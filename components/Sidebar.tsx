"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Wallet, CalendarCheck, Compass, Bookmark } from "lucide-react";
import { initials } from "@/lib/ui";


const links = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", Icon: Briefcase },
  { href: "/expenses", label: "Expenses", Icon: Wallet },
  { href: "/reservations", label: "Reservations", Icon: CalendarCheck },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/places", label: "Saved Places", Icon: Bookmark },
];
type Recent = { id: string; title: string; when: string; coverUrl: string | null };

export default function Sidebar({ name, recent, onSignOut }: { name: string; recent: Recent[]; onSignOut?: () => Promise<void> }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-sand-400/40 bg-white md:flex">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-display text-white">E</span>
        <span className="font-display text-lg font-semibold">Elsewhere</span>
      </Link>
      <nav className="flex flex-col gap-0.5 text-sm">
        {links.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 px-5 py-2.5 ${active(href) ? "bg-sand-200 font-medium text-navy shadow-[inset_-3px_0_0_#13233F]" : "text-navy-600 hover:bg-sand-200/60"}`}>
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </Link>
        ))}
      </nav>

      {recent.length > 0 && (
        <div className="mt-auto border-t border-sand-400/40 px-5 py-4">
          <p className="mb-2 text-[10px] font-semibold tracking-wider text-navy-600">RECENT TRIPS</p>
          <ul className="space-y-2">
            {recent.map((t) => (
              <li key={t.id}>
                <Link href={`/trips/${t.id}`} className="flex items-center gap-2">
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-navy">{t.coverUrl && <Image src={t.coverUrl} alt="" fill sizes="32px" className="object-cover" />}</span>
                  <span className="min-w-0 text-xs"><span className="block truncate font-medium">{t.title}</span><span className="text-navy-600">{t.when}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`flex items-center gap-2 border-t border-sand-400/40 px-5 py-4 ${recent.length ? "" : "mt-auto"}`}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sand text-xs font-semibold">{initials(name)}</span>
        <div className="min-w-0 text-xs">
          <p className="truncate font-medium">{name}</p>
          {onSignOut && <form action={onSignOut}><button className="text-navy-600 underline">Sign out</button></form>}
        </div>
      </div>
    </aside>
  );
}