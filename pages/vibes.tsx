import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useState, useRef, useEffect } from "react";
import { usePlayer } from "../contexts/PlayerContext";
import { TRACKS, formatTime } from "../lib/tracks";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type Filter = "all" | "instrumental" | "vocal";


const FILTERS: { label: string; value: Filter }[] = [
  { label: "All",          value: "all"          },
  { label: "Instrumental", value: "instrumental" },
  { label: "Vocal",        value: "vocal"        },
];

export default function Vibes() {
  const {
    currentIndex, isPlaying, currentTime, duration,
    repeatMode, isShuffle, audioEl,
    selectTrack, togglePlay, goToNext, goToPrev,
    seek, cycleRepeat, toggleShuffle,
  } = usePlayer();

  const [filter,     setFilter]     = useState<Filter>("all");
  const [showLyrics, setShowLyrics] = useState(true);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const idlePhaseRef = useRef(0);

  const track = TRACKS[currentIndex];

  // Wire up AudioContext visualizer (once, when audio element is ready + playing)
  useEffect(() => {
    if (!isPlaying || !audioEl) return;
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
      const ctx = new Ctx() as AudioContext;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.connect(ctx.destination);
      try {
        const source = ctx.createMediaElementSource(audioEl);
        source.connect(analyser);
      } catch { /* already connected */ }
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
  }, [isPlaying, audioEl]);

  // Visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 600, H = 80, BARS = 64, GAP = 1;
    const HALF = BARS / 2;
    const barW = (W - GAP * (BARS - 1)) / BARS;
    const cy = H / 2;
    canvas.width = W;
    canvas.height = H;

    function drawMirror(getV: (i: number) => number) {
      for (let i = 0; i < HALF; i++) {
        const v  = getV(i);
        const bh = Math.max(1, v * cy * 0.95);
        const xL = (HALF - 1 - i) * (barW + GAP);
        const xR = (HALF + i)     * (barW + GAP);
        ctx!.fillStyle = `rgba(217,72,48,${0.2 + v * 0.8})`;
        ctx!.fillRect(xL, cy - bh, barW, bh);
        ctx!.fillRect(xR, cy - bh, barW, bh);
        ctx!.fillRect(xL, cy,      barW, bh);
        ctx!.fillRect(xR, cy,      barW, bh);
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const step = Math.max(1, Math.floor(data.length / HALF));
        drawMirror((i) => (data[Math.min(i * step, data.length - 1)] || 0) / 255);
      } else {
        idlePhaseRef.current += 0.018;
        const phase = idlePhaseRef.current;
        const amp = ((Math.sin(phase) + 1) / 2) * 0.28 + 0.04;
        drawMirror((i) => amp * (1 - (i / HALF) * 0.55));
      }
      animFrameRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const filteredTracks = TRACKS.filter((t) => filter === "all" || t.type === filter);

  return (
    <>
      <Head>
        <title>Vibes — AI and Coffee</title>
        <meta name="description" content="Music to vibe to while you AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/vibes" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/vibes" />
        <meta property="og:title" content="Vibes — AI and Coffee" />
        <meta property="og:description" content="Music to vibe to while you AI." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vibes — AI and Coffee" />
        <meta name="twitter:description" content="Music to vibe to while you AI." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen lg:h-screen bg-[#E8E4D9] font-mono flex flex-col`}>
        <Nav active="vibes" />

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">

          {/* ── LEFT: Player ── */}
          <aside className="lg:w-[400px] lg:shrink-0 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-400/40 px-6 sm:px-10 pt-10 pb-8">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-8">— vibes</p>

            <div className="mb-5">
              <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 border inline-block mb-3 ${
                track.type === "instrumental" ? "border-zinc-400 text-zinc-400" : "border-[#D94830] text-[#D94830]"
              }`}>{track.type}</span>
              <h1 className="text-3xl font-bold tracking-tighter text-zinc-800 leading-tight">{track.title}</h1>
              <p className="text-[10px] text-zinc-400 mt-1.5 uppercase tracking-widest">{track.artist}</p>
            </div>

            <div className="mb-5 bg-[#DEDAD0] border border-zinc-400/25 p-2">
              <canvas ref={canvasRef} className="w-full block" style={{ height: 80 }} />
            </div>

            <div className="mb-6">
              <div className="relative h-px bg-zinc-300 cursor-pointer group mb-1.5" onClick={handleSeek}>
                <div className="absolute top-0 left-0 h-full bg-[#D94830]" style={{ width: `${progress}%` }} />
                <div className="absolute top-1/2 w-2.5 h-2.5 bg-[#D94830] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, transform: "translate(-50%,-50%)" }} />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 uppercase tracking-widest">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-5 mb-3">
              <button onClick={toggleShuffle} title="Shuffle"
                className={`transition-colors ${isShuffle ? "text-[#D94830]" : "text-zinc-400 hover:text-zinc-600"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                </svg>
              </button>

              <button onClick={goToPrev} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
              </button>

              <button onClick={togglePlay}
                className="w-12 h-12 bg-[#D94830] hover:bg-[#C13D27] text-white flex items-center justify-center transition-colors">
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>

              <button onClick={goToNext} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
              </button>

              <button onClick={cycleRepeat} title={`Repeat: ${repeatMode}`}
                className={`relative transition-colors ${repeatMode !== "none" ? "text-[#D94830]" : "text-zinc-400 hover:text-zinc-600"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
                  <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                </svg>
                {repeatMode === "one" && <span className="absolute -top-1.5 -right-2 text-[8px] font-bold leading-none">1</span>}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className={`text-[9px] uppercase tracking-widest ${isShuffle ? "text-[#D94830]" : "text-zinc-300"}`}>shuffle</span>
              <span className={`text-[9px] uppercase tracking-widest ${repeatMode !== "none" ? "text-[#D94830]" : "text-zinc-300"}`}>
                {repeatMode === "one" ? "repeat one" : repeatMode === "all" ? "repeat all" : "repeat"}
              </span>
            </div>

            {track.type === "vocal" && (
              <div>
                <button onClick={() => setShowLyrics((v) => !v)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors mb-4">
                  <svg width="10" height="10" viewBox="0 0 10 10"
                    className={`transition-transform duration-200 ${showLyrics ? "rotate-180" : ""}`} fill="currentColor">
                    <path d="M5 7L1 3h8z" />
                  </svg>
                  <span>Lyrics</span>
                </button>
                {showLyrics && (
                  <div className="border border-zinc-400/30 bg-white/20 p-4 max-h-72 overflow-y-auto">
                    <pre className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap font-mono">{track.lyrics}</pre>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* ── RIGHT: Track grid ── */}
          <main className="flex-1 lg:overflow-y-auto px-6 sm:px-10 pt-10 pb-10">
            <div className="flex items-center gap-2 mb-6">
              {FILTERS.map(({ label, value }) => (
                <button key={value} onClick={() => setFilter(value)}
                  className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                    filter === value
                      ? "border-[#D94830] bg-[#D94830] text-white"
                      : "border-zinc-400/50 text-zinc-500 hover:border-zinc-500 hover:text-zinc-700"
                  }`}>{label}</button>
              ))}
              <span className="text-[10px] text-zinc-400 ml-2 uppercase tracking-widest">
                {filteredTracks.length} tracks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTracks.map((t) => {
                const idx = TRACKS.indexOf(t);
                const active = idx === currentIndex;
                return (
                  <button key={t.id} onClick={() => selectTrack(idx)}
                    className={`text-left p-4 border transition-all duration-150 ${
                      active ? "bg-[#D94830] border-[#D94830]" : "border-transparent bg-white/60 hover:bg-white/90"
                    }`}>
                    <div className="flex items-start justify-between gap-1 mb-4">
                      <span className={`text-[10px] tracking-widest tabular-nums ${active ? "text-white/50" : "text-zinc-400"}`}>
                        {active && isPlaying ? <span className={active ? "text-white" : "text-[#D94830]"}>▶</span> : String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className={`text-[9px] uppercase tracking-widest border px-1.5 py-0.5 leading-none ${
                        active ? "border-white/30 text-white/70"
                        : t.type === "instrumental" ? "border-zinc-300 text-zinc-400"
                        : "border-zinc-400/60 text-zinc-500"
                      }`}>{t.type === "instrumental" ? "inst" : "vocal"}</span>
                    </div>
                    <p className={`text-sm font-bold tracking-tight leading-snug mb-1 ${active ? "text-white" : "text-zinc-800"}`}>{t.title}</p>
                    <p className={`text-[10px] uppercase tracking-widest ${active ? "text-white/55" : "text-zinc-400"}`}>{t.artist}</p>
                  </button>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
