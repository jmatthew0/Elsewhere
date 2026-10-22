import { updateExpense } from "@/lib/actions";
import { field, label, button } from "@/lib/ui";

type Person = { id: string; name: string | null };
type E = { id: string; title: string; amount: string; category: string; payerId: string; date: string; activityId: string; splitWith: string[] };

export default function EditExpenseForm({ e, cur, members, activities }: { e: E; cur: string; members: Person[]; activities: { id: string; title: string }[] }) {
  return (
    <form action={updateExpense} className="grid gap-4 rounded-2xl border border-sand-400/40 bg-white p-6">
      <input type="hidden" name="id" value={e.id} />
      <label className={label}>What was it for?
        <input name="title" required defaultValue={e.title} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>Amount ({cur})
          <input type="number" name="amount" min="0.01" max="10000000" step="0.01" required defaultValue={e.amount} className={field} />
        </label>
        <label className={label}>Category
          <select name="category" defaultValue={e.category} className={field}>
            {["Transport", "Stay", "Dining", "Activities", "Shopping", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label className={label}>Who paid?
        <select name="payerId" defaultValue={e.payerId} className={field}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      <fieldset className="grid gap-1 text-sm text-navy-600">
        <legend>Split equally between</legend>
        {members.map((m) => (
          <label key={m.id} className="flex items-center gap-2 text-navy">
            <input type="checkbox" name="splitWith" value={m.id} defaultChecked={e.splitWith.includes(m.id)} /> {m.name}
          </label>
        ))}
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>Date
          <input type="date" name="spentOn" defaultValue={e.date} className={field} />
        </label>
        <label className={label}>Linked stop
          <select name="activityId" defaultValue={e.activityId} className={field}>
            <option value="">None</option>
            {activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </label>
      </div>
      <button className={`${button} justify-self-start`}>Save changes</button>
    </form>
  );
}