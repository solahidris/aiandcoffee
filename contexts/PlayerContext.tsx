import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { TRACKS, makeShuffled, type RepeatMode } from "../lib/tracks";

interface PlayerState {
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  shuffledOrder: number[];
  minimized: boolean;
  // Exposed so vibes can wire the visualizer
  audioEl: HTMLAudioElement | null;
  // Actions
  selectTrack: (idx: number) => void;
  togglePlay: () => void;
  setIsPlaying: (v: boolean) => void;
  goToNext: () => void;
  goToPrev: () => void;
  seek: (t: number) => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setMinimized: (v: boolean) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

function loadInt(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v !== null ? parseInt(v, 10) : fallback;
}
function loadBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v !== null ? v === "true" : fallback;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentIndex,  setCurrentIndex]  = useState(() => loadInt("player_index", 0));
  const [isPlaying,     setIsPlayingState]= useState(false); // never auto-restore to true (browser blocks)
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [repeatMode,    setRepeatMode]    = useState<RepeatMode>("none");
  const [isShuffle,     setIsShuffle]     = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [minimized,     setMinimized]     = useState(false);
  const [audioEl,       setAudioEl]       = useState<HTMLAudioElement | null>(null);

  // Stable refs so event callbacks always see latest state
  const isPlayingRef    = useRef(false);
  const currentIdxRef   = useRef(0);
  const repeatModeRef   = useRef<RepeatMode>("none");
  const isShuffleRef    = useRef(false);
  const shuffledRef     = useRef<number[]>([]);

  useEffect(() => { isPlayingRef.current = isPlaying; localStorage.setItem("player_playing", String(isPlaying)); }, [isPlaying]);
  useEffect(() => { currentIdxRef.current = currentIndex; localStorage.setItem("player_index", String(currentIndex)); }, [currentIndex]);
  useEffect(() => { repeatModeRef.current   = repeatMode;    }, [repeatMode]);
  useEffect(() => { isShuffleRef.current    = isShuffle;     }, [isShuffle]);
  useEffect(() => { shuffledRef.current     = shuffledOrder; }, [shuffledOrder]);

  // ── Create the single global audio element ──────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    const savedIdx = loadInt("player_index", 0);
    audio.src = TRACKS[Math.min(savedIdx, TRACKS.length - 1)].src;

    // Stable ended handler via ref trick
    const onEnded = () => {
      const rm  = repeatModeRef.current;
      const sh  = isShuffleRef.current;
      const ord = shuffledRef.current;
      const idx = currentIdxRef.current;

      if (rm === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const isLast = sh
        ? ord.indexOf(idx) === ord.length - 1
        : idx === TRACKS.length - 1;

      if (rm === "all" || !isLast) {
        const next = sh
          ? ord[(ord.indexOf(idx) + 1) % ord.length]
          : (idx + 1) % TRACKS.length;
        setCurrentIndex(next);
      } else {
        setIsPlayingState(false);
      }
    };

    audio.addEventListener("ended",           onEnded);
    audio.addEventListener("timeupdate",      () => setCurrentTime(audio.currentTime));
    audio.addEventListener("loadedmetadata",  () => setDuration(audio.duration));

    setAudioEl(audio);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Track change: swap src, preserve play state ──────────────
  useEffect(() => {
    if (!audioEl) return;
    audioEl.src   = TRACKS[currentIndex].src;
    audioEl.load();
    setCurrentTime(0);
    setDuration(0);
    if (isPlayingRef.current) {
      audioEl.play().catch(() => setIsPlayingState(false));
    }
  }, [currentIndex, audioEl]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Play / pause ─────────────────────────────────────────────
  function setIsPlaying(v: boolean) {
    if (!audioEl) return;
    if (v) { audioEl.play().catch(() => setIsPlayingState(false)); setIsPlayingState(true); }
    else   { audioEl.pause(); setIsPlayingState(false); }
  }
  function togglePlay() { setIsPlaying(!isPlayingRef.current); }

  // ── Navigation ───────────────────────────────────────────────
  function nextIdx(from = currentIdxRef.current): number {
    if (isShuffleRef.current) {
      const ord = shuffledRef.current;
      return ord[(ord.indexOf(from) + 1) % ord.length];
    }
    return (from + 1) % TRACKS.length;
  }
  function prevIdx(from = currentIdxRef.current): number {
    if (isShuffleRef.current) {
      const ord = shuffledRef.current;
      return ord[(ord.indexOf(from) - 1 + ord.length) % ord.length];
    }
    return (from - 1 + TRACKS.length) % TRACKS.length;
  }

  function goToNext() { setCurrentIndex(nextIdx()); }
  function goToPrev() {
    if (audioEl && audioEl.currentTime > 3) { audioEl.currentTime = 0; }
    else setCurrentIndex(prevIdx());
  }

  function selectTrack(idx: number) {
    if (isShuffleRef.current) {
      setShuffledOrder(makeShuffled(TRACKS.map((_, i) => i), idx));
    }
    setCurrentIndex(idx);
    setIsPlaying(true);
  }

  function seek(t: number) {
    if (audioEl) audioEl.currentTime = t;
  }

  function cycleRepeat() {
    setRepeatMode(prev => prev === "none" ? "all" : prev === "all" ? "one" : "none");
  }

  function toggleShuffle() {
    if (!isShuffle) {
      setShuffledOrder(makeShuffled(TRACKS.map((_, i) => i), currentIdxRef.current));
    }
    setIsShuffle(v => !v);
  }

  return (
    <PlayerContext.Provider value={{
      currentIndex, isPlaying, currentTime, duration,
      repeatMode, isShuffle, shuffledOrder, minimized, audioEl,
      selectTrack, togglePlay, setIsPlaying, goToNext, goToPrev,
      seek, cycleRepeat, toggleShuffle, setMinimized,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
