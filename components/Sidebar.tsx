"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "My trips" },
  { href: "/expenses", label: "Expenses" },
  { href: "/explore", label: "Explore" },
  { href: "/places", label: "Saved places" },
];

export default function Sidebar() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col bg-navy text-sand p-6 sticky top-0 h-screen">
      <Link href="/" className="font-display text-2xl tracking-tight">Elsewhere</Link>
      <nav className="mt-10 flex flex-col gap-1 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 hover:bg-navy-800 ${active(l.href) ? "bg-navy-800 font-medium text-white" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-sand-400">Signed in as Ann Stown</div>
    </aside>
  );
}