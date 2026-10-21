import Link from "next/link";
import Money from "@/components/Money";
import { Donut, LineChart } from "@/components/charts";
import { getRecentExpenses, getTrips } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";

export const dynamic = "force-dynamic";

const card = "rounded-3xl bg-white p-5 shadow-sm";
const peso = (n: number) => money(Math.round(n * 100), "PHP");

export default async function ExpensesPage() {
  const [trips, recent] = await Promise.all([getTrips(), getRecentExpenses()]);
  const rates: Record<string, number> = Object.fromEntries(
    await Promise.all([...new Set(trips.map((t) => t.currency))].map(async (c) => [c, (await getRateToPhp(c)).rate]))
  );
  const all = trips.flatMap((t) => t.expenses.map((e) => ({ ...e, php: (e.amountCents / 100) * rates[t.currency] })));
  const total = all.reduce((s, e) => s + e.php, 0);
  const budget = trips.reduce((s, t) => s + (t.budgetCents / 100) * rates[t.currency], 0);

  const byCat: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  for (const e of all) {
    byCat[e.category] = (byCat[e.category] ?? 0) + e.php;
    const k = e.spentOn.toISOString().slice(0, 10);
    byDay[k] = (byDay[k] ?? 0) + e.php;
  }
  const cats = Object.entries(byCat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const days = Object.keys(byDay).sort().map((k) => ({
    label: new Date(k).toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" }),
    value: byDay[k],
  }));

  const stats = [
    { label: "Total spent", value: peso(total) },
    { label: "Total budget", value: peso(budget) },
    { label: budget >= total ? "Remaining" : "Over budget by", value: peso(Math.abs(budget - total)) },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Expenses</h1>
        <p className="text-navy-600">Everything you've spent across your trips, shown in pesos.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={card}>
            <p className="text-sm text-navy-600">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2`}>
          <h2 className="font-display text-xl mb-4">Spending analysis</h2>
          <LineChart points={days} />
        </div>
        <div className={card}>
          <h2 className="font-display text-xl mb-4">Category breakdown</h2>
          {cats.length ? <Donut data={cats} /> : <p className="text-sm text-navy-600">No expenses yet. Log one from a trip page.</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {trips.map((t) => {
          const spent = t.expenses.reduce((s, e) => s + e.amountCents, 0);
          return (
            <Link key={t.id} href={`/trips/${t.id}`} className={card}>
              <h2 className="font-display text-xl">{t.title}</h2>
              <div className="mt-3 flex justify-between text-sm"><span>Spent</span><Money cents={spent} cur={t.currency} rate={rates[t.currency]} /></div>
              <div className="mt-1 flex justify-between text-sm text-navy-600"><span>Budget</span><span>{money(t.budgetCents, t.currency)}</span></div>
              <div className="mt-3 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-navy" style={{ width: `${t.budgetCents ? Math.min(100, (spent / t.budgetCents) * 100) : 0}%` }} /></div>
            </Link>
          );
        })}
      </section>

      <section className={card}>
        <h2 className="font-display text-xl mb-3">Recent transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-navy-600"><tr><th className="py-2 font-normal">What</th><th className="font-normal">Trip</th><th className="font-normal">Date</th><th className="font-normal">Paid by</th><th className="text-right font-normal">Amount</th></tr></thead>
            <tbody>
              {recent.map((e) => (
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