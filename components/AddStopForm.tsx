import { addActivity } from "@/lib/actions";
import { field, label, button } from "@/lib/ui";

export default function AddStopForm({ tripId, days, places }: { tripId: string; days: number; places: { id: string; name: string }[] }) {
  return (
    <details className="rounded-3xl bg-white p-5">
      <summary className="cursor-pointer font-display text-xl">Add a stop</summary>
      <form action={addActivity} className="mt-4 grid gap-3">
        <input type="hidden" name="tripId" value={tripId} />
        <label className={label}>What are you doing?
          <input name="title" required placeholder="Dinner in Trastevere" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Day
            <input type="number" name="day" min={1} max={days} defaultValue={1} required className={field} />
          </label>
          <label className={label}>Time
            <input type="time" name="startsAt" className={field} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Estimated cost
            <input type="number" name="estimate" min="0" step="0.01" placeholder="0" className={field} />
          </label>
          <label className={label}>Place
            <select name="placeId" className={field}>
              <option value="">No place</option>
              {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
        <button className={`${button} justify-self-start`}>Add stop</button>
      </form>
    </details>
  );
}