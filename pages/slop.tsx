import Head from "next/head";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import { TONES, type Tone } from "../lib/roast-tones";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Mode = "roast" | "threads" | "pitch" | "standup" | "explain";

const TABS: { mode: Mode; label: string; query: string }[] = [
  { mode: "roast",    label: "Roast Anything",   query: "roast"            },
  { mode: "threads",  label: "Roast by Threads",  query: "roast-by-threads" },
  { mode: "pitch",    label: "Startup Pitch",     query: "startup-pitch"    },
  { mode: "standup",  label: "Standup BS",        query: "standup"          },
  { mode: "explain",  label: "Explain Like I'm",  query: "explain"          },
];

const PERSONAS: { value: string; label: string }[] = [
  { value: "mamak-uncle",   label: "Mamak Uncle"   },
  { value: "makcik-bawang", label: "Makcik Bawang" },
  { value: "mlm-boss",      label: "MLM Boss"      },
  { value: "pak-guard",     label: "Pak Guard"     },
  { value: "grab-driver",   label: "Grab Driver"   },
  { value: "crypto-bro",    label: "Crypto Bro"    },
];

const THREADS_LIMIT = 500;

function buildShareText(result: string, attribution: string): string {
  const full = result + attribution;
  if (full.length <= THREADS_LIMIT) return full;
  const truncated = result.slice(0, THREADS_LIMIT - attribution.length - 3) + '...';
  return truncated + attribution;
}

const MOODS = [
  "did nothing",
  "burned out",
  "actually productive",
  "pretending to work",
  "in meetings all day",
];

function ToneSelector({ tone, setTone }: { tone: Tone; setTone: (t: Tone) => void }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">tone</p>
      <div className="flex flex-wrap gap-2">
        {TONES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTone(value)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
              tone === value
                ? "border-[#D94830] bg-[#D94830] text-white"
                : "border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SloppyResult({
  result,
  shareText,
  label = "output",
  resetLabel = "generate again",
  sub,
  onCopy,
  copied,
  onReset,
}: {
  result: string;
  shareText: string;
  label?: string;
  resetLabel?: string;
  sub?: string | null;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
}) {
  return (
    <div className="mt-8 border-2 border-[#D94830] bg-[#F2EFE8] animate-stagger-in">
      <div className="px-5 py-3 border-b border-[#D94830]/30 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#D94830]">{label}</span>
        <button
          onClick={onCopy}
          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      {sub && (
        <div className="px-5 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">their bio</p>
          <p className="text-xs text-zinc-500 italic leading-relaxed">&ldquo;{sub}&rdquo;</p>
        </div>
      )}
      <div className="px-5 py-6">
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{result}</p>
      </div>
      <div className="px-5 py-5 border-t border-[#D94830]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <a
          href={`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-2 border-zinc-800 px-8 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors"
        >
          share to threads ↗
        </a>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-zinc-400">powered by (AI and Coffee) slop LLM</span>
          <button
            onClick={onReset}
            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#D94830] transition-colors"
          >
            {resetLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-8 border border-zinc-400/60 px-5 py-4">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">error</p>
      <p className="text-sm text-zinc-700">{message}</p>
    </div>
  );
}

export default function SlopCentre() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("roast");
  const [tone, setTone] = useState<Tone>("english");
  const [slopCount, setSlopCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/slop-count')
      .then(r => r.json())
      .then((d: { count: number }) => setSlopCount(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const found = TABS.find((t) => t.query in router.query);
    if (found) setMode(found.mode);
  }, [router.isReady, router.query]);

  function switchMode(m: Mode) {
    const tab = TABS.find((t) => t.mode === m)!;
    setMode(m);
    resetAll();
    router.replace(`/slop?${tab.query}`, undefined, { shallow: true });
  }

  function resetAll() {
    setRoastResult(null); setRoastError(null);
    setThreadsResult(null); setThreadsBio(null); setThreadsError(null);
    setPitchResult(null); setPitchError(null);
    setStandupResult(null); setStandupError(null);
    setExplainResult(null); setExplainError(null);
  }

  async function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  // ── Roast state ──
  const [roastInput, setRoastInput] = useState("");
  const [roastResult, setRoastResult] = useState<string | null>(null);
  const [roastLoading, setRoastLoading] = useState(false);
  const [roastError, setRoastError] = useState<string | null>(null);
  const [roastCopied, setRoastCopied] = useState(false);
  const roastRef = useRef<HTMLTextAreaElement>(null);

  async function handleRoast() {
    const trimmed = roastInput.trim();
    if (!trimmed || roastLoading) return;
    setRoastLoading(true); setRoastResult(null); setRoastError(null);
    try {
      const res = await fetch("/api/roast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: trimmed, tone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setRoastResult(data.roast);
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setRoastError(e instanceof Error ? e.message : "Failed. Try again."); }
    finally { setRoastLoading(false); }
  }

  // ── Threads state ──
  const [threadsUsername, setThreadsUsername] = useState("");
  const [threadsResult, setThreadsResult] = useState<string | null>(null);
  const [threadsBio, setThreadsBio] = useState<string | null>(null);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [threadsCopied, setThreadsCopied] = useState(false);
  const threadsRef = useRef<HTMLInputElement>(null);

  async function handleThreadsRoast() {
    const trimmed = threadsUsername.trim().replace(/^@+/, "");
    if (!trimmed || threadsLoading) return;
    setThreadsLoading(true); setThreadsResult(null); setThreadsBio(null); setThreadsError(null);
    try {
      const res = await fetch("/api/roast-threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: trimmed, tone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setThreadsResult(data.roast);
      setThreadsBio(data.bio || null);
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setThreadsError(e instanceof Error ? e.message : "Failed to fetch profile. Try again."); }
    finally { setThreadsLoading(false); }
  }

  // ── Pitch state ──
  const [pitchInput, setPitchInput] = useState("");
  const [pitchResult, setPitchResult] = useState<string | null>(null);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [pitchCopied, setPitchCopied] = useState(false);
  const pitchRef = useRef<HTMLTextAreaElement>(null);

  async function handlePitch() {
    const trimmed = pitchInput.trim();
    if (!trimmed || pitchLoading) return;
    setPitchLoading(true); setPitchResult(null); setPitchError(null);
    try {
      const res = await fetch("/api/startup-pitch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: trimmed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setPitchResult(data.pitch);
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setPitchError(e instanceof Error ? e.message : "Failed. Try again."); }
    finally { setPitchLoading(false); }
  }

  // ── Standup state ──
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [standupContext, setStandupContext] = useState("");
  const [standupResult, setStandupResult] = useState<string | null>(null);
  const [standupLoading, setStandupLoading] = useState(false);
  const [standupError, setStandupError] = useState<string | null>(null);
  const [standupCopied, setStandupCopied] = useState(false);

  async function handleStandup() {
    if (!selectedMood || standupLoading) return;
    setStandupLoading(true); setStandupResult(null); setStandupError(null);
    try {
      const res = await fetch("/api/standup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mood: selectedMood, context: standupContext }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStandupResult(data.update);
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setStandupError(e instanceof Error ? e.message : "Failed. Try again."); }
    finally { setStandupLoading(false); }
  }

  // ── Explain state ──
  const [explainTopic, setExplainTopic] = useState("");
  const [explainPersona, setExplainPersona] = useState("mamak-uncle");
  const [explainResult, setExplainResult] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainCopied, setExplainCopied] = useState(false);
  const explainRef = useRef<HTMLTextAreaElement>(null);

  async function handleExplain() {
    const trimmed = explainTopic.trim();
    if (!trimmed || explainLoading) return;
    setExplainLoading(true); setExplainResult(null); setExplainError(null);
    try {
      const res = await fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: trimmed, persona: explainPersona }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setExplainResult(data.explanation);
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setExplainError(e instanceof Error ? e.message : "Failed. Try again."); }
    finally { setExplainLoading(false); }
  }

  return (
    <>
      <Head>
        <title>Slop Centre — AI and Coffee</title>
        <meta name="description" content="Malaysia's worst AI-powered slop. Paste your job title, LinkedIn bio, or startup idea and get roasted." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://aiandcoffee.com/slop" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI and Coffee" />
        <meta property="og:url" content="https://aiandcoffee.com/slop" />
        <meta property="og:title" content="Slop Centre — AI and Coffee" />
        <meta property="og:description" content="Malaysia's worst AI-powered slop." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Slop Centre — AI and Coffee" />
        <meta name="twitter:description" content="Malaysia's worst AI-powered slop." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        {/* Background floating mascot */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="animate-float opacity-10">
            <Image
              src="/logo/logo_mascot_transparent.png"
              alt=""
              width={800}
              height={800}
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
              priority
            />
          </div>
        </div>

        <Nav active="slop" />

        <style>{`
          @keyframes plate-spin {
            0%   { transform: perspective(400px) rotateY(0deg); }
            100% { transform: perspective(400px) rotateY(360deg); }
          }
        `}</style>

        <div className="relative z-10 px-6 sm:px-16 pt-12 pb-6">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#D94830] leading-none tracking-tighter">
            ONE{" "}
            <span className="text-[#171717] inline-block" style={{ animation: "plate-spin 2s linear infinite" }}>
              SLOP
            </span>{" "}
            CENTRE
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest animate-stagger-in" style={{ animationDelay: "400ms" }}>
            malaysia&apos;s worst ai-powered slop · leave your ego at the door
          </p>
          <p className="mt-4 animate-stagger-in" style={{ animationDelay: "500ms" }}>
            <span className="text-3xl sm:text-4xl font-bold text-zinc-800 tracking-tighter">
              {slopCount !== null ? slopCount.toLocaleString() : "—"}
            </span>
            <span className="ml-2 text-xs text-zinc-400 uppercase tracking-widest">slops served</span>
          </p>
        </div>

        <div className="relative z-10 px-6 sm:px-16 pb-24">
          <div className="max-w-2xl">

            {/* Tab switcher */}
            <div className="flex flex-wrap gap-2 mb-8 animate-stagger-in" style={{ animationDelay: "550ms" }}>
              {TABS.map(({ mode: m, label }) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
                    mode === m
                      ? "border-[#D94830] bg-[#D94830] text-white"
                      : "border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div key={mode} className="animate-stagger-in">

            {/* ── Roast Anything ── */}
            {mode === "roast" && (
              <>
                <ToneSelector tone={tone} setTone={setTone} />
                <div className="border border-zinc-400/60 bg-[#F2EFE8]">
                  <textarea
                    ref={roastRef}
                    value={roastInput}
                    onChange={(e) => setRoastInput(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleRoast(); }}
                    placeholder="paste your job title, LinkedIn bio, startup idea, tech take, or life decision..."
                    rows={5}
                    className="w-full bg-transparent px-5 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-400/40">
                    <span className={`text-[10px] uppercase tracking-widest ${roastInput.length >= 500 ? "text-[#D94830]" : "text-zinc-400"}`}>
                      {roastInput.length}/500
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:block">⌘ + enter to roast</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={handleRoast} disabled={!roastInput.trim() || roastLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white">
                    {roastLoading ? "brewing the slop..." : "roast me →"}
                  </button>
                </div>
                {roastError && <ErrorBox message={roastError} />}
                {roastResult && (
                  <SloppyResult
                    result={roastResult}
                    shareText={buildShareText(roastResult, "\n\n— roasted at aiandcoffee.com/slop?roast")}
                    label="roast incoming"
                    resetLabel="roast again"
                    onCopy={() => copyToClipboard(roastResult, setRoastCopied)}
                    copied={roastCopied}
                    onReset={() => { setRoastResult(null); setRoastInput(""); roastRef.current?.focus(); }}
                  />
                )}
                {!roastResult && !roastError && (
                  <div className="mt-12 pt-8 border-t border-zinc-400/40 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">things to try</p>
                    {[
                      '"Senior Blockchain Evangelist at Web3 Startup"',
                      '"I\'m pivoting my SaaS to AI + IoT + blockchain"',
                      '"We\'re disrupting the disruption space"',
                      "your actual LinkedIn headline",
                    ].map((ex) => (
                      <button key={ex} onClick={() => { setRoastInput(ex.replace(/^"|"$/g, "")); roastRef.current?.focus(); }}
                        className="block text-xs text-zinc-500 hover:text-zinc-800 transition-colors text-left leading-relaxed">
                        → {ex}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Roast by Threads ── */}
            {mode === "threads" && (
              <>
                <ToneSelector tone={tone} setTone={setTone} />
                <div className="border border-zinc-400/60 bg-[#F2EFE8] flex items-center">
                  <span className="pl-5 text-sm text-zinc-400 select-none">@</span>
                  <input
                    ref={threadsRef}
                    type="text"
                    value={threadsUsername}
                    onChange={(e) => setThreadsUsername(e.target.value.replace(/\s/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleThreadsRoast(); }}
                    placeholder="threadsusername"
                    className="flex-1 bg-transparent px-3 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none"
                  />
                </div>
                <div className="mt-4">
                  <button onClick={handleThreadsRoast} disabled={!threadsUsername.trim() || threadsLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white">
                    {threadsLoading ? "fetching their slop..." : "roast me →"}
                  </button>
                </div>
                {threadsError && <ErrorBox message={threadsError} />}
                {threadsResult && (
                  <SloppyResult
                    result={threadsResult}
                    shareText={buildShareText(threadsResult, "\n\n— roasted at aiandcoffee.com/slop?roast-by-threads")}
                    label="roast incoming"
                    resetLabel="roast again"
                    sub={threadsBio}
                    onCopy={() => copyToClipboard(threadsResult, setThreadsCopied)}
                    copied={threadsCopied}
                    onReset={() => { setThreadsResult(null); setThreadsBio(null); setThreadsUsername(""); threadsRef.current?.focus(); }}
                  />
                )}
                {!threadsResult && !threadsError && (
                  <div className="mt-12 pt-8 border-t border-zinc-400/40">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">how it works</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      we fetch their public Threads profile, read their bio,<br />
                      and let the slop LLM do its thing.
                    </p>
                    <p className="mt-3 text-[10px] text-zinc-400">
                      private profiles won&apos;t work · no bio = still gets roasted
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Startup Pitch ── */}
            {mode === "pitch" && (
              <>
                <div className="border border-zinc-400/60 bg-[#F2EFE8]">
                  <textarea
                    ref={pitchRef}
                    value={pitchInput}
                    onChange={(e) => setPitchInput(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handlePitch(); }}
                    placeholder="describe your startup idea in plain english... e.g. 'an app that reminds you to drink water'"
                    rows={5}
                    className="w-full bg-transparent px-5 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-400/40">
                    <span className={`text-[10px] uppercase tracking-widest ${pitchInput.length >= 500 ? "text-[#D94830]" : "text-zinc-400"}`}>
                      {pitchInput.length}/500
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:block">⌘ + enter to pitch</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={handlePitch} disabled={!pitchInput.trim() || pitchLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white">
                    {pitchLoading ? "disrupting the paradigm..." : "bs it →"}
                  </button>
                </div>
                {pitchError && <ErrorBox message={pitchError} />}
                {pitchResult && (
                  <SloppyResult
                    result={pitchResult}
                    shareText={buildShareText(pitchResult, "\n\n— bs'd at aiandcoffee.com/slop?startup-pitch")}
                    label="pitch generated"
                    resetLabel="pitch again"
                    onCopy={() => copyToClipboard(pitchResult, setPitchCopied)}
                    copied={pitchCopied}
                    onReset={() => { setPitchResult(null); setPitchInput(""); pitchRef.current?.focus(); }}
                  />
                )}
                {!pitchResult && !pitchError && (
                  <div className="mt-12 pt-8 border-t border-zinc-400/40 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">things to try</p>
                    {[
                      '"an app that reminds you to drink water"',
                      '"uber but for laundry"',
                      '"a to-do list app with AI"',
                      '"food delivery but with drones"',
                    ].map((ex) => (
                      <button key={ex} onClick={() => { setPitchInput(ex.replace(/^"|"$/g, "")); pitchRef.current?.focus(); }}
                        className="block text-xs text-zinc-500 hover:text-zinc-800 transition-colors text-left leading-relaxed">
                        → {ex}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Standup BS ── */}
            {mode === "standup" && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">what&apos;s your actual situation</p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                        className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
                          selectedMood === mood
                            ? "border-[#D94830] bg-[#D94830] text-white"
                            : "border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border border-zinc-400/60 bg-[#F2EFE8]">
                  <textarea
                    value={standupContext}
                    onChange={(e) => setStandupContext(e.target.value.slice(0, 300))}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleStandup(); }}
                    placeholder="optional: anything specific to spin? e.g. 'i was playing valorant all day'"
                    rows={3}
                    className="w-full bg-transparent px-5 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-400/40">
                    <span className={`text-[10px] uppercase tracking-widest ${standupContext.length >= 300 ? "text-[#D94830]" : "text-zinc-400"}`}>
                      {standupContext.length}/300
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:block">⌘ + enter to generate</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button onClick={handleStandup} disabled={!selectedMood || standupLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white">
                    {standupLoading ? "synergising the deliverables..." : "generate update →"}
                  </button>
                </div>

                {standupError && <ErrorBox message={standupError} />}
                {standupResult && (
                  <SloppyResult
                    result={standupResult}
                    shareText={buildShareText(standupResult, "\n\n— generated at aiandcoffee.com/slop?standup")}
                    label="your update"
                    resetLabel="generate again"
                    onCopy={() => copyToClipboard(standupResult, setStandupCopied)}
                    copied={standupCopied}
                    onReset={() => { setStandupResult(null); setSelectedMood(null); setStandupContext(""); }}
                  />
                )}
              </>
            )}

            {/* ── Explain Like I'm ── */}
            {mode === "explain" && (
              <>
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">explain like i&apos;m a...</p>
                  <div className="flex flex-wrap gap-2">
                    {PERSONAS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setExplainPersona(value)}
                        className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
                          explainPersona === value
                            ? "border-[#D94830] bg-[#D94830] text-white"
                            : "border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-zinc-400/60 bg-[#F2EFE8]">
                  <textarea
                    ref={explainRef}
                    value={explainTopic}
                    onChange={(e) => setExplainTopic(e.target.value.slice(0, 300))}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleExplain(); }}
                    placeholder="what do you want explained? e.g. 'how does AI work', 'what is cloud computing', 'why is my PR not merged'"
                    rows={4}
                    className="w-full bg-transparent px-5 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-400/40">
                    <span className={`text-[10px] uppercase tracking-widest ${explainTopic.length >= 300 ? "text-[#D94830]" : "text-zinc-400"}`}>
                      {explainTopic.length}/300
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:block">⌘ + enter to explain</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button onClick={handleExplain} disabled={!explainTopic.trim() || explainLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white">
                    {explainLoading ? "asking around..." : "explain →"}
                  </button>
                </div>

                {explainError && <ErrorBox message={explainError} />}
                {explainResult && (
                  <SloppyResult
                    result={explainResult}
                    shareText={buildShareText(explainResult, "\n\n— explained at aiandcoffee.com/slop?explain")}
                    label={`explained by ${PERSONAS.find(p => p.value === explainPersona)?.label ?? explainPersona}`}
                    resetLabel="explain again"
                    onCopy={() => copyToClipboard(explainResult, setExplainCopied)}
                    copied={explainCopied}
                    onReset={() => { setExplainResult(null); setExplainTopic(""); explainRef.current?.focus(); }}
                  />
                )}

                {!explainResult && !explainError && (
                  <div className="mt-12 pt-8 border-t border-zinc-400/40 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">things to try</p>
                    {[
                      "how does AI work",
                      "what is cloud computing",
                      "why is crypto so volatile",
                      "explain microservices",
                    ].map((ex) => (
                      <button key={ex} onClick={() => { setExplainTopic(ex); explainRef.current?.focus(); }}
                        className="block text-xs text-zinc-500 hover:text-zinc-800 transition-colors text-left leading-relaxed">
                        → {ex}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            </div>{/* end key={mode} animated wrapper */}
          </div>
        </div>
      </div>
    </>
  );
}
