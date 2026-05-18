import Head from "next/head";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import { TONES, type Tone } from "../lib/roast-tones";
import ReactMarkdown, { type Components } from "react-markdown";

const mdComponents: Components = {
  p:          ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
  strong:     ({ children }) => <strong className="font-bold">{children}</strong>,
  em:         ({ children }) => <em className="italic">{children}</em>,
  ul:         ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
  ol:         ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>,
  li:         ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  h1:         ({ children }) => <h1 className="font-bold text-base mt-6 mb-3 first:mt-0">{children}</h1>,
  h2:         ({ children }) => <h2 className="font-bold text-sm mt-5 mb-2 first:mt-0">{children}</h2>,
  h3:         ({ children }) => <h3 className="font-semibold text-sm mt-4 mb-2 first:mt-0">{children}</h3>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-[#D94830]/40 pl-4 text-zinc-600 italic my-4">{children}</blockquote>,
  hr:         () => <hr className="border-zinc-300 my-5" />,
  pre:        ({ children }) => <pre className="my-3">{children}</pre>,
  code:       ({ children, className }) => className
    ? <code className="block bg-zinc-200/70 px-3 py-2.5 text-xs font-mono rounded my-3 overflow-x-auto whitespace-pre">{children}</code>
    : <code className="bg-zinc-200/70 px-1.5 py-0.5 text-xs font-mono rounded">{children}</code>,
  a:          ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#D94830] transition-colors">{children}</a>,
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Mode = "roast" | "threads" | "pitch" | "standup" | "explain" | "thread-chain" | "image-gen";

const TABS: { mode: Mode; label: string; query: string }[] = [
  { mode: "roast",         label: "Roast Anything",   query: "roast"            },
  { mode: "threads",       label: "Roast by Threads",  query: "roast-by-threads" },
  { mode: "pitch",         label: "Startup Pitch",     query: "startup-pitch"    },
  { mode: "standup",       label: "Standup BS",        query: "standup"          },
  { mode: "explain",       label: "Explain Like I'm",  query: "explain"          },
  { mode: "thread-chain",  label: "Viral Thread",      query: "thread-chain"     },
  { mode: "image-gen",     label: "Jpeg Slop",         query: "image-gen"        },
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
      <div className="px-5 py-6 text-sm text-zinc-800 leading-relaxed">
        <ReactMarkdown components={mdComponents}>{result}</ReactMarkdown>
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

function LoadingBars({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8">
      <div className="flex items-end gap-1 h-5">
        {[0, 0.12, 0.24, 0.12, 0].map((delay, i) => (
          <div key={i} className="w-1 bg-[#D94830] rounded-full"
            style={{ height: 20, transformOrigin: "bottom", animation: `minibar 0.6s ease-in-out ${delay}s infinite` }} />
        ))}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</p>
    </div>
  );
}

function Examples({ items, onSelect }: { items: string[]; onSelect: (ex: string) => void }) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">things to try</p>
      {items.map((ex) => (
        <button key={ex} onClick={() => onSelect(ex)}
          className="block text-xs text-zinc-500 hover:text-zinc-800 transition-colors text-left leading-relaxed">
          → {ex}
        </button>
      ))}
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
    setThreadChainPosts(null); setThreadChainError(null);
    setImageUrl(null); setImageError(null);
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

  // ── Thread Chain state ──
  const [threadChainTopic, setThreadChainTopic] = useState("");
  const [threadChainCount, setThreadChainCount] = useState(5);
  const [threadChainPosts, setThreadChainPosts] = useState<string[] | null>(null);
  const [threadChainLoading, setThreadChainLoading] = useState(false);
  const [threadChainError, setThreadChainError] = useState<string | null>(null);
  const [threadChainCopied, setThreadChainCopied] = useState(false);
  const [threadChainPostCopied, setThreadChainPostCopied] = useState<number | null>(null);
  const threadChainRef = useRef<HTMLTextAreaElement>(null);

  async function handleThreadChain() {
    const trimmed = threadChainTopic.trim();
    if (!trimmed || threadChainLoading) return;
    setThreadChainLoading(true); setThreadChainPosts(null); setThreadChainError(null);
    try {
      const res = await fetch("/api/thread-chain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: trimmed, count: threadChainCount }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setThreadChainPosts(data.posts);
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setThreadChainError(e instanceof Error ? e.message : "Failed. Try again."); }
    finally { setThreadChainLoading(false); }
  }

  // ── Image Gen state ──
  const [imagePrompt, setImagePrompt]   = useState("");
  const [imageUrl, setImageUrl]         = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError]     = useState<string | null>(null);
  const imageRef = useRef<HTMLTextAreaElement>(null);

  async function handleImageGen() {
    const trimmed = imagePrompt.trim();
    if (!trimmed || imageLoading) return;
    setImageLoading(true); setImageUrl(null); setImageError(null);
    try {
      const res = await fetch("/api/image-gen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: trimmed }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as {error?: string}).error || "Generation failed"); }
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
      setSlopCount(c => c !== null ? c + 1 : 1);
    } catch (e) { setImageError(e instanceof Error ? e.message : "Failed. Try again."); }
    finally { setImageLoading(false); }
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

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono pb-24`}>
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
          @keyframes minibar {
            0%, 100% { transform: scaleY(0.2); }
            50%       { transform: scaleY(1);   }
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
            {slopCount !== null && (
              <span className="ml-3 text-zinc-400">· {slopCount.toLocaleString()} slops served</span>
            )}
          </p>
        </div>


        <div className="relative z-10 px-6 sm:px-16 pb-6">

          {/* Tabs — full width */}
          <div className="flex flex-wrap gap-2 mb-8 animate-stagger-in" style={{ animationDelay: "550ms" }}>
              {TABS.map(({ mode: m, label }) => (
                <button key={m} onClick={() => switchMode(m)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
                    mode === m ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
                  }`}>
                  {label}
                </button>
              ))}
          </div>

          <div className="max-w-2xl">
            {/* Output area — pb-44 to clear fixed input bar */}
            <div key={mode} className="animate-stagger-in pb-44">

              {/* ── Roast Anything ── */}
              {mode === "roast" && (
                <>
                  {roastError && <ErrorBox message={roastError} />}
                  {roastLoading && <LoadingBars label="brewing the slop..." />}
                  {roastResult && (
                    <SloppyResult result={roastResult}
                      shareText={buildShareText(roastResult, "\n\n— roasted at aiandcoffee.com/slop?roast")}
                      label="roast incoming" resetLabel="roast again"
                      onCopy={() => copyToClipboard(roastResult, setRoastCopied)} copied={roastCopied}
                      onReset={() => { setRoastResult(null); setRoastInput(""); roastRef.current?.focus(); }} />
                  )}
                  {!roastResult && !roastError && !roastLoading && (
                    <Examples items={['"Senior Blockchain Evangelist at Web3 Startup"', '"I\'m pivoting my SaaS to AI + IoT + blockchain"', '"We\'re disrupting the disruption space"', "your actual LinkedIn headline"]}
                      onSelect={(ex) => { setRoastInput(ex.replace(/^"|"$/g, "")); roastRef.current?.focus(); }} />
                  )}
                </>
              )}

              {/* ── Roast by Threads ── */}
              {mode === "threads" && (
                <>
                  {threadsError && <ErrorBox message={threadsError} />}
                  {threadsLoading && <LoadingBars label="fetching their slop..." />}
                  {threadsResult && (
                    <SloppyResult result={threadsResult}
                      shareText={buildShareText(threadsResult, "\n\n— roasted at aiandcoffee.com/slop?roast-by-threads")}
                      label="roast incoming" resetLabel="roast again" sub={threadsBio}
                      onCopy={() => copyToClipboard(threadsResult, setThreadsCopied)} copied={threadsCopied}
                      onReset={() => { setThreadsResult(null); setThreadsBio(null); setThreadsUsername(""); threadsRef.current?.focus(); }} />
                  )}
                  {!threadsResult && !threadsError && !threadsLoading && (
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">how it works</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">we fetch their public Threads profile, read their bio,<br />and let the slop LLM do its thing.</p>
                      <p className="mt-3 text-[10px] text-zinc-400">private profiles won&apos;t work · no bio = still gets roasted</p>
                    </div>
                  )}
                </>
              )}

              {/* ── Startup Pitch ── */}
              {mode === "pitch" && (
                <>
                  {pitchError && <ErrorBox message={pitchError} />}
                  {pitchLoading && <LoadingBars label="disrupting the paradigm..." />}
                  {pitchResult && (
                    <SloppyResult result={pitchResult}
                      shareText={buildShareText(pitchResult, "\n\n— bs'd at aiandcoffee.com/slop?startup-pitch")}
                      label="pitch generated" resetLabel="pitch again"
                      onCopy={() => copyToClipboard(pitchResult, setPitchCopied)} copied={pitchCopied}
                      onReset={() => { setPitchResult(null); setPitchInput(""); pitchRef.current?.focus(); }} />
                  )}
                  {!pitchResult && !pitchError && !pitchLoading && (
                    <Examples items={['"an app that reminds you to drink water"', '"uber but for laundry"', '"a to-do list app with AI"', '"food delivery but with drones"']}
                      onSelect={(ex) => { setPitchInput(ex.replace(/^"|"$/g, "")); pitchRef.current?.focus(); }} />
                  )}
                </>
              )}

              {/* ── Standup BS ── */}
              {mode === "standup" && (
                <>
                  {standupError && <ErrorBox message={standupError} />}
                  {standupLoading && <LoadingBars label="synergising the deliverables..." />}
                  {standupResult && (
                    <SloppyResult result={standupResult}
                      shareText={buildShareText(standupResult, "\n\n— generated at aiandcoffee.com/slop?standup")}
                      label="your update" resetLabel="generate again"
                      onCopy={() => copyToClipboard(standupResult, setStandupCopied)} copied={standupCopied}
                      onReset={() => { setStandupResult(null); setSelectedMood(null); setStandupContext(""); }} />
                  )}
                  {!standupResult && !standupError && !standupLoading && (
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-4">pick your mood below, then hit generate</p>
                  )}
                </>
              )}

              {/* ── Explain Like I'm ── */}
              {mode === "explain" && (
                <>
                  {explainError && <ErrorBox message={explainError} />}
                  {explainLoading && <LoadingBars label="asking around..." />}
                  {explainResult && (
                    <SloppyResult result={explainResult}
                      shareText={buildShareText(explainResult, "\n\n— explained at aiandcoffee.com/slop?explain")}
                      label={`explained by ${PERSONAS.find(p => p.value === explainPersona)?.label ?? explainPersona}`}
                      resetLabel="explain again"
                      onCopy={() => copyToClipboard(explainResult, setExplainCopied)} copied={explainCopied}
                      onReset={() => { setExplainResult(null); setExplainTopic(""); explainRef.current?.focus(); }} />
                  )}
                  {!explainResult && !explainError && !explainLoading && (
                    <Examples items={["how does AI work", "what is cloud computing", "why is crypto so volatile", "explain microservices"]}
                      onSelect={(ex) => { setExplainTopic(ex); explainRef.current?.focus(); }} />
                  )}
                </>
              )}

              {/* ── Viral Thread ── */}
              {mode === "thread-chain" && (
                <>
                  {threadChainError && <ErrorBox message={threadChainError} />}
                  {threadChainLoading && <LoadingBars label="cooking the thread..." />}
                  {threadChainPosts && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] uppercase tracking-widest text-[#D94830]">thread ready — {threadChainPosts.length} posts</p>
                        <button onClick={() => copyToClipboard(threadChainPosts.join('\n\n'), setThreadChainCopied)}
                          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors">
                          {threadChainCopied ? "copied ✓" : "copy all"}
                        </button>
                      </div>
                      <div>
                        {threadChainPosts.map((post, i) => (
                          <div key={i} className="relative">
                            <div className="border-2 border-[#D94830] bg-[#F2EFE8]">
                              <div className="px-5 py-3 border-b border-[#D94830]/30 flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-[#D94830]">{i + 1}/{threadChainPosts.length}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] text-zinc-400">{post.length} chars</span>
                                  <button onClick={async () => { try { await navigator.clipboard.writeText(post); setThreadChainPostCopied(i); setTimeout(() => setThreadChainPostCopied(null), 2000); } catch { /* clipboard not available */ } }}
                                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors">
                                    {threadChainPostCopied === i ? "copied ✓" : "copy"}
                                  </button>
                                  <a href={`https://www.threads.net/intent/post?text=${encodeURIComponent(post.slice(0, 500))}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors">post ↗</a>
                                </div>
                              </div>
                              <div className="px-5 py-5">
                                <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{post}</p>
                              </div>
                            </div>
                            {i < threadChainPosts.length - 1 && (
                              <div className="flex justify-start pl-6"><div className="w-[2px] h-4 bg-[#D94830]/40" /></div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-5 border-t border-[#D94830]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <a href={`https://www.threads.net/intent/post?text=${encodeURIComponent((threadChainPosts[0] || '').slice(0, 500))}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-block border-2 border-zinc-800 px-8 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors">
                          post first to threads ↗
                        </a>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-zinc-400">powered by (AI and Coffee) slop LLM</span>
                          <button onClick={() => { setThreadChainPosts(null); setThreadChainTopic(""); threadChainRef.current?.focus(); }}
                            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#D94830] transition-colors">generate again</button>
                        </div>
                      </div>
                    </>
                  )}
                  {!threadChainPosts && !threadChainError && !threadChainLoading && (
                    <Examples items={["why i quit my corporate job to become a developer", "things no one tells you about working at a startup", "how i accidentally went viral with a terrible post", "the real cost of free software"]}
                      onSelect={(ex) => { setThreadChainTopic(ex); threadChainRef.current?.focus(); }} />
                  )}
                </>
              )}

              {/* ── Image Gen ── */}
              {mode === "image-gen" && (
                <>
                  {imageError && <ErrorBox message={imageError} />}
                  {imageLoading && <LoadingBars label="cooking your image..." />}
                  {imageUrl && (
                    <div className="animate-stagger-in">
                      <div className="border border-zinc-400/40 bg-[#F2EFE8] p-2 inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt={imagePrompt} className="block max-h-[60vh] w-auto" />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <a href={imageUrl} download="ai-and-coffee.png"
                          className="border-2 border-zinc-800 px-6 py-3 text-xs uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors">
                          download ↓
                        </a>
                        <button onClick={() => { setImageUrl(null); setImagePrompt(""); imageRef.current?.focus(); }}
                          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#D94830] transition-colors">generate again</button>
                      </div>
                      <p className="mt-3 text-[10px] text-zinc-400 uppercase tracking-widest">powered by ai-1-coffee · ai and coffee image slop ai</p>
                    </div>
                  )}
                  {!imageUrl && !imageError && !imageLoading && (
                    <Examples items={["a robot barista making espresso in a neon-lit café, cyberpunk illustration", "two friends coding together at a coffee shop, warm lighting, cozy vibe", "an AI brain made of coffee beans, digital art", "a cup of coffee with circuit board patterns, minimal flat design"]}
                      onSelect={(ex) => { setImagePrompt(ex); imageRef.current?.focus(); }} />
                  )}
                </>
              )}

            </div>{/* end key={mode} */}
          </div>{/* end max-w-2xl */}
        </div>{/* end content wrapper */}

        {/* ── Fixed bottom input bar — all modes ── */}
        <div className="fixed bottom-12 left-0 right-0 z-40 pb-6 px-6 sm:px-16 flex justify-center pointer-events-none">
          <div className="w-full max-w-2xl border border-zinc-400/40 bg-[#E8E4D9]/95 backdrop-blur-sm shadow-lg p-4 pointer-events-auto">

            {/* Tone selector — roast + threads */}
            {(mode === "roast" || mode === "threads") && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {TONES.map(({ value, label }) => (
                  <button key={value} onClick={() => setTone(value)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                      tone === value ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-400 text-zinc-500 hover:border-zinc-600"
                    }`}>{label}</button>
                ))}
              </div>
            )}

            {/* Mood selector — standup */}
            {mode === "standup" && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {MOODS.map((mood) => (
                  <button key={mood} onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                      selectedMood === mood ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-400 text-zinc-500 hover:border-zinc-600"
                    }`}>{mood}</button>
                ))}
              </div>
            )}

            {/* Persona selector — explain */}
            {mode === "explain" && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PERSONAS.map(({ value, label }) => (
                  <button key={value} onClick={() => setExplainPersona(value)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                      explainPersona === value ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-400 text-zinc-500 hover:border-zinc-600"
                    }`}>{label}</button>
                ))}
              </div>
            )}

            {/* Post count selector — thread chain */}
            {mode === "thread-chain" && (
              <div className="flex items-center gap-1.5 mb-3">
                {[3, 5, 7, 10].map((n) => (
                  <button key={n} onClick={() => setThreadChainCount(n)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                      threadChainCount === n ? "border-[#D94830] bg-[#D94830] text-white" : "border-zinc-400 text-zinc-500 hover:border-zinc-600"
                    }`}>{n}</button>
                ))}
                <span className="text-[10px] text-zinc-400 ml-1">posts</span>
              </div>
            )}

            {/* Input box with button inside — matches chat page pattern */}
            <div className="border border-zinc-400/60 bg-[#F2EFE8]">

              {/* Roast by Threads — @ username */}
              {mode === "threads" && (
                <div className="flex items-center">
                  <span className="pl-4 text-sm text-zinc-400 select-none">@</span>
                  <input ref={threadsRef} type="text" value={threadsUsername}
                    onChange={(e) => setThreadsUsername(e.target.value.replace(/\s/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleThreadsRoast(); }}
                    placeholder="threadsusername"
                    className="flex-1 bg-transparent px-2 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none" />
                </div>
              )}

              {/* Standup — optional context */}
              {mode === "standup" && (
                <textarea value={standupContext}
                  onChange={(e) => setStandupContext(e.target.value.slice(0, 300))}
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleStandup(); }}
                  placeholder="optional: anything specific to spin?"
                  rows={2} className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed" />
              )}

              {/* All other modes */}
              {mode !== "threads" && mode !== "standup" && (
                <textarea
                  ref={mode === "roast" ? roastRef : mode === "pitch" ? pitchRef : mode === "explain" ? explainRef : mode === "thread-chain" ? threadChainRef : imageRef}
                  value={mode === "roast" ? roastInput : mode === "pitch" ? pitchInput : mode === "explain" ? explainTopic : mode === "thread-chain" ? threadChainTopic : imagePrompt}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (mode === "roast") setRoastInput(v.slice(0, 500));
                    else if (mode === "pitch") setPitchInput(v.slice(0, 500));
                    else if (mode === "explain") setExplainTopic(v.slice(0, 300));
                    else if (mode === "thread-chain") setThreadChainTopic(v.slice(0, 300));
                    else if (mode === "image-gen") setImagePrompt(v.slice(0, 500));
                  }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      if (mode === "roast") handleRoast();
                      else if (mode === "pitch") handlePitch();
                      else if (mode === "explain") handleExplain();
                      else if (mode === "thread-chain") handleThreadChain();
                      else if (mode === "image-gen") handleImageGen();
                    }
                  }}
                  placeholder={
                    mode === "roast" ? "paste your job title, bio, startup idea..." :
                    mode === "pitch" ? "describe your startup idea in plain english..." :
                    mode === "explain" ? "what do you want explained?" :
                    mode === "thread-chain" ? "what's the thread about?" :
                    "describe your image..."
                  }
                  rows={2}
                  className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                />
              )}

              {/* Bottom row — hint + button inside the box */}
              <div className="flex items-center justify-between px-3 pb-3">
                <span className="text-[9px] uppercase tracking-widest text-zinc-400">⌘ + enter to generate</span>
                <button
                  disabled={
                    mode === "roast" ? (!roastInput.trim() || roastLoading) :
                    mode === "threads" ? (!threadsUsername.trim() || threadsLoading) :
                    mode === "pitch" ? (!pitchInput.trim() || pitchLoading) :
                    mode === "standup" ? (!selectedMood || standupLoading) :
                    mode === "explain" ? (!explainTopic.trim() || explainLoading) :
                    mode === "thread-chain" ? (!threadChainTopic.trim() || threadChainLoading) :
                    (!imagePrompt.trim() || imageLoading)
                  }
                  onClick={() => {
                    if (mode === "roast") handleRoast();
                    else if (mode === "threads") handleThreadsRoast();
                    else if (mode === "pitch") handlePitch();
                    else if (mode === "standup") handleStandup();
                    else if (mode === "explain") handleExplain();
                    else if (mode === "thread-chain") handleThreadChain();
                    else if (mode === "image-gen") handleImageGen();
                  }}
                  className="w-9 h-9 shrink-0 bg-[#D94830] flex items-center justify-center text-white hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed rounded-sm"
                  aria-label="Generate"
                >
                  {(mode === "roast" && roastLoading) || (mode === "threads" && threadsLoading) || (mode === "pitch" && pitchLoading) || (mode === "standup" && standupLoading) || (mode === "explain" && explainLoading) || (mode === "thread-chain" && threadChainLoading) || (mode === "image-gen" && imageLoading) ? (
                    <span className="flex gap-0.5 items-center">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 13V3M3 8l5-5 5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}
