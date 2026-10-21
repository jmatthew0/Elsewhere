import Image from "next/image";
import { notFound } from "next/navigation";
import TripMap from "@/components/TripMap";
import Money from "@/components/Money";
import Converter from "@/components/Converter";
import AddStopForm from "@/components/AddStopForm";
import LogExpenseForm from "@/components/LogExpenseForm";
import { getTrip } from "@/lib/queries";
import { getRateToPhp } from "@/lib/currency";
import { balances } from "@/lib/balances";
import PlaceSearch from "@/components/PlaceSearch";

export const dynamic = "force-dynamic";

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
    new Date(trip.startDate.getTime() + (n - 1) * 864e5).toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{trip.title}</h1>
          <p className="text-navy-600">{trip.destination} · {trip.members.length} traveler{trip.members.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-navy px-5 py-3 text-sand"><p className="text-xs text-sand-400">Budget</p><p className="text-xl font-medium"><Money cents={trip.budgetCents} cur={cur} rate={rate} /></p></div>
          <div className="rounded-2xl bg-white px-5 py-3"><p className="text-xs text-navy-600">Spent</p><p className="text-xl font-medium"><Money cents={actual} cur={cur} rate={rate} /></p></div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-8">
          {dayNumbers.length === 0 && <p className="text-navy-600">No stops yet. Use “Add a stop” below to start your itinerary.</p>}
          {dayNumbers.map((n) => (
            <div key={n}>
              <h2 className="font-display text-2xl mb-3">{dayLabel(n)}</h2>
              <ul className="space-y-3 border-l-2 border-sand-400 pl-5">
                {trip.activities.filter((a) => a.day === n).map((a) => {
                  const paid = a.expenses.reduce((s, e) => s + e.amountCents, 0);
                  return (
                    <li key={a.id} className="flex items-center gap-4 rounded-2xl bg-white p-3">
                      {a.place?.imageUrl && <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={a.place.imageUrl} alt="" fill sizes="80px" className="object-cover" /></div>}
                      <div className="flex-1"><p className="text-sm text-navy-600">{a.startsAt}</p><p className="font-medium">{a.title}</p></div>
                      <div className="text-right text-sm">
                        {paid > 0 ? <Money cents={paid} cur={cur} rate={rate} /> : <span className="text-navy-600">Not paid yet</span>}
                        <p className="text-xs text-navy-600">est. {Intl.NumberFormat("en-PH", { style: "currency", currency: cur }).format(a.estimatedCents / 100)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <TripMap pins={trip.places} className="h-80 overflow-hidden rounded-3xl" />
          <AddStopForm tripId={trip.id} days={tripDays} places={trip.places} />
          <PlaceSearch tripId={trip.id} />
        </section>

        <aside id="expenses" className="space-y-6">
          <div className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-xl">Estimated vs actual</h2>
            <Bar label="Estimated" cents={est} max={trip.budgetCents} cur={cur} rate={rate} tone="bg-sand-400" />
            <Bar label="Actual" cents={actual} max={trip.budgetCents} cur={cur} rate={rate} tone="bg-navy" />
            <p className="mt-3 text-sm text-navy-600">{trip.budgetCents - actual >= 0 ? "Left in budget:" : "Over budget by:"} <Money cents={Math.abs(trip.budgetCents - actual)} cur={cur} rate={rate} /></p>
          </div>
          <LogExpenseForm tripId={trip.id} cur={cur} members={trip.members.map((m) => m.user)} activities={trip.activities} />
          {trip.members.length > 1 && (
            <div className="rounded-3xl bg-white p-5">
              <h2 className="font-display text-xl">Who owes whom</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {trip.members.map(({ user }) => {
                  const v = net[user.id] ?? 0;
                  return (
                    <li key={user.id} className="flex justify-between">
                      <span>{user.name}</span>
                      <span className="text-right">{v >= 0 ? "is owed " : "owes "}<Money cents={Math.abs(v)} cur={cur} rate={rate} /></span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {cur !== "PHP" && <Converter cur={cur} rate={rate} live={live} />}
        </aside>
      </div>
    </div>
  );
}

function Bar({ label, cents, max, cur, rate, tone }: { label: string; cents: number; max: number; cur: string; rate: number; tone: string }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm"><span>{label}</span><Money cents={cents} cur={cur} rate={rate} /></div>
      <div className="mt-1 h-2 rounded-full bg-sand"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${max ? Math.min(100, (cents / max) * 100) : 0}%` }} /></div>
    </div>
  );
}