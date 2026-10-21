import { logExpense } from "@/lib/actions";
import { field, label, button } from "@/lib/ui";

type Person = { id: string; name: string | null };

export default function LogExpenseForm({ tripId, cur, members, activities }: {
  tripId: string; cur: string; members: Person[]; activities: { id: string; title: string }[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <details className="rounded-3xl bg-white p-5">
      <summary className="cursor-pointer font-display text-xl">Log an expense</summary>
      <form action={logExpense} className="mt-4 grid gap-3">
        <input type="hidden" name="tripId" value={tripId} />
        <label className={label}>What was it for?
          <input name="title" required placeholder="Taxi to hotel" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Amount ({cur})
            <input type="number" name="amount" min="0.01" step="0.01" required className={field} />
          </label>
          <label className={label}>Category
            <select name="category" className={field}>
              {["Transport", "Stay", "Dining", "Activities", "Shopping", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label className={label}>Who paid?
          <select name="payerId" className={field}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <fieldset className="grid gap-1 text-sm text-navy-600">
          <legend>Split equally between</legend>
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-navy">
              <input type="checkbox" name="splitWith" value={m.id} defaultChecked /> {m.name}
            </label>
          ))}
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className={label}>Date
            <input type="date" name="spentOn" defaultValue={today} className={field} />
          </label>
          <label className={label}>Linked stop
            <select name="activityId" className={field}>
              <option value="">None</option>
              {activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </label>
        </div>
        <button className={`${button} justify-self-start`}>Log expense</button>
      </form>
    </details>
  );
}