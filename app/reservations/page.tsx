import Link from "next/link";
import { CalendarCheck, Clock, Wallet } from "lucide-react";
import Reservations from "@/components/Reservations";
import { getReservations, getTrips } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-sand-400/40 bg-white p-5";
const STATUSES = ["ALL", "BOOKED", "CONFIRMED", "PAID", "PENDING"];

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "ALL" } = await searchParams;
  const [trips, all] = await Promise.all([getTrips(), getReservations()]);

  if (all.length === 0)
    return (
      <div className={`${card} max-w-lg`}>
        <h1 className="font-display text-3xl">Reservations</h1>
        <p className="mt-2 text-navy-600">No bookings yet. Open a trip and use <strong>Add a reservation</strong> to save a flight or hotel.</p>
        <Link href="/trips" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white">Go to my trips</Link>
      </div>
    );

  const rates: Record<string, number> = Object.fromEntries(
    await Promise.all([...new Set(trips.map((t) => t.currency))].map(async (c) => [c, (await getRateToPhp(c)).rate]))
  );
  const now = new Date();
  const shown = status === "ALL" ? all : all.filter((r) => r.status === status);
  const upcoming = all.filter((r) => r.date && r.date >= now).length;
  const totalPhp = all.reduce((s, r) => s + r.costCents * (rates[r.trip.currency] ?? 1), 0);
  const groups = trips.map((t) => ({ trip: t, items: shown.filter((r) => r.tripId === t.id) })).filter((g) => g.items.length > 0);

  const stats = [
    { label: "BOOKINGS", value: String(all.length), Icon: CalendarCheck },
    { label: "UPCOMING", value: String(upcoming), Icon: Clock },
    { label: "TOTAL COST (PESOS)", value: money(Math.round(totalPhp), "PHP"), Icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Reservations</h1>
        <p className="text-sm text-navy-600">Every flight, hotel and booking across your trips.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className={card}>
            <div className="flex items-center justify-between"><p className="text-[10px] font-semibold tracking-wider text-navy-600">{label}</p><Icon className="h-4 w-4 text-navy-600" aria-hidden /></div>
            <p className="mt-3 font-display text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <Link key={s} href={`/reservations?status=${s}`} className={`rounded-full px-4 py-1.5 ${status === s ? "bg-navy text-white" : "border border-sand-400/40 bg-white text-navy-600 hover:text-navy"}`}>
            {s === "ALL" ? "All" : s[0] + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </nav>

      {groups.length === 0 ? (
        <p className="text-sm text-navy-600">No reservations with that status.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map(({ trip, items }) => (
            <div key={trip.id}>
              <Link href={`/trips/${trip.id}`} className="mb-2 block text-xs font-semibold tracking-wide text-navy-600 hover:text-navy">VIEW TRIP →</Link>
              <Reservations title={trip.title} items={items} cur={trip.currency} rate={rates[trip.currency] ?? 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}