import Image from "next/image";
import Link from "next/link";

type Page = "home" | "events" | "about";

const LINKS: { label: string; href: string; page: Page }[] = [
  { label: "Events", href: "/events", page: "events" },
  { label: "About",  href: "/about",  page: "about"  },
];

export default function Nav({ active }: { active: Page }) {
  return (
    <nav className="relative z-10 px-6 py-6 sm:px-16 flex items-center justify-between border-b border-zinc-400/40">
      {active === "home" ? (
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
      )}

      <div className="flex items-center gap-6">
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
      </div>
    </nav>
  );
}
