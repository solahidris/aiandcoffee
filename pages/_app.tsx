import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PetProvider } from "../contexts/PetContext";
import PetSprite from "../components/PetSprite";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PetProvider>
      <style>{`
        @keyframes pet-float-heart {
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-44px) scale(1.5); }
        }
      `}</style>
      <Component {...pageProps} />
      <PetSprite />
    </PetProvider>
  );
}
