import Image from "next/image";
import { trip, places, travelers, balances } from "@/lib/data";
import TripMap from "@/components/TripMap";

const money = (n: number) => `€${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TripPage() {
  const items = trip.days.flatMap((d) => d.items);
  const est = items.reduce((s, i) => s + i.est, 0);
  const actual = items.reduce((s, i) => s + i.actual, 0);
  const net = balances();
  const pins = places.filter((p) => items.some((i) => i.place === p.id));

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{trip.title}</h1>
          <p className="text-navy-600">{trip.dates} · {trip.where} · {travelers.length} travelers</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-navy px-5 py-3 text-sand"><p className="text-xs text-sand-400">Budget</p><p className="text-xl font-medium">{money(trip.budget)}</p></div>
          <div className="rounded-2xl bg-white px-5 py-3"><p className="text-xs text-navy-600">Spent</p><p className="text-xl font-medium">{money(actual)}</p></div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-8">
          {trip.days.map((day) => (
            <div key={day.label}>
              <h2 className="font-display text-2xl mb-3">{day.label}</h2>
              <ul className="space-y-3 border-l-2 border-sand-400 pl-5">
                {day.items.map((it) => {
                  const p = places.find((x) => x.id === it.place);
                  return (
                    <li key={it.title} className="flex items-center gap-4 rounded-2xl bg-white p-3">
                      {p && <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={p.image} alt="" fill sizes="80px" className="object-cover" /></div>}
                      <div className="flex-1"><p className="text-sm text-navy-600">{it.time}</p><p className="font-medium">{it.title}</p></div>
                      <div className="text-right text-sm"><p>{money(it.actual)}</p><p className="text-navy-600">est. {money(it.est)}</p></div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <TripMap pins={pins} className="h-80 overflow-hidden rounded-3xl" />
        </section>

        <aside id="expenses" className="space-y-6">
          <div className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-xl">Estimated vs actual</h2>
            <Bar label="Estimated" value={est} max={trip.budget} tone="bg-sand-400" />
            <Bar label="Actual" value={actual} max={trip.budget} tone="bg-navy" />
            <p className="mt-3 text-sm text-navy-600">{money(trip.budget - actual)} left of your budget</p>
          </div>
          <div className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-xl">Who owes whom</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {travelers.map((t) => (
                <li key={t.id} className="flex justify-between">
                  <span>{t.name}</span>
                  <span className={net[t.id] >= 0 ? "text-navy" : "text-sand-600"}>{net[t.id] >= 0 ? "is owed " : "owes "}{money(Math.abs(net[t.id]))}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm"><span>{label}</span><span>€{value.toLocaleString()}</span></div>
      <div className="mt-1 h-2 rounded-full bg-sand"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
    </div>
  );
}
