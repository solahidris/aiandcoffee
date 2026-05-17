import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useState, useRef, useEffect } from "react";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ── Pixel palette ──────────────────────────────────────────────
const B = "#111111"; // black body
const b = "#2A2A2A"; // dark grey (depth)
const Y = "#FFD700"; // yellow eye
const P = "#FF99BB"; // pink nose
const _ = null;

type Px = string | null;

// 16×16 side-view cat, facing RIGHT.
// Head = left side, tail = right side.
// When moving left, canvas is flipped with scaleX(-1).

// Walk frame A — legs spread (one fore/one hind forward)
const WALK_A: Px[][] = [
  [_,_,B,B,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,B,B,B,B,_,_,_,_,_,_,_,_,_,_,_],
  [B,B,B,B,B,B,_,_,_,_,_,_,_,_,_,_],
  [B,B,Y,B,B,B,B,_,_,_,_,_,_,_,_,_],
  [B,P,b,B,B,B,B,B,_,_,_,_,_,_,_,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,_,_,_,B],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,_,_,B],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,_,B,_,_,B,_,_,_,B,_,_,_,_,_],
  [_,_,_,B,_,_,B,_,_,_,B,_,_,_,_,_],
  [_,_,_,B,_,_,_,_,_,_,B,_,_,_,_,_],
  [_,_,_,B,B,_,_,_,_,_,_,B,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Walk frame B — legs tucked (alternate)
const WALK_B: Px[][] = WALK_A.map((row, r) => {
  if (r === 9)  return [_,_,_,_,B,_,_,B,_,_,_,B,_,_,_,_];
  if (r === 10) return [_,_,_,_,B,_,_,B,_,_,_,B,_,_,_,_];
  if (r === 11) return [_,_,_,_,B,_,_,_,_,_,_,B,_,_,_,_];
  if (r === 12) return [_,_,_,_,B,B,_,_,_,_,_,B,B,_,_,_];
  return [...row];
});

// Sitting (front-facing, black) — shown when petted
const SIT: Px[][] = [
  [_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_],
  [_,_,B,B,B,B,_,_,_,_,B,B,B,B,_,_],
  [_,B,B,B,B,B,B,_,_,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,Y,Y,B,B,B,B,B,Y,Y,B,B,B,_],
  [_,B,B,Y,b,B,P,_,_,B,Y,b,B,B,B,_],
  [_,B,B,B,B,B,_,_,_,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_],
  [_,_,_,B,_,_,_,_,_,_,_,_,B,_,_,_],
  [_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const PIXEL = 5;          // px per sprite pixel
const COLS  = 16;
const ROWS  = 16;
const CAT_W = COLS * PIXEL; // 80px
const CAT_H = ROWS * PIXEL; // 80px
const SPEED = 65;           // px per second
const STEP  = 18;           // pixels walked before frame switch

function drawFrame(canvas: HTMLCanvasElement, frame: Px[][]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CAT_W, CAT_H);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = frame[r][c];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * PIXEL, r * PIXEL, PIXEL, PIXEL);
    }
  }
}

export default function Pet() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const floorRef   = useRef<HTMLDivElement>(null);
  const animRef    = useRef<number>(0);
  // Mutable refs so the rAF loop always sees latest values
  const walkState  = useRef({ x: 40, dir: 1, accum: 0, mode: "walk", happyLeft: 0 });

  const [catX,     setCatX]     = useState(40);
  const [flipX,    setFlipX]    = useState(false);   // true = facing left
  const [frame,    setFrame]    = useState<"walkA" | "walkB" | "sit">("walkA");
  const [heart,    setHeart]    = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [catName,  setCatName]  = useState("Byte");
  const [editing,  setEditing]  = useState(false);
  const [nameInput,setNameInput]= useState("Byte");

  // Load localStorage
  useEffect(() => {
    const n = localStorage.getItem("pet_name");
    const c = localStorage.getItem("pet_count");
    if (n) { setCatName(n); setNameInput(n); }
    if (c) setPetCount(parseInt(c, 10));
  }, []);

  // Draw whenever frame changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const map = { walkA: WALK_A, walkB: WALK_B, sit: SIT };
    drawFrame(canvas, map[frame]);
  }, [frame]);

  // rAF animation loop
  useEffect(() => {
    let last = 0;

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const s   = walkState.current;
      const maxX = (floorRef.current?.clientWidth ?? window.innerWidth) - CAT_W - 16;

      if (s.mode === "walk") {
        s.x += s.dir * SPEED * dt;
        s.accum += SPEED * dt;

        if (s.accum >= STEP) {
          s.accum = 0;
          setFrame(f => f === "walkA" ? "walkB" : "walkA");
        }

        if (s.x >= maxX) { s.x = maxX; s.dir = -1; setFlipX(true);  }
        if (s.x <= 0)    { s.x = 0;    s.dir =  1; setFlipX(false); }

        setCatX(s.x);
      } else {
        s.happyLeft -= dt;
        if (s.happyLeft <= 0) {
          s.mode  = "walk";
          s.accum = 0;
          setFrame("walkA");
        }
      }

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  function petCat() {
    const s = walkState.current;
    if (s.mode === "happy") return;
    s.mode      = "happy";
    s.happyLeft = 1.4;
    setFrame("sit");
    setHeart(true);
    const n = petCount + 1;
    setPetCount(n);
    localStorage.setItem("pet_count", String(n));
    setTimeout(() => setHeart(false), 900);
  }

  function saveName() {
    const n = nameInput.trim() || "Byte";
    setCatName(n); setNameInput(n);
    localStorage.setItem("pet_name", n);
    setEditing(false);
  }

  const hearts = Math.min(5, Math.floor(petCount / 2) + 1);

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
        @keyframes float-heart {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-44px) scale(1.4); }
        }
        .pixel-canvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono flex flex-col`}>
        <Nav active="pet" />

        {/* Info */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">— your cat</p>

          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveName(); }}>
              <input autoFocus value={nameInput}
                onChange={e => setNameInput(e.target.value.slice(0, 12))}
                onBlur={saveName}
                className="bg-transparent border-b border-zinc-400 text-center text-xl font-bold text-zinc-800 outline-none pb-0.5 w-36 tracking-tight"
              />
            </form>
          ) : (
            <button onClick={() => setEditing(true)}
              className="text-xl font-bold tracking-tight text-zinc-800 hover:text-[#D94830] transition-colors">
              {catName}
            </button>
          )}

          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xl ${i < hearts ? "text-[#D94830]" : "text-zinc-300"}`}>♥</span>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-widest text-zinc-400">
            {petCount === 0 ? "click the cat to say hi" : `petted ${petCount}×`}
          </p>
        </div>

        {/* Floor — cat walks here */}
        <div ref={floorRef} className="relative h-36 border-t border-zinc-400/40 bg-[#DEDAD0] overflow-hidden">

          {/* Pixel floor dots for texture */}
          <div className="absolute top-0 left-0 right-0 h-px bg-zinc-400/30" />

          {/* Cat */}
          <div
            className="absolute bottom-0 cursor-pointer select-none"
            style={{
              left: catX,
              transform: flipX ? "scaleX(-1)" : "scaleX(1)",
              transformOrigin: "left bottom",
            }}
            onClick={petCat}
          >
            {/* Floating heart */}
            {heart && (
              <div
                className="absolute text-xl text-[#D94830] pointer-events-none"
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

            <canvas
              ref={canvasRef}
              width={CAT_W}
              height={CAT_H}
              className="pixel-canvas block"
            />
          </div>
        </div>
      </div>
    </>
  );
}
