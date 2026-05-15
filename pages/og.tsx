import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

function buildUrl(title: string, subtitle: string): string {
  if (typeof window === "undefined") return "/api/og";
  const base = window.location.origin + "/api/og";
  if (!title) return base;
  const p = new URLSearchParams();
  p.set("title", title);
  if (subtitle) p.set("subtitle", subtitle);
  return `${base}?${p.toString()}`;
}

export default function OGGenerator() {
  const [title, setTitle] = useState("AI and Coffee Meetup");
  const [subtitle, setSubtitle] = useState("16 May 2026 · Kuala Lumpur · Free");
  const [previewUrl, setPreviewUrl] = useState("/api/og");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewUrl(buildUrl(title, subtitle));
    }, 400);
    return () => clearTimeout(t);
  }, [title, subtitle]);

  function copyUrl() {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setTitle("");
    setSubtitle("");
    setPreviewUrl("/api/og");
  }

  return (
    <>
      <Head>
        <title>OG Image Generator — AI and Coffee</title>
        <meta name="description" content="Generate branded Open Graph preview images for events and posts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="tools" />

        <div className="px-6 sm:px-16 pt-12 pb-6 border-b border-zinc-400/40">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">AI and Coffee</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[#D94830] leading-none tracking-tighter">
            OG GENERATOR
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
            generate social preview images
          </p>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">

          {/* ── Form ── */}
          <div className="lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-400/40 px-6 py-10 lg:px-8">
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event or post title..."
                  className="w-full bg-transparent border-b border-zinc-400 pb-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Date · Venue · Fee..."
                  className="w-full bg-transparent border-b border-zinc-400 pb-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={copyUrl}
                  className="w-full border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
                >
                  {copied ? "Copied ✓" : "Copy URL"}
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border-2 border-zinc-800 px-6 py-3 text-xs uppercase tracking-widest text-zinc-800 text-center hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors"
                >
                  Open Image ↗
                </a>
                <button
                  onClick={reset}
                  className="w-full text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors py-2"
                >
                  Reset to default
                </button>
              </div>

              <div className="pt-4 border-t border-zinc-400/40">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Usage</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Paste the URL into your meta tags or share it directly. 1200×630px. Works with WhatsApp, Twitter, LinkedIn, and Telegram.
                </p>
              </div>
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="flex-1 px-6 py-10 lg:px-10">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">Preview</p>

            {/* OG card preview — 1200:630 aspect ratio */}
            <div className="w-full" style={{ aspectRatio: "1200/630" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={previewUrl}
                src={previewUrl}
                alt="OG preview"
                className="w-full h-full object-contain border border-zinc-300 animate-stagger-in"
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 items-start">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">URL</p>
              <p className="text-xs text-zinc-600 break-all leading-relaxed">{previewUrl}</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
