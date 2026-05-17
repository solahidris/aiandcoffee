import { useState, useRef, useEffect } from "react";
import { usePet, GRID_SIZE } from "../contexts/PetContext";

const AP = 4; // px per sprite pixel → 64×64 canvas, CSS 128×128

function drawGrid(canvas: HTMLCanvasElement, grid: (string | null)[][]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, GRID_SIZE * AP, GRID_SIZE * AP);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = grid[r][c];
      if (col) { ctx.fillStyle = col; ctx.fillRect(c * AP, r * AP, AP, AP); }
    }
  }
}

export default function PetSprite() {
  const { grid, enabled, incrementPet } = usePet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const ws        = useRef({ x: 60, dir: 1, t: 0 });
  const [catX,  setCatX]  = useState(60);
  const [flipX, setFlipX] = useState(false);
  const [hopY,  setHopY]  = useState(0);
  const [heart, setHeart] = useState(false);

  // Draw sprite whenever grid changes
  useEffect(() => {
    const c = canvasRef.current;
    if (c) drawGrid(c, grid);
  }, [grid, enabled]);

  // Walk animation — only runs when enabled
  useEffect(() => {
    if (!enabled) { cancelAnimationFrame(rafRef.current); return; }
    let last = 0;
    function tick(now: number) {
      const dt  = Math.min((now - last) / 1000, 0.05); last = now;
      const s   = ws.current;
      const max = window.innerWidth - GRID_SIZE * AP * 2 - 8;
      s.x += s.dir * 60 * dt;
      s.t += dt;
      if (s.x >= max) { s.x = max; s.dir = -1; setFlipX(false); }
      if (s.x <= 0)   { s.x = 0;   s.dir =  1; setFlipX(true);  }
      setCatX(s.x);
      setHopY(Math.round(Math.abs(Math.sin(s.t * 7)) * 3));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="fixed z-40 pointer-events-none select-none"
      style={{ left: catX, bottom: hopY }}
    >
      <div
        className="pointer-events-auto cursor-pointer"
        onClick={() => {
          incrementPet();
          setHeart(true);
          setTimeout(() => setHeart(false), 900);
        }}
      >
        {heart && (
          <div
            className="absolute text-xl text-[#D94830] pointer-events-none"
            style={{
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              animation: "pet-float-heart 0.9s ease forwards",
            }}
          >
            ♥
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * AP}
          height={GRID_SIZE * AP}
          style={{
            display: "block",
            width: GRID_SIZE * AP * 2,
            height: GRID_SIZE * AP * 2,
            imageRendering: "pixelated",
            transform: flipX ? "scaleX(-1)" : "none",
          }}
        />
      </div>
    </div>
  );
}
