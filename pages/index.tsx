import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-white font-sans`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          <h1 className="text-5xl font-bold tracking-tight text-black">
            ai and coffee
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600">
            An open source community. No BS. No hierarchy. Ever-evolving.
          </p>
          <p className="max-w-md text-base leading-7 text-zinc-500">
            The only rule is to be nice.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-white transition-colors hover:bg-zinc-800 md:w-auto"
            href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join WhatsApp
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-6 transition-colors hover:border-transparent hover:bg-black/[.04] md:w-auto"
            href="https://luma.com/9f63qyq1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next Event
          </a>
        </div>
      </main>
    </div>
  );
}
