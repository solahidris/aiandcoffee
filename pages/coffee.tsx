import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import rawShops from "../data/coffee-shops.json";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type Shop = {
  id: string;
  name: string;
  area: string;
  google_maps: string | null;
  waze: string | null;
  machine: string | null;
  grinder: string | null;
  capacity_pax: number | null;
  size_sqft: number | null;
  hours: string | null;
  food: "none" | "snacks" | "full menu" | null;
  toilet: boolean | null;
  surau: boolean | null;
  wifi: "open" | "password" | "none" | null;
  vibe: string | null;
  rating?: number | null;
};

const shops = rawShops as Shop[];
const PAGE_SIZE = 48;

const WIFI_LABEL: Record<string, string> = { open: "wifi: open", password: "wifi: pw", none: "no wifi" };
const FOOD_LABEL: Record<string, string> = { none: "no food", snacks: "snacks", "full menu": "full menu" };

// --- Hours parsing for "open now" ---

function parseTimeStr(t: string): number {
  const m = t.trim().match(/^(\d+)(?::(\d+))?\s*(am|pm)$/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const p = m[3].toLowerCase();
  if (p === "pm" && h !== 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  return h * 60 + min;
}

const DAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

function parseDays(s: string): number[] {
  const norm = s.trim().toLowerCase().replace(/\s+/g, "");
  if (["daily", "everyday", "mon-sun", "mon–sun", "sun-sat", "sun–sat"].includes(norm)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const rangeM = norm.match(/^(\w+)[–\-](\w+)$/);
  if (rangeM) {
    const a = DAY_MAP[rangeM[1]], b = DAY_MAP[rangeM[2]];
    if (a !== undefined && b !== undefined) {
      const days: number[] = [];
      if (a <= b) {
        for (let i = a; i <= b; i++) days.push(i);
      } else {
        for (let i = a; i <= 6; i++) days.push(i);
        for (let i = 0; i <= b; i++) days.push(i);
      }
      return days;
    }
  }
  const d = DAY_MAP[norm];
  return d !== undefined ? [d] : [];
}

function isOpenNow(hours: string | null): boolean {
  if (!hours || /closed/i.test(hours)) return false;
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  for (const seg of hours.split(",")) {
    const s = seg.trim();
    const withDay = s.match(
      /^([\w\s–\-]+?)\s+(\d+(?::\d+)?\s*[ap]m)\s*[–\-]\s*(\d+(?::\d+)?\s*[ap]m)$/i
    );
    if (withDay) {
      if (!parseDays(withDay[1]).includes(day)) continue;
      const o = parseTimeStr(withDay[2]), c = parseTimeStr(withDay[3]);
      if (o !== -1 && c !== -1) {
        if (c <= o ? (mins >= o || mins < c) : (mins >= o && mins < c)) return true;
      }
      continue;
    }
    const timeOnly = s.match(/^(\d+(?::\d+)?\s*[ap]m)\s*[–\-]\s*(\d+(?::\d+)?\s*[ap]m)$/i);
    if (timeOnly) {
      const o = parseTimeStr(timeOnly[1]), c = parseTimeStr(timeOnly[2]);
      if (o !== -1 && c !== -1) {
        if (c <= o ? (mins >= o || mins < c) : (mins >= o && mins < c)) return true;
      }
    }
  }
  return false;
}

// --- Area helpers ---

function getNeighborhood(area: string): string {
  return area.split(",")[0].trim();
}

// --- Components ---

function FilterBtn({
  label, active, onClick, red,
}: {
  label: string; active: boolean; onClick: () => void; red?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
        active
          ? red
            ? "border-[#D94830] bg-[#D94830] text-white"
            : "border-zinc-800 bg-zinc-800 text-[#E8E4D9]"
          : "border-zinc-400/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="text-zinc-300 text-xs mx-1 select-none">|</span>;
}

function Tag({ label, red }: { label: string; red?: boolean }) {
  return (
    <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 border ${red ? "border-[#D94830]/40 text-[#D94830]" : "border-zinc-300 text-zinc-500"}`}>
      {label}
    </span>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const tags = [
    shop.food && shop.food !== "none" ? FOOD_LABEL[shop.food] : null,
    shop.wifi && shop.wifi !== "none" ? WIFI_LABEL[shop.wifi] : null,
    shop.toilet === true ? "toilet" : null,
  ].filter(Boolean) as string[];

  const hasGear = shop.machine || shop.grinder;
  const hasSize = shop.capacity_pax != null || shop.size_sqft != null;

  return (
    <div className="group border border-zinc-400/50 hover:border-zinc-600 transition-colors duration-150 flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-start gap-2 mb-2">
          {shop.vibe ? (
            <span className="text-[9px] uppercase tracking-widest text-[#D94830]">{shop.vibe}</span>
          ) : <span />}
          {shop.rating != null && (
            <span className="text-[9px] text-zinc-400 shrink-0 tabular-nums">★ {shop.rating}</span>
          )}
        </div>
        <p className="text-sm font-bold text-zinc-800 tracking-tight leading-snug">{shop.name}</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">{shop.area}</p>
      </div>

      {shop.hours && (
        <div className="border-t border-zinc-400/40 px-4 py-2.5">
          <p className="text-[10px] text-zinc-600 leading-relaxed">{shop.hours}</p>
        </div>
      )}

      {hasGear && (
        <div className="border-t border-zinc-400/40 px-4 py-2.5 grid grid-cols-2 gap-2">
          {shop.machine && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-0.5">machine</p>
              <p className="text-[10px] text-zinc-700">{shop.machine}</p>
            </div>
          )}
          {shop.grinder && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-0.5">grinder</p>
              <p className="text-[10px] text-zinc-700">{shop.grinder}</p>
            </div>
          )}
        </div>
      )}

      {hasSize && (
        <div className="border-t border-zinc-400/40 px-4 py-2.5 flex gap-4">
          {shop.capacity_pax != null && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-0.5">capacity</p>
              <p className="text-[10px] text-zinc-700">~{shop.capacity_pax} pax</p>
            </div>
          )}
          {shop.size_sqft != null && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-0.5">size</p>
              <p className="text-[10px] text-zinc-700">~{shop.size_sqft.toLocaleString()} sqft</p>
            </div>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="border-t border-zinc-400/40 px-4 py-2.5 flex flex-wrap gap-1.5">
          {tags.map((t) => <Tag key={t} label={t} />)}
        </div>
      )}

      <div className="border-t border-zinc-400/40 px-4 py-2.5 mt-auto flex gap-3">
        {shop.google_maps && (
          <a href={shop.google_maps} target="_blank" rel="noopener noreferrer"
            className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors">
            Maps ↗
          </a>
        )}
        {shop.waze && (
          <a href={shop.waze} target="_blank" rel="noopener noreferrer"
            className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors">
            Waze ↗
          </a>
        )}
      </div>
    </div>
  );
}

function SurpriseModal({ shop, onClose }: { shop: Shop; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[#E8E4D9] border border-zinc-400 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-zinc-400/40 flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest text-zinc-400">today&apos;s pick</p>
          <button
            onClick={onClose}
            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            close
          </button>
        </div>
        <ShopCard shop={shop} />
      </div>
    </div>
  );
}

// --- Page ---

export default function Coffee() {
  const router = useRouter();
  const initialized = useRef(false);

  const [query, setQuery]                   = useState("");
  const [activeState, setActiveState]       = useState<string | null>(null);
  const [activeVibe, setActiveVibe]         = useState<string | null>(null);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);
  const [activeFood, setActiveFood]         = useState<string | null>(null);
  const [activeWifi, setActiveWifi]         = useState<string | null>(null);
  const [activeToilet, setActiveToilet]     = useState(false);
  const [openNow, setOpenNow]               = useState(false);
  const [sortBy, setSortBy]                 = useState<"name" | "rating" | null>(null);
  const [shown, setShown]                   = useState(PAGE_SIZE);
  const [surpriseShop, setSurpriseShop]     = useState<Shop | null>(null);

  // Initialize state from URL params once router is ready
  useEffect(() => {
    if (!router.isReady || initialized.current) return;
    initialized.current = true;
    const q = router.query as Record<string, string>;
    if (q.q)            setQuery(q.q);
    if (q.state)        setActiveState(q.state);
    if (q.vibe)         setActiveVibe(q.vibe);
    if (q.neighborhood) setActiveNeighborhood(q.neighborhood);
    if (q.food)         setActiveFood(q.food);
    if (q.wifi)         setActiveWifi(q.wifi);
    if (q.toilet === "1") setActiveToilet(true);
    if (q.open   === "1") setOpenNow(true);
    if (q.sort)         setSortBy(q.sort as "name" | "rating");
  }, [router.isReady, router.query]);

  // Sync filter state to URL so filters are shareable
  useEffect(() => {
    if (!initialized.current) return;
    const params: Record<string, string> = {};
    if (query)             params.q = query;
    if (activeState)       params.state = activeState;
    if (activeVibe)        params.vibe = activeVibe;
    if (activeNeighborhood) params.neighborhood = activeNeighborhood;
    if (activeFood)        params.food = activeFood;
    if (activeWifi)        params.wifi = activeWifi;
    if (activeToilet)      params.toilet = "1";
    if (openNow)           params.open = "1";
    if (sortBy)            params.sort = sortBy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    router.replace({ pathname: "/coffee", query: params }, undefined, { shallow: true });
  }, [query, activeState, activeVibe, activeNeighborhood, activeFood, activeWifi, activeToilet, openNow, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const vibes = useMemo(
    () => Array.from(new Set(shops.map((s) => s.vibe).filter(Boolean))).sort() as string[],
    []
  );

  // Top 15 neighborhoods by shop count for the active state
  const neighborhoods = useMemo(() => {
    if (!activeState) return [];
    const counts: Record<string, number> = {};
    shops.forEach((s) => {
      if (s.area.includes(activeState)) {
        const n = getNeighborhood(s.area);
        counts[n] = (counts[n] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name]) => name);
  }, [activeState]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let result = shops.filter((s) => {
      if (activeState       && !s.area.includes(activeState)) return false;
      if (activeNeighborhood && getNeighborhood(s.area) !== activeNeighborhood) return false;
      if (activeVibe        && s.vibe !== activeVibe) return false;
      if (activeFood        && s.food !== activeFood) return false;
      if (activeWifi        && s.wifi !== activeWifi) return false;
      if (activeToilet      && s.toilet !== true) return false;
      if (openNow           && !isOpenNow(s.hours)) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.area.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortBy === "name")   result = [...result].sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
    if (sortBy === "rating") result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return result;
  }, [query, activeState, activeNeighborhood, activeVibe, activeFood, activeWifi, activeToilet, openNow, sortBy]);

  const visible = useMemo(() => filtered.slice(0, shown), [filtered, shown]);

  const handleFilter = useCallback((fn: () => void) => {
    fn();
    setShown(PAGE_SIZE);
  }, []);

  const handleSurprise = useCallback(() => {
    if (filtered.length === 0) return;
    setSurpriseShop(filtered[Math.floor(Math.random() * filtered.length)]);
  }, [filtered]);

  return (
    <>
      <Head>
        <title>Coffee — AI and Coffee</title>
        <meta name="description" content="Community-maintained map of coffee shops in KL and Selangor. Machine, grinder, hours, wifi, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/coffee" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/coffee" />
        <meta property="og:title" content="Coffee — AI and Coffee" />
        <meta property="og:description" content="Community-maintained map of coffee shops in KL and Selangor. Machine, grinder, hours, wifi, and more." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Coffee — AI and Coffee" />
        <meta name="twitter:description" content="Community-maintained map of coffee shops in KL and Selangor." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="coffee" />

        {/* Hero */}
        <section className="px-6 sm:px-16 pt-10 pb-10 border-b border-zinc-400/40 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">— coffee shops</p>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-800 leading-none mb-3">
              Coffee.
            </h1>
            <p className="text-xs text-zinc-500">KL &amp; Selangor · community verified</p>
          </div>
          <p className="text-6xl sm:text-8xl font-bold tracking-tighter text-zinc-200 leading-none select-none">
            {shops.length.toLocaleString()}
          </p>
        </section>

        {/* Search */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-4 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 shrink-0">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => handleFilter(() => setQuery(e.target.value))}
            placeholder="name or area..."
            className="flex-1 bg-transparent text-xs text-zinc-800 placeholder:text-zinc-400 outline-none font-mono uppercase tracking-widest"
          />
          {query && (
            <button
              onClick={() => handleFilter(() => setQuery(""))}
              className="text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors uppercase tracking-widest"
            >
              clear
            </button>
          )}
        </div>

        {/* State + Vibe + count */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
          {(["Kuala Lumpur", "Selangor"] as const).map((state) => (
            <FilterBtn
              key={state}
              label={state === "Kuala Lumpur" ? "KL" : state}
              active={activeState === state}
              onClick={() => handleFilter(() => {
                setActiveState(activeState === state ? null : state);
                setActiveNeighborhood(null);
              })}
            />
          ))}

          <Divider />

          {vibes.map((v) => (
            <FilterBtn
              key={v}
              label={v}
              active={activeVibe === v}
              onClick={() => handleFilter(() => setActiveVibe(activeVibe === v ? null : v))}
              red
            />
          ))}

          <span className="ml-auto text-[9px] uppercase tracking-widest text-zinc-400">
            {filtered.length.toLocaleString()} spots
          </span>
        </div>

        {/* Neighborhood sub-filter — shown only when a state is active */}
        {activeState && neighborhoods.length > 0 && (
          <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 shrink-0">area</span>
            {neighborhoods.map((n) => (
              <FilterBtn
                key={n}
                label={n}
                active={activeNeighborhood === n}
                onClick={() => handleFilter(() => setActiveNeighborhood(activeNeighborhood === n ? null : n))}
              />
            ))}
          </div>
        )}

        {/* Amenities + Open Now + Sort + Surprise */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
          <FilterBtn label="open now" active={openNow} onClick={() => handleFilter(() => setOpenNow(!openNow))} />

          <Divider />

          <FilterBtn label="wifi: open" active={activeWifi === "open"}     onClick={() => handleFilter(() => setActiveWifi(activeWifi === "open"     ? null : "open"))} />
          <FilterBtn label="wifi: pw"   active={activeWifi === "password"} onClick={() => handleFilter(() => setActiveWifi(activeWifi === "password" ? null : "password"))} />

          <Divider />

          <FilterBtn label="snacks"    active={activeFood === "snacks"}    onClick={() => handleFilter(() => setActiveFood(activeFood === "snacks"    ? null : "snacks"))} />
          <FilterBtn label="full menu" active={activeFood === "full menu"} onClick={() => handleFilter(() => setActiveFood(activeFood === "full menu" ? null : "full menu"))} />

          <Divider />

          <FilterBtn label="toilet" active={activeToilet} onClick={() => handleFilter(() => setActiveToilet(!activeToilet))} />

          <Divider />

          <span className="text-[9px] uppercase tracking-widest text-zinc-400 shrink-0">sort</span>
          {(["name", "rating"] as const).map((s) => (
            <FilterBtn
              key={s}
              label={s}
              active={sortBy === s}
              onClick={() => handleFilter(() => setSortBy(sortBy === s ? null : s))}
            />
          ))}

          <Divider />

          <button
            onClick={handleSurprise}
            className="text-[9px] uppercase tracking-widest px-2.5 py-1 border border-[#D94830]/60 text-[#D94830] hover:bg-[#D94830] hover:text-white transition-colors"
          >
            surprise me
          </button>
        </div>

        {/* Grid */}
        <section className="px-6 sm:px-16 py-8">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-400 py-12">no shops found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {visible.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>

              {shown < filtered.length && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setShown((s) => s + PAGE_SIZE)}
                    className="border border-zinc-400 px-6 py-2.5 text-[10px] uppercase tracking-widest text-zinc-600 hover:border-zinc-800 hover:text-zinc-800 transition-colors"
                  >
                    load more
                  </button>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest">
                    {shown} of {filtered.length.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        {/* Submit CTA */}
        <div className="border-t border-zinc-400/40 px-6 sm:px-16 py-12 pb-24">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">know a spot?</p>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mb-6">
            Add a shop via GitHub issue — name, area, machine, grinder, hours, wifi, food, facilities.
            Community verifies and merges.
          </p>
          <a
            href="https://github.com/solahidris/aiandcoffee/issues/new?title=Coffee+shop+submission:+SHOP+NAME&body=**Name:**%0A**Area:**%0A**Machine:**%0A**Grinder:**%0A**Hours:**%0A**Capacity (pax):**%0A**Size (sqft):**%0A**Food:** none / snacks / full menu%0A**Wifi:** open / password / none%0A**Toilet:** yes / no%0A**Surau:** yes / no%0A**Vibe:**%0A**Google Maps link:**%0A**Waze link:**"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
          >
            Submit a shop ↗
          </a>
        </div>
      </div>

      {surpriseShop && (
        <SurpriseModal shop={surpriseShop} onClose={() => setSurpriseShop(null)} />
      )}
    </>
  );
}
