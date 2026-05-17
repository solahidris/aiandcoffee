import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PetProvider } from "../contexts/PetContext";
import { PlayerProvider } from "../contexts/PlayerContext";
import PetSprite from "../components/PetSprite";
import MiniPlayer from "../components/MiniPlayer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PlayerProvider>
      <PetProvider>
        <style>{`
          @keyframes pet-float-heart {
            0%   { opacity:1; transform:translateY(0) scale(1); }
            100% { opacity:0; transform:translateY(-44px) scale(1.5); }
          }
        `}</style>
        <Component {...pageProps} />
        <MiniPlayer />
        <PetSprite />
      </PetProvider>
    </PlayerProvider>
  );
}
