import Link from "next/link";
const links = [
  { href: "/", label: "Home" },
  { href: "/trips/rome", label: "My trips" },
  { href: "/trips/rome#expenses", label: "Expenses" },
  { href: "/#places", label: "Saved places" },
];
export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col bg-navy text-sand p-6 sticky top-0 h-screen">
      <Link href="/" className="font-display text-2xl tracking-tight">Elsewhere</Link>
      <nav className="mt-10 flex flex-col gap-1 text-sm">
        {links.map((l) => (
          <Link key={l.label} href={l.href} className="rounded-lg px-3 py-2 hover:bg-navy-800">{l.label}</Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-sand-400">Signed in as Ann Stown</div>
    </aside>
  );
}
