import Image from "next/image";
import Head from "next/head";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>AI and Coffee - Open Source Community</title>
        <meta
          name="description"
          content="An open source community project. No BS. No hierarchy. Ever-evolving. The only rule is to be nice."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content="AI and Coffee" />
        <meta
          property="og:description"
          content="An open source community project. No BS. No hierarchy. Ever-evolving. The only rule is to be nice."
        />
        <meta property="og:image" content="/logo/logo.png" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI and Coffee" />
        <meta
          name="twitter:description"
          content="An open source community project. No BS. No hierarchy. Ever-evolving. The only rule is to be nice."
        />
        <meta name="twitter:image" content="/logo/logo.png" />
      </Head>
      <div
        className={`${geistMono.className} min-h-screen bg-[#E8E4D9] font-mono`}
      >
        {/* Background animated mascot */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="animate-float opacity-10">
            <Image
              src="/logo/logo_mascot_transparent.png"
              alt=""
              width={800}
              height={800}
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
              priority
            />
          </div>
        </div>

        <main className="relative min-h-screen overflow-hidden px-6 py-12 z-10">
          {/* Floating mascot */}
          <div className="absolute top-8 right-8 sm:top-12 sm:right-16 rotate-12 hover:rotate-0 transition-transform duration-500">
            <Image
              src="/logo/logo_mascot.png"
              alt="AI and Coffee mascot"
              width={120}
              height={120}
              priority
            />
          </div>

          {/* Main content - left aligned, raw */}
          <div className="max-w-xl pt-24 sm:pt-32 sm:pl-16">
            <h1 className="text-6xl sm:text-8xl font-bold text-[#D94830] leading-none tracking-tighter">
              AI
              <br />
              <span className="text-zinc-800">&</span>
              <br />
              COFFEE
            </h1>

            <div className="mt-12 space-y-2 text-zinc-700">
              <p className="text-lg">no bs.</p>
              <p className="text-lg">no hierarchy.</p>
              <p className="text-lg">no laws.</p>
              <p className="mt-6 text-2xl font-bold text-zinc-900">
                only rule: be nice
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-zinc-500">
              <span className="border-b border-zinc-400 pb-1">clueless</span>
              <span className="border-b border-zinc-400 pb-1">beginners</span>
              <span className="border-b border-zinc-400 pb-1">seniors</span>
              <span className="border-b border-zinc-400 pb-1">whales</span>
              <span className="border-b border-zinc-400 pb-1">sharks</span>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row gap-4">
              <a
                className="inline-block border-2 border-[#D94830] bg-[#D94830] px-8 py-4 text-sm uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
                href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join WhatsApp
              </a>
              <a
                className="inline-block border-2 border-zinc-800 px-8 py-4 text-sm uppercase tracking-widest text-zinc-800 hover:bg-zinc-800 hover:text-[#E8E4D9] transition-colors"
                href="https://luma.com/9f63qyq1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Next Event
              </a>
            </div>
          </div>

          {/* Bottom corner note */}
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-16 max-w-[200px] text-right">
            <p className="text-xs text-zinc-500 leading-relaxed">
              no social media<br />
              just whatsapp<br />
              <span className="text-zinc-400">expanding @ 1024 members</span>
            </p>
          </div>

          {/* Random decorative element */}
          <div className="absolute bottom-32 left-8 sm:left-16 text-[120px] sm:text-[200px] font-bold text-zinc-300/30 select-none pointer-events-none leading-none">
            *
          </div>
        </main>
      </div>
    </>
  );
}
