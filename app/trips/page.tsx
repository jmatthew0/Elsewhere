import Image from "next/image";
import Link from "next/link";
import { getTrips } from "@/lib/queries";
import { money } from "@/lib/currency";


export const dynamic = "force-dynamic";

const range = (a: Date, b: Date) =>
  `${a.toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" })} – ${b.toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;

export default async function TripsPage() {
  const trips = await getTrips();
  return (
    <div className="space-y-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">My trips</h1>
          <p className="mt-1 text-navy-600">{trips.length} trips planned.</p>
        </div>
        <Link href="/trips/new" className="rounded-full bg-navy px-5 py-2 text-sm font-medium text-sand hover:bg-navy-800">New trip</Link>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {trips.map((t) => {
          const spent = t.expenses.reduce((s, e) => s + e.amountCents, 0);
          return (
            <Link key={t.id} href={`/trips/${t.id}`} className="overflow-hidden rounded-3xl bg-white transition hover:shadow-lg">
              <div className="relative h-48 bg-navy">
                {t.coverUrl && <Image src={t.coverUrl} alt="" fill sizes="600px" className="object-cover" />}
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl">{t.title}</h2>
                <p className="text-sm text-navy-600">{t.destination} · {range(t.startDate, t.endDate)}</p>
                <p className="mt-3 text-sm">{money(spent, t.currency)} spent of {money(t.budgetCents, t.currency)}</p>
                <div className="mt-2 h-2 rounded-full bg-sand">
                  <div className="h-2 rounded-full bg-navy" style={{ width: `${t.budgetCents ? Math.min(100, (spent / t.budgetCents) * 100) : 0}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}