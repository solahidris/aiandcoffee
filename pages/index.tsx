import Image from "next/image";
import Head from "next/head";
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
        className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-[#E8E4D9] font-sans`}
      >
        <main className="flex w-full max-w-2xl flex-col items-center gap-10 py-16 px-8 sm:py-24 sm:px-16">
          <Image
            src="/logo/logo.png"
            alt="AI and Coffee"
            width={280}
            height={280}
            priority
          />

          <div className="flex flex-col items-center gap-4 text-center">
            <p className="max-w-md text-lg leading-8 text-zinc-700">
              An open source community. No BS. No hierarchy. Ever-evolving.
            </p>
            <p className="text-xl font-medium text-zinc-800">
              The only rule is to be nice.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-zinc-600">
            <span className="rounded-full bg-zinc-200/70 px-3 py-1">Clueless about AI</span>
            <span className="rounded-full bg-zinc-200/70 px-3 py-1">Beginners</span>
            <span className="rounded-full bg-zinc-200/70 px-3 py-1">Seniors</span>
            <span className="rounded-full bg-zinc-200/70 px-3 py-1">Whales</span>
            <span className="rounded-full bg-zinc-200/70 px-3 py-1">Sharks</span>
          </div>

          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#D94830] px-8 text-white transition-colors hover:bg-[#c13d27]"
              href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join WhatsApp
            </a>
            <a
              className="flex h-12 items-center justify-center rounded-full border border-solid border-zinc-400 px-8 text-zinc-700 transition-colors hover:border-zinc-600 hover:bg-zinc-200/50"
              href="https://luma.com/9f63qyq1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next Event
            </a>
          </div>

          <p className="text-center text-sm text-zinc-500">
            No social media. Just WhatsApp. We&apos;ll think about expanding after we hit 1024 members.
          </p>
        </main>
      </div>
    </>
  );
}
