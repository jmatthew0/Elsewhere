import Link from "next/link";
import Money from "@/components/Money";
import { getRecentExpenses, getTrips } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [trips, expenses] = await Promise.all([getTrips(), getRecentExpenses()]);
  const currencies = [...new Set(trips.map((t) => t.currency))];
  const rates: Record<string, number> = Object.fromEntries(
    await Promise.all(currencies.map(async (c) => [c, (await getRateToPhp(c)).rate]))
  );
  const totalPhp = trips.reduce((s, t) => s + t.expenses.reduce((x, e) => x + e.amountCents, 0) * rates[t.currency], 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Expenses</h1>
          <p className="mt-1 text-navy-600">Everything you've spent, across all trips.</p>
        </div>
        <div className="rounded-2xl bg-navy px-5 py-3 text-sand">
          <p className="text-xs text-sand-400">Total spent (in pesos)</p>
          <p className="text-xl font-medium">{money(Math.round(totalPhp), "PHP")}</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {trips.map((t) => {
          const spent = t.expenses.reduce((s, e) => s + e.amountCents, 0);
          return (
            <Link key={t.id} href={`/trips/${t.id}`} className="rounded-3xl bg-white p-5">
              <h2 className="font-display text-xl">{t.title}</h2>
              <div className="mt-3 flex justify-between text-sm">
                <span>Spent</span><Money cents={spent} cur={t.currency} rate={rates[t.currency]} />
              </div>
              <div className="mt-1 flex justify-between text-sm text-navy-600">
                <span>Budget</span><span>{money(t.budgetCents, t.currency)}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-sand">
                <div className="h-2 rounded-full bg-navy" style={{ width: `${t.budgetCents ? Math.min(100, (spent / t.budgetCents) * 100) : 0}%` }} />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl mb-3">Recent transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-navy-600">
              <tr><th className="py-2 font-normal">What</th><th className="font-normal">Trip</th><th className="font-normal">Date</th><th className="font-normal">Paid by</th><th className="text-right font-normal">Amount</th></tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-sand">
                  <td className="py-3"><p className="font-medium">{e.title}</p><p className="text-xs text-navy-600">{e.category}</p></td>
                  <td>{e.trip.title}</td>
                  <td>{e.spentOn.toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</td>
                  <td>{e.payer.name}</td>
                  <td className="text-right"><Money cents={e.amountCents} cur={e.trip.currency} rate={rates[e.trip.currency]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}