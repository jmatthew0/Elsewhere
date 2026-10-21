import { createTrip } from "@/lib/actions";
import { field, label, button, CURRENCIES, COUNTRIES } from "@/lib/ui";

export default function NewTripPage() {
  return (
    <div className="max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-4xl">New trip</h1>
        <p className="mt-1 text-navy-600">Set the basics now. You can add stops and expenses after.</p>
      </header>
      <form action={createTrip} className="grid gap-4 rounded-3xl bg-white p-6">
        <label className={label}>Trip name
          <input name="title" required placeholder="Anniversary in Italy" className={field} />
        </label>
        <label className={label}>Destination
          <input name="destination" required placeholder="Rome and Tuscany" className={field} />
        </label>
        <label className={label}>Country
          <input name="country" list="countries" placeholder="Italy" className={field} />
          <datalist id="countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={label}>Start date
            <input type="date" name="startDate" required className={field} />
          </label>
          <label className={label}>End date
            <input type="date" name="endDate" required className={field} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className={label}>Currency you'll spend
            <select name="currency" defaultValue="PHP" className={field}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={label}>Budget
            <input name="budget" type="number" min="0" step="0.01" placeholder="3400" className={field} />
          </label>
        </div>
        <button className={`${button} justify-self-start`}>Create trip</button>
      </form>
    </div>
  );
}