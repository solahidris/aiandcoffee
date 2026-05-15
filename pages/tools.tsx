import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Geist_Mono } from "next/font/google";
import { useState, useMemo } from "react";
import Nav from "../components/Nav";
import toolsData from "../data/tools.json";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Tool {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  url: string;
  category: string;
  logo: string;
}

const tools = toolsData as Tool[];

const CATEGORIES = [
  { label: "All",            value: "all"            },
  { label: "AI and Coffee",  value: "ai-and-coffee"  },
  { label: "AI",             value: "ai"             },
  { label: "IDE",            value: "ide"            },
  { label: "Voice",          value: "voice"          },
  { label: "Automate",       value: "automate"       },
  { label: "Productivity",   value: "productivity"   },
];

const CATEGORY_LABELS: Record<string, string> = {
  "ai-and-coffee": "AI and Coffee",
  ai: "AI", ide: "IDE", voice: "Voice",
  automate: "Automate", productivity: "Productivity",
};

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTool = tools.find((t) => t.id === selectedId) ?? null;

  const filtered = useMemo(() =>
    activeCategory === "all"
      ? tools
      : tools.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <Head>
        <title>Tools — AI and Coffee</title>
        <meta name="description" content="AI tools the community actually uses." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tools — AI and Coffee" />
        <meta property="og:description" content="AI tools the community actually uses." />
        <meta property="og:image" content="/api/og?title=Tools&subtitle=Things we actually use" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="tools" />

        {/* Header */}
        <div className="px-6 sm:px-16 pt-12 pb-6">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#D94830] leading-none tracking-tighter">
            TOOLS
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
            things we actually use
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

        {/* ── Mobile layout ── */}
        <div className="lg:hidden overflow-hidden">
          <div
            className="flex"
            style={{
              width: "200%",
              transform: selectedTool ? "translateX(-50%)" : "translateX(0)",
              transition: "transform 0.35s ease",
            }}
          >
            {/* Grid panel */}
            <div className="w-1/2 px-6 py-8">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
                {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
              </p>
              <div key={activeCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((tool, i) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedId(tool.id)}
                    className="animate-stagger-in group border border-transparent bg-[#F2EFE8] hover:border-zinc-300 transition-colors duration-150 flex items-stretch h-14"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <Image src={tool.logo} alt={tool.name} width={56} height={56} className="w-14 h-full shrink-0 object-contain" />
                    <p className="px-4 flex items-center text-[11px] font-bold uppercase tracking-wide text-zinc-800 group-hover:text-zinc-600 transition-colors text-left">
                      {tool.name}
                    </p>
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
              {selectedTool && (
                <>
                  <Image src={selectedTool.logo} alt={selectedTool.name} width={80} height={80} className="w-20 h-20 object-contain mb-8" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                    {CATEGORY_LABELS[selectedTool.category] ?? selectedTool.category}
                  </p>
                  <h2 className="text-4xl font-bold tracking-tighter leading-none text-zinc-900 mb-6">
                    {selectedTool.name}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-8">
                    {selectedTool.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Pros</p>
                      <ul className="space-y-1">
                        {selectedTool.pros.map((p, i) => (
                          <li key={i} className="text-xs text-zinc-600 flex gap-2"><span className="text-[#D94830] shrink-0">+</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Cons</p>
                      <ul className="space-y-1">
                        {selectedTool.cons.map((c, i) => (
                          <li key={i} className="text-xs text-zinc-500 flex gap-2"><span className="text-zinc-400 shrink-0">−</span>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {selectedTool.url.startsWith('/') ? (
                    <Link href={selectedTool.url} className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                      Open →
                    </Link>
                  ) : (
                    <a href={selectedTool.url} target="_blank" rel="noopener noreferrer" className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                      Visit ↗
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop split layout ── */}
        <div
          className="hidden lg:grid min-h-[calc(100vh-200px)] overflow-hidden"
          style={{
            gridTemplateColumns: selectedTool ? "1fr 1fr" : "1fr 0fr",
            transition: "grid-template-columns 0.4s ease",
          }}
        >
          {/* Grid panel */}
          <div className="border-r border-zinc-400/40 px-10 py-8 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
              {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            </p>
            <div key={activeCategory} className="grid grid-cols-3 gap-3">
              {filtered.map((tool, i) => {
                const isSelected = selectedId === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedId(isSelected ? null : tool.id)}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className={`animate-stagger-in group border bg-[#F2EFE8] transition-colors duration-150 flex items-stretch h-24 ${
                      isSelected
                        ? "border-[#D94830]"
                        : "border-transparent hover:border-zinc-300"
                    }`}
                  >
                    <Image src={tool.logo} alt={tool.name} width={96} height={96} className="w-24 h-full shrink-0 object-contain" />
                    <p className={`px-4 flex items-center text-[11px] font-bold uppercase tracking-wide transition-colors text-left ${
                      isSelected ? "text-[#D94830]" : "text-zinc-800 group-hover:text-zinc-600"
                    }`}>
                      {tool.name}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-12 pt-8 border-t border-zinc-400/40">
              <p className="text-xs text-zinc-500">
                missing a tool?{" "}
                <a
                  href="https://github.com/solahidris/aiandcoffee/edit/main/data/tools.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-zinc-400 hover:text-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  add it on GitHub ↗
                </a>
              </p>
            </div>
          </div>

          {/* Detail panel — slides in */}
          <div className="overflow-hidden">
            <div
              className="px-12 py-10 h-full"
              style={{
                opacity: selectedTool ? 1 : 0,
                transform: selectedTool ? "translateX(0)" : "translateX(40px)",
                transition: "opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s",
              }}
            >
              {selectedTool && (
                <>
                  <Image src={selectedTool.logo} alt={selectedTool.name} width={80} height={80} className="w-20 h-20 object-contain mb-8" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                    {CATEGORY_LABELS[selectedTool.category] ?? selectedTool.category}
                  </p>
                  <h2 className="text-5xl xl:text-6xl font-bold tracking-tighter leading-none text-zinc-900 mb-8">
                    {selectedTool.name}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-8 max-w-sm">
                    {selectedTool.description}
                  </p>
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Pros</p>
                      <ul className="space-y-2">
                        {selectedTool.pros.map((p, i) => (
                          <li key={i} className="text-sm text-zinc-600 flex gap-2 leading-snug"><span className="text-[#D94830] shrink-0 font-bold">+</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Cons</p>
                      <ul className="space-y-2">
                        {selectedTool.cons.map((c, i) => (
                          <li key={i} className="text-sm text-zinc-500 flex gap-2 leading-snug"><span className="text-zinc-400 shrink-0 font-bold">−</span>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {selectedTool.url.startsWith('/') ? (
                    <Link href={selectedTool.url} className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                      Open →
                    </Link>
                  ) : (
                    <a href={selectedTool.url} target="_blank" rel="noopener noreferrer" className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors">
                      Visit ↗
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
