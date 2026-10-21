import { addReservation } from "@/lib/actions";
import { field, label, button } from "@/lib/ui";

export default function ReservationForm({ tripId }: { tripId: string }) {
  return (
    <details className="rounded-3xl bg-white p-5">
      <summary className="cursor-pointer font-display text-xl">Add a reservation</summary>
      <form action={addReservation} className="mt-4 grid gap-3">
        <input type="hidden" name="tripId" value={tripId} />
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Type
            <select name="kind" className={field}>{["Flight", "Hotel", "Activity", "Other"].map((k) => <option key={k}>{k}</option>)}</select>
          </label>
          <label className={label}>Status
            <select name="status" defaultValue="BOOKED" className={field}>{["BOOKED", "CONFIRMED", "PAID", "PENDING"].map((s) => <option key={s}>{s}</option>)}</select>
          </label>
        </div>
        <label className={label}>Title
          <input name="title" required placeholder="Flight to Rome (FCO)" className={field} />
        </label>
        <label className={label}>Details
          <input name="details" placeholder="Air Transat · 9h 45m" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Date
            <input type="date" name="date" className={field} />
          </label>
          <label className={label}>Confirmation number
            <input name="reference" placeholder="ABC123" className={field} />
          </label>
        </div>
        <label className={label}>Cost (optional)
          <input type="number" name="cost" min="0" max="10000000" step="0.01" placeholder="0" className={field} />
        </label>
        <button className={`${button} justify-self-start`}>Save reservation</button>
      </form>
    </details>
  );
}