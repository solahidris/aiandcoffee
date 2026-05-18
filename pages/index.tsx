import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useEffect } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { TRACKS } from "../lib/tracks";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Index of "Instrumental 1" in the TRACKS array
const AUTOPLAY_IDX = TRACKS.findIndex(t => t.title === "Instrumental 1");

export default function Home() {
  const { selectTrack, isPlaying } = usePlayer();

  // Auto-play if music is not already playing
  useEffect(() => {
    if (!isPlaying) {
      const t = setTimeout(() => selectTrack(AUTOPLAY_IDX >= 0 ? AUTOPLAY_IDX : 0), 600);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>AI and Coffee — Open Source Tech Community in Malaysia</title>
        <meta name="description" content="No BS. No hierarchy. No laws. The only rule is to be nice. An open source tech community for everyone — from clueless to sharks." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com" />
        <meta property="og:title" content="AI and Coffee — Open Source Tech Community" />
        <meta property="og:description" content="No BS. No hierarchy. No laws. The only rule is to be nice." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@aiandcoffee" />
        <meta name="twitter:title" content="AI and Coffee — Open Source Tech Community" />
        <meta name="twitter:description" content="No BS. No hierarchy. No laws. The only rule is to be nice." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>
      <div className={`${geistMono.className} min-h-screen sm:h-screen sm:overflow-hidden bg-[#E8E4D9] font-mono sm:flex sm:flex-col`}>
        {/* Background animated mascot */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="animate-float opacity-10">
            <Image
              src="/logo/logo_mascot_transparent.png"
              alt=""
              width={800}
              height={800}
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
              priority
            />
          </div>
        </div>

        {/* Nav */}
        <Nav active="home" />

        <main className="relative overflow-hidden px-6 py-6 sm:py-4 z-10 sm:flex-1">
          {/* Main content - left aligned, raw */}
          <div className="max-w-xl pt-6 sm:pt-4 sm:pl-16">
            <h1 className="text-6xl sm:text-7xl font-bold leading-none tracking-tighter">
              <span className="block text-[#D94830] animate-hero-in">AI</span>
              <span className="block text-zinc-800 animate-hero-in" style={{ animationDelay: "100ms" }}>AND</span>
              <span className="block text-[#D94830] animate-hero-in" style={{ animationDelay: "200ms" }}>COFFEE</span>
            </h1>

            <div className="mt-8 space-y-2 text-zinc-700 animate-stagger-in" style={{ animationDelay: "400ms" }}>
              <p className="text-lg">no bs.</p>
              <p className="text-lg">no hierarchy.</p>
              <p className="text-lg">no laws.</p>
              <p className="mt-4 text-2xl font-bold text-zinc-900">
                only rule: be nice
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-zinc-500 animate-stagger-in" style={{ animationDelay: "600ms" }}>
              <span className="border-b border-zinc-400 pb-1">clueless</span>
              <span className="border-b border-zinc-400 pb-1">beginners</span>
              <span className="border-b border-zinc-400 pb-1">seniors</span>
              <span className="border-b border-zinc-400 pb-1">whales</span>
              <span className="border-b border-zinc-400 pb-1">sharks</span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-stagger-in" style={{ animationDelay: "750ms" }}>
              <a
                className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
                href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join WhatsApp
              </a>
              <a
                className="inline-block border-2 border-zinc-800 px-8 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors"
                href="https://luma.com/6axuvn1j"
                target="_blank"
                rel="noopener noreferrer"
              >
                Our Next Event
              </a>
            </div>

            {/* Bottom note — inline on mobile, hidden on sm+ (shown as absolute) */}
            <div className="mt-8 sm:hidden animate-stagger-in" style={{ animationDelay: "900ms" }}>
              <p className="text-xs text-zinc-500 leading-relaxed">
                no social media<br />
                just whatsapp<br />
                <span className="text-zinc-400">expanding @ 1024 members</span>
              </p>
              <div className="mt-2 flex gap-4">
                <Link
                  href="/memories"
                  className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  memories →
                </Link>
                <Link
                  href="/contribute"
                  className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  github ↗
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom corner note — desktop only */}
          <div className="hidden sm:block absolute bottom-[80px] right-16 max-w-[200px] text-right animate-stagger-in z-10" style={{ animationDelay: "900ms" }}>
            <p className="text-xs text-zinc-500 leading-relaxed">
              no social media<br />
              just whatsapp<br />
              <span className="text-zinc-400">expanding @ 1024 members</span>
            </p>
            <div className="mt-2 flex justify-end gap-4">
              <Link
                href="/memories"
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                memories →
              </Link>
              <Link
                href="/contribute"
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                github ↗
              </Link>
            </div>
          </div>

          {/* Random decorative element */}
          <div className="absolute bottom-32 left-8 sm:left-16 text-[120px] sm:text-[200px] font-bold text-zinc-300/30 select-none pointer-events-none leading-none animate-stagger-in" style={{ animationDelay: "500ms" }}>
            *
          </div>
        </main>

      </div>
    </>
  );
}
