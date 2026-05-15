import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function About() {
  return (
    <>
      <Head>
        <title>About — AI and Coffee</title>
        <meta
          name="description"
          content="No BS. No hierarchy. No laws. The only rule is to be nice. An open source community for everyone interested in AI."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="About — AI and Coffee" />
        <meta property="og:description" content="No BS. No hierarchy. No laws. The only rule is to be nice." />
        <meta property="og:image" content="/logo/logo.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        {/* Nav */}
        <Nav active="about" />

        {/* Hero — big manifesto */}
        <section className="relative px-6 sm:px-16 pt-14 pb-16 overflow-hidden">
          <div className="absolute top-10 right-8 sm:top-12 sm:right-16 rotate-12 hover:rotate-0 transition-transform duration-500">
            <Image
              src="/logo/logo_mascot.png"
              alt=""
              width={110}
              height={110}
            />
          </div>

          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-10">— who we are</p>

          <div className="font-bold tracking-tighter leading-none text-5xl sm:text-7xl text-zinc-800 space-y-2">
            <p>no bs.</p>
            <p>no hierarchy.</p>
            <p>no laws.</p>
          </div>
        </section>

        {/* "Only rule" full-width banner */}
        <div className="border-y border-zinc-400/40 px-6 sm:px-16 py-10">
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
          <div className="sm:col-span-2 border-b sm:border-b-0 sm:border-r border-zinc-400/40 px-6 sm:px-16 py-12">
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

          {/* Right column — stacked */}
          <div className="flex flex-col divide-y divide-zinc-400/40">
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
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                Built in public, by the community. See a bug? Fix it.
                See something missing? Add it. No permission needed.
              </p>
              <a
                href="https://github.com/solahidris/aiandcoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
              >
                github ↗
              </a>
            </div>
          </div>

          {/* Monetization — full width bottom row */}
          <div className="sm:col-span-3 border-t border-zinc-400/40 px-6 sm:px-16 py-12">
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
