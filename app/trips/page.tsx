import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getTrips } from "@/lib/queries";
import { money } from "@/lib/currency";
import { initials } from "@/lib/ui";

export const dynamic = "force-dynamic";

const range = (a: Date, b: Date) =>
  `${a.toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" })} – ${b.toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const { q = "", tab = "all" } = await searchParams;
  const all = await getTrips();
  const now = new Date();
  const trips = all.filter(
    (t) =>
      (tab === "upcoming" ? t.endDate >= now : tab === "past" ? t.endDate < now : true) &&
      `${t.title} ${t.destination} ${t.country ?? ""}`.toLowerCase().includes(q.toLowerCase())
  );
  const tabs = [["all", "All"], ["upcoming", "Upcoming"], ["past", "Past"]];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">My Trips</h1>
        <p className="text-sm text-navy-600">{q ? `Results for “${q}”` : `${all.length} trip${all.length === 1 ? "" : "s"} in total.`}</p>
      </header>

      <nav className="flex gap-1 border-b border-sand-400/40 text-sm">
        {tabs.map(([k, label]) => (
          <Link key={k} href={`/trips?tab=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`-mb-px border-b-2 px-4 py-2 ${tab === k ? "border-navy font-medium" : "border-transparent text-navy-600 hover:text-navy"}`}>{label}</Link>
        ))}
      </nav>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-sand-400/40 bg-white p-8 text-center text-navy-600">
          No trips match. <Link href="/trips/new" className="font-medium text-navy underline">Plan a new one</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => {
            const spent = t.expenses.reduce((s, e) => s + e.amountCents, 0);
            const pct = t.budgetCents ? Math.min(100, (spent / t.budgetCents) * 100) : 0;
            return (
              <Link key={t.id} href={`/trips/${t.id}`} className="group overflow-hidden rounded-2xl border border-sand-400/40 bg-white transition hover:shadow-md">
                <div className="relative h-44 bg-navy">
                  {t.coverUrl && <Image src={t.coverUrl} alt="" fill sizes="400px" className="object-cover transition group-hover:scale-[1.03]" />}
                  <span className="absolute left-3 top-3 rounded bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wide">{t.endDate >= now ? "UPCOMING" : "PAST"}</span>
                </div>
                <div className="p-5">
                  <h2 className="font-display text-xl">{t.title}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-navy-600"><MapPin className="h-3.5 w-3.5" aria-hidden />{t.destination}{t.country ? `, ${t.country}` : ""}</p>
                  <p className="text-sm font-medium">{range(t.startDate, t.endDate)}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-navy-600">
                    <span>{money(spent, t.currency)} of {money(t.budgetCents, t.currency)}</span>
                    <span className="flex -space-x-2">{t.members.map(({ user: u }) => <span key={u.id} title={u.name ?? ""} className="grid h-6 w-6 place-items-center rounded-full bg-sand text-[9px] font-semibold text-navy ring-2 ring-white">{initials(u.name)}</span>)}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-sand"><div className="h-1.5 rounded-full bg-navy" style={{ width: `${pct}%` }} /></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}