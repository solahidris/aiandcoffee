import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type Page = "home" | "events" | "tools" | "about";

const LINKS: { label: string; href: string; page: Page }[] = [
  { label: "Events", href: "/events", page: "events" },
  { label: "Tools",  href: "/tools",  page: "tools"  },
  { label: "About",  href: "/about",  page: "about"  },
];

const SHEET_LINKS: { label: string; href: string; page: Page }[] = [
  { label: "Home",   href: "/",        page: "home"   },
  { label: "Events", href: "/events",  page: "events" },
  { label: "Tools",  href: "/tools",   page: "tools"  },
  { label: "About",  href: "/about",   page: "about"  },
];

export default function Nav({ active }: { active: Page }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const logo = active === "home" ? (
    <div className="flex items-center gap-3">
      <Image src="/logo/logo_mascot.png" alt="AI and Coffee" width={32} height={32} />
      <span className="text-sm uppercase tracking-widest text-zinc-700">AI and Coffee</span>
    </div>
  ) : (
    <Link href="/" className="flex items-center gap-3 group">
      <Image
        src="/logo/logo_mascot.png"
        alt="AI and Coffee"
        width={32}
        height={32}
        className="group-hover:rotate-12 transition-transform duration-300"
      />
      <span className="text-sm uppercase tracking-widest text-zinc-700 group-hover:text-[#D94830] transition-colors">
        AI and Coffee
      </span>
    </Link>
  );

  return (
    <>
      <nav className={`relative z-10 px-6 py-6 sm:px-16 flex items-center sm:border-b border-zinc-400/40 ${active === "home" ? "justify-end sm:justify-between" : "justify-between"}`}>
        <div className={active === "home" ? "hidden sm:block" : "block"}>{logo}</div>

        {/* Desktop links + join */}
        <div className="hidden sm:flex items-center gap-6">
          {LINKS.map(({ label, href, page }) =>
            active === page ? (
              <span key={page} className="text-xs uppercase tracking-widest text-[#D94830]">
                {label}
              </span>
            ) : (
              <Link
                key={page}
                href={href}
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                {label}
              </Link>
            )
          )}
          <a
            href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-[#D94830] bg-[#D94830] px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-transparent hover:text-[#D94830] transition-colors"
          >
            Join
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="sm:hidden flex flex-col gap-1.5 p-1"
          aria-label="Open menu"
        >
          <span className="w-5 h-px bg-zinc-700 block" />
          <span className="w-5 h-px bg-zinc-700 block" />
          <span className="w-5 h-px bg-zinc-700 block" />
        </button>
      </nav>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-20 bg-zinc-900/40 transition-opacity duration-300 sm:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side sheet */}
      <div
        className={`fixed top-0 right-0 z-30 h-full w-72 bg-[#E8E4D9] border-l border-zinc-400/40 flex flex-col transition-transform duration-300 ease-in-out sm:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-400/40">
          <div className="flex items-center gap-2">
            <Image src="/logo/logo_mascot.png" alt="AI and Coffee" width={28} height={28} />
            <span className="text-xs uppercase tracking-widest text-zinc-700">AI and Coffee</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-500 hover:text-zinc-900 transition-colors p-1"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Sheet links */}
        <div className="flex flex-col px-6 pt-8 gap-1">
          {SHEET_LINKS.map(({ label, href, page }) =>
            active === page ? (
              <span
                key={page}
                className="text-2xl font-bold tracking-tighter text-[#D94830] py-2"
              >
                {label}
              </span>
            ) : (
              <Link
                key={page}
                href={href}
                onClick={() => setOpen(false)}
                className="text-2xl font-bold tracking-tighter text-zinc-800 hover:text-[#D94830] transition-colors py-2"
              >
                {label}
              </Link>
            )
          )}
        </div>

        {/* Sheet footer */}
        <div className="mt-auto px-6 py-8 border-t border-zinc-400/40 space-y-4">
          <a
            href="https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full border-2 border-[#D94830] bg-[#D94830] px-4 py-3 text-xs uppercase tracking-widest text-white text-center hover:bg-transparent hover:text-[#D94830] transition-colors"
          >
            Join WhatsApp
          </a>
          <p className="text-xs text-zinc-500">only rule: be nice</p>
        </div>
      </div>
    </>
  );
}
