import Link from "next/link";
import { notFound } from "next/navigation";
import { Wallet, Target, CalendarDays, ArrowLeftRight, PiggyBank, Car, Bed, Utensils, Ticket, ShoppingBag, Receipt, Plus, type LucideIcon } from "lucide-react";
import Money from "@/components/Money";
import LogExpenseForm from "@/components/LogExpenseForm";
import { Donut, LineChart, HBars } from "@/components/charts";
import { getCurrentUser, getTrip, getTrips } from "@/lib/queries";
import { getRateToPhp, money } from "@/lib/currency";
import { balances } from "@/lib/balances";
import { initials } from "@/lib/ui";
import ConfirmDelete from "@/components/ConfirmDelete";
import { deleteExpense } from "@/lib/actions";

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-sand-400/40 bg-white p-5";
const label = "text-[10px] font-semibold tracking-wider text-navy-600";
const ICONS: Record<string, LucideIcon> = { Transport: Car, Stay: Bed, Dining: Utensils, Activities: Ticket, Shopping: ShoppingBag, Other: Receipt };
const dmy = (d: Date) => d.toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ trip?: string; view?: string; log?: string }> }) {
  const { trip: tripParam, view = "daily", log } = await searchParams;
  const trips = await getTrips();
  if (trips.length === 0)
    return (
      <div className={`${card} max-w-lg`}>
        <h1 className="font-display text-3xl">Expenses & Budget</h1>
        <p className="mt-2 text-navy-600">Plan a trip first, then log what you spend.</p>
        <Link href="/trips/new" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white">New Trip</Link>
      </div>
    );

  const now = new Date();
  const pick = trips.find((t) => t.id === tripParam) ?? trips.find((t) => t.endDate >= now) ?? trips[0];
  const [trip, user] = await Promise.all([getTrip(pick.id), getCurrentUser()]);
  if (!trip) notFound();

  const cur = trip.currency;
  const { rate } = await getRateToPhp(cur);
  const actual = trip.expenses.reduce((s, e) => s + e.amountCents, 0);
  const est = trip.activities.reduce((s, a) => s + a.estimatedCents, 0);
  const tripDays = Math.round((trip.endDate.getTime() - trip.startDate.getTime()) / 864e5) + 1;
  const remaining = trip.budgetCents - actual;
  const usedPct = trip.budgetCents ? Math.round(Math.min(100, (actual / trip.budgetCents) * 100)) : 0;
  const net = balances(trip.expenses);
  const mine = user ? net[user.id] ?? 0 : 0;
  const names = Object.fromEntries(trip.members.map((m) => [m.user.id, m.user.name ?? "Traveler"]));

  const byCat: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  for (const e of trip.expenses) {
    byCat[e.category] = (byCat[e.category] ?? 0) + e.amountCents / 100;
    const k = e.spentOn.toISOString().slice(0, 10);
    byDay[k] = (byDay[k] ?? 0) + e.amountCents / 100;
  }
  const cats = Object.entries(byCat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const days = Object.keys(byDay).sort().map((k) => ({ label: dmy(new Date(k)).replace(/ \d{4}$/, ""), value: byDay[k] }));
  const rows = [...trip.expenses].sort((a, b) => +b.spentOn - +a.spentOn).slice(0, 10);

  const baseline = est > 0 ? est : trip.budgetCents;
  const saved = baseline - actual;
  const solo = trip.members.length < 2;
  const href = (q: string) => `/expenses?trip=${trip.id}${q}`;

  const stats = [
    { label: "TOTAL SPENT", Icon: Wallet, value: <Money cents={actual} cur={cur} rate={rate} />, note: `${usedPct}% of budget used` },
    { label: "REMAINING", Icon: Target, value: <Money cents={Math.abs(remaining)} cur={cur} rate={rate} />, note: remaining >= 0 ? "Left in budget" : "Over budget", bar: usedPct },
    { label: "DAILY AVERAGE", Icon: CalendarDays, value: <Money cents={Math.round(actual / tripDays)} cur={cur} rate={rate} />, note: `Planned: ${money(Math.round(trip.budgetCents / tripDays), cur)}` },
    {
      label: "SETTLEMENTS", Icon: ArrowLeftRight,
      value: solo ? <span>—</span> : mine === 0 ? <span>Settled up</span> : <Money cents={Math.abs(mine)} cur={cur} rate={rate} />,
      note: solo ? "Just you on this trip" : mine > 0 ? "You are owed" : mine < 0 ? "You owe" : "Everyone is even",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Expenses & Budget</h1>
          <p className="text-sm text-navy-600">Managing spending for {trip.title}</p>
        </div>
        <Link href={href("&log=1#log")} className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
          <Plus className="h-4 w-4" aria-hidden /> Log Expense
        </Link>
      </header>

      {trips.length > 1 && (
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Choose a trip">
          {trips.map((t) => (
            <Link key={t.id} href={`/expenses?trip=${t.id}`} className={`rounded-full px-4 py-1.5 ${t.id === trip.id ? "bg-navy text-white" : "bg-white text-navy-600 hover:text-navy border border-sand-400/40"}`}>{t.title}</Link>
          ))}
        </nav>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label: l, Icon, value, note, bar }) => (
          <div key={l} className={card}>
            <div className="flex items-center justify-between"><p className={label}>{l}</p><Icon className="h-4 w-4 text-navy-600" aria-hidden /></div>
            <p className="mt-3 font-display text-2xl">{value}</p>
            {bar !== undefined && <div className="mt-2 h-1.5 rounded-full bg-sand"><div className="h-1.5 rounded-full bg-navy" style={{ width: `${bar}%` }} /></div>}
            <p className="mt-2 text-xs text-navy-600">{note}</p>
          </div>
        ))}
      </section>

      {log && (
        <div id="log">
          <LogExpenseForm open tripId={trip.id} cur={cur} members={trip.members.map((m) => m.user)} activities={trip.activities} />
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Spending Analysis</h2>
            <div className="flex gap-1 rounded-lg bg-sand-200 p-1 text-xs">
              {[["category", "Category"], ["daily", "Daily"]].map(([k, l]) => (
                <Link key={k} href={href(`&view=${k}`)} className={`rounded-md px-3 py-1 ${view === k ? "bg-white font-medium shadow-sm" : "text-navy-600"}`}>{l}</Link>
              ))}
            </div>
          </div>
          {trip.expenses.length === 0 ? (
            <p className="text-sm text-navy-600">No expenses yet. Use Log Expense to add the first one.</p>
          ) : view === "category" ? (
            <HBars data={cats} fmt={(n) => money(Math.round(n * 100), cur)} />
          ) : (
            <LineChart points={days} />
          )}
        </div>
        <div className={card}>
          <h2 className="mb-4 text-sm font-semibold">Category Breakdown</h2>
          {cats.length ? <Donut data={cats} /> : <p className="text-sm text-navy-600">Nothing to break down yet.</p>}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold">Recent Transactions</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-navy-600">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className={label}><th className="py-2 font-semibold">TRANSACTION</th><th className="font-semibold">CATEGORY</th><th className="font-semibold">DATE</th><th className="font-semibold">PAID BY</th><th className="text-right font-semibold">AMOUNT</th><th></th></tr></thead>
              <tbody>
                {rows.map((e) => {
                  const Icon = ICONS[e.category] ?? Receipt;
                  return (
                    <tr key={e.id} className="border-t border-sand">
                      <td className="py-3"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-sand"><Icon className="h-4 w-4" aria-hidden /></span><span className="font-medium">{e.title}</span></span></td>
                      <td className="text-navy-600">{e.category}</td>
                      <td className="text-navy-600">{dmy(e.spentOn)}</td>
                      <td><span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-sand text-[9px] font-semibold">{initials(names[e.payerId])}</span>{names[e.payerId]}</span></td>
                      <td className="text-right font-medium"><Money cents={e.amountCents} cur={cur} rate={rate} /></td>
                      <td className="pl-3"><span className="flex items-center justify-end gap-3 whitespace-nowrap text-xs"><Link href={`/expenses/${e.id}/edit`} className="text-navy-600 underline">Edit</Link><ConfirmDelete action={deleteExpense} fields={{ id: e.id }} what="this expense" className="text-xs text-navy-600 underline" /></span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-navy p-6 text-white">
          <h2 className="font-display text-2xl">Log expenses as you go</h2>
          <p className="mt-2 max-w-sm text-sm text-sand-400">Add each cost when it happens. The budget, the split and settlements update right away.</p>
          <Link href={href("&log=1#log")} className="mt-5 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-sand">Log Expense</Link>
        </div>
        <div className={`${card} flex items-center gap-4`}>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sand"><PiggyBank className="h-7 w-7" aria-hidden /></span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Budget Goal</h2>
              <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${remaining >= 0 ? "bg-navy text-white" : "bg-sand-400 text-navy"}`}>{remaining >= 0 ? "ON TRACK" : "OVER BUDGET"}</span>
            </div>
            <p className="mt-1 text-sm text-navy-600">
              {saved >= 0 ? `You're ${money(saved, cur)} under your ${est > 0 ? "estimate" : "budget"}.` : `You're ${money(-saved, cur)} over your ${est > 0 ? "estimate" : "budget"}.`}
            </p>
            <p className="text-xs text-navy-600">{money(actual, cur)} spent of {money(trip.budgetCents, cur)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}