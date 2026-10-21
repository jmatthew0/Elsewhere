import Image from "next/image";
import Link from "next/link";
import { Plane, Globe, Wallet } from "lucide-react";
import TripMap from "@/components/TripMap";
import Calendar from "@/components/Calendar";
import { getCurrentUser, getTrips } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";
import { flag, initials } from "@/lib/ui";

export const dynamic = "force-dynamic";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const card = "rounded-2xl border border-sand-400/40 bg-white p-5";
const day = (d: Date) => d.toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" });
const chip = "rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide";

export default async function Home({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const [user, trips] = await Promise.all([getCurrentUser(), getTrips()]);
  const first = user?.name?.split(" ")[0] ?? "traveler";

  if (trips.length === 0)
    return (
      <div className={`${card} max-w-lg`}>
        <h1 className="font-display text-3xl">Welcome, {first}!</h1>
        <p className="mt-2 text-navy-600">You don't have any trips yet. Start with where and when.</p>
        <Link href="/trips/new" className="mt-5 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white">Plan your first trip</Link>
      </div>
    );

  const now = new Date();
  const rates = Object.fromEntries(
    await Promise.all([...new Set(trips.map((t) => t.currency))].map(async (c) => [c, (await getRateToPhp(c)).rate]))
  );
  const spentPhp = trips.reduce((s, t) => s + t.expenses.reduce((x, e) => x + e.amountCents, 0) * rates[t.currency], 0);
  const places = trips.flatMap((t) => t.places);
  const upcoming = trips.filter((t) => t.endDate >= now);
  const next = upcoming[0] ?? trips[0];
  const nextSpent = next.expenses.reduce((s, e) => s + e.amountCents, 0);
  const pct = next.budgetCents ? Math.round(Math.min(100, (nextSpent / next.budgetCents) * 100)) : 0;

  const countries = new Map<string, { trips: number; visited: boolean }>();
  for (const t of trips) {
    if (!t.country) continue;
    const c = countries.get(t.country) ?? { trips: 0, visited: false };
    c.trips++;
    if (t.endDate < now) c.visited = true;
    countries.set(t.country, c);
  }
  const countryRows = [...countries].sort((a, b) => Number(b[1].visited) - Number(a[1].visited));
  const visitedCount = countryRows.filter(([, c]) => c.visited).length;
  const anchor = /^\d{4}-\d{2}$/.test(m ?? "") ? new Date(`${m}-01T00:00:00Z`) : next.startDate > now ? next.startDate : now;

  const stats = [
    { label: "TRIPS THIS YEAR", value: String(trips.filter((t) => t.startDate.getUTCFullYear() === now.getFullYear()).length), Icon: Plane },
    { label: "COUNTRIES VISITED", value: String(visitedCount), Icon: Globe },
    { label: "TOTAL SPENT", value: money(Math.round(spentPhp), "PHP"), Icon: Wallet },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <header>
          <h1 className="font-display text-3xl">Welcome back, {first}!</h1>
          <p className="text-sm text-navy-600">You have {upcoming.length} trip{upcoming.length === 1 ? "" : "s"} coming up.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className={card}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-sand"><Icon className="h-4 w-4" aria-hidden /></span>
              <p className="mt-4 font-display text-2xl">{value}</p>
              <p className="mt-1 text-[10px] font-semibold tracking-wider text-navy-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Calendar year={anchor.getUTCFullYear()} month={anchor.getUTCMonth()} trips={trips.map((t) => ({ id: t.id, title: t.title, start: t.startDate, end: t.endDate }))} />

      <div className={`${card} grid overflow-hidden p-0 sm:grid-cols-5 lg:col-span-2`}>
        <div className="relative min-h-56 bg-navy sm:col-span-2">
          {next.coverUrl && <Image src={next.coverUrl} alt="" fill sizes="400px" className="object-cover" />}
        </div>
        <div className="flex flex-col p-5 sm:col-span-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-2xl leading-tight">{next.title}</h2>
            <span className={`${chip} bg-sand`}>{next.endDate >= now ? "UPCOMING" : "PAST"}</span>
          </div>
          <p className="mt-1 text-sm text-navy-600">{next.destination}{next.country ? `, ${next.country}` : ""}</p>
          <p className="text-sm font-medium">{day(next.startDate)} – {day(next.endDate)}</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between"><dt className="text-navy-600">Travelers</dt><dd className="flex -space-x-2">{next.members.map(({ user: u }) => <span key={u.id} title={u.name ?? ""} className="grid h-7 w-7 place-items-center rounded-full bg-sand text-[10px] font-semibold ring-2 ring-white">{initials(u.name)}</span>)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-600">Stops planned</dt><dd className="font-medium">{next._count.activities}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-600">Budget used</dt><dd className="font-medium">{pct}%</dd></div>
          </dl>
          <Link href={`/trips/${next.id}`} className="mt-5 rounded-lg bg-navy py-2.5 text-center text-sm font-medium text-white hover:bg-navy-800">View Itinerary</Link>
        </div>
      </div>

      <div className={card}>
        <h2 className="text-sm font-semibold">Adventure Map</h2>
        <TripMap pins={places} className="mt-3 h-44 overflow-hidden rounded-xl" />
        <div className="mt-3 flex gap-2">
          <span className={`${chip} bg-navy text-white`}>{visitedCount} VISITED</span>
          <span className={`${chip} bg-sand`}>{upcoming.length} PLANNED</span>
          <span className={`${chip} bg-sand-400/60`}>{places.length} SAVED</span>
        </div>
      </div>

      <section className={`${card} lg:col-span-2`}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Explore New Places</h2><Link href="/explore" className="text-xs font-medium text-navy-600 hover:text-navy">View All</Link></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[["Kyoto Temples", "Japan", "photo-1493976040374-85c8e12f0c0e"], ["Santorini Views", "Greece", "photo-1570077188670-e3a8d69ac5ff"]].map(([t, c, id]) => (
            <Link key={t} href="/explore" className="group relative block h-40 overflow-hidden rounded-xl bg-navy">
              <Image src={img(id)} alt="" fill sizes="400px" className="object-cover transition group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <p className="absolute bottom-3 left-4 text-white"><span className="block text-[10px] tracking-wide text-sand">{c.toUpperCase()}</span><span className="font-display text-lg">{t}</span></p>
            </Link>
          ))}
        </div>
      </section>

      <div className={card}>
        <h2 className="text-sm font-semibold">Visited Countries</h2>
        {countryRows.length === 0 ? (
          <p className="mt-3 text-sm text-navy-600">Add a country when you plan a trip and it shows up here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-sand text-sm">
            {countryRows.map(([name, c]) => (
              <li key={name} className="flex items-center gap-3 py-2.5">
                <span className="text-lg" aria-hidden>{flag(name)}</span>
                <span className="flex-1"><span className="font-medium">{name}</span>{!c.visited && <span className={`${chip} ml-2 bg-sand`}>PLANNED</span>}</span>
                <span className="text-xs text-navy-600">{c.trips} trip{c.trips === 1 ? "" : "s"}</span>
                <Link href={`/trips?q=${encodeURIComponent(name)}`} className="text-xs font-medium text-navy hover:underline">View Trips</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}