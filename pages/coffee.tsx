import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import rawShops from "../data/coffee-shops.json";
import { useState, useMemo } from "react";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type Shop = {
  id: string;
  name: string;
  area: string;
  petakopi_url?: string;
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
  petakopi_tags?: string[];
  rating?: number | null;
};

const shops = rawShops as Shop[];

const WIFI_LABEL: Record<string, string> = {
  open: "wifi: open",
  password: "wifi: pw",
  none: "no wifi",
};

const FOOD_LABEL: Record<string, string> = {
  none: "no food",
  snacks: "snacks",
  "full menu": "full menu",
};

function Badge({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${muted ? "border-zinc-400/40 text-zinc-400" : "border-zinc-400 text-zinc-600"}`}>
      {label}
    </span>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const featureBadges = [
    shop.food != null ? { label: FOOD_LABEL[shop.food], muted: shop.food === "none" } : null,
    shop.wifi != null ? { label: WIFI_LABEL[shop.wifi], muted: shop.wifi === "none" } : null,
    shop.toilet === true ? { label: "toilet" } : null,
    shop.surau === true ? { label: "surau" } : null,
  ].filter(Boolean) as { label: string; muted?: boolean }[];

  return (
    <div className="border border-zinc-400/40 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-400/40">
        <div className="flex items-start justify-between gap-2 mb-2">
          {shop.vibe && (
            <p className="text-[10px] uppercase tracking-widest text-[#D94830]">{shop.vibe}</p>
          )}
          {shop.rating != null && (
            <p className="text-[10px] text-zinc-400 ml-auto shrink-0">★ {shop.rating}</p>
          )}
        </div>
        <p className="text-lg font-bold text-zinc-800 tracking-tight leading-tight mb-1">{shop.name}</p>
        <p className="text-xs text-zinc-500">{shop.area}</p>
      </div>

      {/* Espresso gear */}
      <div className="px-6 py-4 border-b border-zinc-400/40 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">machine</p>
          <p className="text-xs text-zinc-700 font-medium">{shop.machine ?? "—"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">grinder</p>
          <p className="text-xs text-zinc-700 font-medium">{shop.grinder ?? "—"}</p>
        </div>
      </div>

      {/* Hours + size */}
      <div className="px-6 py-4 border-b border-zinc-400/40 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">hours</p>
          <p className="text-xs text-zinc-700">{shop.hours ?? "—"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">capacity</p>
          <p className="text-xs text-zinc-700 font-medium">{shop.capacity_pax != null ? `~${shop.capacity_pax} pax` : "—"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">size</p>
          <p className="text-xs text-zinc-700 font-medium">{shop.size_sqft != null ? `~${shop.size_sqft.toLocaleString()} sqft` : "—"}</p>
        </div>
      </div>

      {/* Feature badges */}
      {featureBadges.length > 0 && (
        <div className="px-6 py-4 border-b border-zinc-400/40 flex flex-wrap gap-2">
          {featureBadges.map((b) => <Badge key={b.label} label={b.label} muted={b.muted} />)}
        </div>
      )}

      {/* Directions */}
      <div className="px-6 py-4 flex gap-4 mt-auto flex-wrap">
        {shop.google_maps && (
        <a
          href={shop.google_maps}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
        >
          Google Maps ↗
        </a>
        )}
        {shop.waze && (
          <a
            href={shop.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
          >
            Waze ↗
          </a>
        )}
        {shop.petakopi_url && (
          <a
            href={shop.petakopi_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors border-b border-zinc-300 pb-0.5"
          >
            petakopi ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function Coffee() {
  const [activeVibe, setActiveVibe] = useState<string | null>(null);

  const vibes = useMemo(() => Array.from(new Set(shops.map((s) => s.vibe).filter(Boolean))).sort() as string[], []);

  const filtered = useMemo(
    () => (activeVibe ? shops.filter((s) => s.vibe === activeVibe) : shops),
    [activeVibe]
  );

  return (
    <>
      <Head>
        <title>Coffee — AI and Coffee</title>
        <meta name="description" content="A community map of coffee shops. Espresso machines, grinders, hours, wifi, food, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/coffee" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/coffee" />
        <meta property="og:title" content="Coffee — AI and Coffee" />
        <meta property="og:description" content="A community map of coffee shops. Espresso machines, grinders, hours, wifi, food, and more." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Coffee — AI and Coffee" />
        <meta name="twitter:description" content="A community map of coffee shops. Espresso machines, grinders, hours, wifi, food, and more." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono pb-24`}>
        <Nav active="coffee" />

        {/* Hero */}
        <section className="px-6 sm:px-16 pt-14 pb-12 border-b border-zinc-400/40">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-10 animate-stagger-in">— coffee shops</p>
          <div className="font-bold tracking-tighter leading-none text-5xl sm:text-7xl text-zinc-800 space-y-2 mb-8">
            <p className="animate-hero-in">good beans.</p>
            <p className="animate-hero-in" style={{ animationDelay: "100ms" }}>good machines.</p>
            <p className="animate-hero-in" style={{ animationDelay: "200ms" }}>good vibes.</p>
          </div>
          <p className="text-xs text-zinc-500 max-w-md leading-relaxed animate-stagger-in" style={{ animationDelay: "350ms" }}>
            Community-maintained list of coffee shops worth visiting. Covers the machine, grinder,
            hours, wifi, food, facilities — everything you need to know before you go.
          </p>
        </section>

        {/* Filters */}
        {vibes.length > 0 && (
          <div className="px-6 sm:px-16 py-6 border-b border-zinc-400/40 flex items-center gap-3 flex-wrap">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mr-2">vibe</p>
            <button
              onClick={() => setActiveVibe(null)}
              className={`text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors ${
                activeVibe === null
                  ? "border-zinc-800 bg-zinc-800 text-[#E8E4D9]"
                  : "border-zinc-400 text-zinc-500 hover:border-zinc-800 hover:text-zinc-800"
              }`}
            >
              all
            </button>
            {vibes.map((v) => (
              <button
                key={v}
                onClick={() => setActiveVibe(v === activeVibe ? null : v)}
                className={`text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors ${
                  activeVibe === v
                    ? "border-[#D94830] bg-[#D94830] text-white"
                    : "border-zinc-400 text-zinc-500 hover:border-zinc-800 hover:text-zinc-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <section className="px-6 sm:px-16 py-12">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-400">no shops found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </section>

        {/* Submit CTA */}
        <div className="px-6 sm:px-16 py-12 border-t border-zinc-400/40">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">know a spot?</p>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mb-6">
            Add a coffee shop by opening a GitHub issue. Include the shop name, area, machine, grinder,
            hours, and any other details you know. The community will verify and merge it.
          </p>
          <a
            href="https://github.com/solahidris/aiandcoffee/issues/new?title=Coffee+shop+submission:+SHOP+NAME&body=**Name:**%0A**Area:**%0A**Address:**%0A**Machine:**%0A**Grinder:**%0A**Hours:**%0A**Capacity (pax):**%0A**Size (sqft):**%0A**Food:** none / snacks / full menu%0A**Wifi:** open / password / none%0A**Toilet:** yes / no%0A**Surau:** yes / no%0A**Vibe:**%0A**Google Maps link:**%0A**Waze link:**"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
          >
            Submit a shop ↗
          </a>
        </div>

        {/* Decorative */}
        <div className="fixed bottom-0 right-0 text-[200px] sm:text-[300px] font-bold text-zinc-300/20 select-none pointer-events-none leading-none translate-x-1/4 translate-y-1/4">
          ☕
        </div>
      </div>
    </>
  );
}
