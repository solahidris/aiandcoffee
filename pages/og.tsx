import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import { useState, useEffect, useRef, useCallback } from "react";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type Mode = "text" | "image";

function buildUrl(title: string, subtitle: string): string {
  if (typeof window === "undefined") return "/api/og";
  const base = window.location.origin + "/api/og";
  if (!title) return base;
  const p = new URLSearchParams();
  p.set("title", title);
  if (subtitle) p.set("subtitle", subtitle);
  return `${base}?${p.toString()}`;
}

const CTA = "inline-block border-2 border-[#D94830] bg-[#D94830] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors text-center";
const CTA_GHOST = "block w-full border-2 border-zinc-800 px-6 py-3 text-xs uppercase tracking-widest text-zinc-800 text-center hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors";

export default function OGGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [title, setTitle] = useState("AI and Coffee Meetup");
  const [subtitle, setSubtitle] = useState("16 May 2026 · Kuala Lumpur · Free");
  const [previewUrl, setPreviewUrl] = useState("/api/og");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  // ── Text mode: update preview URL ──────────────────────────────────────────
  useEffect(() => {
    if (mode !== "text") return;
    const t = setTimeout(() => setPreviewUrl(buildUrl(title, subtitle)), 400);
    return () => clearTimeout(t);
  }, [title, subtitle, mode]);

  // ── Image mode: draw canvas ─────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedFile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(uploadedFile);
    img.onload = () => {
      ctx.clearRect(0, 0, 1200, 630);

      // Background image — cover fit
      const ratio = Math.max(1200 / img.width, 630 / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, (1200 - w) / 2, (630 - h) / 2, w, h);

      // Dark gradient overlay (bottom half)
      const grad = ctx.createLinearGradient(0, 200, 0, 630);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.82)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);

      // Red left bar
      ctx.fillStyle = "#D94830";
      ctx.fillRect(0, 0, 16, 630);

      // "AI AND COFFEE" badge — top right
      ctx.font = "700 18px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "right";
      ctx.fillText("AI AND COFFEE", 1136, 56);
      ctx.textAlign = "left";

      // Title — bottom left, wrapping
      if (title) {
        ctx.font = "700 68px monospace";
        ctx.fillStyle = "#FFFFFF";
        const maxWidth = 880;
        const words = title.toUpperCase().split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const test = current ? current + " " + word : word;
          if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        const visibleLines = lines.slice(0, 2);
        const baseY = subtitle ? 490 - (visibleLines.length - 1) * 80 : 530 - (visibleLines.length - 1) * 80;
        visibleLines.forEach((l, i) => ctx.fillText(l, 56, baseY + i * 84));
      }

      // Subtitle
      if (subtitle) {
        ctx.font = "400 26px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(subtitle, 56, 578);
      }

      // Domain — bottom right
      ctx.font = "400 18px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.textAlign = "right";
      ctx.fillText("aiandcoffee.com", 1144, 608);

      URL.revokeObjectURL(objectUrl);
      setCanvasDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = objectUrl;
  }, [uploadedFile, title, subtitle]);

  useEffect(() => {
    if (mode === "image") {
      const t = setTimeout(drawCanvas, 300);
      return () => clearTimeout(t);
    }
  }, [mode, drawCanvas]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  function copyUrl() {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCanvas() {
    if (!canvasDataUrl) return;
    const a = document.createElement("a");
    a.href = canvasDataUrl;
    a.download = "og-image.png";
    a.click();
  }

  async function share() {
    try {
      if (mode === "image" && canvasRef.current) {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], "og-image.png", { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "AI and Coffee" });
          } else {
            await navigator.share({ title: "AI and Coffee OG Image", url: window.location.href });
          }
        }, "image/png");
      } else {
        await navigator.share({ title: "AI and Coffee OG Image", url: previewUrl });
      }
    } catch {}
  }

  const currentPreview = mode === "image" ? canvasDataUrl : previewUrl;

  return (
    <>
      <Head>
        <title>OG Image Generator — AI and Coffee</title>
        <meta name="description" content="Generate branded Open Graph preview images for events and posts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hidden canvas for image mode compositing */}
      <canvas ref={canvasRef} width={1200} height={630} className="hidden" />

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="tools" />

        <div className="px-6 sm:px-16 pt-12 pb-6 border-b border-zinc-400/40">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">AI and Coffee</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[#D94830] leading-none tracking-tighter">
            OG GENERATOR
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
            generate social preview images
          </p>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">

          {/* ── Form ── */}
          <div className="lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-400/40 px-6 py-10 lg:px-8">

            {/* Mode toggle */}
            <div className="flex gap-2 mb-8">
              {(["text", "image"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-[11px] uppercase tracking-widest border transition-colors ${
                    mode === m
                      ? "border-[#D94830] bg-[#D94830] text-white"
                      : "border-zinc-300 text-zinc-500 hover:border-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {m === "text" ? "Text" : "Image"}
                </button>
              ))}
            </div>

            <div className="space-y-7">
              {/* Image upload (image mode only) */}
              {mode === "image" && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                    Background Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setUploadedFile(f);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-zinc-400 py-6 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-800 transition-colors"
                  >
                    {uploadedFile ? uploadedFile.name : "Click to upload image"}
                  </button>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event or post title..."
                  className="w-full bg-transparent border-b border-zinc-400 pb-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Date · Venue · Fee..."
                  className="w-full bg-transparent border-b border-zinc-400 pb-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-3">
                {mode === "text" ? (
                  <>
                    <button onClick={copyUrl} className={`w-full ${CTA}`}>
                      {copied ? "Copied ✓" : "Copy URL"}
                    </button>
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className={CTA_GHOST}>
                      Open Image ↗
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      onClick={downloadCanvas}
                      disabled={!canvasDataUrl}
                      className={`w-full ${CTA} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      Download PNG
                    </button>
                  </>
                )}

                {canShare && (
                  <button onClick={share} className={CTA_GHOST}>
                    Share ↗
                  </button>
                )}

                <button
                  onClick={() => { setTitle(""); setSubtitle(""); setUploadedFile(null); setCanvasDataUrl(null); setPreviewUrl("/api/og"); }}
                  className="w-full text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors py-2"
                >
                  Reset
                </button>
              </div>

              {mode === "text" && (
                <div className="pt-2 border-t border-zinc-400/40">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Usage</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Paste the URL into your meta tags or share directly. 1200×630px SVG.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="flex-1 px-6 py-10 lg:px-10">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6">Preview</p>

            <div className="w-full" style={{ aspectRatio: "1200/630" }}>
              {currentPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={currentPreview}
                  src={currentPreview}
                  alt="OG preview"
                  className="w-full h-full object-contain border border-zinc-300 animate-stagger-in"
                />
              ) : (
                <div className="w-full h-full border border-dashed border-zinc-300 flex items-center justify-center">
                  <p className="text-xs uppercase tracking-widest text-zinc-300">
                    {mode === "image" ? "Upload an image to preview" : "Loading..."}
                  </p>
                </div>
              )}
            </div>

            {mode === "text" && (
              <div className="mt-6 flex flex-col sm:flex-row gap-2 items-start">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1 shrink-0">URL</p>
                <p className="text-xs text-zinc-600 break-all leading-relaxed">{previewUrl}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
