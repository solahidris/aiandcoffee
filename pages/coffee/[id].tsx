import Head from "next/head";
import Link from "next/link";
import { Geist_Mono } from "next/font/google";
import { GetStaticPaths, GetStaticProps } from "next";
import Nav from "../../components/Nav";
import rawShops from "../../data/coffee-shops.json";
import { useEffect, useState } from "react";
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

const shops = rawShops as Shop[];

const WIFI_LABEL: Record<string, string> = {
  open: "Wifi: Open",
  password: "Wifi: Password",
  none: "No Wifi",
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: shops.map((s) => ({ params: { id: s.id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const shop = shops.find((s) => s.id === params?.id) ?? null;
  if (!shop) return { notFound: true };
  return { props: { shop } };
};

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <p className="text-sm text-zinc-800">{value}</p>
    </div>
  );
}

export default function ShopPage({ shop }: { shop: Shop }) {
  const [openStatus, setOpenStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (shop.hours) setOpenStatus(isOpenNow(shop.hours));
  }, [shop.hours]);

  const name = shop.name.trim();
  const hasGear = shop.machine || shop.grinder;
  const hasSize = shop.capacity_pax != null || shop.size_sqft != null;
  const hasAmenities = (shop.wifi && shop.wifi !== "none") || shop.toilet === true;
  const hasDirections = shop.google_maps || shop.waze;
  const hoursLines = formatHours(shop.hours);

  const metaDesc = [
    shop.area,
    shop.machine ? `Machine: ${shop.machine}` : null,
    shop.grinder ? `Grinder: ${shop.grinder}` : null,
    shop.hours ? `Hours: ${shop.hours}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <>
      <Head>
        <title>{name} — AI and Coffee</title>
        <meta name="description" content={metaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`https://aiandcoffee.com/coffee/${shop.id}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content={`https://aiandcoffee.com/coffee/${shop.id}`} />
        <meta property="og:title" content={`${name} — AI and Coffee`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${name} — AI and Coffee`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="coffee" />

        {/* Hero */}
        <section className="px-6 sm:px-16 pt-8 pb-10 border-b border-zinc-400/40">
          <Link
            href="/coffee"
            className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            ← coffee
          </Link>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {shop.vibe && (
                <span className="text-[9px] uppercase tracking-widest text-[#D94830]">{shop.vibe}</span>
              )}
              {shop.rating != null && (
                <span className="text-[9px] text-zinc-400 tabular-nums">★ {shop.rating}</span>
              )}
              {openStatus !== null && (
                <span className={`text-[9px] uppercase tracking-widest ${openStatus ? "text-green-700" : "text-zinc-400"}`}>
                  {openStatus ? "● open now" : "○ closed"}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-zinc-800 leading-none mb-3">
              {name}
            </h1>
            <p className="text-sm text-zinc-500">{shop.area}</p>
          </div>
        </section>

        {/* Hours */}
        {hoursLines.length > 0 && (
          <section className="px-6 sm:px-16 py-8 border-b border-zinc-400/40">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-5">hours</p>
            <div className="space-y-2">
              {hoursLines.map((line, i) => (
                <p key={i} className="text-sm text-zinc-700 leading-relaxed">{line}</p>
              ))}
            </div>
          </section>
        )}

        {/* Gear */}
        {hasGear && (
          <section className="px-6 sm:px-16 py-8 border-b border-zinc-400/40">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-5">gear</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {shop.machine && <InfoBlock label="Machine" value={shop.machine} />}
              {shop.grinder && <InfoBlock label="Grinder" value={shop.grinder} />}
            </div>
          </section>
        )}

        {/* Space */}
        {hasSize && (
          <section className="px-6 sm:px-16 py-8 border-b border-zinc-400/40">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-5">space</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {shop.capacity_pax != null && (
                <InfoBlock label="Capacity" value={`~${shop.capacity_pax} pax`} />
              )}
              {shop.size_sqft != null && (
                <InfoBlock label="Size" value={`~${shop.size_sqft.toLocaleString()} sqft`} />
              )}
            </div>
          </section>
        )}

        {/* Amenities */}
        {hasAmenities && (
          <section className="px-6 sm:px-16 py-8 border-b border-zinc-400/40">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-5">amenities</p>
            <div className="flex flex-wrap gap-2">
              {shop.wifi && shop.wifi !== "none" && (
                <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 border border-zinc-400/60 text-zinc-600">
                  {WIFI_LABEL[shop.wifi]}
                </span>
              )}
              {shop.toilet === true && (
                <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 border border-zinc-400/60 text-zinc-600">
                  Toilet
                </span>
              )}
            </div>
          </section>
        )}

        {/* Directions */}
        {hasDirections && (
          <section className="px-6 sm:px-16 py-10 pb-24">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-5">directions</p>
            <div className="flex flex-wrap gap-3">
              {shop.google_maps && (
                <a
                  href={shop.google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
                >
                  Google Maps ↗
                </a>
              )}
              {shop.waze && (
                <a
                  href={shop.waze}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-2 border-zinc-700 px-6 py-3 text-xs uppercase tracking-widest text-zinc-700 hover:bg-zinc-700 hover:text-[#E8E4D9] transition-colors"
                >
                  Waze ↗
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
