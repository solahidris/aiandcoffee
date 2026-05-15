import Head from "next/head";
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
  url: string;
  category: string;
}

const tools = toolsData as Tool[];

const CATEGORIES = [
  { label: "All",          value: "all"         },
  { label: "AI",           value: "ai"          },
  { label: "IDE",          value: "ide"         },
  { label: "Image",        value: "image"       },
  { label: "Video",        value: "video"       },
  { label: "Voice",        value: "voice"       },
  { label: "Automate",     value: "automate"    },
  { label: "Productivity", value: "productivity"},
];


export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <meta property="og:image" content="/logo/logo.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="tools" />

        <div className="px-6 sm:px-16 pt-12 pb-6 border-b border-zinc-400/40">
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
                onClick={() => setActiveCategory(value)}
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

        {/* Tools grid */}
        <main className="px-6 sm:px-16 py-10">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((tool) => {
              const isExpanded = expandedId === tool.id;
              return (
                <div key={tool.id} className="flex flex-col">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : tool.id)}
                    className={`group border bg-[#F2EFE8] transition-colors duration-200 flex flex-col items-center gap-3 p-5 text-center ${
                      isExpanded
                        ? "border-[#D94830]"
                        : "border-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {/* Logo placeholder */}
                    <div className={`w-12 h-12 transition-colors ${isExpanded ? "bg-zinc-300" : "bg-zinc-200 group-hover:bg-zinc-300"}`} />
                    <p className={`text-xs font-bold uppercase tracking-wide transition-colors ${isExpanded ? "text-[#D94830]" : "text-zinc-800 group-hover:text-zinc-600"}`}>
                      {tool.name}
                    </p>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border border-t-0 border-[#D94830] bg-[#F2EFE8] px-4 py-4">
                      <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                        {tool.description}
                      </p>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] uppercase tracking-widest text-[#D94830] hover:underline"
                      >
                        Visit ↗
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-400/40">
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
        </main>
      </div>
    </>
  );
}
