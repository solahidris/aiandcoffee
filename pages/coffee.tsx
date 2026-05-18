import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import rawShops from "../data/coffee-shops.json";
import { useState, useMemo, useCallback } from "react";

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
    shop.surau === true ? "surau" : null,
  ].filter(Boolean) as string[];

  const hasGear = shop.machine || shop.grinder;
  const hasSize = shop.capacity_pax != null || shop.size_sqft != null;

  return (
    <div className="group border border-zinc-400/50 hover:border-zinc-600 transition-colors duration-150 flex flex-col">
      {/* Name + area */}
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

      {/* Hours */}
      {shop.hours && (
        <div className="border-t border-zinc-400/40 px-4 py-2.5">
          <p className="text-[10px] text-zinc-600 leading-relaxed">{shop.hours}</p>
        </div>
      )}

      {/* Gear */}
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

      {/* Size */}
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

      {/* Tags */}
      {tags.length > 0 && (
        <div className="border-t border-zinc-400/40 px-4 py-2.5 flex flex-wrap gap-1.5">
          {tags.map((t) => <Tag key={t} label={t} />)}
        </div>
      )}

      {/* Directions */}
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

export default function Coffee() {
  const [query, setQuery]         = useState("");
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeVibe, setActiveVibe]   = useState<string | null>(null);
  const [shown, setShown]         = useState(PAGE_SIZE);

  const vibes = useMemo(
    () => Array.from(new Set(shops.map((s) => s.vibe).filter(Boolean))).sort() as string[],
    []
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return shops.filter((s) => {
      if (activeState && !s.area.includes(activeState)) return false;
      if (activeVibe && s.vibe !== activeVibe) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.area.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, activeState, activeVibe]);

  const visible = useMemo(() => filtered.slice(0, shown), [filtered, shown]);

  const handleFilter = useCallback((fn: () => void) => {
    fn();
    setShown(PAGE_SIZE);
  }, []);

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
            <button onClick={() => handleFilter(() => setQuery(""))}
              className="text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors uppercase tracking-widest">
              clear
            </button>
          )}
        </div>

        {/* Filters + count */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-3 flex items-center gap-2 flex-wrap">
          {/* State */}
          {["Kuala Lumpur", "Selangor"].map((state) => (
            <button key={state}
              onClick={() => handleFilter(() => setActiveState(activeState === state ? null : state))}
              className={`text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
                activeState === state
                  ? "border-zinc-800 bg-zinc-800 text-[#E8E4D9]"
                  : "border-zinc-400/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
              }`}>
              {state === "Kuala Lumpur" ? "KL" : state}
            </button>
          ))}

          <span className="text-zinc-300 text-xs mx-1">|</span>

          {/* Vibe */}
          {vibes.map((v) => (
            <button key={v}
              onClick={() => handleFilter(() => setActiveVibe(activeVibe === v ? null : v))}
              className={`text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
                activeVibe === v
                  ? "border-[#D94830] bg-[#D94830] text-white"
                  : "border-zinc-400/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
              }`}>
              {v}
            </button>
          ))}

          <span className="ml-auto text-[9px] uppercase tracking-widest text-zinc-400">
            {filtered.length.toLocaleString()} spots
          </span>
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
    </>
  );
}
