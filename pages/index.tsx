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
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-8 sm:py-32 sm:px-16 sm:items-start">
          <Image
            src="/logo/logo.png"
            alt="AI and Coffee"
            width={300}
            height={300}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <p className="max-w-md text-lg leading-8 text-zinc-700">
              An open source community. No BS. No hierarchy. Ever-evolving.
            </p>
            <p className="max-w-md text-base leading-7 text-zinc-600">
              The only rule is to be nice.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D94830] px-6 text-white transition-colors hover:bg-[#c13d27] md:w-auto"
              href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join WhatsApp
            </a>
            <a
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-zinc-400 px-6 text-zinc-700 transition-colors hover:border-zinc-600 hover:bg-zinc-200/50 md:w-auto"
              href="https://luma.com/9f63qyq1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next Event
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
