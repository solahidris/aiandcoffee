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
  } catch {
    // manifest not yet generated
  }

  return { props: { shop, images } };
};

export default function ShopPage({ shop, images = [] }: { shop: Shop; images: string[] }) {
  const [openStatus, setOpenStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (shop.hours) setOpenStatus(isOpenNow(shop.hours));
  }, [shop.hours]);

  const name = shop.name.trim();
  const hoursLines = formatHours(shop.hours);
  const hasGear = shop.machine || shop.grinder;
  const hasSize = shop.capacity_pax != null || shop.size_sqft != null;

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
        <meta property="og:image" content={images[0] ?? "https://aiandcoffee.com/og-image.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${name} — AI and Coffee`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={images[0] ?? "https://aiandcoffee.com/og-image.png"} />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="coffee" />

        {/* Hero — image with overlay when photos exist */}
        {images.length > 0 ? (
          <div className="relative w-full h-[55vw] max-h-[520px] min-h-[280px] overflow-hidden">
            <Image
              src={images[0]}
              alt={name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* back link top-left */}
            <div className="absolute top-0 left-0 right-0 px-6 sm:px-16 pt-6">
              <Link href="/coffee"
                className="text-[9px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                ← coffee
              </Link>
            </div>

            {/* name + meta bottom-left */}
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-16 pb-8">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {shop.vibe && (
                  <span className="text-[8px] uppercase tracking-widest bg-[#D94830] text-white px-2 py-0.5">
                    {shop.vibe}
                  </span>
                )}
                {shop.rating != null && (
                  <span className="text-[9px] text-white/60 tabular-nums">★ {shop.rating}</span>
                )}
                {openStatus !== null && (
                  <span className={`text-[9px] uppercase tracking-widest ${openStatus ? "text-green-400" : "text-white/40"}`}>
                    {openStatus ? "● open now" : "○ closed"}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter text-white leading-none mb-2">
                {name}
              </h1>
              <p className="text-sm text-white/60">{shop.area}</p>
            </div>
          </div>
        ) : (
          /* No photos: text-only hero */
          <section className="px-6 sm:px-16 pt-8 pb-10 border-b border-zinc-400/40">
            <Link href="/coffee"
              className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors">
              ← coffee
            </Link>
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {shop.vibe && <span className="text-[9px] uppercase tracking-widest text-[#D94830]">{shop.vibe}</span>}
                {shop.rating != null && <span className="text-[9px] text-zinc-400 tabular-nums">★ {shop.rating}</span>}
                {openStatus !== null && (
                  <span className={`text-[9px] uppercase tracking-widest ${openStatus ? "text-green-700" : "text-zinc-400"}`}>
                    {openStatus ? "● open now" : "○ closed"}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-zinc-800 leading-none mb-3">{name}</h1>
              <p className="text-sm text-zinc-500">{shop.area}</p>
            </div>
          </section>
        )}

        {/* Thumbnail strip — remaining photos */}
        {images.length > 1 && (
          <div className="flex overflow-x-auto border-b border-zinc-400/40 gap-px bg-zinc-400/20">
            {images.slice(1).map((src, i) => (
              <div key={i} className="relative shrink-0 h-28 sm:h-36 w-40 sm:w-52">
                <Image src={src} alt="" fill className="object-cover" sizes="208px" />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-6 sm:px-16 py-10 flex flex-col gap-10 max-w-3xl">

          {/* Hours */}
          {hoursLines.length > 0 && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-3">hours</p>
              <div className="space-y-1.5">
                {hoursLines.map((line, i) => (
                  <p key={i} className="text-sm text-zinc-700">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Gear */}
          {hasGear && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-3">gear</p>
              <div className="flex flex-wrap gap-8">
                {shop.machine && (
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1">machine</p>
                    <p className="text-base font-bold text-zinc-800 tracking-tight">{shop.machine}</p>
                  </div>
                )}
                {shop.grinder && (
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1">grinder</p>
                    <p className="text-base font-bold text-zinc-800 tracking-tight">{shop.grinder}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Space */}
          {hasSize && (
            <div className="flex flex-wrap gap-8">
              {shop.capacity_pax != null && (
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1">capacity</p>
                  <p className="text-sm text-zinc-700">~{shop.capacity_pax} pax</p>
                </div>
              )}
              {shop.size_sqft != null && (
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-1">size</p>
                  <p className="text-sm text-zinc-700">~{shop.size_sqft.toLocaleString()} sqft</p>
                </div>
              )}
            </div>
          )}

          {/* Directions */}
          {(shop.google_maps || shop.waze) && (
            <div>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mb-4">directions</p>
              <div className="flex flex-wrap gap-3">
                {shop.google_maps && (
                  <a href={shop.google_maps} target="_blank" rel="noopener noreferrer"
                    className="inline-block border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                    Google Maps ↗
                  </a>
                )}
                {shop.waze && (
                  <a href={shop.waze} target="_blank" rel="noopener noreferrer"
                    className="inline-block border-2 border-zinc-700 px-6 py-3 text-xs uppercase tracking-widest text-zinc-700 hover:bg-zinc-700 hover:text-[#E8E4D9] transition-colors">
                    Waze ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pb-24" />
      </div>
    </>
  );
}
