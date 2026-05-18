import Head from "next/head";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import { useState, useMemo } from "react";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Grant {
  id: string;
  name: string;
  amount: string;
  type: string;
  category: string;
  description: string;
  eligibility: string[];
  details: string[];
  url: string;
  urlLabel: string;
  logo: string;
}

const GRANTS: Grant[] = [
  {
    id: "cradle-spark",
    name: "Cradle CIP Spark",
    amount: "Up to RM150k",
    type: "Pre-seed Grant",
    category: "grant",
    logo: "/broke_logo/cradle_logo.png",
    description: "For MVP development and prototyping. This is a grant, not investment — they don't take equity. Good starting point if you're building something new.",
    eligibility: [
      "Min 2 people (at least 1 Malaysian)",
      "Or company <5 years old, <RM3M revenue",
      "51% Malaysian-owned (or majority MY employees)",
      "No single shareholder >25%",
      "You own the IP",
    ],
    details: [
      "18 months duration",
      "60% for development costs",
      "Paid in milestones",
      "Conditional — payback if you quit early",
    ],
    url: "https://cradle.com.my/cip-spark/",
    urlLabel: "Apply for CIP Spark",
  },
  {
    id: "cradle-sprint",
    name: "Cradle CIP Sprint",
    amount: "Up to RM600k",
    type: "Commercial Grant",
    category: "grant",
    logo: "/broke_logo/cradle_logo.png",
    description: "For scaling and go-to-market. You already have a working product — this helps you commercialize it. Bigger grant, stricter requirements.",
    eligibility: [
      "Sdn Bhd only",
      "Company <7 years old, <RM5M revenue",
      "51% Malaysian-owned",
      "Min 2 directors (1 Malaysian)",
      "RM10k paid-up capital",
    ],
    details: [
      "18 months duration",
      "60% for commercialization",
      "2-4 months approval time",
      "Same payback terms",
    ],
    url: "https://cradle.com.my/cip-sprint/",
    urlLabel: "Apply for CIP Sprint",
  },
  {
    id: "mdec",
    name: "MDEC Malaysia Digital",
    amount: "Tax exemption",
    type: "Tax Incentive",
    category: "tax",
    logo: "/broke_logo/mdec_logo.png",
    description: "Not a grant — it's a status that gives you tax benefits. Good for AI, big data, or any tech business that's starting to make money.",
    eligibility: [
      "Malaysian Sdn Bhd",
      "2 full-time employees (RM5k+ avg salary)",
      "RM50k annual operating expenditure",
      "RM1k paid-up capital",
      "Approved digital activities",
    ],
    details: [
      "Reduced tax rate",
      "100% foreign ownership allowed",
      "No internet censorship",
      "2-6 weeks processing",
    ],
    url: "https://www.mdec.my/malaysiadigital/apply",
    urlLabel: "Apply for MD Status",
  },
  {
    id: "magic",
    name: "MaGIC Accelerator",
    amount: "No equity taken",
    type: "Accelerator Program",
    category: "accelerator",
    logo: "/broke_logo/magic_logo.png",
    description: "4-month program with mentorship and resources. They don't take equity and cover your living expenses. Competitive to get in, but solid if you want structure.",
    eligibility: [
      "Tech startup with traction",
      "Willing to relocate to Cyberjaya",
      "ASEAN expansion mindset",
      "Full-time commitment for 4 months",
    ],
    details: [
      "4 months at MaGIC campus",
      "Living expenses + accommodation",
      "Mentorship and investor access",
      "Microsoft Azure credits",
      "~77 selected from 1000+ applications",
    ],
    url: "https://accelerator.mymagic.my/",
    urlLabel: "Check MaGIC programs",
  },
  {
    id: "ssm",
    name: "SSM Registration",
    amount: "~RM1k",
    type: "Company Registration",
    category: "essential",
    logo: "/broke_logo/ssm_logo.png",
    description: "Most grants require a Sdn Bhd. SSM is where you register one — takes about a week online. Do this first before applying for grants.",
    eligibility: [
      "Malaysian citizen or PR",
      "At least 1 director",
      "Registered business address",
      "Proposed company name",
    ],
    details: [
      "Online application available",
      "~1 week processing",
      "Annual renewal required",
      "Can register from anywhere",
    ],
    url: "https://www.ssm.com.my/Pages/Services/Registration-of-Business-(ROB)/EzBiz-Online.aspx",
    urlLabel: "SSM e-Services",
  },
];

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Grant", value: "grant" },
  { label: "Tax", value: "tax" },
  { label: "Accelerator", value: "accelerator" },
  { label: "Essential", value: "essential" },
];

const CATEGORY_LABELS: Record<string, string> = {
  grant: "Grant",
  tax: "Tax Incentive",
  accelerator: "Accelerator",
  essential: "Essential",
};

export default function Broke() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedGrant = GRANTS.find((g) => g.id === selectedId) ?? null;

  const filtered = useMemo(() =>
    activeCategory === "all"
      ? GRANTS
      : GRANTS.filter((g) => g.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <Head>
        <title>Broke — AI and Coffee</title>
        <meta name="description" content="Malaysian grants and funding for tech startups. Cradle, MDEC, MaGIC — actual money for builders." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/broke" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/broke" />
        <meta property="og:title" content="Broke — AI and Coffee" />
        <meta property="og:description" content="Malaysian grants and funding for tech startups." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Broke — AI and Coffee" />
        <meta name="twitter:description" content="Malaysian grants and funding for tech startups." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono pb-24`}>
        <Nav active="broke" />

        {/* Header */}
        <div className="px-6 sm:px-16 pt-12 pb-6">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#D94830] leading-none tracking-tighter">
            BROKE
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
            money for broke builders
          </p>
        </div>

        {/* Category filter */}
        <div className="px-6 sm:px-16 py-4 border-b border-zinc-400/40">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setActiveCategory(value); setSelectedId(null); }}
                className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
                  activeCategory === value
                    ? "border-[#D94830] bg-[#D94830] text-white"
                    : "border-zinc-300 text-zinc-500 hover:border-zinc-500 hover:text-zinc-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden overflow-hidden">
          <div
            className="flex"
            style={{
              width: "200%",
              transform: selectedGrant ? "translateX(-50%)" : "translateX(0)",
              transition: "transform 0.35s ease",
            }}
          >
            {/* Grid panel */}
            <div className="w-1/2 px-6 py-8">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
                {filtered.length} option{filtered.length !== 1 ? "s" : ""}
              </p>
              <div key={activeCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((grant, i) => (
                  <button
                    key={grant.id}
                    onClick={() => setSelectedId(grant.id)}
                    className="animate-stagger-in group border border-transparent bg-[#F2EFE8] hover:border-zinc-300 transition-colors duration-150 flex items-stretch"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <Image src={grant.logo} alt={grant.name} width={96} height={96} className="w-24 h-24 shrink-0 object-cover bg-white" />
                    <div className="p-4 text-left">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{grant.type}</p>
                      <p className="text-sm font-bold text-zinc-800 group-hover:text-zinc-600 transition-colors mb-1">
                        {grant.name}
                      </p>
                      <p className="text-base font-bold text-[#D94830]">{grant.amount}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail panel */}
            <div className="w-1/2 px-6 py-10">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors mb-10"
              >
                ← back
              </button>
              {selectedGrant && (
                <>
                  <Image src={selectedGrant.logo} alt={selectedGrant.name} width={80} height={80} className="w-20 h-20 object-contain mb-6" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                    {CATEGORY_LABELS[selectedGrant.category] ?? selectedGrant.category}
                  </p>
                  <h2 className="text-3xl font-bold tracking-tighter leading-none text-zinc-900 mb-2">
                    {selectedGrant.name}
                  </h2>
                  <p className="text-2xl font-bold text-[#D94830] mb-6">{selectedGrant.amount}</p>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-8">
                    {selectedGrant.description}
                  </p>
                  <div className="space-y-6 mb-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Eligibility</p>
                      <ul className="space-y-1">
                        {selectedGrant.eligibility.map((e, i) => (
                          <li key={i} className="text-xs text-zinc-600 flex gap-2"><span className="text-[#D94830] shrink-0">→</span>{e}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Details</p>
                      <ul className="space-y-1">
                        {selectedGrant.details.map((d, i) => (
                          <li key={i} className="text-xs text-zinc-500 flex gap-2"><span className="text-zinc-400 shrink-0">•</span>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <a
                    href={selectedGrant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
                  >
                    {selectedGrant.urlLabel} ↗
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop split layout */}
        <div
          className="hidden lg:grid min-h-[calc(100vh-200px)] overflow-hidden"
          style={{
            gridTemplateColumns: selectedGrant ? "1fr 1fr" : "1fr 0fr",
            transition: "grid-template-columns 0.4s ease",
          }}
        >
          {/* Grid panel */}
          <div className="border-r border-zinc-400/40 px-10 py-8 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
              {filtered.length} option{filtered.length !== 1 ? "s" : ""}
            </p>
            <div key={activeCategory} className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((grant, i) => {
                const isSelected = selectedId === grant.id;
                return (
                  <button
                    key={grant.id}
                    onClick={() => setSelectedId(isSelected ? null : grant.id)}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className={`animate-stagger-in group border bg-[#F2EFE8] transition-colors duration-150 flex items-stretch ${
                      isSelected
                        ? "border-[#D94830]"
                        : "border-transparent hover:border-zinc-300"
                    }`}
                  >
                    <Image src={grant.logo} alt={grant.name} width={128} height={128} className="w-32 h-32 shrink-0 object-cover bg-white" />
                    <div className="p-4 text-left flex flex-col justify-center">
                      <p className={`text-[10px] uppercase tracking-widest text-zinc-400 ${selectedGrant ? "mb-1" : "mb-1"}`}>{grant.type}</p>
                      <p className={`text-sm font-bold transition-colors ${selectedGrant ? "" : "mb-2"} ${
                        isSelected ? "text-[#D94830]" : "text-zinc-800 group-hover:text-zinc-600"
                      }`}>
                        {grant.name}
                      </p>
                      {!selectedGrant && <p className="text-lg font-bold text-[#D94830]">{grant.amount}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-12 pt-8 border-t border-zinc-400/40">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Info scraped by AI. If something&apos;s wrong, tell those agencies to fix their SEO.
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                Know more grants?{" "}
                <a
                  href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-zinc-400 hover:text-zinc-600 hover:border-zinc-600 transition-colors"
                >
                  Drop it in the group ↗
                </a>
              </p>
            </div>
          </div>

          {/* Detail panel */}
          <div className="overflow-hidden">
            <div
              className="px-12 py-10 h-full"
              style={{
                opacity: selectedGrant ? 1 : 0,
                transform: selectedGrant ? "translateX(0)" : "translateX(40px)",
                transition: "opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s",
              }}
            >
              {selectedGrant && (
                <>
                  <Image src={selectedGrant.logo} alt={selectedGrant.name} width={80} height={80} className="w-20 h-20 object-contain mb-8" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                    {CATEGORY_LABELS[selectedGrant.category] ?? selectedGrant.category}
                  </p>
                  <h2 className="text-4xl xl:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-2">
                    {selectedGrant.name}
                  </h2>
                  <p className="text-3xl font-bold text-[#D94830] mb-8">{selectedGrant.amount}</p>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-8 max-w-md">
                    {selectedGrant.description}
                  </p>
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Eligibility</p>
                      <ul className="space-y-2">
                        {selectedGrant.eligibility.map((e, i) => (
                          <li key={i} className="text-sm text-zinc-600 flex gap-2 leading-snug"><span className="text-[#D94830] shrink-0">→</span>{e}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Details</p>
                      <ul className="space-y-2">
                        {selectedGrant.details.map((d, i) => (
                          <li key={i} className="text-sm text-zinc-500 flex gap-2 leading-snug"><span className="text-zinc-400 shrink-0">•</span>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <a
                    href={selectedGrant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
                  >
                    {selectedGrant.urlLabel} ↗
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
