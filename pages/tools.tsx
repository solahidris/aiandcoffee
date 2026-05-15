import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import { useState, useMemo } from "react";
import Nav from "../components/Nav";
import toolsData from "../data/tools.json";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Pricing = "free" | "freemium" | "paid";

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  pricing: Pricing;
}

const tools = toolsData as Tool[];

const CATEGORIES = [
  { label: "All",          value: "all"         },
  { label: "Chat",         value: "chat"        },
  { label: "Code",         value: "code"        },
  { label: "Image",        value: "image"       },
  { label: "Video",        value: "video"       },
  { label: "Voice",        value: "voice"       },
  { label: "APIs",         value: "api"         },
  { label: "Automate",     value: "automate"    },
  { label: "Productivity", value: "productivity"},
];

const PRICING_STYLES: Record<Pricing, string> = {
  free:      "text-zinc-500 border-zinc-300",
  freemium:  "text-zinc-500 border-zinc-300",
  paid:      "text-zinc-500 border-zinc-300",
};

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
        <meta name="description" content="AI tools the community actually uses — chat, code, image, video, voice, APIs, automation, and productivity." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tools — AI and Coffee" />
        <meta property="og:description" content="AI tools the community actually uses." />
        <meta property="og:image" content="/logo/logo.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="tools" />

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
                className="group border border-zinc-300 bg-[#F2EFE8] hover:border-[#D94830] flex flex-col transition-colors duration-200"
              >
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-800 group-hover:text-[#D94830] transition-colors">
                      {tool.name}
                    </p>
                    <span className={`shrink-0 text-[9px] uppercase tracking-widest border px-1.5 py-0.5 ${PRICING_STYLES[tool.pricing]}`}>
                      {tool.pricing}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed flex-1">
                    {tool.description}
                  </p>
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
