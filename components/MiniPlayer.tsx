import Link from "next/link";
import { useRouter } from "next/router";
import { usePlayer } from "../contexts/PlayerContext";
import { TRACKS } from "../lib/tracks";

const BARS = [0, 0.18, 0.09, 0.25];

function EqBars({ playing, size = 16 }: { playing: boolean; size?: number }) {
  return (
    <div className="flex items-end gap-[3px]">
      {BARS.map((delay, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-[#D94830]"
          style={{
            height: size,
            transformOrigin: "bottom",
            transform: playing ? undefined : "scaleY(0.2)",
            opacity: playing ? 1 : 0.4,
            transition: "opacity 0.3s",
            animation: playing
              ? `minibar ${0.55 + i * 0.08}s ease-in-out ${delay}s infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function MiniPlayer() {
  const router = useRouter();
  const { currentIndex, isPlaying, minimized, setMinimized, togglePlay } = usePlayer();

  // Hide on vibes (has its own full player)
  if (router.pathname === "/vibes") return null;

  const track = TRACKS[currentIndex];

  return (
    <>
      {/* Full bar — slides left to hide */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-400/40 bg-[#E8E4D9]/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          minimized ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="px-6 sm:px-16 py-3 flex items-center gap-4">
          <EqBars playing={isPlaying} />

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-tight text-zinc-800 truncate">{track.title}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{track.artist}</p>
          </div>

          <button
            onClick={togglePlay}
            className="w-8 h-8 bg-[#D94830] hover:bg-[#C13D27] text-white flex items-center justify-center transition-colors shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <Link
            href="/vibes"
            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors shrink-0 whitespace-nowrap"
          >
            full player ↗
          </Link>

          <button
            onClick={() => setMinimized(true)}
            className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
          >
            minimize
          </button>
        </div>
      </div>

      {/* Minimized square — eq bars only, slides in from left */}
      <button
        onClick={() => setMinimized(false)}
        aria-label="Expand player"
        className={`fixed bottom-4 left-6 z-50 w-12 h-12 border border-zinc-400/40 bg-[#E8E4D9]/95 backdrop-blur-sm flex items-center justify-center hover:border-zinc-500 transition-all duration-300 ease-in-out ${
          minimized ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        <EqBars playing={isPlaying} />
      </button>
    </>
  );
}
