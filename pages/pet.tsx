import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useState, useRef, useEffect } from "react";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ── Pixel palette ──────────────────────────────────────────────
const B = "#111111"; // black body
const d = "#2C2C2C"; // dark grey (depth on eye)
const Y = "#FFD700"; // amber eye
const P = "#FF99BB"; // pink nose
const _ = null;      // transparent

type Px = string | null;

// ── Sprite: 16×16, cat faces LEFT.
// Walk LEFT → show as-is. Walk RIGHT → canvas scaleX(-1) around its centre.
//
// Head (rows 0-5, cols 0-3): compact + round
//   row 0: ear tip (single pixel)
//   rows 1-2: ear widening
//   rows 2-5: head oval, eye at (3,1), nose at (4,0)
// Neck (row 5-6): narrows to 2px before body
// Body (rows 6-10, cols 3-11): wider oval
// Tail (rows 2-5, cols 12-14): curves up from body-back
// Legs (rows 10-13, cols 4,6,8,10): 4 legs, alternating in frame B

const WALK_A: Px[][] = [
  [_,B,_,_,_,_,_,_,_,_,_,_,_,_,_,_],  // 0  ear tip
  [_,B,B,_,_,_,_,_,_,_,_,_,_,_,_,_],  // 1  ear
  [B,B,B,B,_,_,_,_,_,_,_,_,_,_,B,_],  // 2  head top + tail tip
  [B,B,Y,B,_,_,_,_,_,_,_,_,_,B,B,_],  // 3  eye + tail
  [B,P,B,B,_,_,_,_,_,_,_,_,B,B,_,_],  // 4  nose + tail arc
  [_,B,B,B,_,_,_,_,_,_,_,B,B,_,_,_],  // 5  chin (3px) + tail base
  [_,_,B,B,B,B,B,B,B,B,B,B,_,_,_,_],  // 6  neck(2)+body — narrow start
  [_,_,_,B,B,B,B,B,B,B,B,B,_,_,_,_],  // 7  body
  [_,_,_,B,B,B,B,B,B,B,B,B,_,_,_,_],  // 8  body
  [_,_,_,_,B,B,B,B,B,B,B,_,_,_,_,_],  // 9  lower body
  [_,_,_,_,B,B,B,B,B,B,B,_,_,_,_,_],  // 10 belly
  [_,_,_,_,B,_,B,_,B,_,B,_,_,_,_,_],  // 11 4 legs cols 4,6,8,10
  [_,_,_,_,B,_,B,_,B,_,B,_,_,_,_,_],  // 12 legs
  [_,_,_,_,B,_,B,_,B,_,B,_,_,_,_,_],  // 13 paws
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Walk B: legs shift +1 col → stride animation
const WALK_B: Px[][] = WALK_A.map((row, r) => {
  if (r === 11) return [_,_,_,_,_,B,_,B,_,B,_,B,_,_,_,_]; // cols 5,7,9,11
  if (r === 12) return [_,_,_,_,_,B,_,B,_,B,_,B,_,_,_,_];
  if (r === 13) return [_,_,_,_,_,B,_,B,_,B,_,B,_,_,_,_];
  return [...row];
});

// Sit — front-facing, shown when petted
const SIT: Px[][] = [
  [_,_,B,_,_,_,_,_,_,_,_,_,B,_,_,_],  // two ear tips
  [_,B,B,B,_,_,_,_,_,_,_,B,B,B,_,_],  // ears
  [_,B,B,B,B,_,_,_,_,_,B,B,B,B,_,_],  // ear base
  [_,_,B,B,B,B,B,B,B,B,B,B,B,_,_,_],  // head
  [_,_,B,B,B,B,B,B,B,B,B,B,B,_,_,_],  // head
  [_,_,B,Y,d,B,B,B,B,B,Y,d,B,_,_,_],  // eyes
  [_,_,B,B,B,B,_,P,_,B,B,B,B,_,_,_],  // nose
  [_,_,B,B,B,B,B,B,B,B,B,B,B,_,_,_],  // lower face
  [_,_,_,B,B,B,B,B,B,B,B,B,_,_,_,_],  // neck
  [_,_,_,B,B,B,B,B,B,B,B,B,_,_,_,_],  // body
  [_,_,_,B,B,B,B,B,B,B,B,B,_,_,_,_],  // body
  [_,_,_,_,B,B,B,B,B,B,B,_,_,_,_,_],  // lower body
  [_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_],  // front legs
  [_,_,_,B,_,_,_,_,_,_,_,_,B,_,_,_],  // legs
  [_,_,_,B,B,_,_,_,_,_,_,B,B,_,_,_],  // paws
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const PIXEL = 5;
const COLS  = 16;
const ROWS  = 16;
const CAT_W = COLS * PIXEL; // 80px
const CAT_H = ROWS * PIXEL; // 80px
const SPEED = 65;            // px/s
const STEP  = 20;            // px per walk-frame switch

function drawFrame(canvas: HTMLCanvasElement, frame: Px[][]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CAT_W, CAT_H);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const col = frame[r][c];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(c * PIXEL, r * PIXEL, PIXEL, PIXEL);
    }
  }
}

export default function Pet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const floorRef  = useRef<HTMLDivElement>(null);
  const animRef   = useRef<number>(0);
  // mutable state for rAF — no re-render needed each tick
  const ws = useRef({ x: 40, dir: -1, accum: 0, mode: "walk", happyLeft: 0 });

  const [catX,      setCatX]      = useState(40);
  const [flipX,     setFlipX]     = useState(false); // false=left, true=right
  const [frame,     setFrame]     = useState<"walkA"|"walkB"|"sit">("walkA");
  const [heart,     setHeart]     = useState(false);
  const [petCount,  setPetCount]  = useState(0);
  const [catName,   setCatName]   = useState("Byte");
  const [editing,   setEditing]   = useState(false);
  const [nameInput, setNameInput] = useState("Byte");

  // Load localStorage
  useEffect(() => {
    const n = localStorage.getItem("pet_name");
    const c = localStorage.getItem("pet_count");
    if (n) { setCatName(n); setNameInput(n); }
    if (c) setPetCount(parseInt(c, 10));
  }, []);

  // Redraw sprite when frame changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFrame(canvas, { walkA: WALK_A, walkB: WALK_B, sit: SIT }[frame]);
  }, [frame]);

  // rAF walk loop
  useEffect(() => {
    let last = 0;
    function tick(now: number) {
      const dt  = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s   = ws.current;
      const maxX = (floorRef.current?.clientWidth ?? window.innerWidth) - CAT_W - 8;

      if (s.mode === "walk") {
        s.x     += s.dir * SPEED * dt;
        s.accum += SPEED * dt;

        if (s.accum >= STEP) {
          s.accum = 0;
          setFrame(f => f === "walkA" ? "walkB" : "walkA");
        }

        // Sprite faces LEFT by default. Flip when going right.
        if (s.x >= maxX) { s.x = maxX; s.dir = -1; setFlipX(false); }
        if (s.x <= 0)    { s.x = 0;    s.dir =  1; setFlipX(true);  }

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
    const s = ws.current;
    if (s.mode === "happy") return;
    s.mode      = "happy";
    s.happyLeft = 1.5;
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
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-48px) scale(1.5); }
        }
        canvas { image-rendering:pixelated; image-rendering:crisp-edges; display:block; }
      `}</style>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono flex flex-col`}>
        <Nav active="pet" />

        {/* Stats */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">— your cat</p>

          {editing ? (
            <form onSubmit={e => { e.preventDefault(); saveName(); }}>
              <input autoFocus value={nameInput}
                onChange={e => setNameInput(e.target.value.slice(0, 12))}
                onBlur={saveName}
                className="bg-transparent border-b border-zinc-400 text-center text-xl font-bold text-zinc-800 outline-none pb-0.5 w-36 tracking-tight" />
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

        {/* Floor */}
        <div ref={floorRef} className="relative h-36 border-t border-zinc-400/30 bg-[#DEDAD0] overflow-hidden">
          {/* walking cat container — positioned without transform so flip stays in-place */}
          <div
            className="absolute bottom-0 cursor-pointer select-none"
            style={{ left: catX }}
            onClick={petCat}
          >
            {heart && (
              <div className="absolute text-xl text-[#D94830] pointer-events-none"
                style={{ top: -4, left: "50%", transform: "translateX(-50%)", animation: "float-heart 0.9s ease forwards" }}>
                ♥
              </div>
            )}
            {/* canvas flips around its own centre — container position unaffected */}
            <canvas
              ref={canvasRef}
              width={CAT_W}
              height={CAT_H}
              style={{ transform: flipX ? "scaleX(-1)" : "none" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
