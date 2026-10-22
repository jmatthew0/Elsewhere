import Link from "next/link";
import { notFound } from "next/navigation";
import EditReservationForm from "@/components/EditReservationForm";
import { db } from "@/lib/prisma";
import { getTrip } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.reservation.findUnique({ where: { id } });
  if (!r) notFound();
  const trip = await getTrip(r.tripId); // also checks you belong to this trip
  if (!trip) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Link href={`/trips/${trip.id}`} className="text-xs font-semibold tracking-wide text-navy-600 hover:text-navy">← BACK TO {trip.title.toUpperCase()}</Link>
        <h1 className="mt-2 font-display text-3xl">Edit reservation</h1>
      </header>
      <EditReservationForm
        cur={trip.currency}
        r={{
          id: r.id,
          kind: r.kind,
          status: r.status,
          title: r.title,
          details: r.details ?? "",
          date: r.date ? r.date.toISOString().slice(0, 10) : "",
          reference: r.reference ?? "",
          cost: r.costCents ? String(r.costCents / 100) : "",
        }}
      />
    </div>
  );
}