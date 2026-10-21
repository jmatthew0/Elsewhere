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

export default function Sidebar({ name, onSignOut }: { name: string; onSignOut: () => Promise<void> }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sand-400/50 bg-white p-5 md:flex">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy font-display text-lg text-sand">E</span>
        <span className="font-display text-xl">Elsewhere</span>
      </Link>
      <nav className="mt-8 flex flex-col gap-1 text-sm">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`rounded-xl px-3 py-2.5 transition hover:bg-sand-200 ${active(l.href) ? "bg-navy font-medium text-white hover:bg-navy" : "text-navy-600"}`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <Link href="/trips/new" className="mt-6 rounded-full bg-sand px-4 py-2.5 text-center text-sm font-medium hover:bg-sand-400">Plan a trip</Link>
      <div className="mt-auto border-t border-sand pt-4 text-sm">
        <p className="font-medium">{name}</p>
        <form action={onSignOut}><button className="text-xs text-navy-600 underline">Sign out</button></form>
      </div>
    </aside>
  );
}