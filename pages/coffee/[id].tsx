import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
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

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: shops.map((s) => ({ params: { id: s.id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const shop = shops.find((s) => s.id === params?.id) ?? null;
  if (!shop) return { notFound: true };

  let images: string[] = [];
  try {
    const manifest = (await import("../../data/shop-images.json")).default as Record<string, string[]>;
    images = manifest[shop.id] ?? [];
  } catch {}

  return { props: { shop, images } };
};

export default function ShopPage({ shop, images = [] }: { shop: Shop; images: string[] }) {
  const [openStatus, setOpenStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (shop.hours) setOpenStatus(isOpenNow(shop.hours));
  }, [shop.hours]);

  const name = shop.name.trim();
  const hoursLines = formatHours(shop.hours);

  const stats = [
    hoursLines.length > 0 && {
      label: "Hours",
      value: hoursLines,
      multi: true,
    },
    shop.machine && { label: "Machine", value: shop.machine },
    shop.grinder && { label: "Grinder", value: shop.grinder },
    shop.capacity_pax != null && { label: "Capacity", value: `~${shop.capacity_pax} pax` },
    shop.size_sqft != null && { label: "Size", value: `~${shop.size_sqft.toLocaleString()} sqft` },
  ].filter(Boolean) as { label: string; value: string | string[]; multi?: boolean }[];

  const metaDesc = [
    shop.area,
    shop.machine ? `Machine: ${shop.machine}` : null,
    shop.grinder ? `Grinder: ${shop.grinder}` : null,
    shop.hours ?? null,
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
        <meta property="og:image" content={images[0] ?? "https://aiandcoffee.com/og-image.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${name} — AI and Coffee`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={images[0] ?? "https://aiandcoffee.com/og-image.png"} />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="coffee" />

        {/* Hero — full bleed image */}
        {images.length > 0 && (
          <div className="relative w-full h-[56vw] max-h-[580px] min-h-[260px] overflow-hidden">
            <Image src={images[0]} alt={name} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
            <div className="absolute top-6 left-6 sm:left-16">
              <Link href="/coffee" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                ← coffee
              </Link>
            </div>
          </div>
        )}

        {/* Identity */}
        <div className="bg-[#E8E4D9] px-6 sm:px-16 pt-8 pb-0 border-b border-zinc-400/30">
          {images.length === 0 && (
            <Link href="/coffee" className="block text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors mb-8">
              ← coffee
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {shop.vibe && (
              <span className="text-[10px] uppercase tracking-widest text-[#D94830]">{shop.vibe}</span>
            )}
            {shop.rating != null && (
              <span className="text-sm text-zinc-400 tabular-nums">★ {shop.rating}</span>
            )}
            {openStatus !== null && (
              <span className={`text-xs uppercase tracking-widest ${openStatus ? "text-green-600" : "text-zinc-400"}`}>
                {openStatus ? "● open" : "○ closed"}
              </span>
            )}
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-zinc-900 leading-none mb-4">
            {name}
          </h1>
          <p className="text-base text-zinc-500 pb-8">{shop.area}</p>
        </div>

        {/* Stats grid — horizontal bordered cells */}
        {stats.length > 0 && (
          <div className="grid border-b border-zinc-400/30"
            style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))` }}>
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-6 sm:px-10 py-8 ${i < stats.length - 1 ? "border-r border-zinc-400/30" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">{stat.label}</p>
                {stat.multi ? (
                  <div className="space-y-1">
                    {(stat.value as string[]).map((line, j) => (
                      <p key={j} className="text-base text-zinc-800 leading-snug">{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-none">
                    {stat.value as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Photo grid — square tiles */}
        {images.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 border-b border-zinc-400/30">
            {images.slice(1, 7).map((src, i) => (
              <div key={i} className={`relative aspect-square overflow-hidden ${i % 3 !== 2 ? "border-r border-zinc-400/30" : ""} ${i < 3 ? "border-b border-zinc-400/30" : ""}`}>
                <Image src={src} alt="" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="33vw" />
              </div>
            ))}
          </div>
        )}

        {/* Directions */}
        {(shop.google_maps || shop.waze) && (
          <div className="px-6 sm:px-16 py-10 pb-24 flex flex-col sm:flex-row gap-3">
            {shop.google_maps && (
              <a href={shop.google_maps} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center border-2 border-[#D94830] bg-[#D94830] px-10 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                Google Maps ↗
              </a>
            )}
            {shop.waze && (
              <a href={shop.waze} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center border-2 border-zinc-800 px-10 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors">
                Waze ↗
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
