// Shared hours parsing + formatting utilities for /coffee pages

export function parseTimeStr(t: string): number {
  const m = t.trim().match(/^(\d+)(?::(\d+))?\s*(am|pm)$/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const p = m[3].toLowerCase();
  if (p === "pm" && h !== 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  return h * 60 + min;
}

export const DAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

export function parseDays(s: string): number[] {
  const norm = s.trim().toLowerCase().replace(/\s+/g, "");
  if (["daily", "everyday", "mon-sun", "mon–sun", "sun-sat", "sun–sat"].includes(norm)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const rangeM = norm.match(/^(\w+)[–\-](\w+)$/);
  if (rangeM) {
    const a = DAY_MAP[rangeM[1]], b = DAY_MAP[rangeM[2]];
    if (a !== undefined && b !== undefined) {
      const days: number[] = [];
      if (a <= b) {
        for (let i = a; i <= b; i++) days.push(i);
      } else {
        for (let i = a; i <= 6; i++) days.push(i);
        for (let i = 0; i <= b; i++) days.push(i);
      }
      return days;
    }
  }
  const d = DAY_MAP[norm];
  return d !== undefined ? [d] : [];
}

export function isOpenNow(hours: string | null): boolean {
  if (!hours || /closed/i.test(hours)) return false;
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  for (const seg of hours.split(",")) {
    const s = seg.trim();
    const withDay = s.match(
      /^([\w\s–\-]+?)\s+(\d+(?::\d+)?\s*[ap]m)\s*[–\-]\s*(\d+(?::\d+)?\s*[ap]m)$/i
    );
    if (withDay) {
      if (!parseDays(withDay[1]).includes(day)) continue;
      const o = parseTimeStr(withDay[2]), c = parseTimeStr(withDay[3]);
      if (o !== -1 && c !== -1) {
        if (c <= o ? (mins >= o || mins < c) : (mins >= o && mins < c)) return true;
      }
      continue;
    }
    const timeOnly = s.match(/^(\d+(?::\d+)?\s*[ap]m)\s*[–\-]\s*(\d+(?::\d+)?\s*[ap]m)$/i);
    if (timeOnly) {
      const o = parseTimeStr(timeOnly[1]), c = parseTimeStr(timeOnly[2]);
      if (o !== -1 && c !== -1) {
        if (c <= o ? (mins >= o || mins < c) : (mins >= o && mins < c)) return true;
      }
    }
  }
  return false;
}

export const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function daysToStr(days: number[]): string {
  if (days.length === 7) return "Daily";
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const runs: number[][] = [];
  let run = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) run.push(sorted[i]);
    else { runs.push(run); run = [sorted[i]]; }
  }
  runs.push(run);
  return runs
    .map((r) => r.length === 1 ? DAY_ABBRS[r[0]] : `${DAY_ABBRS[r[0]]}–${DAY_ABBRS[r[r.length - 1]]}`)
    .join(", ");
}

export function formatHours(raw: string | null): string[] {
  if (!raw) return [];
  const segments = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const parsed: { days: number[]; timeRange: string }[] = [];

  for (const seg of segments) {
    const m = seg.match(/^([\w\s–\-]+?)\s+(\d+(?::\d+)?\s*[ap]m\s*[–\-]\s*\d+(?::\d+)?\s*[ap]m)$/i);
    if (!m) return [raw];
    const days = parseDays(m[1]);
    if (days.length === 0) return [raw];
    parsed.push({ days, timeRange: m[2].trim() });
  }

  if (parsed.length === 0) return [raw];

  const dayTimes = new Map<number, string[]>();
  for (const { days, timeRange } of parsed) {
    for (const d of days) {
      if (!dayTimes.has(d)) dayTimes.set(d, []);
      const times = dayTimes.get(d)!;
      if (!times.includes(timeRange)) times.push(timeRange);
    }
  }

  const groups = new Map<string, number[]>();
  dayTimes.forEach((times, day) => {
    const key = times.join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(day);
  });

  return [...groups.entries()]
    .sort(([, a], [, b]) => Math.min(...a) - Math.min(...b))
    .map(([key, days]) => {
      const times = key.split("|");
      const dayStr = daysToStr(days);
      return times.length === 1 && dayStr === "Daily"
        ? `Daily ${times[0]}`
        : `${dayStr}: ${times.join(" · ")}`;
    });
}
