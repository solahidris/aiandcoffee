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
  const [activeImg, setActiveImg]     = useState(0); // thumbnail ring
  const [displayedImg, setDisplayedImg] = useState(0); // main image src
  const [fading, setFading]           = useState(false);
  const [openStatus, setOpenStatus]   = useState<boolean | null>(null);

  useEffect(() => {
    if (shop.hours) setOpenStatus(isOpenNow(shop.hours));
  }, [shop.hours]);

  useEffect(() => { setActiveImg(0); setDisplayedImg(0); }, [shop.id]);

  const handleSelectImg = (i: number) => {
    if (i === activeImg) return;
    setActiveImg(i);       // highlight thumbnail immediately
    setFading(true);
    setTimeout(() => {
      setDisplayedImg(i);  // swap image after fade-out
      setFading(false);
    }, 220);
  };

  const name = shop.name.trim();
  const hoursLines = formatHours(shop.hours);
  const hasGear = shop.machine || shop.grinder;
  const hasSize = shop.capacity_pax != null || shop.size_sqft != null;

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

        <div className="max-w-6xl mx-auto px-6 sm:px-16 py-8 pb-24">

          {/* Back */}
          <Link href="/coffee"
            className="animate-stagger-in inline-block text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors mb-8"
            style={{ animationDelay: "0ms" }}>
            ← coffee
          </Link>

          {/* Two-column on desktop: gallery left, info right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* LEFT — Gallery */}
            <div>
              {images.length > 0 ? (
                <>
                  {/* Main image */}
                  <div
                    className="animate-stagger-in relative w-full aspect-square overflow-hidden bg-zinc-200"
                    style={{ animationDelay: "60ms" }}
                  >
                    <Image
                      src={images[displayedImg]}
                      alt={`${name} — photo ${displayedImg + 1}`}
                      fill
                      className={`object-cover transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}
                      priority={displayedImg === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>

                  {/* Thumbnails — each staggers in */}
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {images.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectImg(i)}
                          className={`animate-stagger-in relative shrink-0 w-24 h-24 overflow-hidden transition-all duration-150 ${
                            i === activeImg
                              ? "ring-2 ring-offset-1 ring-[#D94830] opacity-100"
                              : "opacity-40 hover:opacity-80"
                          }`}
                          style={{ animationDelay: `${140 + i * 50}ms` }}
                        >
                          <Image src={src} alt="" fill className="object-cover" sizes="96px" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-stagger-in w-full aspect-square bg-zinc-200 flex items-center justify-center"
                  style={{ animationDelay: "60ms" }}>
                  <p className="text-xs uppercase tracking-widest text-zinc-400">no photos</p>
                </div>
              )}
            </div>

            {/* RIGHT — Info */}
            <div className="flex flex-col gap-8">

              {/* Name + meta */}
              <div className="animate-stagger-in" style={{ animationDelay: "80ms" }}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {shop.vibe && (
                    <span className="text-[10px] uppercase tracking-widest text-[#D94830]">{shop.vibe}</span>
                  )}
                  {shop.rating != null && (
                    <span className="text-sm text-zinc-400 tabular-nums">★ {shop.rating}</span>
                  )}
                  {openStatus !== null && (
                    <span className={`text-xs uppercase tracking-widest ${openStatus ? "text-green-600" : "text-zinc-400"}`}>
                      {openStatus ? "● open now" : "○ closed"}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-zinc-900 leading-none mb-3">
                  {name}
                </h1>
                <p className="text-base text-zinc-500">{shop.area}</p>
              </div>

              {/* Gear */}
              {hasGear && (
                <div className="animate-stagger-in border-t border-zinc-400/30 pt-8" style={{ animationDelay: "160ms" }}>
                  <div className="grid grid-cols-2 gap-6">
                    {shop.machine && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Machine</p>
                        <p className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight">{shop.machine}</p>
                      </div>
                    )}
                    {shop.grinder && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Grinder</p>
                        <p className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight">{shop.grinder}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hours */}
              {hoursLines.length > 0 && (
                <div className="animate-stagger-in border-t border-zinc-400/30 pt-8" style={{ animationDelay: "220ms" }}>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Hours</p>
                  <div className="space-y-1.5">
                    {hoursLines.map((line, i) => (
                      <p key={i} className="text-base text-zinc-700 leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity */}
              {hasSize && (
                <div className="animate-stagger-in border-t border-zinc-400/30 pt-8" style={{ animationDelay: "280ms" }}>
                  <div className="flex gap-10">
                    {shop.capacity_pax != null && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Capacity</p>
                        <p className="text-2xl font-bold text-zinc-900">~{shop.capacity_pax} pax</p>
                      </div>
                    )}
                    {shop.size_sqft != null && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Size</p>
                        <p className="text-2xl font-bold text-zinc-900">~{shop.size_sqft.toLocaleString()} sqft</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Directions */}
              {(shop.google_maps || shop.waze) && (
                <div className="animate-stagger-in border-t border-zinc-400/30 pt-8 mt-auto flex flex-col sm:flex-row gap-3" style={{ animationDelay: "340ms" }}>
                  {shop.google_maps && (
                    <a href={shop.google_maps} target="_blank" rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center border-2 border-[#D94830] bg-[#D94830] px-6 py-3.5 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                      Google Maps ↗
                    </a>
                  )}
                  {shop.waze && (
                    <a href={shop.waze} target="_blank" rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center border-2 border-zinc-800 px-6 py-3.5 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors">
                      Waze ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
