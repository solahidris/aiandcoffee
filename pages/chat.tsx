import Head from "next/head";
import { Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect, useCallback } from "react";
import Nav from "../components/Nav";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  summary: string;
  createdAt: number;
  updatedAt: number;
};

const S_SESSIONS    = "aiandcoffee:chat:sessions";
const S_ACTIVE      = "aiandcoffee:chat:active";
const S_SIDEBAR     = "aiandcoffee:chat:sidebar";
const S_INFO_CLOSED = "aiandcoffee:chat:info-closed";

const MAX_SESSIONS    = 50;
const MAX_MESSAGES    = 40;
const SUMMARIZE_BATCH = 20;
const CONTEXT_WINDOW  = 20;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

function mkSession(): ChatSession {
  return { id: uid(), title: "New Chat", messages: [], summary: "", createdAt: Date.now(), updatedAt: Date.now() };
}

// ── Icons ──────────────────────────────────────────────────────────────────

function IconMenu() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconX({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [sessions, setSessions]         = useState<ChatSession[]>([]);
  const [activeId, setActiveId]         = useState("");
  const [messages, setMessages]         = useState<Message[]>([]);
  const [summary, setSummary]           = useState("");
  const [streaming, setStreaming]       = useState<string | null>(null);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [input, setInput]               = useState("");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [infoOpen, setInfoOpen]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [copiedId, setCopiedId]         = useState<string | null>(null);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const isSummarizing  = useRef(false);
  const activeIdRef    = useRef(activeId);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  // ── Persistence helpers ──

  function saveSessions(list: ChatSession[]) {
    try { localStorage.setItem(S_SESSIONS, JSON.stringify(list)); } catch { /* */ }
  }

  const syncSession = useCallback((id: string, msgs: Message[], sum: string) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, messages: msgs, summary: sum, updatedAt: Date.now() } : s);
      saveSessions(next);
      return next;
    });
  }, []);

  // ── Mount: load from localStorage ──

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(S_SESSIONS);
      let list: ChatSession[] = raw ? JSON.parse(raw) : [];
      if (list.length === 0) {
        const fresh = mkSession();
        list = [fresh];
        saveSessions(list);
      }
      setSessions(list);

      const savedActive = localStorage.getItem(S_ACTIVE);
      const active = list.find(s => s.id === savedActive) ?? list[0];
      setActiveId(active.id);
      setMessages(active.messages);
      setSummary(active.summary);

      if (localStorage.getItem(S_SIDEBAR) === "closed") setSidebarOpen(false);
      setInfoOpen(localStorage.getItem(S_INFO_CLOSED) !== "true");
    } catch { /* localStorage unavailable */ }
  }, []);

  // Persist active id + sidebar state
  useEffect(() => {
    if (!mounted || !activeId) return;
    try { localStorage.setItem(S_ACTIVE, activeId); } catch { /* */ }
  }, [activeId, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(S_SIDEBAR, sidebarOpen ? "open" : "closed"); } catch { /* */ }
  }, [sidebarOpen, mounted]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // ── Session actions ──

  function newChat() {
    if (messages.length === 0) { inputRef.current?.focus(); return; }
    syncSession(activeId, messages, summary);
    const s = mkSession();
    setSessions(prev => {
      const next = [s, ...prev].slice(0, MAX_SESSIONS);
      saveSessions(next);
      return next;
    });
    setActiveId(s.id);
    setMessages([]);
    setSummary("");
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function switchSession(s: ChatSession) {
    if (s.id === activeId || isStreaming) return;
    syncSession(activeId, messages, summary);
    setActiveId(s.id);
    setMessages(s.messages);
    setSummary(s.summary);
    setInput("");
    if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarOpen(false);
  }

  function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId(prev => prev === id ? null : prev), 2500);
      return;
    }
    setDeletingId(null);
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const fresh = mkSession();
        const withFresh = [fresh];
        saveSessions(withFresh);
        setActiveId(fresh.id);
        setMessages([]);
        setSummary("");
        return withFresh;
      }
      saveSessions(next);
      if (id === activeId) {
        const fallback = next[0];
        setActiveId(fallback.id);
        setMessages(fallback.messages);
        setSummary(fallback.summary);
      }
      return next;
    });
  }

  // ── Info banner ──

  function closeInfo() {
    setInfoOpen(false);
    try { localStorage.setItem(S_INFO_CLOSED, "true"); } catch { /* */ }
  }

  // ── Summarisation ──

  const triggerSummarize = useCallback(async (batch: Message[], currentSummary: string, sessionId: string) => {
    if (isSummarizing.current) return;
    isSummarizing.current = true;
    try {
      const conv = batch.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
      const prompt = currentSummary
        ? `Update the existing summary with the new conversation. Keep under 300 words.\n\nExisting summary:\n${currentSummary}\n\nNew conversation:\n${conv}`
        : `Summarize this conversation in under 300 words. Dense and factual — used as future context.\n\n${conv}`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], stream: false }),
      });
      if (res.ok) {
        const data = await res.json() as { content?: string };
        if (data.content && activeIdRef.current === sessionId) {
          setSummary(data.content);
        }
      }
    } catch { /* silent */ } finally { isSummarizing.current = false; }
  }, []);

  // ── Send message ──

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming || !activeId) return;

    const userMsg: Message = { id: uid(), role: "user", content: text, timestamp: Date.now() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setInput("");
    setIsStreaming(true);
    setStreaming("");

    // Auto-title on first message
    if (messages.length === 0) {
      const title = text.slice(0, 55);
      setSessions(prev => {
        const next = prev.map(s => s.id === activeId ? { ...s, title } : s);
        saveSessions(next);
        return next;
      });
    }

    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const context = withUser.slice(-CONTEXT_WINDOW).map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: context, summary, stream: true }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to connect");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf  = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const chunk = line.slice(6).trim();
          if (chunk === "[DONE]") continue;
          try {
            const json = JSON.parse(chunk);
            const token = json.choices?.[0]?.delta?.content ?? "";
            if (token) { full += token; setStreaming(full); }
          } catch { /* ignore */ }
        }
      }

      const assistantMsg: Message = { id: uid(), role: "assistant", content: full || "(no response)", timestamp: Date.now() };
      const finalMsgs = [...withUser, assistantMsg];
      setMessages(finalMsgs);
      syncSession(activeId, finalMsgs, summary);

      if (finalMsgs.length > MAX_MESSAGES && !isSummarizing.current) {
        const batchToSummarize = finalMsgs.slice(0, SUMMARIZE_BATCH);
        const remaining = finalMsgs.slice(SUMMARIZE_BATCH);
        setMessages(remaining);
        syncSession(activeId, remaining, summary);
        triggerSummarize(batchToSummarize, summary, activeId);
      }
    } catch (e) {
      const errMsg: Message = {
        id: uid(), role: "assistant",
        content: `Sorry, something went wrong — ${e instanceof Error ? e.message : "try again."}`,
        timestamp: Date.now(),
      };
      setMessages(prev => { const next = [...prev, errMsg]; syncSession(activeId, next, summary); return next; });
    } finally {
      setIsStreaming(false);
      setStreaming(null);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  // ── Render ──

  const isEmpty         = messages.length === 0 && !isStreaming;
  const hasSummary      = summary.length > 0;
  const activeSession   = sessions.find(s => s.id === activeId);

  return (
    <>
      <Head>
        <title>Chat — AI and Coffee</title>
        <meta name="description" content="Free AI chat powered by ILMU AI. No account, no tracking. Your conversations stay in your browser." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Chat — AI and Coffee" />
        <meta property="og:description" content="Free AI chat. No account, no tracking. Everything stays local." />
        <meta property="og:url" content="https://aiandcoffee.com/chat" />
        <meta property="og:image" content="https://aiandcoffee.com/og-image.png" />
      </Head>

      <div className={`${geistMono.className} h-screen flex flex-col bg-[#E8E4D9] font-mono overflow-hidden`}>
        <Nav active="chat" />

        <div className="flex-1 flex overflow-hidden">

          {/* ── Sidebar ── */}
          <aside className={`shrink-0 flex flex-col border-r border-zinc-400/40 bg-[#F2EFE8] transition-all duration-200 overflow-hidden ${sidebarOpen ? "w-64" : "w-14"}`}>

            {/* Header row */}
            <div className={`flex items-center gap-2 px-3 py-3 border-b border-zinc-400/30 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
              {sidebarOpen && <span className="text-[10px] uppercase tracking-widest text-zinc-500 select-none">Chats</span>}
              <button
                onClick={() => setSidebarOpen(v => !v)}
                title={sidebarOpen ? "Collapse" : "Expand"}
                className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-[#E8E4D9] transition-colors rounded"
              >
                <IconMenu />
              </button>
            </div>

            {/* New chat */}
            <div className={`px-3 py-3 border-b border-zinc-400/30 ${sidebarOpen ? "" : "flex justify-center"}`}>
              <button
                onClick={newChat}
                title="New Chat"
                className={`flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-600 hover:text-[#D94830] hover:bg-[#E8E4D9] transition-colors py-2 px-2 rounded ${sidebarOpen ? "w-full" : ""}`}
              >
                <IconPlus />
                {sidebarOpen && <span>New Chat</span>}
              </button>
            </div>

            {/* Session list */}
            {sidebarOpen && (
              <div className="flex-1 overflow-y-auto py-1">
                {sessions.length === 0 && (
                  <p className="text-[10px] text-zinc-400 px-4 py-3 uppercase tracking-widest">no chats yet</p>
                )}
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => switchSession(s)}
                    className={`group relative flex flex-col px-4 py-2.5 cursor-pointer transition-colors border-l-2 ${
                      s.id === activeId
                        ? "bg-[#E8E4D9] border-[#D94830]"
                        : "hover:bg-[#E8E4D9] border-transparent"
                    }`}
                  >
                    <span className="text-[11px] text-zinc-700 truncate pr-6 leading-tight">{s.title}</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 uppercase tracking-widest">{timeAgo(s.updatedAt)}</span>
                    <button
                      onClick={e => deleteSession(s.id, e)}
                      title={deletingId === s.id ? "Confirm delete" : "Delete"}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-all rounded opacity-0 group-hover:opacity-100 ${
                        deletingId === s.id ? "text-[#D94830] opacity-100" : "text-zinc-400 hover:text-zinc-700"
                      }`}
                    >
                      <IconX size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Sidebar footer */}
            {sidebarOpen && (
              <div className="border-t border-zinc-400/30 px-4 py-3 shrink-0">
                <p className="text-[9px] text-zinc-400 leading-relaxed">
                  all chats stored locally<br />in your browser only
                </p>
                <button
                  onClick={() => setInfoOpen(v => !v)}
                  className="mt-1.5 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors"
                >
                  {infoOpen ? "hide info ×" : "how this works →"}
                </button>
              </div>
            )}
          </aside>

          {/* ── Main area ── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Info banner */}
            {infoOpen && (
              <div className="shrink-0 border-b border-zinc-400/40 bg-[#F2EFE8] px-6 py-4">
                <div className="max-w-2xl flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#D94830] mb-2">how this works</p>
                    <div className="space-y-1">
                      {[
                        "your chats live only in your browser — localStorage, nothing on our servers",
                        "messages go directly from your browser to ILMU AI for processing",
                        "older messages are auto-compressed into a local summary for context",
                        "free · no account · no sign-in · delete chats anytime",
                      ].map(item => (
                        <p key={item} className="text-[11px] text-zinc-500">· {item}</p>
                      ))}
                    </div>
                  </div>
                  <button onClick={closeInfo} className="shrink-0 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors mt-1">
                    got it ×
                  </button>
                </div>
              </div>
            )}

            {/* Chat title bar (shown once there are messages) */}
            {activeSession && !isEmpty && (
              <div className="shrink-0 border-b border-zinc-400/40 px-6 py-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-zinc-500 truncate">{activeSession.title}</span>
                <button
                  onClick={newChat}
                  className="shrink-0 ml-4 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors"
                >
                  + new chat
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 space-y-5">

                {isEmpty && (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3">
                    <p className="text-4xl sm:text-5xl font-bold text-[#171717] tracking-tighter leading-none">
                      what&apos;s on<br />your mind?
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2">
                      powered by ILMU AI · free · stored locally
                    </p>
                    {!infoOpen && (
                      <button
                        onClick={() => setInfoOpen(true)}
                        className="mt-1 text-[9px] uppercase tracking-widest text-zinc-400 hover:text-[#D94830] transition-colors"
                      >
                        how does this work? →
                      </button>
                    )}
                  </div>
                )}

                {hasSummary && messages.length > 0 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-zinc-400/30" />
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 shrink-0">earlier context summarized</span>
                    <div className="flex-1 h-px bg-zinc-400/30" />
                  </div>
                )}

                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {msg.role === "assistant" && (
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400 px-1">AI and Coffee Chat</span>
                      )}
                      <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === "user"
                          ? "bg-[#171717] text-white"
                          : "bg-[#F2EFE8] border border-zinc-400/60 text-zinc-800"
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-3 px-1">
                        <span className="text-[9px] text-zinc-400">{fmt(msg.timestamp)}</span>
                        {msg.role === "assistant" && (
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(msg.content);
                                setCopiedId(msg.id);
                                setTimeout(() => setCopiedId(id => id === msg.id ? null : id), 2000);
                              } catch { /* clipboard unavailable */ }
                            }}
                            className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors"
                          >
                            {copiedId === msg.id ? "copied ✓" : "copy"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Streaming bubble */}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="flex flex-col gap-1 max-w-[82%] sm:max-w-[75%] items-start">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-400 px-1">AI and Coffee Chat</span>
                      <div className="px-4 py-3 text-sm leading-relaxed bg-[#F2EFE8] border border-zinc-400/60 text-zinc-800 whitespace-pre-wrap break-words">
                        {streaming || (
                          <span className="inline-flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse" />
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-zinc-400/40 bg-[#E8E4D9] px-4 sm:px-8 py-4">
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 border border-zinc-400/60 bg-[#F2EFE8]">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onInput={handleInput}
                      placeholder="type here... (enter to send · shift+enter for new line)"
                      rows={1}
                      disabled={isStreaming}
                      className="w-full bg-transparent px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 resize-none outline-none leading-relaxed disabled:opacity-50"
                      style={{ minHeight: "44px", maxHeight: "160px" }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isStreaming}
                    className="border-2 border-[#D94830] bg-[#D94830] px-5 py-3 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D94830] disabled:hover:text-white shrink-0"
                  >
                    {isStreaming ? "···" : "send →"}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400">
                    {messages.length > 0
                      ? `${messages.length} msg${messages.length !== 1 ? "s" : ""}${hasSummary ? " · compressed" : ""}`
                      : "no messages yet"}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400">
                    {sessions.length} chat{sessions.length !== 1 ? "s" : ""} saved locally
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
