import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import Nav from "../components/Nav";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePet, GRID_SIZE } from "../contexts/PetContext";
import type { Grid } from "../contexts/PetContext";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const G  = GRID_SIZE;
const CE = 20; // editor cell size → 320×320 canvas

// ── Palette ───────────────────────────────────────────────────
const PALETTE: (string | null)[] = [
  "#111111","#555555","#999999","#CCCCCC","#FFFFFF",
  "#D94830","#F4A460","#FFD700","#3CB371","#4ECDC4",
  "#4A90D9","#9B59B6","#FF99BB","#F5CBA7","#8B5E3C",
  null,
];

const empty = (): Grid => Array.from({ length: G }, () => Array(G).fill(null));

// ── Animal templates ──────────────────────────────────────────
function tplCat(): Grid {
  const B="#111111",Y="#FFD700",P="#FF99BB",n=null;
  return [
    [n,B,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,B,B,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [B,B,B,B,n,n,n,n,n,n,n,n,n,n,B,n],[B,B,Y,B,n,n,n,n,n,n,n,n,n,B,B,n],
    [B,P,B,B,n,n,n,n,n,n,n,n,B,B,n,n],[n,B,B,B,n,n,n,n,n,n,n,B,B,n,n,n],
    [n,n,B,B,B,B,B,B,B,B,B,B,n,n,n,n],[n,n,n,B,B,B,B,B,B,B,B,B,n,n,n,n],
    [n,n,n,B,B,B,B,B,B,B,B,B,n,n,n,n],[n,n,n,n,B,B,B,B,B,B,B,n,n,n,n,n],
    [n,n,n,n,B,B,B,B,B,B,B,n,n,n,n,n],[n,n,n,n,B,n,B,n,B,n,B,n,n,n,n,n],
    [n,n,n,n,B,n,B,n,B,n,B,n,n,n,n,n],[n,n,n,n,B,n,B,n,B,n,B,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}
function tplDog(): Grid {
  const T="#C9A063",D="#8B5E3C",E="#111111",P="#FF99BB",n=null;
  return [
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,D,D,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,D,D,T,T,n,n,n,n,n,n,n,n,n,n,n],[D,D,T,E,T,T,n,n,n,n,n,n,n,n,n,n],
    [D,D,T,T,T,T,n,n,n,n,n,n,n,n,n,n],[n,T,T,T,T,T,T,n,n,n,n,n,n,n,T,n],
    [P,T,T,T,T,T,n,n,n,n,n,n,n,T,T,n],[n,n,T,T,T,T,T,T,T,T,T,T,T,n,n,n],
    [n,n,n,T,T,T,T,T,T,T,T,T,n,n,n,n],[n,n,n,T,T,T,T,T,T,T,T,T,n,n,n,n],
    [n,n,n,n,T,T,T,T,T,T,T,n,n,n,n,n],[n,n,n,n,T,n,T,n,T,n,T,n,n,n,n,n],
    [n,n,n,n,T,n,T,n,T,n,T,n,n,n,n,n],[n,n,n,n,T,n,T,n,T,n,T,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}
function tplRabbit(): Grid {
  const W="#CCCCCC",P="#FFB3C6",E="#111111",n=null;
  return [
    [n,W,P,n,W,P,n,n,n,n,n,n,n,n,n,n],[n,W,P,n,W,P,n,n,n,n,n,n,n,n,n,n],
    [n,W,P,n,W,P,n,n,n,n,n,n,n,n,n,n],[n,W,P,n,W,P,n,n,n,n,n,n,n,n,n,n],
    [W,W,W,W,W,W,W,n,n,n,n,n,n,n,n,n],[W,W,W,E,W,W,W,W,n,n,n,n,n,n,n,n],
    [W,W,W,W,W,n,n,n,n,n,n,n,n,n,W,n],[n,n,W,W,W,W,W,W,W,W,W,W,n,n,W,n],
    [n,n,n,W,W,W,W,W,W,W,W,W,n,n,n,n],[n,n,n,W,W,W,W,W,W,W,W,W,n,n,n,n],
    [n,n,n,n,W,W,W,W,W,W,W,n,n,n,n,n],[n,n,n,n,W,n,W,n,W,n,W,n,n,n,n,n],
    [n,n,n,n,W,n,W,n,W,n,W,n,n,n,n,n],[n,n,n,n,W,n,W,n,W,n,W,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}
function tplBird(): Grid {
  const B="#4A90D9",Y="#FFD700",E="#111111",n=null;
  return [
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,B,B,B,n,n,n,n,n,n,n,n,n,n],[n,Y,n,B,E,B,B,n,n,n,n,n,n,n,n,n],
    [Y,Y,B,B,B,B,B,B,B,B,B,n,n,n,n,n],[n,n,B,B,B,B,B,B,B,B,B,B,B,n,n,n],
    [n,n,n,B,B,B,B,B,B,B,B,B,B,B,n,n],[n,n,n,n,B,B,B,B,B,B,B,B,n,n,n,n],
    [n,n,n,n,n,B,B,B,B,B,n,n,n,n,n,n],[n,n,n,n,n,n,Y,n,n,Y,n,n,n,n,n,n],
    [n,n,n,n,n,n,Y,n,n,Y,n,n,n,n,n,n],[n,n,n,n,n,Y,Y,n,Y,Y,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}
function tplFish(): Grid {
  const O="#F4A460",R="#D94830",E="#111111",n=null;
  return [
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,R,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,R,R,n],
    [n,n,O,O,O,O,O,O,O,O,O,O,O,R,R,n],[O,O,O,E,O,O,O,O,O,O,O,O,O,R,R,n],
    [O,O,O,O,O,O,O,O,O,O,O,O,O,R,R,n],[n,n,O,O,O,O,R,O,O,O,O,O,O,R,R,n],
    [n,n,n,n,O,O,O,O,O,O,O,O,O,R,R,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,R,R,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,R,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}
function tplBear(): Grid {
  const B="#8B5E3C",L="#C9A063",E="#111111",n=null;
  return [
    [n,n,B,B,n,n,n,n,n,n,n,n,n,n,n,n],[n,B,B,B,B,n,n,n,n,n,n,n,n,n,n,n],
    [B,B,B,B,B,B,n,n,n,n,n,n,n,n,n,n],[B,B,E,B,B,B,n,n,n,n,n,n,n,n,n,n],
    [B,B,B,B,B,B,n,n,n,n,n,n,n,n,n,n],[n,B,L,L,B,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,B,B,B,B,B,B,B,B,B,B,n,n,n,n],[n,n,B,B,B,B,B,B,B,B,B,B,B,n,n,n],
    [n,n,B,B,B,B,B,B,B,B,B,B,B,n,n,n],[n,n,n,B,B,B,B,B,B,B,B,B,n,n,n,n],
    [n,n,n,B,B,B,B,B,B,B,B,B,n,n,n,n],[n,n,n,n,B,n,B,n,B,n,B,n,n,n,n,n],
    [n,n,n,n,B,n,B,n,B,n,B,n,n,n,n,n],[n,n,n,n,B,B,B,B,B,B,B,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}

function randomSprite(): Grid {
  const grid = empty();
  const schemes = [
    { body:"#111111",hi:"#333333",eye:"#FFD700" },
    { body:"#666666",hi:"#999999",eye:"#4ECDC4" },
    { body:"#F4A460",hi:"#D9965A",eye:"#4A90D9" },
    { body:"#4A90D9",hi:"#2C6FA8",eye:"#FFD700" },
    { body:"#9B59B6",hi:"#6C3483",eye:"#FFD700" },
    { body:"#D94830",hi:"#9B3522",eye:"#FFFFFF" },
  ];
  const s = schemes[Math.floor(Math.random() * schemes.length)];
  for (let r = 8; r <= 13; r++) {
    const pad = (r===8||r===13)?2:(r===9||r===12)?1:0;
    for (let c = 3+pad; c <= 12-pad; c++) grid[r][c] = s.body;
  }
  for (let r = 2; r <= 7; r++) for (let c = 4; c <= 11; c++) {
    const dx=(c+.5-7.5)/3.5, dy=(r+.5-4.5)/3;
    if (dx*dx+dy*dy<=1) grid[r][c]=s.body;
  }
  grid[4][6]=s.eye; grid[4][9]=s.eye;
  [[14,4],[14,6],[14,9],[14,11],[15,4],[15,6],[15,9],[15,11]].forEach(([r,c])=>{ grid[r][c]=s.body; });
  [[5,6],[5,7],[5,8],[9,5],[9,8],[10,6],[10,9],[11,7]].forEach(([r,c])=>{ if(Math.random()<.45) grid[r][c]=s.hi; });
  return grid;
}

const TEMPLATES = [
  { name:"Cat",    grid: tplCat()    },
  { name:"Dog",    grid: tplDog()    },
  { name:"Rabbit", grid: tplRabbit() },
  { name:"Bird",   grid: tplBird()   },
  { name:"Fish",   grid: tplFish()   },
  { name:"Bear",   grid: tplBear()   },
];

// ── Thumbnail ─────────────────────────────────────────────────
function TemplateThumb({ grid }: { grid: Grid }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const PX  = 3;
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,G*PX,G*PX);
    for (let r=0;r<G;r++) for (let col=0;col<G;col++) {
      const color = grid[r][col];
      if (color) { ctx.fillStyle=color; ctx.fillRect(col*PX,r*PX,PX,PX); }
    }
  }, [grid]);
  return <canvas ref={ref} width={G*3} height={G*3} className="px block" style={{width:G*3,height:G*3}} />;
}

// ── Editor canvas helpers ─────────────────────────────────────
function drawEditor(canvas: HTMLCanvasElement, grid: Grid, hover: [number,number]|null, color: string|null) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  ctx.clearRect(0,0,G*CE,G*CE);
  for (let r=0;r<G;r++) for (let c=0;c<G;c++) {
    const col = grid[r][c];
    if (col) { ctx.fillStyle=col; ctx.fillRect(c*CE,r*CE,CE,CE); }
    if (hover?.[0]===r && hover?.[1]===c) {
      ctx.fillStyle = color ?? "rgba(255,255,255,0.5)";
      ctx.fillRect(c*CE,r*CE,CE,CE);
    }
  }
  ctx.strokeStyle="rgba(0,0,0,0.07)"; ctx.lineWidth=0.5;
  for (let i=0;i<=G;i++) {
    ctx.beginPath(); ctx.moveTo(i*CE,0); ctx.lineTo(i*CE,G*CE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*CE); ctx.lineTo(G*CE,i*CE); ctx.stroke();
  }
}

// ── Page ──────────────────────────────────────────────────────
export default function Pet() {
  const { grid, catName, enabled, petCount, setGrid, setCatName, setEnabled } = usePet();

  const [selColor, setSelColor] = useState<string|null>("#111111");
  const [erasing,  setErasing]  = useState(false);
  const [drawing,  setDrawing]  = useState(false);
  const [hover,    setHover]    = useState<[number,number]|null>(null);
  const [editing,  setEditing]  = useState(false);
  const [nameInput,setNameInput]= useState(catName);

  const editorRef = useRef<HTMLCanvasElement>(null);

  // Sync nameInput when context name loads
  useEffect(() => { setNameInput(catName); }, [catName]);

  // Draw editor
  useEffect(() => {
    const c = editorRef.current; if (!c) return;
    drawEditor(c, grid, hover, erasing ? null : selColor);
  }, [grid, hover, selColor, erasing]);

  const cellAt = useCallback((canvas: HTMLCanvasElement, cx: number, cy: number): [number,number]|null => {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((cx-rect.left)/CE), r = Math.floor((cy-rect.top)/CE);
    return (r>=0&&r<G&&c>=0&&c<G) ? [r,c] : null;
  }, []);

  const paint = useCallback((r: number, c: number) => {
    const next = grid.map(row => [...row]);
    next[r][c] = erasing ? null : selColor;
    setGrid(next);
  }, [erasing, selColor, grid, setGrid]);

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const cell = cellAt(e.currentTarget, e.clientX, e.clientY);
    if (!cell) return; setDrawing(true); paint(cell[0],cell[1]);
  }
  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const cell = cellAt(e.currentTarget, e.clientX, e.clientY);
    setHover(cell); if (drawing && cell) paint(cell[0],cell[1]);
  }
  function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault(); const t=e.touches[0]; if (!t) return;
    const cell = cellAt(e.currentTarget, t.clientX, t.clientY);
    if (!cell) return; setDrawing(true); paint(cell[0],cell[1]);
  }
  function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault(); const t=e.touches[0]; if (!t) return;
    const cell = cellAt(e.currentTarget, t.clientX, t.clientY); if (cell) paint(cell[0],cell[1]);
  }

  function saveName() {
    const n = nameInput.trim() || "petslop";
    setCatName(n); setEditing(false);
  }

  const hearts = Math.min(5, Math.floor(petCount/2)+1);

  return (
    <>
      <Head>
        <title>Pet — AI and Coffee</title>
        <meta name="description" content="Draw a pixel sprite and set it loose on the whole app." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/pet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style>{`
        .px { image-rendering:pixelated; image-rendering:crisp-edges; }
      `}</style>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="pet" />

        <div className="px-6 sm:px-12 py-10">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-8">— draw your sprite</p>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Grid canvas */}
            <div className="border border-zinc-400/40 bg-[#F2EFE8] shrink-0">
              <canvas
                ref={editorRef}
                width={G*CE} height={G*CE}
                className="block cursor-crosshair touch-none"
                style={{ width:G*CE, height:G*CE }}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove}
                onMouseUp={() => setDrawing(false)} onMouseLeave={() => { setDrawing(false); setHover(null); }}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => setDrawing(false)}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-6 min-w-[200px]">

              {/* Templates */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">templates</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(({ name, grid: tg }) => (
                    <button key={name} onClick={() => setGrid(tg.map(r=>[...r]))}
                      className="flex flex-col items-center gap-1 p-1.5 border border-zinc-400/40 hover:border-[#D94830] bg-[#F2EFE8] transition-colors"
                      title={`Load ${name}`}>
                      <TemplateThumb grid={tg} />
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">tool</p>
                <div className="flex gap-2">
                  {(["paint","erase"] as const).map(t => (
                    <button key={t} onClick={() => setErasing(t==="erase")}
                      className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                        erasing===(t==="erase") ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-400 text-zinc-500 hover:border-zinc-600"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Palette */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">color</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {PALETTE.map((col, i) => (
                    <button key={i} title={col ?? "eraser"}
                      onClick={() => { setSelColor(col); setErasing(col===null); }}
                      className={`w-8 h-8 border-2 transition-all ${
                        selColor===col && erasing===(col===null) ? "border-[#D94830] scale-110" : "border-transparent hover:border-zinc-400"
                      }`}
                      style={{ backgroundColor:col??'transparent', backgroundImage:col?'none':'repeating-conic-gradient(#ccc 0% 25%, #e8e4d9 0% 50%) 0 0/8px 8px' }}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">name</p>
                {editing ? (
                  <form onSubmit={e=>{e.preventDefault();saveName();}}>
                    <input autoFocus value={nameInput} onChange={e=>setNameInput(e.target.value.slice(0,16))}
                      onBlur={saveName}
                      className="bg-transparent border-b border-zinc-400 text-sm text-zinc-800 outline-none pb-0.5 w-full tracking-tight" />
                  </form>
                ) : (
                  <button onClick={()=>setEditing(true)}
                    className="text-sm font-bold tracking-tight text-zinc-800 hover:text-[#D94830] transition-colors">
                    {catName}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button onClick={() => setGrid(randomSprite())}
                  className="px-4 py-2 text-[10px] uppercase tracking-widest border border-zinc-400 text-zinc-600 hover:border-zinc-600 hover:text-zinc-800 transition-colors text-left">
                  ✦ randomise
                </button>
                <button onClick={() => setGrid(empty())}
                  className="px-4 py-2 text-[10px] uppercase tracking-widest border border-zinc-400 text-zinc-600 hover:border-zinc-600 hover:text-zinc-800 transition-colors text-left">
                  clear
                </button>
              </div>

              {/* ── Toggle: live on all pages ── */}
              <div className="pt-4 border-t border-zinc-400/40">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">live on all pages</p>
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`flex items-center gap-3 px-4 py-3 w-full border-2 transition-colors ${
                    enabled
                      ? "border-[#D94830] bg-[#D94830] text-white"
                      : "border-zinc-400 text-zinc-600 hover:border-zinc-600"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${enabled ? "bg-white" : "bg-zinc-400"}`} />
                  <span className="text-[11px] uppercase tracking-widest">
                    {enabled ? "on — walking the app" : "off"}
                  </span>
                </button>

                {enabled && (
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({length:5}).map((_,i)=>(
                      <span key={i} className={`text-base ${i<hearts?"text-[#D94830]":"text-zinc-300"}`}>♥</span>
                    ))}
                    {petCount > 0 && (
                      <span className="text-[10px] text-zinc-400 ml-1 self-center">petted {petCount}×</span>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
