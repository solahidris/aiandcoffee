import Head from "next/head";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import Nav from "../../components/Nav";
import rawShops from "../../data/coffee-shops.json";
import rawImages from "../../data/shop-images.json";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { isOpenNow, formatHours } from "../../lib/coffee-hours";

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

const shops    = rawShops as Shop[];
const shopImages = rawImages as Record<string, string[]>;
const PAGE_SIZE = 10;

const WIFI_LABEL: Record<string, string> = { open: "wifi: open", password: "wifi: pw", none: "no wifi" };

function getNeighborhood(area: string): string {
  return area.split(",")[0].trim();
}

function FilterBtn({ label, active, onClick, red }: { label: string; active: boolean; onClick: () => void; red?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
        active
          ? red ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-800 bg-zinc-800 text-[#E8E4D9]"
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

function ShopCard({ shop }: { shop: Shop }) {
  const router = useRouter();
  const imageSrc = shopImages[shop.id]?.[0] ?? null;
  const hoursLines = formatHours(shop.hours);

  return (
    <div
      className="group cursor-pointer flex flex-col overflow-hidden border border-zinc-300 hover:border-zinc-500 transition-colors duration-150"
      onClick={() => router.push(`/coffee/${shop.id}`)}
    >
      {/* Photo */}
      <div className="relative w-full aspect-video overflow-hidden bg-zinc-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={shop.name.trim()}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-400 text-[8px] uppercase tracking-widest">no photo</span>
          </div>
        )}
        {shop.vibe && (
          <span className="absolute top-3 left-3 bg-[#D94830] text-white text-[8px] uppercase tracking-widest px-2 py-0.5">
            {shop.vibe}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 bg-[#F5F2EB]">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-base font-bold text-zinc-800 tracking-tight leading-tight group-hover:text-[#D94830] transition-colors">
            {shop.name.trim()}
          </h2>
          {shop.rating != null && (
            <span className="text-[9px] text-zinc-400 tabular-nums shrink-0 mt-0.5">★ {shop.rating}</span>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 mb-3">{shop.area}</p>

        {/* Gear */}
        {(shop.machine || shop.grinder) && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
            {shop.machine && (
              <div>
                <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-0.5">machine</p>
                <p className="text-[11px] text-zinc-700">{shop.machine}</p>
              </div>
            )}
            {shop.grinder && (
              <div>
                <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-0.5">grinder</p>
                <p className="text-[11px] text-zinc-700">{shop.grinder}</p>
              </div>
            )}
          </div>
        )}

        {/* Hours — first line only */}
        {hoursLines.length > 0 && (
          <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">{hoursLines[0]}</p>
        )}

        {/* Bottom row */}
        <div className="mt-auto pt-3 border-t border-zinc-300/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shop.capacity_pax != null && (
              <span className="text-[9px] text-zinc-400">~{shop.capacity_pax} pax</span>
            )}
            {shop.wifi && shop.wifi !== "none" && (
              <span className="text-[9px] text-zinc-400">{WIFI_LABEL[shop.wifi]}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {shop.google_maps && (
              <a href={shop.google_maps} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors">
                Maps ↗
              </a>
            )}
            {shop.waze && (
              <a href={shop.waze} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors">
                Waze ↗
              </a>
            )}
          </div>
        </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-[#E8E4D9] max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-zinc-400/40 flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest text-zinc-400">today&apos;s pick</p>
          <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors">close</button>
        </div>
        <ShopCard shop={shop} />
      </div>
    </div>
  );
}

export default function Coffee() {
  const router = useRouter();
  const initialized = useRef(false);

  const [query, setQuery]                   = useState("");
  const [activeState, setActiveState]       = useState<string | null>(null);
  const [activeVibe, setActiveVibe]         = useState<string | null>(null);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);
  const [activeWifi, setActiveWifi]         = useState<string | null>(null);
  const [activeToilet, setActiveToilet]     = useState(false);
  const [openNow, setOpenNow]               = useState(false);
  const [sortBy, setSortBy]                 = useState<"name" | "rating" | null>(null);
  const [shown, setShown]                   = useState(PAGE_SIZE);
  const [surpriseShop, setSurpriseShop]     = useState<Shop | null>(null);

  useEffect(() => {
    if (!router.isReady || initialized.current) return;
    initialized.current = true;
    const q = router.query as Record<string, string>;
    if (q.q)            setQuery(q.q);
    if (q.state)        setActiveState(q.state);
    if (q.vibe)         setActiveVibe(q.vibe);
    if (q.neighborhood) setActiveNeighborhood(q.neighborhood);
    if (q.wifi)         setActiveWifi(q.wifi);
    if (q.toilet === "1") setActiveToilet(true);
    if (q.open   === "1") setOpenNow(true);
    if (q.sort)         setSortBy(q.sort as "name" | "rating");
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!initialized.current) return;
    const params: Record<string, string> = {};
    if (query)              params.q = query;
    if (activeState)        params.state = activeState;
    if (activeVibe)         params.vibe = activeVibe;
    if (activeNeighborhood) params.neighborhood = activeNeighborhood;
    if (activeWifi)         params.wifi = activeWifi;
    if (activeToilet)       params.toilet = "1";
    if (openNow)            params.open = "1";
    if (sortBy)             params.sort = sortBy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    router.replace({ pathname: "/coffee", query: params }, undefined, { shallow: true });
  }, [query, activeState, activeVibe, activeNeighborhood, activeWifi, activeToilet, openNow, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const vibes = useMemo(
    () => Array.from(new Set(shops.map((s) => s.vibe).filter(Boolean))).sort() as string[],
    []
  );

  const neighborhoods = useMemo(() => {
    if (!activeState) return [];
    const counts: Record<string, number> = {};
    shops.forEach((s) => {
      if (s.area.includes(activeState)) {
        const n = getNeighborhood(s.area);
        counts[n] = (counts[n] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name]) => name);
  }, [activeState]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let result = shops.filter((s) => {
      if (activeState        && !s.area.includes(activeState)) return false;
      if (activeNeighborhood && getNeighborhood(s.area) !== activeNeighborhood) return false;
      if (activeVibe         && s.vibe !== activeVibe) return false;
      if (activeWifi         && s.wifi !== activeWifi) return false;
      if (activeToilet       && s.toilet !== true) return false;
      if (openNow            && !isOpenNow(s.hours)) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.area.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortBy === "name")        result = [...result].sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
    else if (sortBy === "rating") result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else result = [...result].sort((a, b) => {
      const score = (s: Shop) =>
        (s.machine && s.grinder) ? 3 : (s.machine || s.grinder) ? 2 : s.capacity_pax != null ? 1 : 0;
      return score(b) - score(a);
    });

    return result;
  }, [query, activeState, activeNeighborhood, activeVibe, activeWifi, activeToilet, openNow, sortBy]);

  const visible = useMemo(() => filtered.slice(0, shown), [filtered, shown]);

  const handleFilter = useCallback((fn: () => void) => { fn(); setShown(PAGE_SIZE); }, []);

  const hasActiveFilters = !!(query || activeState || activeVibe || activeNeighborhood || activeWifi || activeToilet || openNow || sortBy);

  const handleClearAll = useCallback(() => {
    setQuery(""); setActiveState(null); setActiveVibe(null); setActiveNeighborhood(null);
    setActiveWifi(null); setActiveToilet(false); setOpenNow(false); setSortBy(null); setShown(PAGE_SIZE);
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
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-800 leading-none mb-3">Coffee.</h1>
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
            <button onClick={() => handleFilter(() => setQuery(""))}
              className="text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors uppercase tracking-widest">
              clear
            </button>
          )}
        </div>

        {/* State + Vibe */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
          {(["Kuala Lumpur", "Selangor"] as const).map((state) => (
            <FilterBtn key={state} label={state === "Kuala Lumpur" ? "KL" : state} active={activeState === state}
              onClick={() => handleFilter(() => { setActiveState(activeState === state ? null : state); setActiveNeighborhood(null); })} />
          ))}
          <Divider />
          {vibes.map((v) => (
            <FilterBtn key={v} label={v} active={activeVibe === v} red
              onClick={() => handleFilter(() => setActiveVibe(activeVibe === v ? null : v))} />
          ))}
          <span className="ml-auto text-[9px] uppercase tracking-widest text-zinc-400">
            {filtered.length.toLocaleString()} spots
          </span>
        </div>

        {/* Neighborhood */}
        {activeState && neighborhoods.length > 0 && (
          <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 shrink-0">area</span>
            {neighborhoods.map((n) => (
              <FilterBtn key={n} label={n} active={activeNeighborhood === n}
                onClick={() => handleFilter(() => setActiveNeighborhood(activeNeighborhood === n ? null : n))} />
            ))}
          </div>
        )}

        {/* Amenities + Sort + Surprise */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
          <FilterBtn label="open now" active={openNow} onClick={() => handleFilter(() => setOpenNow(!openNow))} />
          <Divider />
          <FilterBtn label="wifi: open" active={activeWifi === "open"} onClick={() => handleFilter(() => setActiveWifi(activeWifi === "open" ? null : "open"))} />
          <FilterBtn label="wifi: pw" active={activeWifi === "password"} onClick={() => handleFilter(() => setActiveWifi(activeWifi === "password" ? null : "password"))} />
          <Divider />
          <FilterBtn label="toilet" active={activeToilet} onClick={() => handleFilter(() => setActiveToilet(!activeToilet))} />
          <Divider />
          <span className="text-[9px] uppercase tracking-widest text-zinc-400 shrink-0">sort</span>
          {(["name", "rating"] as const).map((s) => (
            <FilterBtn key={s} label={s} active={sortBy === s}
              onClick={() => handleFilter(() => setSortBy(sortBy === s ? null : s))} />
          ))}
          <Divider />
          <button onClick={handleSurprise}
            className="text-[9px] uppercase tracking-widest px-2.5 py-1 border border-[#D94830]/60 text-[#D94830] hover:bg-[#D94830] hover:text-white transition-colors">
            surprise me
          </button>
          {hasActiveFilters && (
            <>
              <Divider />
              <button onClick={handleClearAll}
                className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors">
                clear all
              </button>
            </>
          )}
        </div>

        {/* Grid */}
        <section className="px-6 sm:px-16 py-8">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-400 py-12">no shops found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
              </div>

              {shown < filtered.length && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button onClick={() => setShown((s) => s + PAGE_SIZE)}
                    className="border border-zinc-400 px-8 py-3 text-[10px] uppercase tracking-widest text-zinc-600 hover:border-zinc-800 hover:text-zinc-800 transition-colors">
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
          <a href="https://github.com/solahidris/aiandcoffee/issues/new?title=Coffee+shop+submission:+SHOP+NAME&body=**Name:**%0A**Area:**%0A**Machine:**%0A**Grinder:**%0A**Hours:**%0A**Capacity (pax):**%0A**Size (sqft):**%0A**Food:** none / snacks / full menu%0A**Wifi:** open / password / none%0A**Toilet:** yes / no%0A**Surau:** yes / no%0A**Vibe:**%0A**Google Maps link:**%0A**Waze link:**"
            target="_blank" rel="noopener noreferrer"
            className="inline-block border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
            Submit a shop ↗
          </a>
        </div>
      </div>

      {surpriseShop && <SurpriseModal shop={surpriseShop} onClose={() => setSurpriseShop(null)} />}
    </>
  );
}
