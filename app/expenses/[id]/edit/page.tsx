import Link from "next/link";
import { notFound } from "next/navigation";
import EditExpenseForm from "@/components/EditExpenseForm";
import { db } from "@/lib/prisma";
import { getTrip } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await db.expense.findUnique({ where: { id }, include: { splits: true } });
  if (!e) notFound();
  const trip = await getTrip(e.tripId); // also checks you belong to this trip
  if (!trip) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Link href={`/expenses?trip=${trip.id}`} className="text-xs font-semibold tracking-wide text-navy-600 hover:text-navy">← BACK TO EXPENSES</Link>
        <h1 className="mt-2 font-display text-3xl">Edit expense</h1>
        <p className="text-sm text-navy-600">{trip.title}</p>
      </header>
      <EditExpenseForm
        cur={trip.currency}
        members={trip.members.map((m) => m.user)}
        activities={trip.activities}
        e={{
          id: e.id,
          title: e.title,
          amount: (e.amountCents / 100).toFixed(2),
          category: e.category,
          payerId: e.payerId,
          date: e.spentOn.toISOString().slice(0, 10),
          activityId: e.activityId ?? "",
          splitWith: e.splits.map((s) => s.userId),
        }}
      />
    </div>
  );
}