import Head from "next/head";
import Image from "next/image";
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

function LogoPlaceholder({ name }: { name: string }) {
  return (
    <div className="w-12 h-12 shrink-0 bg-zinc-200 flex items-center justify-center">
      <span className="text-xs font-bold text-zinc-400 uppercase">
        {name.charAt(0)}
      </span>
    </div>
  );
}

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((tool) => (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-zinc-300 bg-[#F2EFE8] hover:border-[#D94830] transition-colors duration-200 flex flex-col"
              >
                <div className="p-5 flex gap-4 flex-1">
                  {/* Logo placeholder */}
                  <div className="w-12 h-12 shrink-0 bg-zinc-200 group-hover:bg-zinc-300 transition-colors" />

                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-sm font-bold text-zinc-800 group-hover:text-[#D94830] transition-colors truncate">
                      {tool.name}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-300 group-hover:border-[#D94830] px-5 py-3 text-[11px] uppercase tracking-widest text-zinc-400 group-hover:text-[#D94830] transition-colors duration-200">
                  Visit ↗
                </div>
              </a>
            ))}
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
