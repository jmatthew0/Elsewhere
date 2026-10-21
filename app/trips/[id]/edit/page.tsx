import Link from "next/link";
import { notFound } from "next/navigation";
import EditTripForm from "@/components/EditTripForm";
import ConfirmDelete from "@/components/ConfirmDelete";
import { getTrip } from "@/lib/queries";
import { deleteTrip } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Link href={`/trips/${trip.id}`} className="text-xs font-semibold tracking-wide text-navy-600 hover:text-navy">← BACK TO TRIP</Link>
        <h1 className="mt-2 font-display text-3xl">Edit Trip</h1>
      </header>

      <EditTripForm
        trip={{
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          country: trip.country ?? "",
          startDate: trip.startDate.toISOString().slice(0, 10),
          endDate: trip.endDate.toISOString().slice(0, 10),
          budget: String(trip.budgetCents / 100),
          currency: trip.currency,
        }}
      />

      <section className="rounded-2xl border border-sand-400/40 bg-white p-6">
        <h2 className="text-sm font-semibold">Delete this trip</h2>
        <p className="mt-1 text-sm text-navy-600">This also removes its stops, places and expenses. It can't be undone.</p>
        <div className="mt-4">
          <ConfirmDelete action={deleteTrip} fields={{ id: trip.id }} what="this whole trip" label="Delete Trip" className="rounded-lg border border-navy px-4 py-2 text-sm font-medium hover:bg-sand-200" />
        </div>
      </section>
    </div>
  );
}