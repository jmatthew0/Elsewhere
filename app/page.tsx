import Image from "next/image";
import Link from "next/link";
import TripMap from "@/components/TripMap";
import Calendar from "@/components/Calendar";
import { getCurrentUser, getTrips } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";

export const dynamic = "force-dynamic";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const card = "rounded-3xl bg-white p-5 shadow-sm";
const day = (d: Date) => d.toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function Home({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const [user, trips] = await Promise.all([getCurrentUser(), getTrips()]);
  const first = user?.name?.split(" ")[0] ?? "traveler";

  if (trips.length === 0)
    return (
      <div className={`${card} max-w-lg`}>
        <h1 className="font-display text-3xl">Welcome, {first}</h1>
        <p className="mt-2 text-navy-600">You don't have any trips yet. Start with where and when.</p>
        <Link href="/trips/new" className="mt-5 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-sand">Plan your first trip</Link>
      </div>
    );

  const now = new Date();
  const rates = Object.fromEntries(
    await Promise.all([...new Set(trips.map((t) => t.currency))].map(async (c) => [c, (await getRateToPhp(c)).rate]))
  );
  const spentPhp = trips.reduce((s, t) => s + t.expenses.reduce((x, e) => x + e.amountCents, 0) * rates[t.currency], 0);
  const places = trips.flatMap((t) => t.places);
  const next = trips.find((t) => t.endDate >= now) ?? trips[0];
  const nextSpent = next.expenses.reduce((s, e) => s + e.amountCents, 0);
  const pct = next.budgetCents ? Math.min(100, (nextSpent / next.budgetCents) * 100) : 0;

  const countries = new Map<string, { trips: number; visited: boolean }>();
  for (const t of trips) {
    if (!t.country) continue;
    const c = countries.get(t.country) ?? { trips: 0, visited: false };
    c.trips++;
    if (t.endDate < now) c.visited = true;
    countries.set(t.country, c);
  }

  const anchor = /^\d{4}-\d{2}$/.test(m ?? "") ? new Date(`${m}-01T00:00:00Z`) : next.startDate > now ? next.startDate : now;

  const stats = [
    { label: "Trips planned", value: String(trips.length) },
    { label: "Countries", value: String(countries.size) },
    { label: "Places saved", value: String(places.length) },
    { label: "Total spent", value: money(Math.round(spentPhp), "PHP") },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Welcome back, {first}</h1>
          <p className="text-navy-600">{trips.length} trip{trips.length === 1 ? "" : "s"} planned.</p>
        </div>
        <Link href="/trips/new" className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-sand hover:bg-navy-800">New trip</Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-sm text-navy-600">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${card} grid overflow-hidden p-0 md:grid-cols-2`}>
            <div className="relative min-h-60 bg-navy">
              {next.coverUrl && <Image src={next.coverUrl} alt="" fill sizes="500px" className="object-cover" />}
            </div>
            <div className="flex flex-col p-6">
              <p className="w-fit rounded-full bg-sand px-3 py-1 text-xs font-medium">Up next</p>
              <h2 className="mt-3 font-display text-3xl">{next.title}</h2>
              <p className="text-navy-600">{next.destination}</p>
              <p className="mt-1 text-sm text-navy-600">{day(next.startDate)} – {day(next.endDate)}</p>
              <div className="mt-5">
                <div className="flex justify-between text-sm"><span>Budget used</span><span>{money(nextSpent, next.currency)} of {money(next.budgetCents, next.currency)}</span></div>
                <div className="mt-1 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-navy" style={{ width: `${pct}%` }} /></div>
              </div>
              <Link href={`/trips/${next.id}`} className="mt-auto rounded-full bg-navy px-5 py-2.5 text-center text-sm font-medium text-sand hover:bg-navy-800">View itinerary</Link>
            </div>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between"><h2 className="font-display text-xl">Adventure map</h2><Link href="/places" className="text-sm text-navy-600 underline">All places</Link></div>
            <TripMap pins={places} className="mt-3 h-72 overflow-hidden rounded-2xl" />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-2xl">Explore new places</h2><Link href="/explore" className="text-sm text-navy-600 underline">View all</Link></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[["Kyoto temples", "photo-1493976040374-85c8e12f0c0e"], ["Santorini views", "photo-1570077188670-e3a8d69ac5ff"]].map(([t, id]) => (
                <Link key={t} href="/explore" className="group relative block h-44 overflow-hidden rounded-3xl bg-navy">
                  <Image src={img(id)} alt="" fill sizes="500px" className="object-cover transition group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <p className="absolute bottom-4 left-5 font-display text-xl text-white">{t}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Calendar year={anchor.getUTCFullYear()} month={anchor.getUTCMonth()} trips={trips.map((t) => ({ id: t.id, title: t.title, start: t.startDate, end: t.endDate }))} />

          <div className={card}>
            <h2 className="font-display text-xl">Countries</h2>
            {countries.size === 0 ? (
              <p className="mt-3 text-sm text-navy-600">Add a country when you plan a trip and it shows up here.</p>
            ) : (
              <ul className="mt-3 divide-y divide-sand text-sm">
                {[...countries].map(([name, c]) => (
                  <li key={name} className="flex items-center justify-between py-2.5">
                    <span className="font-medium">{name}</span>
                    <span className="flex items-center gap-2 text-navy-600">
                      {c.trips} trip{c.trips === 1 ? "" : "s"}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${c.visited ? "bg-navy text-white" : "bg-sand text-navy"}`}>{c.visited ? "Visited" : "Planned"}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}