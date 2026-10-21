import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TripMap from "@/components/TripMap";
import Money from "@/components/Money";
import Converter from "@/components/Converter";
import AddStopForm from "@/components/AddStopForm";
import PlaceSearch from "@/components/PlaceSearch";
import LogExpenseForm from "@/components/LogExpenseForm";
import { getTrip } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";
import { balances } from "@/lib/balances";

export const dynamic = "force-dynamic";

const card = "rounded-3xl bg-white p-5 shadow-sm";
const initials = (n?: string | null) => (n ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const fmt = (d: Date) => d.toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();

  const { rate, live } = await getRateToPhp(trip.currency);
  const cur = trip.currency;
  const est = trip.activities.reduce((s, a) => s + a.estimatedCents, 0);
  const actual = trip.expenses.reduce((s, e) => s + e.amountCents, 0);
  const net = balances(trip.expenses);
  const tripDays = Math.round((trip.endDate.getTime() - trip.startDate.getTime()) / 864e5) + 1;
  const dayNumbers = [...new Set(trip.activities.map((a) => a.day))];
  const dayLabel = (n: number) =>
    new Date(trip.startDate.getTime() + (n - 1) * 864e5).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

  const byCat: Record<string, number> = {};
  for (const e of trip.expenses) byCat[e.category] = (byCat[e.category] ?? 0) + e.amountCents;
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  const stops = trip.activities.flatMap((a) => (a.place ? [a.place] : [])).filter((p, i, arr) => i === 0 || arr[i - 1].id !== p.id);
  const pins = stops.length ? stops : trip.places;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <Link href="/" className="text-xs font-semibold tracking-wide text-navy-600 hover:text-navy">← BACK TO DASHBOARD</Link>
          <h1 className="mt-1 font-display text-4xl">{trip.title}</h1>
          <p className="text-navy-600">
            {fmt(trip.startDate)} – {fmt(trip.endDate)} · {trip.destination}{trip.country ? `, ${trip.country}` : ""} · {trip.members.length} traveler{trip.members.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-navy px-5 py-3 text-sand"><p className="text-xs text-sand-400">Budget</p><p className="text-xl font-medium"><Money cents={trip.budgetCents} cur={cur} rate={rate} /></p></div>
          <div className="rounded-2xl bg-white px-5 py-3 shadow-sm"><p className="text-xs text-navy-600">Spent</p><p className="text-xl font-medium"><Money cents={actual} cur={cur} rate={rate} /></p></div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          {dayNumbers.length === 0 ? (
            <p className={`${card} text-navy-600`}>No stops yet. Use “Add a stop” below to start your itinerary.</p>
          ) : (
            <ol className="relative space-y-10 border-l-2 border-sand-400 pl-8">
              {dayNumbers.map((n) => {
                const items = trip.activities.filter((a) => a.day === n);
                return (
                  <li key={n} className="relative">
                    <span className="absolute -left-[51px] top-0 grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-medium text-white ring-4 ring-sand-200">{n}</span>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-display text-2xl">{dayLabel(n)}</h2>
                      <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium">{items.length} {items.length === 1 ? "activity" : "activities"}</span>
                    </div>
                    <ul className="mt-3 space-y-3">
                      {items.map((a) => {
                        const paid = a.expenses.reduce((s, e) => s + e.amountCents, 0);
                        return (
                          <li key={a.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
                            {a.place?.imageUrl && <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={a.place.imageUrl} alt="" fill sizes="80px" className="object-cover" /></div>}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-navy-600">{a.startsAt ?? "Any time"}{a.place ? ` · ${a.place.name}` : ""}</p>
                              <p className="font-medium">{a.title}</p>
                            </div>
                            <div className="text-right text-sm">
                              {paid > 0 ? <Money cents={paid} cur={cur} rate={rate} /> : <span className="text-navy-600">Not paid yet</span>}
                              <p className="text-xs text-navy-600">est. {money(a.estimatedCents, cur)}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          )}
          <AddStopForm tripId={trip.id} days={tripDays} places={trip.places} />
          <PlaceSearch tripId={trip.id} />
        </section>

        <aside id="expenses" className="space-y-6">
          <div className={card}>
            <h2 className="font-display text-xl">Budget overview</h2>
            <Bar label="Estimated" cents={est} max={trip.budgetCents} cur={cur} rate={rate} tone="bg-sand-400" />
            <Bar label="Actual" cents={actual} max={trip.budgetCents} cur={cur} rate={rate} tone="bg-navy" />
            <p className="mt-3 text-sm text-navy-600">{trip.budgetCents - actual >= 0 ? "Left in budget:" : "Over budget by:"} <Money cents={Math.abs(trip.budgetCents - actual)} cur={cur} rate={rate} /></p>
            {cats.length > 0 && (
              <div className="mt-4 border-t border-sand pt-2">
                {cats.map(([c, v]) => <Bar key={c} label={c} cents={v} max={actual} cur={cur} rate={rate} tone="bg-navy-600" />)}
              </div>
            )}
          </div>

          <div className={card}>
            <h2 className="font-display text-xl">Travel group</h2>
            <ul className="mt-3 space-y-3">
              {trip.members.map(({ user, role }) => {
                const v = net[user.id] ?? 0;
                return (
                  <li key={user.id} className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-sand text-sm font-medium">{initials(user.name)}</span>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-navy-600">{role === "ORGANIZER" ? "Organizer" : "Traveler"}</p>
                    </div>
                    {trip.members.length > 1 && (
                      <p className="text-right text-sm">
                        {v === 0 ? <span className="text-navy-600">Settled up</span> : <><span className="block text-xs text-navy-600">{v > 0 ? "is owed" : "owes"}</span><Money cents={Math.abs(v)} cur={cur} rate={rate} /></>}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={card}>
          className="rounded-3xl bg-navy p-5 text-sand"
            <TripMap pins={pins} route={stops.length > 1} className="mt-3 h-64 overflow-hidden rounded-2xl" />
            <p className="mt-2 text-sm text-sand-400">{stops.length > 1 ? `${stops.length} stops in itinerary order` : "Link stops to places and your route appears here."}</p>
          </div>

          <LogExpenseForm tripId={trip.id} cur={cur} members={trip.members.map((m) => m.user)} activities={trip.activities} />
          {cur !== "PHP" && <Converter cur={cur} rate={rate} live={live} />}
        </aside>
      </div>
    </div>
  );
}

function Bar({ label, cents, max, cur, rate, tone }: { label: string; cents: number; max: number; cur: string; rate: number; tone: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm"><span>{label}</span><Money cents={cents} cur={cur} rate={rate} /></div>
      <div className="mt-1 h-2 rounded-full bg-sand"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${max ? Math.min(100, (cents / max) * 100) : 0}%` }} /></div>
    </div>
  );
}