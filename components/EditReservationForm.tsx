import { updateReservation } from "@/lib/actions";
import { field, label, button } from "@/lib/ui";

type R = { id: string; kind: string; status: string; title: string; details: string; date: string; reference: string; cost: string };

export default function EditReservationForm({ r, cur }: { r: R; cur: string }) {
  return (
    <form action={updateReservation} className="grid gap-4 rounded-2xl border border-sand-400/40 bg-white p-6">
      <input type="hidden" name="id" value={r.id} />
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>Type
          <select name="kind" defaultValue={r.kind} className={field}>{["Flight", "Hotel", "Activity", "Other"].map((k) => <option key={k}>{k}</option>)}</select>
        </label>
        <label className={label}>Status
          <select name="status" defaultValue={r.status} className={field}>{["BOOKED", "CONFIRMED", "PAID", "PENDING"].map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      </div>
      <label className={label}>Title
        <input name="title" required defaultValue={r.title} className={field} />
      </label>
      <label className={label}>Details
        <input name="details" defaultValue={r.details} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>Date
          <input type="date" name="date" defaultValue={r.date} className={field} />
        </label>
        <label className={label}>Confirmation number
          <input name="reference" defaultValue={r.reference} className={field} />
        </label>
      </div>
      <label className={label}>Cost ({cur}, optional)
        <input type="number" name="cost" min="0" max="10000000" step="0.01" defaultValue={r.cost} className={field} />
      </label>
      <button className={`${button} justify-self-start`}>Save changes</button>
    </form>
  );
}