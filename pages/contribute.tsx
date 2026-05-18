import Head from "next/head";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function ForkButtonDiagram() {
  return (
    <div className="my-6 max-w-xl">
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">— where to click</p>
      <svg
        viewBox="0 0 600 210"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full border border-zinc-400/40 bg-[#E8E4D9]"
        role="img"
        aria-label="Diagram showing the Fork button location at the top-right of a GitHub repository page, between Watch and Star"
      >
        {/* Browser dots */}
        <circle cx="16" cy="16" r="3.5" fill="#D94830" />
        <circle cx="30" cy="16" r="3.5" fill="#a1a1aa" />
        <circle cx="44" cy="16" r="3.5" fill="#a1a1aa" />

        {/* URL bar */}
        <rect x="64" y="8" width="520" height="16" fill="none" stroke="#a1a1aa" strokeWidth="1" rx="2" />
        <text x="72" y="19" fontFamily="monospace" fontSize="10" fill="#71717a">
          github.com/solahidris/aiandcoffee
        </text>

        {/* Divider */}
        <line x1="0" y1="36" x2="600" y2="36" stroke="#a1a1aa" strokeWidth="0.5" />

        {/* Repo path */}
        <text x="20" y="68" fontFamily="monospace" fontSize="14" fill="#3f3f46" fontWeight="bold">solahidris</text>
        <text x="92" y="68" fontFamily="monospace" fontSize="14" fill="#71717a">/</text>
        <text x="104" y="68" fontFamily="monospace" fontSize="14" fill="#3f3f46" fontWeight="bold">aiandcoffee</text>

        {/* Public badge */}
        <rect x="208" y="56" width="44" height="16" fill="none" stroke="#a1a1aa" strokeWidth="1" rx="8" />
        <text x="230" y="67" fontFamily="monospace" fontSize="9" fill="#71717a" textAnchor="middle">Public</text>

        {/* Watch button */}
        <rect x="346" y="54" width="64" height="22" fill="#E8E4D9" stroke="#a1a1aa" strokeWidth="1" rx="3" />
        <text x="378" y="69" fontFamily="monospace" fontSize="10" fill="#52525b" textAnchor="middle">Watch</text>

        {/* Fork button — highlighted with dashed orange ring */}
        <rect x="412" y="48" width="76" height="34" fill="none" stroke="#D94830" strokeWidth="2.5" strokeDasharray="5 3" rx="6" />
        <rect x="418" y="54" width="64" height="22" fill="#E8E4D9" stroke="#71717a" strokeWidth="1" rx="3" />
        <text x="450" y="69" fontFamily="monospace" fontSize="10" fill="#3f3f46" fontWeight="bold" textAnchor="middle">Fork</text>

        {/* Star button */}
        <rect x="494" y="54" width="64" height="22" fill="#E8E4D9" stroke="#a1a1aa" strokeWidth="1" rx="3" />
        <text x="526" y="69" fontFamily="monospace" fontSize="10" fill="#52525b" textAnchor="middle">Star</text>

        {/* Arrow pointing up to fork */}
        <line x1="450" y1="135" x2="450" y2="92" stroke="#D94830" strokeWidth="2.5" />
        <polygon points="442,100 450,86 458,100" fill="#D94830" />

        {/* Labels under arrow */}
        <text x="450" y="155" fontFamily="monospace" fontSize="13" fill="#D94830" fontWeight="bold" textAnchor="middle">
          click this
        </text>
        <text x="450" y="174" fontFamily="monospace" fontSize="10" fill="#71717a" textAnchor="middle">
          top right of the repo page
        </text>
        <text x="450" y="192" fontFamily="monospace" fontSize="10" fill="#71717a" textAnchor="middle">
          you must be logged in first
        </text>
      </svg>
    </div>
  );
}

function PrBannerDiagram() {
  return (
    <div className="my-6 max-w-xl">
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">— where to click</p>
      <svg
        viewBox="0 0 600 230"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full border border-zinc-400/40 bg-[#E8E4D9]"
        role="img"
        aria-label="Diagram showing the yellow Compare and pull request banner near the top of your forked repo page, with the green button highlighted"
      >
        {/* Browser dots */}
        <circle cx="16" cy="16" r="3.5" fill="#D94830" />
        <circle cx="30" cy="16" r="3.5" fill="#a1a1aa" />
        <circle cx="44" cy="16" r="3.5" fill="#a1a1aa" />

        {/* URL bar */}
        <rect x="64" y="8" width="520" height="16" fill="none" stroke="#a1a1aa" strokeWidth="1" rx="2" />
        <text x="72" y="19" fontFamily="monospace" fontSize="10" fill="#71717a">
          github.com/YOUR-USERNAME/aiandcoffee
        </text>

        {/* Divider */}
        <line x1="0" y1="36" x2="600" y2="36" stroke="#a1a1aa" strokeWidth="0.5" />

        {/* Yellow banner */}
        <rect x="20" y="64" width="560" height="60" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" rx="6" />

        {/* Info icon */}
        <circle cx="42" cy="94" r="8" fill="none" stroke="#92400E" strokeWidth="1.5" />
        <text x="42" y="98" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#92400E" textAnchor="middle">i</text>

        {/* Banner text */}
        <text x="62" y="88" fontFamily="monospace" fontSize="11" fill="#78350F" fontWeight="bold">add-contribute-page</text>
        <text x="195" y="88" fontFamily="monospace" fontSize="11" fill="#78350F">had recent pushes</text>
        <text x="62" y="108" fontFamily="monospace" fontSize="10" fill="#92400E">less than a minute ago</text>

        {/* Green button — highlighted with dashed orange ring */}
        <rect x="412" y="78" width="148" height="32" fill="none" stroke="#D94830" strokeWidth="2.5" strokeDasharray="5 3" rx="6" />
        <rect x="418" y="82" width="136" height="24" fill="#16A34A" stroke="#15803D" strokeWidth="1" rx="3" />
        <text x="486" y="98" fontFamily="monospace" fontSize="10" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
          Compare &amp; pull request
        </text>

        {/* Arrow pointing up to button */}
        <line x1="486" y1="175" x2="486" y2="135" stroke="#D94830" strokeWidth="2.5" />
        <polygon points="478,143 486,127 494,143" fill="#D94830" />

        {/* Labels under arrow */}
        <text x="486" y="195" fontFamily="monospace" fontSize="13" fill="#D94830" fontWeight="bold" textAnchor="middle">
          click this
        </text>
        <text x="486" y="213" fontFamily="monospace" fontSize="10" fill="#71717a" textAnchor="middle">
          green button, top of your fork
        </text>
      </svg>
    </div>
  );
}

const STEPS: { num: string; title: string; body: string; code?: string; note?: string }[] = [
  {
    num: "01",
    title: "get a github account",
    body: "if you don't have one, sign up at github.com. free forever. takes 30 seconds.",
    note: "skip this if you already have one.",
  },
  {
    num: "02",
    title: "fork the repo",
    body: "make sure you're logged in to github first. find the FORK button at the top-right of the repo page — it sits between Watch and Star (see diagram below). click it. on the next screen, leave everything as default and click the green CREATE FORK button. wait 2-3 seconds while github copies the repo to your account.",
    note: "you'll know it worked when the url becomes github.com/YOUR-USERNAME/aiandcoffee and you see \"forked from solahidris/aiandcoffee\" in small text under the repo name.",
  },
  {
    num: "03",
    title: "clone your fork",
    body: "open a terminal. paste this — replace YOUR-USERNAME with yours.",
    code: "git clone https://github.com/YOUR-USERNAME/aiandcoffee.git\ncd aiandcoffee",
  },
  {
    num: "04",
    title: "install and run it",
    body: "you need node.js installed first. then run these two commands.",
    code: "npm install\nnpm run dev",
    note: "open http://localhost:3000 in your browser. the site is now running on your laptop.",
  },
  {
    num: "05",
    title: "create a new branch",
    body: "never touch main. always branch. name it whatever describes your change.",
    code: "git checkout -b fix-typo-on-about-page",
  },
  {
    num: "06",
    title: "make your changes",
    body: "edit code. save the file. the browser auto-refreshes. break things. fix things. repeat.",
  },
  {
    num: "07",
    title: "commit your work",
    body: "save your progress with git. message can be anything — just say what you did.",
    code: 'git add .\ngit commit -m "fixed typo on about page"',
  },
  {
    num: "08",
    title: "push to your fork",
    body: "your commits only live on your laptop until you push. this sends them up to your fork on github.",
    code: "git push origin fix-typo-on-about-page",
    note: "watch the terminal output — github prints a clickable link to open a PR directly. cmd-click (mac) or ctrl-click (windows) it and skip step 09.",
  },
  {
    num: "09",
    title: "find the pull request banner",
    body: "open your fork at github.com/YOUR-USERNAME/aiandcoffee. a yellow banner appears near the top mentioning your branch, with a green COMPARE & PULL REQUEST button on the right (see diagram below). click the green button.",
    note: "didn't see the banner? it disappears after a few minutes. fallback: click the PULL REQUESTS tab, then the green NEW PULL REQUEST button.",
  },
  {
    num: "10",
    title: "submit the pull request",
    body: "you'll land on a form with two fields. write a short title (one line — what you changed). for the description, copy the template below and fill in the blanks. then click the green CREATE PULL REQUEST button at the bottom. nobody reads novels — short is better.",
    code: "adds: <what you added>\nwhy: <one line, if relevant>\nnotes: <anything reviewer should know, or \"none\">",
    note: "that's it. you're a contributor. your name shows up on the repo forever.",
  },
];

export default function Contribute() {
  return (
    <>
      <Head>
        <title>Contribute — AI and Coffee</title>
        <meta name="description" content="How to contribute to AI and Coffee. A no-bs, for-dummies guide to your first pull request. No permission needed." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/contribute" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/contribute" />
        <meta property="og:title" content="Contribute — AI and Coffee" />
        <meta property="og:description" content="how to ship your first pull request. no gatekeepers. no permission. just build." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contribute — AI and Coffee" />
        <meta name="twitter:description" content="how to ship your first pull request. no gatekeepers. no permission. just build." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        {/* Nav */}
        <Nav active="contribute" />

        {/* Hero — manifesto */}
        <section className="relative px-6 sm:px-16 pt-14 pb-16 overflow-hidden">
          {/* Mobile mascot */}
          <div className="sm:hidden absolute top-10 right-8 -rotate-12 hover:rotate-0 transition-transform duration-500">
            <Image src="/logo/logo_mascot.png" alt="" width={110} height={110} />
          </div>

          {/* Desktop mascot */}
          <div className="hidden sm:block absolute -top-4 right-0 -rotate-6 hover:rotate-0 transition-transform duration-500 pointer-events-none">
            <Image src="/logo/logo_mascot.png" alt="" width={420} height={420} className="opacity-90" />
          </div>

          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-10 animate-stagger-in">— contribute</p>

          <div className="font-bold tracking-tighter leading-none text-5xl sm:text-7xl text-zinc-800 space-y-2">
            <p className="animate-hero-in">anyone can build.</p>
            <p className="animate-hero-in" style={{ animationDelay: "100ms" }}>no permission.</p>
            <p className="animate-hero-in" style={{ animationDelay: "200ms" }}>no gatekeepers.</p>
          </div>
        </section>

        {/* Banner */}
        <div className="border-y border-zinc-400/40 px-6 sm:px-16 py-10 animate-stagger-in" style={{ animationDelay: "400ms" }}>
          <p className="text-3xl sm:text-5xl font-bold text-[#D94830] tracking-tighter leading-none mb-5">
            the bar is the floor.
          </p>
          <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
            never opened a terminal? never written a line of code? doesn&apos;t matter.
            this guide walks you through your first pull request from absolute zero.
            if you can copy-paste, you can contribute.
          </p>
        </div>

        {/* Steps section */}
        <section className="px-6 sm:px-16 py-14 border-b border-zinc-400/40">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-10 animate-stagger-in">— the 10 steps</p>

          <div className="space-y-10 sm:space-y-12">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 animate-stagger-in"
                style={{ animationDelay: `${550 + i * 60}ms` }}
              >
                {/* Number */}
                <div className="sm:col-span-2">
                  <p className="text-4xl sm:text-5xl font-bold text-[#D94830] tracking-tighter leading-none">
                    {step.num}
                  </p>
                </div>

                {/* Content */}
                <div className="sm:col-span-10 sm:border-l sm:border-zinc-400/40 sm:pl-8">
                  <p className="text-lg sm:text-xl font-bold text-zinc-800 tracking-tight mb-3 lowercase">
                    {step.title}
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-xl mb-4">
                    {step.body}
                  </p>

                  {step.num === "02" && <ForkButtonDiagram />}
                  {step.num === "09" && <PrBannerDiagram />}

                  {step.code && (
                    <pre className="bg-zinc-800 text-[#E8E4D9] text-[11px] leading-relaxed p-4 overflow-x-auto max-w-xl mb-4 whitespace-pre">
                      {step.code}
                    </pre>
                  )}

                  {step.note && (
                    <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xl italic">
                      → {step.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bento grid — what to build / events / help */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-zinc-400/40">

          {/* What to build — spans 2 cols */}
          <div className="sm:col-span-2 border-b sm:border-b-0 sm:border-r border-zinc-400/40 px-6 sm:px-16 py-12 animate-stagger-in" style={{ animationDelay: "1300ms" }}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-8">what to build</p>
            <div className="flex flex-wrap gap-4 font-bold uppercase tracking-widest text-zinc-700 text-sm mb-8">
              {["fix a typo", "add a tool", "new page", "design tweak", "wild idea"].map((label) => (
                <span key={label} className="border-b-2 border-zinc-400 pb-1">{label}</span>
              ))}
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mb-4">
              see something broken? fix it. think the site needs a feature? add it.
              want to redesign the whole thing? send a pr.
            </p>
            <a
              href="https://github.com/solahidris/aiandcoffee/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
            >
              browse open issues ↗
            </a>
          </div>

          {/* Right column — stacked */}
          <div className="flex flex-col divide-y divide-zinc-400/40 animate-stagger-in" style={{ animationDelay: "1400ms" }}>
            <div className="px-6 py-10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">don&apos;t wanna code?</p>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                got an event? open a github issue with the details. that&apos;s the whole submission flow.
                no forms, no signups.
              </p>
              <a
                href="https://github.com/solahidris/aiandcoffee/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
              >
                add an event ↗
              </a>
            </div>

            <div className="px-6 py-10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">stuck?</p>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                drop your question in the whatsapp group. someone will help. nobody bites.
                <span className="font-bold text-zinc-800"> only rule: be nice.</span>
              </p>
              <a
                href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-400 pb-0.5"
              >
                join the group ↗
              </a>
            </div>
          </div>

          {/* Pro tips — full width bottom row */}
          <div className="sm:col-span-3 border-t border-zinc-400/40 px-6 sm:px-16 py-12 animate-stagger-in" style={{ animationDelay: "1500ms" }}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">tips</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl">
              <div>
                <p className="text-sm font-bold text-zinc-800 tracking-tight mb-2">
                  → your code doesn&apos;t need to be perfect.
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  small messy pr &gt; perfect pr that never ships. open it. iterate.
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 tracking-tight mb-2">
                  → ai is your pair programmer.
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  read claude.md in the repo. paste it into claude or cursor. let it help.
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 tracking-tight mb-2">
                  → no database. keep it that way.
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  data lives in /data as json. github actions auto-update events. no servers to babysit.
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 tracking-tight mb-2">
                  → tech stack.
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  next.js (pages router) + typescript + tailwind. deployed on cloudflare pages.
                </p>
              </div>
            </div>

            <blockquote className="mt-10 border-l-2 border-[#D94830] pl-4 max-w-sm">
              <p className="text-sm font-bold text-zinc-800 tracking-tight leading-snug">
                the best contributors are the ones who just start.
              </p>
            </blockquote>
          </div>
        </div>

        {/* CTAs */}
        <div className="px-6 sm:px-16 py-12 pb-24 flex flex-col sm:flex-row gap-4">
          <a
            href="https://github.com/solahidris/aiandcoffee/fork"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
          >
            Fork the repo
          </a>
          <a
            href="https://github.com/solahidris/aiandcoffee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-zinc-800 px-8 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors"
          >
            View on GitHub
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
