import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const FIRST_COMMIT_DATE = new Date("2026-05-14");

type Contributor = { login: string; avatar_url: string; html_url: string };

export default function About() {
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const [contributors, setContributors] = useState<Contributor[]>([]);

  useEffect(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - FIRST_COMMIT_DATE.getTime()) / (1000 * 60 * 60 * 24));
    setDaysSinceStart(diff);
  }, []);

  useEffect(() => {
    fetch("https://api.github.com/repos/solahidris/aiandcoffee/contributors")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setContributors(data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>About — AI and Coffee</title>
        <meta name="description" content="Who we are, what we value, and why we exist. No BS. No hierarchy. No laws. The only rule is to be nice." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/about" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/about" />
        <meta property="og:title" content="About — AI and Coffee" />
        <meta property="og:description" content="No BS. No hierarchy. No laws. The only rule is to be nice." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About — AI and Coffee" />
        <meta name="twitter:description" content="No BS. No hierarchy. No laws. The only rule is to be nice." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono pb-24`}>
        {/* Nav */}
        <Nav active="about" />

        {/* Hero — big manifesto */}
        <section className="relative px-6 sm:px-16 pt-14 pb-16 overflow-hidden">
          {/* Mobile mascot — small */}
          <div className="sm:hidden absolute top-10 right-8 rotate-12 hover:rotate-0 transition-transform duration-500">
            <Image src="/logo/logo_mascot.png" alt="" width={110} height={110} />
          </div>

          {/* Desktop mascot — large */}
          <div className="hidden sm:block absolute -top-4 right-0 rotate-6 hover:rotate-0 transition-transform duration-500 pointer-events-none">
            <Image src="/logo/logo_mascot.png" alt="" width={420} height={420} className="opacity-90" />
          </div>

          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-10 animate-stagger-in">— who we are</p>

          <div className="font-bold tracking-tighter leading-none text-5xl sm:text-7xl text-zinc-800 space-y-2">
            <p className="animate-hero-in">no bs.</p>
            <p className="animate-hero-in" style={{ animationDelay: "100ms" }}>no hierarchy.</p>
            <p className="animate-hero-in" style={{ animationDelay: "200ms" }}>no laws.</p>
          </div>
        </section>

        {/* "Only rule" full-width banner */}
        <div className="border-y border-zinc-400/40 px-6 sm:px-16 py-10 animate-stagger-in" style={{ animationDelay: "400ms" }}>
          <p className="text-3xl sm:text-5xl font-bold text-[#D94830] tracking-tighter leading-none mb-5">
            only rule: be nice
          </p>
          <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
            Think of it like a DAO — open-ended, ever-evolving. No roadmap, no founders
            calling shots, no gatekeepers. The community decides everything.
            If you want something built, build it.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-zinc-400/40">

          {/* Who's welcome — spans 2 cols */}
          <div className="sm:col-span-2 border-b sm:border-b-0 sm:border-r border-zinc-400/40 px-6 sm:px-16 py-12 animate-stagger-in relative overflow-hidden" style={{ animationDelay: "550ms" }}>
            {/* Collage backdrop */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-1/3 h-full">
                <Image src="/memories/mem-001/1.png" alt="" fill className="object-cover" />
              </div>
              <div className="absolute top-0 left-1/3 w-1/3 h-full">
                <Image src="/memories/mem-001/2.png" alt="" fill className="object-cover" />
              </div>
              <div className="absolute top-0 left-2/3 w-1/3 h-full">
                <Image src="/memories/mem-001/3.png" alt="" fill className="object-cover" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-8">who&apos;s welcome</p>
              <div className="flex flex-wrap gap-4 font-bold uppercase tracking-widest text-zinc-700 text-sm mb-8">
                {["clueless", "beginners", "seniors", "whales", "sharks"].map((label) => (
                  <span key={label} className="border-b-2 border-zinc-400 pb-1">{label}</span>
                ))}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                Whether you&apos;ve never touched AI or you&apos;re shipping models to production —
                you belong here. Leave the ego at the door.
              </p>
            </div>
          </div>

          {/* Right column — stacked */}
          <div className="flex flex-col divide-y divide-zinc-400/40 animate-stagger-in" style={{ animationDelay: "650ms" }}>
            <div className="px-6 py-10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">no social media</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Just a WhatsApp group. No Twitter, no LinkedIn, no newsletter.
                We expand after hitting{" "}
                <span className="font-bold text-zinc-800">1,024 members</span>.
                Until then — one group, one vibe.
              </p>
            </div>

            <div className="px-6 py-10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">open source</p>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Built in public, by the community. See a bug? Fix it.
                See something missing? Add it. No permission needed.
              </p>
              {contributors.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    {contributors.slice(0, 8).map((c, i) => (
                      <a
                        key={c.login}
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={c.login}
                        className="block rounded-full border-2 border-[#E8E4D9] overflow-hidden hover:scale-110 transition-transform"
                        style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: contributors.length - i }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.avatar_url} alt={c.login} width={28} height={28} className="block" />
                      </a>
                    ))}
                    {contributors.length > 8 && (
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#E8E4D9] bg-zinc-300 text-[9px] font-bold text-zinc-600"
                        style={{ marginLeft: "-8px" }}
                      >
                        +{contributors.length - 8}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    <span className="font-bold text-zinc-800">{contributors.length}</span> contributor{contributors.length !== 1 ? "s" : ""} and counting
                  </p>
                </div>
              )}
              <a
                href="https://github.com/solahidris/aiandcoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
              >
                github ↗
              </a>
            </div>

            <div className="px-6 py-10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">day one</p>
              <p className="text-2xl font-bold text-[#D94830] tracking-tighter mb-1">
                {daysSinceStart} days
              </p>
              <p className="text-xs text-zinc-500 mb-3">since first commit</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Started on <span className="font-bold text-zinc-800">14 May 2026</span>.
                <br />
                Building in public ever since.
              </p>
            </div>
          </div>

          {/* Monetization — full width bottom row */}
          <div className="sm:col-span-3 border-t border-zinc-400/40 px-6 sm:px-16 py-12 animate-stagger-in" style={{ animationDelay: "750ms" }}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">how do we make money?</p>
            <p className="text-sm font-bold text-zinc-800 tracking-tight mb-3">
              we don&apos;t. not yet anyway.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-lg">
              no plans. no monetization strategy. we just wanna vibe with everyone first and maximize
              giving out value. we&apos;ll figure the rest out sooner or later.
            </p>
            <blockquote className="mt-6 border-l-2 border-[#D94830] pl-4 max-w-sm">
              <p className="text-sm font-bold text-zinc-800 tracking-tight leading-snug">
                a community isn&apos;t a monetisation strategy.
              </p>
            </blockquote>
            <p className="mt-6 text-xs text-zinc-500 leading-relaxed max-w-lg">
              it&apos;s value first, and always good vibes. we&apos;re here to share what we know,
              learn from each other, and push each other forward — no hidden agenda, no
              transactional energy. when everyone grows as a collective, everyone wins.
              that&apos;s the only scoreboard that matters.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-lg mt-3">
              if you want to sponsor anything — join the community first.{" "}
              <span className="font-bold text-zinc-800">only if our values align</span>,
              only then will we accept the gesture.
            </p>
          </div>
        </div>

        {/* Past Events */}
        <div className="border-b border-zinc-400/40 px-6 sm:px-16 py-12 animate-stagger-in" style={{ animationDelay: "850ms" }}>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">our past events</p>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-md mb-6">
            We've been hanging out, sharing ideas, and building together.
            Check out the memories from our past meetups.
          </p>
          <Link
            href="/memories"
            className="inline-block text-xs uppercase tracking-widest text-[#D94830] hover:text-zinc-900 transition-colors border-b border-[#D94830] pb-0.5"
          >
            View memories →
          </Link>
        </div>

        {/* CTAs */}
        <div className="px-6 sm:px-16 py-12 flex flex-col sm:flex-row gap-4">
          <a
            href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
          >
            Join WhatsApp
          </a>
          <a
            href="https://luma.com/9f63qyq1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-zinc-800 px-8 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors"
          >
            Our Next Event
          </a>
        </div>

        {/* Decorative */}
        <div className="fixed bottom-0 right-0 text-[200px] sm:text-[300px] font-bold text-zinc-300/20 select-none pointer-events-none leading-none translate-x-1/4 translate-y-1/4">
          *
        </div>
      </div>
    </>
  );
}
