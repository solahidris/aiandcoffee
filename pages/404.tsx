import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — AI and Coffee</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono px-6 py-12 sm:px-16`}>
        <div className="absolute top-8 right-8 sm:top-12 sm:right-16 rotate-12">
          <Image
            src="/logo/logo_mascot.png"
            alt="AI and Coffee mascot"
            width={80}
            height={80}
          />
        </div>

        <div className="max-w-xl pt-24 sm:pt-32">
          <h1 className="text-6xl sm:text-8xl font-bold text-[#D94830] leading-none tracking-tighter">
            404
          </h1>
          <p className="mt-6 text-lg text-zinc-700">this page doesn&apos;t exist.</p>
          <p className="text-lg text-zinc-500">but the coffee is still hot.</p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/events"
              className="inline-block border-2 border-zinc-400 px-8 py-4 text-sm uppercase tracking-widest text-zinc-500 hover:border-zinc-600 hover:text-zinc-700 transition-colors"
            >
              All MYS Events
            </Link>
          </div>
        </div>

        <div className="absolute bottom-32 left-8 sm:left-16 text-[120px] sm:text-[200px] font-bold text-zinc-300/30 select-none pointer-events-none leading-none">
          *
        </div>
      </div>
    </>
  );
}
