import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetStaticProps } from "next";
import { Geist_Mono } from "next/font/google";
import path from "path";
import fs from "fs";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Event {
  id: string;
  text: string;
  timestamp: string | null;
  url: string;
  source: string;
  scrapedAt: string;
}

interface Props {
  events: Event[];
  lastUpdated: string | null;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const filePath = path.join(process.cwd(), "data", "events.json");
  let events: Event[] = [];
  let lastUpdated: string | null = null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    events = JSON.parse(raw);
    if (events.length > 0) {
      lastUpdated = events[0].scrapedAt;
    }
  } catch {
    events = [];
  }

  return { props: { events, lastUpdated } };
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerpt(text: string, max = 200) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function EventsPage({ events, lastUpdated }: Props) {
  return (
    <>
      <Head>
        <title>Events — AI and Coffee</title>
        <meta
          name="description"
          content="Malaysia tech events scraped daily from @codewithchuba on Threads."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}>
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
              AI & Coffee
            </span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#D94830]">
            Events
          </span>
        </nav>

        <main className="px-6 py-12 sm:px-16 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-bold text-[#D94830] leading-none tracking-tighter mb-2">
            EVENTS
          </h1>
          <p className="text-zinc-500 text-sm mt-4 mb-2">
            Malaysia tech events — scraped daily from{" "}
            <a
              href="https://www.threads.net/@codewithchuba"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 underline underline-offset-2 hover:text-[#D94830] transition-colors"
            >
              @codewithchuba
            </a>{" "}
            on Threads.
          </p>
          {lastUpdated && (
            <p className="text-xs text-zinc-400 mb-12">
              last updated {formatDate(lastUpdated)}
            </p>
          )}

          {events.length === 0 ? (
            <div className="mt-16">
              <p className="text-4xl font-bold text-zinc-300 leading-none tracking-tighter select-none">
                *
              </p>
              <p className="mt-6 text-zinc-500 text-sm">
                No events yet. The scraper runs daily — check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border-l-2 border-[#D94830] pl-6 group"
                >
                  <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                    {excerpt(event.text)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                    <span>{formatDate(event.timestamp)}</span>
                    <span className="text-zinc-300">·</span>
                    <span>{event.source}</span>
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-[#D94830] transition-colors underline underline-offset-2"
                    >
                      view on threads →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className="fixed bottom-8 right-8 sm:bottom-12 sm:right-16 text-[80px] sm:text-[140px] font-bold text-zinc-300/20 select-none pointer-events-none leading-none">
          *
        </div>
      </div>
    </>
  );
}
