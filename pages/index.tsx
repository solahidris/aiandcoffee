import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useState, useRef, useEffect } from "react";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const MINI_TRACK = {
  title: "Coffee and Code",
  artist: "AI and Coffee",
  src: "/music/vocal/coffee-and-code.mp3",
};

export default function Home() {
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [minimized,  setMinimized]  = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = setTimeout(() => {
      audio.play().then(() => setIsPlaying(true)).catch(() => {/* autoplay blocked */});
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

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
      <audio ref={audioRef} src={MINI_TRACK.src} loop />

      <style>{`
        @keyframes minibar {
          0%, 100% { transform: scaleY(0.2); }
          50%       { transform: scaleY(1);   }
        }
      `}</style>

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
              <a
                href="https://github.com/solahidris/aiandcoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                github ↗
              </a>
            </div>
          </div>

          {/* Bottom corner note — desktop only */}
          <div className="hidden sm:block absolute bottom-[80px] right-16 max-w-[200px] text-right animate-stagger-in z-10" style={{ animationDelay: "900ms" }}>
            <p className="text-xs text-zinc-500 leading-relaxed">
              no social media<br />
              just whatsapp<br />
              <span className="text-zinc-400">expanding @ 1024 members</span>
            </p>
            <a
              href="https://github.com/solahidris/aiandcoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              github ↗
            </a>
          </div>

          {/* Random decorative element */}
          <div className="absolute bottom-32 left-8 sm:left-16 text-[120px] sm:text-[200px] font-bold text-zinc-300/30 select-none pointer-events-none leading-none animate-stagger-in" style={{ animationDelay: "500ms" }}>
            *
          </div>
        </main>

        {/* Mini player — full bar */}
        {!minimized && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-400/40 bg-[#E8E4D9]/95 backdrop-blur-sm">
            <div className="px-6 sm:px-16 py-3 flex items-center gap-4">

              {/* Animated bars */}
              <div className="flex items-end gap-[3px] h-4 shrink-0">
                {[0, 0.18, 0.09, 0.25].map((delay, i) => (
                  <div key={i} className="w-[3px] rounded-full bg-[#D94830]"
                    style={{
                      height: 16, transformOrigin: "bottom",
                      transform: isPlaying ? undefined : "scaleY(0.2)",
                      opacity: isPlaying ? 1 : 0.35,
                      transition: "opacity 0.3s",
                      animation: isPlaying ? `minibar ${0.55 + i * 0.08}s ease-in-out ${delay}s infinite` : "none",
                    }}
                  />
                ))}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold tracking-tight text-zinc-800 truncate">{MINI_TRACK.title}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">{MINI_TRACK.artist}</p>
              </div>

              {/* Play / Pause */}
              <button onClick={togglePlay}
                className="w-8 h-8 bg-[#D94830] hover:bg-[#C13D27] text-white flex items-center justify-center transition-colors shrink-0"
                aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Full player link */}
              <Link href="/vibes"
                className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors shrink-0 whitespace-nowrap">
                full player ↗
              </Link>

              {/* Minimize */}
              <button onClick={() => setMinimized(true)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
                aria-label="Minimize player">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Mini player — minimized square */}
        {minimized && (
          <button
            onClick={() => setMinimized(false)}
            className="fixed bottom-4 right-6 z-50 w-12 h-12 border border-zinc-400/40 bg-[#E8E4D9]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-1 hover:border-zinc-500 transition-colors"
            aria-label="Expand player"
          >
            {/* Tiny bars */}
            <div className="flex items-end gap-[2px]">
              {[0, 0.18, 0.09, 0.25].map((delay, i) => (
                <div key={i} className="w-[2px] rounded-full bg-[#D94830]"
                  style={{
                    height: 8, transformOrigin: "bottom",
                    transform: isPlaying ? undefined : "scaleY(0.3)",
                    animation: isPlaying ? `minibar ${0.55 + i * 0.08}s ease-in-out ${delay}s infinite` : "none",
                  }}
                />
              ))}
            </div>
            {/* Play/pause icon */}
            <div className="text-[#D94830]">
              {isPlaying ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>
        )}
      </div>
    </>
  );
}
