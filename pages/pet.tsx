import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useState, useRef, useEffect, useCallback } from "react";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ── Pixel palette ─────────────────────────────────────────────
const K = "#2A2A2E"; // outline
const C = "#F5C897"; // coat orange
const D = "#D9965A"; // stripe / shadow
const W = "#FFFFFF"; // eye white
const G = "#4ECDC4"; // eye pupil
const P = "#FF9DC7"; // nose pink
const I = "#FFD9E8"; // inner ear
const _ = null;      // transparent

type Px = string | null;

// Idle — eyes open
const IDLE: Px[][] = [
  [_,_,K,K,_,_,_,_,_,_,_,_,K,K,_,_],
  [_,K,C,C,K,_,_,_,_,_,_,K,C,C,K,_],
  [K,C,I,C,C,K,_,_,_,_,K,C,C,I,C,K],
  [K,C,C,C,C,C,K,_,_,K,C,C,C,C,C,K],
  [_,K,C,C,C,C,C,K,K,C,C,C,C,C,K,_],
  [_,K,C,W,W,C,C,C,C,C,W,W,C,C,K,_],
  [_,K,C,W,G,C,P,_,_,C,W,G,C,C,K,_],
  [_,K,C,C,C,C,_,_,_,C,C,C,C,C,K,_],
  [_,K,C,C,C,C,C,C,C,C,C,C,C,C,K,_],
  [_,K,C,D,D,C,C,C,C,C,D,D,C,C,K,_],
  [_,K,C,C,C,C,C,C,C,C,C,C,C,C,K,_],
  [_,_,K,C,C,C,C,C,C,C,C,C,C,K,_,_],
  [_,_,K,C,C,K,_,_,_,_,K,C,C,K,_,_],
  [_,_,_,K,C,K,_,_,_,_,K,C,K,_,_,_],
  [_,_,_,K,K,_,_,_,_,_,_,K,K,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Blink — eyes closed
const BLINK: Px[][] = IDLE.map((row, r) => {
  if (r === 5) return [_,K,C,K,K,C,C,C,C,C,K,K,C,C,K,_];
  if (r === 6) return [_,K,C,C,C,C,P,_,_,C,C,C,C,C,K,_];
  return [...row];
});

// Happy — squint ^.^
const HAPPY: Px[][] = IDLE.map((row, r) => {
  if (r === 5) return [_,K,C,K,C,C,C,C,C,C,C,K,C,C,K,_];
  if (r === 6) return [_,K,K,C,K,C,P,_,_,C,K,C,K,C,K,_];
  return [...row];
});

// Sleeping — flat lines eyes + zzz
const SLEEP: Px[][] = IDLE.map((row, r) => {
  if (r === 5) return [_,K,C,C,C,C,C,C,C,C,C,C,C,C,K,_];
  if (r === 6) return [_,K,C,K,K,C,P,_,_,C,K,K,C,C,K,_];
  return [...row];
});

const FRAMES: Record<string, Px[][]> = { idle: IDLE, blink: BLINK, happy: HAPPY, sleep: SLEEP };
const PIXEL = 10; // px per pixel → 160×160 canvas
const SIZE = 16;

function drawSprite(ctx: CanvasRenderingContext2D, frame: Px[][]) {
  ctx.clearRect(0, 0, SIZE * PIXEL, SIZE * PIXEL);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const color = frame[r][c];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * PIXEL, r * PIXEL, PIXEL, PIXEL);
    }
  }
}

const NAMES = ["Byte", "Pixel", "Chip", "Sudo", "Null"];
const DEFAULT_NAME = NAMES[0];

export default function Pet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame]       = useState<string>("idle");
  const [bounce, setBounce]     = useState(false);
  const [heart, setHeart]       = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [catName, setCatName]   = useState(DEFAULT_NAME);
  const [editing, setEditing]   = useState(false);
  const [nameInput, setNameInput] = useState(DEFAULT_NAME);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef(frame);
  frameRef.current = frame;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pet_name");
    const count = localStorage.getItem("pet_count");
    if (saved) { setCatName(saved); setNameInput(saved); }
    if (count) setPetCount(parseInt(count, 10));
  }, []);

  // Draw sprite whenever frame changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawSprite(ctx, FRAMES[frame] ?? IDLE);
  }, [frame]);

  // Blink cycle
  const scheduleBlink = useCallback(() => {
    const delay = 3000 + Math.random() * 4000;
    blinkTimer.current = setTimeout(() => {
      if (frameRef.current !== "happy" && frameRef.current !== "sleep") {
        setFrame("blink");
        setTimeout(() => {
          setFrame("idle");
          scheduleBlink();
        }, 180);
      } else {
        scheduleBlink();
      }
    }, delay);
  }, []);

  useEffect(() => {
    scheduleBlink();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [scheduleBlink]);

  function pet() {
    if (frame === "happy") return;
    setFrame("happy");
    setBounce(true);
    setHeart(true);
    const newCount = petCount + 1;
    setPetCount(newCount);
    localStorage.setItem("pet_count", String(newCount));
    setTimeout(() => setHeart(false), 900);
    setTimeout(() => {
      setBounce(false);
      setFrame("idle");
      scheduleBlink();
    }, 1200);
  }

  function saveName() {
    const n = nameInput.trim() || DEFAULT_NAME;
    setCatName(n);
    setNameInput(n);
    localStorage.setItem("pet_name", n);
    setEditing(false);
  }

  const hearts = Math.min(5, Math.floor(petCount / 3) + 1);

  return (
    <>
      <Head>
        <title>Pet — AI and Coffee</title>
        <meta name="description" content="A pixel cat that lives on the internet." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/pet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style>{`
        @keyframes bounce-pet {
          0%, 100% { transform: translateY(0); }
          30%       { transform: translateY(-18px); }
          60%       { transform: translateY(-8px); }
        }
        @keyframes float-heart {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-48px) scale(1.4); }
        }
        .pixel-canvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="pet" />

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6 py-12">

          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-10">— your pixel cat</p>

          {/* Sprite */}
          <div className="relative flex items-center justify-center mb-8">
            <div
              className="cursor-pointer select-none"
              style={{ animation: bounce ? "bounce-pet 0.5s ease" : "none" }}
              onClick={pet}
            >
              <canvas
                ref={canvasRef}
                width={SIZE * PIXEL}
                height={SIZE * PIXEL}
                className="pixel-canvas"
                style={{ width: SIZE * PIXEL * 2, height: SIZE * PIXEL * 2 }}
              />
            </div>

            {/* Floating heart */}
            {heart && (
              <div
                className="absolute text-2xl pointer-events-none"
                style={{
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  animation: "float-heart 0.9s ease forwards",
                }}
              >
                ♥
              </div>
            )}
          </div>

          {/* Name */}
          <div className="mb-4 text-center">
            {editing ? (
              <form onSubmit={(e) => { e.preventDefault(); saveName(); }} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.slice(0, 12))}
                  onBlur={saveName}
                  className="bg-transparent border-b border-zinc-400 text-center text-sm text-zinc-800 outline-none pb-0.5 w-32"
                />
              </form>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-bold tracking-tight text-zinc-800 hover:text-[#D94830] transition-colors"
              >
                {catName}
              </button>
            )}
          </div>

          {/* Hearts */}
          <div className="flex gap-1 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < hearts ? "text-[#D94830]" : "text-zinc-300"}`}>
                ♥
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="text-center space-y-1 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">
              {petCount === 0 ? "click the cat to say hi" : `petted ${petCount} time${petCount !== 1 ? "s" : ""}`}
            </p>
          </div>

          <p className="text-[9px] uppercase tracking-widest text-zinc-300">
            click to pet · name to rename
          </p>

        </div>
      </div>
    </>
  );
}
