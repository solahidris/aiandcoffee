import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Mode = "text" | "threads";

const SHARE_ATTRIBUTION: Record<Mode, string> = {
  text:    "\n\n— roasted at aiandcoffee.com/slop?roast",
  threads: "\n\n— roasted at aiandcoffee.com/slop?roast-by-threads",
};

function RoastResult({
  roast,
  shareText,
  bio,
  onCopy,
  copied,
  onReset,
}: {
  roast: string;
  shareText: string;
  bio?: string | null;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
}) {
  return (
    <div className="mt-8 border-2 border-[#D94830] bg-[#F2EFE8] animate-stagger-in">
      <div className="px-5 py-3 border-b border-[#D94830]/30 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#D94830]">roast incoming</span>
        <button
          onClick={onCopy}
          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      {bio && (
        <div className="px-5 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">their bio</p>
          <p className="text-xs text-zinc-500 italic leading-relaxed">&ldquo;{bio}&rdquo;</p>
        </div>
      )}
      <div className="px-5 py-6">
        <p className="text-base text-zinc-800 leading-relaxed">{roast}</p>
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
            roast again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SlopCentre() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("text");

  // read query param on mount to set active tab
  useEffect(() => {
    if ("roast-by-threads" in router.query) setMode("threads");
    else if ("roast" in router.query) setMode("text");
  }, [router.isReady, router.query]);

  // text mode state
  const [input, setInput] = useState("");
  const [textRoast, setTextRoast] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [textCopied, setTextCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // threads mode state
  const [username, setUsername] = useState("");
  const [threadRoast, setThreadRoast] = useState<string | null>(null);
  const [threadBio, setThreadBio] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [threadCopied, setThreadCopied] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  async function handleTextRoast() {
    const trimmed = input.trim();
    if (!trimmed || textLoading) return;
    setTextLoading(true);
    setTextRoast(null);
    setTextError(null);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setTextRoast(data.roast);
    } catch (e) {
      setTextError(e instanceof Error ? e.message : "Failed to roast. Try again.");
    } finally {
      setTextLoading(false);
    }
  }

  async function handleThreadsRoast() {
    const trimmed = username.trim().replace(/^@+/, "");
    if (!trimmed || threadLoading) return;
    setThreadLoading(true);
    setThreadRoast(null);
    setThreadBio(null);
    setThreadError(null);
    try {
      const res = await fetch("/api/roast-threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setThreadRoast(data.roast);
      setThreadBio(data.bio || null);
    } catch (e) {
      setThreadError(e instanceof Error ? e.message : "Failed to fetch profile. Try again.");
    } finally {
      setThreadLoading(false);
    }
  }

  async function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setTextRoast(null);
    setTextError(null);
    setThreadRoast(null);
    setThreadBio(null);
    setThreadError(null);
    router.replace(m === "threads" ? "/slop?roast-by-threads" : "/slop?roast", undefined, { shallow: true });
  }

  const charCount = input.length;

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
        <meta property="og:description" content="Malaysia's finest AI-powered roastery." />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Slop Centre — AI and Coffee" />
        <meta name="twitter:description" content="Malaysia's finest AI-powered roastery." />
        <meta name="twitter:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        <Nav active="slop" />

        {/* Header */}
        <div className="px-6 sm:px-16 pt-12 pb-6">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#D94830] leading-none tracking-tighter">
            ONE SLOP CENTRE
          </h1>
          <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
            malaysia&apos;s worst ai-powered slop · leave your ego at the door
          </p>
        </div>

        <div className="px-6 sm:px-16 pb-24">
          <div className="max-w-2xl">

            {/* Tab switcher */}
            <div className="flex gap-2 mb-8">
              {(["text", "threads"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors duration-150 ${
                    mode === m
                      ? "border-[#D94830] bg-[#D94830] text-white"
                      : "border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-800"
                  }`}
                >
                  {m === "text" ? "Roast Anything" : "Roast by Threads"}
                </button>
              ))}
            </div>

            {/* ── Text mode ── */}
            {mode === "text" && (
              <>
                <div className="border border-zinc-400/60 bg-[#F2EFE8]">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleTextRoast(); }}
                    placeholder="paste your job title, LinkedIn bio, startup idea, tech take, or life decision..."
                    rows={5}
                    className="w-full bg-transparent px-5 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-400/40">
                    <span className={`text-[10px] uppercase tracking-widest ${charCount >= 500 ? "text-[#D94830]" : "text-zinc-400"}`}>
                      {charCount}/500
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:block">⌘ + enter to roast</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleTextRoast}
                    disabled={!input.trim() || textLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white"
                  >
                    {textLoading ? "brewing the slop..." : "roast me →"}
                  </button>
                </div>

                {textError && (
                  <div className="mt-8 border border-zinc-400/60 px-5 py-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">error</p>
                    <p className="text-sm text-zinc-700">{textError}</p>
                  </div>
                )}

                {textRoast && (
                  <RoastResult
                    roast={textRoast}
                    shareText={textRoast + SHARE_ATTRIBUTION.text}
                    onCopy={() => copyToClipboard(textRoast, setTextCopied)}
                    copied={textCopied}
                    onReset={() => { setTextRoast(null); setInput(""); textareaRef.current?.focus(); }}
                  />
                )}

                {!textRoast && !textError && (
                  <div className="mt-12 pt-8 border-t border-zinc-400/40 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">things to try</p>
                    {[
                      '"Senior Blockchain Evangelist at Web3 Startup"',
                      '"I\'m pivoting my SaaS to AI + IoT + blockchain"',
                      '"We\'re disrupting the disruption space"',
                      "your actual LinkedIn headline",
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => { setInput(example.replace(/^"|"$/g, "")); textareaRef.current?.focus(); }}
                        className="block text-xs text-zinc-500 hover:text-zinc-800 transition-colors text-left leading-relaxed"
                      >
                        → {example}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Threads mode ── */}
            {mode === "threads" && (
              <>
                <div className="border border-zinc-400/60 bg-[#F2EFE8] flex items-center">
                  <span className="pl-5 text-sm text-zinc-400 select-none">@</span>
                  <input
                    ref={usernameRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleThreadsRoast(); }}
                    placeholder="threadsusername"
                    className="flex-1 bg-transparent px-3 py-4 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none"
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleThreadsRoast}
                    disabled={!username.trim() || threadLoading}
                    className="border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white"
                  >
                    {threadLoading ? "fetching their slop..." : "roast me →"}
                  </button>
                </div>

                {threadError && (
                  <div className="mt-8 border border-zinc-400/60 px-5 py-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">error</p>
                    <p className="text-sm text-zinc-700">{threadError}</p>
                  </div>
                )}

                {threadRoast && (
                  <RoastResult
                    roast={threadRoast}
                    shareText={threadRoast + SHARE_ATTRIBUTION.threads}
                    bio={threadBio}
                    onCopy={() => copyToClipboard(threadRoast, setThreadCopied)}
                    copied={threadCopied}
                    onReset={() => { setThreadRoast(null); setThreadBio(null); setUsername(""); usernameRef.current?.focus(); }}
                  />
                )}

                {!threadRoast && !threadError && (
                  <div className="mt-12 pt-8 border-t border-zinc-400/40">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-4">how it works</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      we fetch their public Threads profile, read their bio,<br />
                      and let the slop ai llm do its thing.
                    </p>
                    <p className="mt-3 text-[10px] text-zinc-400">
                      private profiles won&apos;t work · no bio = still gets roasted
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
