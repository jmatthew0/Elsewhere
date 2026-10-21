"use client";
import { useActionState, useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { createTrip } from "@/lib/actions";
import { field, label, CURRENCIES, COUNTRIES } from "@/lib/ui";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&q=60`;
const covers = [
  { v: "map", name: "Map of your destination", src: null },
  { v: "tuscany", name: "Countryside", src: photo("photo-1529260830199-42c24126f198") },
  { v: "coast", name: "Coast", src: photo("photo-1570077188670-e3a8d69ac5ff") },
  { v: "temples", name: "Temples", src: photo("photo-1493976040374-85c8e12f0c0e") },
  { v: "city", name: "City", src: photo("photo-1552832230-c0197dd311b5") },
];

export default function NewTripForm() {
  const [state, action, pending] = useActionState(createTrip, undefined);
  const [start, setStart] = useState("");
  const v = state?.values ?? {};

  return (
    <form action={action} className="grid gap-5 rounded-2xl border border-sand-400/40 bg-white p-6">
      {state?.error && <p role="alert" className="rounded-lg bg-sand px-4 py-3 text-sm">{state.error}</p>}

      <label className={label}>Trip name
        <input name="title" required defaultValue={v.title} placeholder="Anniversary in Italy" className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Destination
          <input name="destination" required defaultValue={v.destination} placeholder="Rome and Tuscany" className={field} />
        </label>
        <label className={label}>Country
          <input name="country" list="countries" defaultValue={v.country} placeholder="Italy" className={field} />
          <datalist id="countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Start date
          <input type="date" name="startDate" required defaultValue={v.startDate} onChange={(e) => setStart(e.target.value)} className={field} />
        </label>
        <label className={label}>End date
          <input type="date" name="endDate" required min={start || undefined} defaultValue={v.endDate} className={field} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Currency you'll spend
          <select name="currency" defaultValue={v.currency ?? "PHP"} className={field}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className={label}>Budget
             <input name="budget" type="number" min="0" max="10000000" step="0.01" defaultValue={v.budget} placeholder="3400" className={field} />
           </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm text-navy-600">Cover</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {covers.map((c) => (
            <label key={c.v} className="cursor-pointer text-center text-xs">
              <input type="radio" name="cover" value={c.v} defaultChecked={(v.cover ?? "map") === c.v} className="peer sr-only" />
              <span className="relative block h-20 overflow-hidden rounded-xl bg-sand ring-offset-2 peer-checked:ring-2 peer-checked:ring-navy peer-focus-visible:ring-2 peer-focus-visible:ring-navy">
                {c.src ? <Image src={c.src} alt="" fill sizes="150px" className="object-cover" /> : <span className="grid h-full place-items-center"><MapPin className="h-6 w-6" aria-hidden /></span>}
              </span>
              <span className="mt-1 block text-navy-600">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button disabled={pending} className="justify-self-start rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50">
        {pending ? "Creating…" : "Create Trip"}
      </button>
    </form>
  );
}