import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetStaticProps } from "next";
import { Geist_Mono } from "next/font/google";
import path from "path";
import fs from "fs";
import { useState, useMemo } from "react";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── Data types ───────────────────────────────────────────────────────────────

interface RawEvent {
  id: string;
  text: string;
  timestamp: string | null;
  url: string;
  source: string;
  scrapedAt: string;
}

interface ParsedEvent {
  id: string;
  type: string;
  name: string;
  date: string | null;       // raw display string
  startDate: string | null;  // YYYY-MM-DD
  endDate: string | null;    // YYYY-MM-DD
  venue: string | null;
  fee: string | null;
  link: string | null;
  expired: boolean;
  isOwn: boolean;
  scrapedAt: string;
}

interface Props {
  events: ParsedEvent[];
  // "YYYY-MM-DD" → { upcoming: boolean; expired: boolean; isOwn: boolean }
  dotMap: Record<string, { upcoming: boolean; expired: boolean; isOwn: boolean }>;
  todayStr: string; // YYYY-MM-DD, baked at build time
  lastUpdated: string | null;
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

function normalizeBold(str: string): string {
  return str.replace(/[\u{1D400}-\u{1D7FF}]/gu, (ch) => {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x1D400 && cp <= 0x1D419) return String.fromCharCode(cp - 0x1D400 + 65);
    if (cp >= 0x1D41A && cp <= 0x1D433) return String.fromCharCode(cp - 0x1D41A + 97);
    return ch;
  });
}

function stripEmoji(str: string): string {
  return str.replace(/^[\p{Emoji}\s]+/u, "").replace(/[\p{Emoji}\s]+$/u, "").trim();
}

function extractField(lines: string[], emoji: string): string | null {
  const line = lines.find((l) => l.includes(emoji));
  if (!line) return null;
  return line.replace(new RegExp(`.*${emoji}\\s*(\\w+:)?\\s*`, "i"), "").trim() || null;
}

function extractLink(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s\n]+/);
  return match ? match[0] : null;
}

// Returns YYYY-MM-DD using local time (not UTC) to avoid timezone date shift
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse "11 – 31 May 2026" or "18 July 2026, Sat" → { start, end } as YYYY-MM-DD
function parseDateRange(dateStr: string | null): { start: string | null; end: string | null } {
  if (!dateStr) return { start: null, end: null };

  const isRange = dateStr.includes("–") || / - /.test(dateStr);

  if (isRange) {
    const parts = dateStr.split(/\s*[–-]\s*/);
    const endRaw = parts[parts.length - 1].trim().replace(/,\s*[A-Za-z]{3}$/, "").trim();
    const endDate = new Date(endRaw);
    if (isNaN(endDate.getTime())) return { start: null, end: null };

    // Start may be just a day number — borrow month+year from end
    const startRaw = parts[0].trim().replace(/,\s*[A-Za-z]{3}$/, "").trim();
    let startDate: Date;
    if (/^\d{1,2}$/.test(startRaw)) {
      // e.g. "11" → "11 May 2026"
      const monthYear = endRaw.match(/[A-Za-z]+ \d{4}/)?.[0] ?? "";
      startDate = new Date(`${startRaw} ${monthYear}`);
    } else {
      startDate = new Date(startRaw);
    }
    if (isNaN(startDate.getTime())) return { start: null, end: toYMD(endDate) };
    return { start: toYMD(startDate), end: toYMD(endDate) };
  }

  const s = dateStr.replace(/,\s*[A-Za-z]{3}$/, "").trim();
  const d = new Date(s);
  if (isNaN(d.getTime())) return { start: null, end: null };
  const ymd = toYMD(d);
  return { start: ymd, end: ymd };
}

// Enumerate every YYYY-MM-DD between start and end (inclusive)
function daysInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function parseEvent(event: RawEvent, todayYMD: string): ParsedEvent {
  const lines = event.text.split("\n").map((l) => l.trim()).filter(Boolean);
  const type = stripEmoji(normalizeBold(lines[0] || "")).toUpperCase();
  const name = stripEmoji(lines[1] || "") || lines[1] || "";
  const date = extractField(lines, "📅");
  const venue = extractField(lines, "📍");
  const fee = extractField(lines, "💰");
  const link = extractLink(event.text);

  const { start, end } = parseDateRange(date);
  const expired = end ? end < todayYMD : false;
  const isOwn = event.source === "ai and coffee";

  return { id: event.id, type, name, date, startDate: start, endDate: end, venue, fee, link, expired, isOwn, scrapedAt: event.scrapedAt };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const communityPath = path.join(process.cwd(), "data", "events.json");
  const ownPath = path.join(process.cwd(), "data", "aiandcoffee-events.json");
  let events: ParsedEvent[] = [];
  const dotMap: Record<string, { upcoming: boolean; expired: boolean; isOwn: boolean }> = {};
  let lastUpdated: string | null = null;

  try {
    const todayYMD = toYMD(new Date());

    const communityRaw: RawEvent[] = JSON.parse(fs.readFileSync(communityPath, "utf-8"));
    const ownRaw: RawEvent[] = JSON.parse(fs.readFileSync(ownPath, "utf-8"));

    // Own events first so they appear at the top
    events = [
      ...ownRaw.map((e) => parseEvent(e, todayYMD)),
      ...communityRaw.map((e) => parseEvent(e, todayYMD)),
    ];

    for (const ev of events) {
      if (!ev.startDate || !ev.endDate) continue;
      for (const day of daysInRange(ev.startDate, ev.endDate)) {
        const prev = dotMap[day] ?? { upcoming: false, expired: false, isOwn: false };
        dotMap[day] = {
          upcoming: prev.upcoming || !ev.expired,
          expired: prev.expired || ev.expired,
          isOwn: prev.isOwn || ev.isOwn,
        };
      }
    }

    if (communityRaw.length > 0) lastUpdated = communityRaw[0].scrapedAt;
  } catch {
    events = [];
  }

  return { props: { events, dotMap, todayStr: toYMD(new Date()), lastUpdated } };
};

// ─── Calendar component ───────────────────────────────────────────────────────

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function Calendar({
  dotMap, todayStr, selected, onSelect,
}: {
  dotMap: Record<string, { upcoming: boolean; expired: boolean; isOwn: boolean }>;
  todayStr: string;
  selected: string | null;
  onSelect: (date: string | null) => void;
}) {
  const today = new Date(todayStr + "T00:00:00");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Monday-first offset (0=Mon … 6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors px-1"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="text-xs uppercase tracking-widest text-zinc-600">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors px-1"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-widest text-zinc-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dot = dotMap[ymd];
          const isToday = ymd === todayStr;
          const isSelected = ymd === selected;
          const isPast = ymd < todayStr;

          return (
            <button
              key={ymd}
              onClick={() => onSelect(isSelected ? null : ymd)}
              className={`relative flex flex-col items-center justify-center h-9 text-xs transition-colors rounded-sm
                ${isSelected ? "bg-[#D94830] text-white" : ""}
                ${!isSelected && isToday ? "text-[#D94830] font-bold" : ""}
                ${!isSelected && !isToday && isPast ? "text-zinc-400" : ""}
                ${!isSelected && !isToday && !isPast ? "text-zinc-700" : ""}
                ${!isSelected && dot ? "hover:bg-zinc-200" : ""}
                ${!isSelected && !dot ? "text-zinc-300 cursor-default" : ""}
              `}
              disabled={!dot}
            >
              {day}
              {dot && !isSelected && (
                <span className="absolute bottom-1 flex gap-[3px] items-center">
                  {dot.isOwn && (
                    <span className="w-1 h-1 rounded-full bg-[#F97316]" />
                  )}
                  {(dot.upcoming || dot.expired) && (
                    <span className={`w-1 h-1 rounded-full ${dot.upcoming ? "bg-[#D94830]" : "bg-zinc-400"}`} />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={() => onSelect(null)}
          className="mt-4 w-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors py-1"
        >
          clear filter ×
        </button>
      )}
    </div>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ event, muted = false }: { event: ParsedEvent; muted?: boolean }) {
  const isOwn = event.isOwn;

  if (isOwn && !muted) {
    return (
      <div className="bg-[#F97316] flex flex-col transition-opacity duration-200">
        <div className="p-5 flex flex-col flex-1">
          <p className="text-[10px] uppercase tracking-widest text-orange-200 mb-3">
            ☕ AI and Coffee
          </p>
          <h2 className="text-sm font-bold leading-snug mb-4 flex-1 text-white">
            {event.name}
          </h2>
          <div className="space-y-1.5 text-xs text-orange-100">
            {event.date && <p className="flex gap-2"><span className="w-3 shrink-0">📅</span><span>{event.date}</span></p>}
            {event.venue && <p className="flex gap-2"><span className="w-3 shrink-0">📍</span><span>{event.venue}</span></p>}
            {event.fee && <p className="flex gap-2"><span className="w-3 shrink-0">💰</span><span>{event.fee}</span></p>}
          </div>
        </div>
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-t border-orange-400 px-5 py-3 text-[11px] uppercase tracking-widest text-white hover:bg-orange-600 transition-colors duration-200"
          >
            Register →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`border flex flex-col transition-colors duration-200 ${
      muted
        ? "border-zinc-300/60 bg-[#EDEAD3] opacity-60"
        : "border-zinc-300 bg-[#F2EFE8] hover:border-[#D94830]"
    }`}>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">{event.type}</p>
          {muted && (
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-300 px-1.5 py-0.5 shrink-0">
              past
            </span>
          )}
        </div>
        <h2 className={`text-sm font-bold leading-snug mb-4 flex-1 ${muted ? "text-zinc-500" : "text-zinc-900"}`}>
          {event.name}
        </h2>
        <div className="space-y-1.5 text-xs text-zinc-500">
          {event.date && <p className="flex gap-2"><span className="w-3 shrink-0">📅</span><span>{event.date}</span></p>}
          {event.venue && <p className="flex gap-2"><span className="w-3 shrink-0">📍</span><span>{event.venue}</span></p>}
          {event.fee && <p className="flex gap-2"><span className="w-3 shrink-0">💰</span><span>{event.fee}</span></p>}
        </div>
      </div>
      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`block border-t px-5 py-3 text-[11px] uppercase tracking-widest transition-colors duration-200 ${
            muted
              ? "border-zinc-300/60 text-zinc-400 cursor-not-allowed pointer-events-none"
              : "border-zinc-300 text-zinc-500 hover:bg-[#D94830] hover:text-white hover:border-[#D94830]"
          }`}
        >
          {muted ? "Event ended" : "Register →"}
        </a>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export default function EventsPage({ events, dotMap, todayStr, lastUpdated }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((e) => {
      if (!e.startDate || !e.endDate) return false;
      return e.startDate <= selectedDate && selectedDate <= e.endDate;
    });
  }, [events, selectedDate]);

  const upcoming = filtered.filter((e) => !e.expired);
  const expired = filtered.filter((e) => e.expired);

  return (
    <>
      <Head>
        <title>Events — AI and Coffee</title>
        <meta name="description" content="Malaysia tech events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
        {/* Nav */}
        <nav className="px-6 py-6 sm:px-16 flex items-center justify-between border-b border-zinc-400/40">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo/logo_mascot.png"
              alt="AI and Coffee"
              width={32}
              height={32}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="text-sm uppercase tracking-widest text-zinc-700 group-hover:text-[#D94830] transition-colors">
              AI and Coffee
            </span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#D94830]">Events</span>
        </nav>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
          {/* ── Sidebar: calendar ── */}
          <aside className="lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-400/40 px-6 py-10 lg:px-8 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#D94830] leading-none tracking-tighter">
                EVENTS
              </h1>
              {lastUpdated && (
                <p className="text-[10px] text-zinc-400 mt-2">
                  updated {formatDate(lastUpdated)}
                </p>
              )}
            </div>

            <Calendar
              dotMap={dotMap}
              todayStr={todayStr}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />

            <div className="mt-8 pt-6 border-t border-zinc-300 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] text-zinc-700">
                <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
                ai and coffee event
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-[#D94830] shrink-0" />
                community upcoming
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                past event
              </div>
            </div>

            <a
              href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full border-2 border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors duration-200"
            >
              + Submit an event
            </a>
          </aside>

          {/* ── Main: event cards ── */}
          <main className="flex-1 px-6 py-10 lg:px-10">
            {selectedDate && (
              <p className="text-xs uppercase tracking-widest text-[#D94830] mb-6">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-MY", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            )}

            {filtered.length === 0 ? (
              <div className="mt-8">
                <p className="text-4xl font-bold text-zinc-300 leading-none tracking-tighter select-none">*</p>
                <p className="mt-4 text-zinc-500 text-sm">
                  {selectedDate ? "No events on this date." : "No events yet."}
                </p>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <section className="mb-12">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
                      Upcoming — {upcoming.length}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
                    </div>
                  </section>
                )}
                {expired.length > 0 && (
                  <section>
                    <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">
                      Past — {expired.length}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {expired.map((e) => <EventCard key={e.id} event={e} muted />)}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
