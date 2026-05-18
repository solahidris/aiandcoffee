import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Geist_Mono } from "next/font/google";
import { useState } from "react";
import Nav from "../components/Nav";
import memoriesData from "../data/memories.json";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Memory {
  id: string;
  title: string;
  date: string;
  venue: string;
  attendees: number;
  photos: string[];
  coverPhoto: string;
  recap: string;
}

const memories = memoriesData as Memory[];

export default function Memories() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedMemory = memories.find((m) => m.id === selectedId) ?? null;

  return (
    <>
      <Head>
        <title>Memories — AI and Coffee</title>
        <meta name="description" content="Photos and recaps from our past events. The good times we've shared." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/memories" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/memories" />
        <meta property="og:title" content="Memories — AI and Coffee" />
        <meta property="og:description" content="Photos and recaps from our past events." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Memories — AI and Coffee" />
        <meta name="twitter:description" content="Photos and recaps from our past events." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono pb-24`}>
        <Nav active="memories" />

        {/* Header */}
        <div className="px-6 sm:px-16 pt-12 pb-6">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#D94830] leading-none tracking-tighter">
            MEMORIES
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
            the good times
          </p>
        </div>

        {/* Stats bar */}
        <div className="px-6 sm:px-16 py-4 border-y border-zinc-400/40 flex gap-8">
          <div>
            <p className="text-2xl font-bold text-zinc-800">{memories.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">events</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-800">
              {memories.reduce((sum, m) => sum + m.attendees, 0)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">attendees</p>
          </div>
        </div>

        {memories.length === 0 ? (
          <div className="px-6 sm:px-16 py-20 text-center">
            <p className="text-6xl font-bold text-zinc-300/50 mb-4">*</p>
            <p className="text-sm text-zinc-500 mb-6">no memories yet. we're just getting started.</p>
            <Link
              href="/events"
              className="inline-block border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
            >
              See upcoming events
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile layout */}
            <div className="lg:hidden overflow-hidden">
              <div
                className="flex"
                style={{
                  width: "200%",
                  transform: selectedMemory ? "translateX(-50%)" : "translateX(0)",
                  transition: "transform 0.35s ease",
                }}
              >
                {/* Grid panel */}
                <div className="w-1/2 px-6 py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {memories.map((memory, i) => (
                      <button
                        key={memory.id}
                        onClick={() => setSelectedId(memory.id)}
                        className="animate-stagger-in group text-left bg-[#F2EFE8] border border-transparent hover:border-zinc-300 transition-colors overflow-hidden"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="aspect-video bg-zinc-300 relative">
                          {memory.coverPhoto && (
                            <Image
                              src={memory.coverPhoto}
                              alt={memory.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-sm font-bold">{memory.title}</p>
                            <p className="text-white/70 text-[10px] uppercase tracking-widest">{memory.date}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detail panel */}
                <div className="w-1/2 px-6 py-10">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors mb-8"
                  >
                    ← back
                  </button>
                  {selectedMemory && (
                    <>
                      <div className="aspect-video bg-zinc-300 relative mb-6 overflow-hidden">
                        {selectedMemory.coverPhoto && (
                          <Image
                            src={selectedMemory.coverPhoto}
                            alt={selectedMemory.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">{selectedMemory.date}</p>
                      <h2 className="text-2xl font-bold tracking-tighter text-zinc-900 mb-4">
                        {selectedMemory.title}
                      </h2>
                      <div className="flex gap-6 mb-6">
                        <div>
                          <p className="text-lg font-bold text-[#D94830]">{selectedMemory.attendees}</p>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400">attendees</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-zinc-800">{selectedMemory.venue}</p>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400">venue</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed mb-8">
                        {selectedMemory.recap}
                      </p>
                      {selectedMemory.photos.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Photos</p>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedMemory.photos.map((photo, i) => (
                              <div key={i} className="aspect-square bg-zinc-300 relative overflow-hidden">
                                <Image src={photo} alt="" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop split layout */}
            <div
              className="hidden lg:grid min-h-[calc(100vh-280px)] overflow-hidden"
              style={{
                gridTemplateColumns: selectedMemory ? "1fr 1fr" : "1fr 0fr",
                transition: "grid-template-columns 0.4s ease",
              }}
            >
              {/* Grid panel */}
              <div className="border-r border-zinc-400/40 px-10 py-8 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">
                  {memories.length} memor{memories.length === 1 ? "y" : "ies"}
                </p>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {memories.map((memory, i) => {
                    const isSelected = selectedId === memory.id;
                    return (
                      <button
                        key={memory.id}
                        onClick={() => setSelectedId(isSelected ? null : memory.id)}
                        className={`animate-stagger-in group text-left overflow-hidden transition-all duration-150 ${
                          isSelected ? "ring-2 ring-[#D94830]" : "hover:ring-1 hover:ring-zinc-300"
                        }`}
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="aspect-video bg-zinc-300 relative">
                          {memory.coverPhoto && (
                            <Image
                              src={memory.coverPhoto}
                              alt={memory.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className={`text-sm font-bold ${isSelected ? "text-[#D94830]" : "text-white"}`}>
                              {memory.title}
                            </p>
                            <p className="text-white/70 text-[10px] uppercase tracking-widest">{memory.date}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail panel */}
              <div className="overflow-hidden">
                <div
                  className="px-12 py-10 h-full overflow-y-auto"
                  style={{
                    opacity: selectedMemory ? 1 : 0,
                    transform: selectedMemory ? "translateX(0)" : "translateX(40px)",
                    transition: "opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s",
                  }}
                >
                  {selectedMemory && (
                    <>
                      <div className="aspect-video bg-zinc-300 relative mb-8 overflow-hidden">
                        {selectedMemory.coverPhoto && (
                          <Image
                            src={selectedMemory.coverPhoto}
                            alt={selectedMemory.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">{selectedMemory.date}</p>
                      <h2 className="text-4xl font-bold tracking-tighter text-zinc-900 mb-6">
                        {selectedMemory.title}
                      </h2>
                      <div className="flex gap-8 mb-8">
                        <div>
                          <p className="text-2xl font-bold text-[#D94830]">{selectedMemory.attendees}</p>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400">attendees</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-zinc-800">{selectedMemory.venue}</p>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400">venue</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed mb-10 max-w-md">
                        {selectedMemory.recap}
                      </p>
                      {selectedMemory.photos.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Photos</p>
                          <div className="grid grid-cols-3 gap-3">
                            {selectedMemory.photos.map((photo, i) => (
                              <div key={i} className="aspect-square bg-zinc-300 relative overflow-hidden">
                                <Image src={photo} alt="" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
