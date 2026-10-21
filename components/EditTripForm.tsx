"use client";
import { useActionState, useState } from "react";
import Image from "next/image";
import { MapPin, ImageIcon } from "lucide-react";
import { updateTrip } from "@/lib/actions";
import { field, label, COUNTRIES } from "@/lib/ui";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&q=60`;
const covers = [
  { v: "keep", name: "Keep current", src: null },
  { v: "map", name: "Map of destination", src: null },
  { v: "tuscany", name: "Countryside", src: photo("photo-1529260830199-42c24126f198") },
  { v: "coast", name: "Coast", src: photo("photo-1570077188670-e3a8d69ac5ff") },
  { v: "temples", name: "Temples", src: photo("photo-1493976040374-85c8e12f0c0e") },
  { v: "city", name: "City", src: photo("photo-1552832230-c0197dd311b5") },
];

type Trip = { id: string; title: string; destination: string; country: string; startDate: string; endDate: string; budget: string; currency: string };

export default function EditTripForm({ trip }: { trip: Trip }) {
  const [state, action, pending] = useActionState(updateTrip, undefined);
  const [start, setStart] = useState(trip.startDate);
  const v = { ...trip, ...(state?.values ?? {}) };

  return (
    <form action={action} className="grid gap-5 rounded-2xl border border-sand-400/40 bg-white p-6">
      <input type="hidden" name="id" value={trip.id} />
      {state?.error && <p role="alert" className="rounded-lg bg-sand px-4 py-3 text-sm">{state.error}</p>}

      <label className={label}>Trip name
        <input name="title" required defaultValue={v.title} className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Destination
          <input name="destination" required defaultValue={v.destination} className={field} />
        </label>
        <label className={label}>Country
          <input name="country" list="countries" defaultValue={v.country} className={field} />
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
        <label className={label}>Budget ({trip.currency})
          <input name="budget" type="number" min="0" max="10000000" step="0.01" defaultValue={v.budget} className={field} />
        </label>
        <div className={label}>Currency
          <p className="rounded-xl bg-sand-200 px-3 py-2 text-navy">{trip.currency}</p>
          <span className="text-xs">Fixed once a trip is created, so existing amounts stay correct.</span>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm text-navy-600">Cover</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {covers.map((c) => (
            <label key={c.v} className="cursor-pointer text-center text-xs">
              <input type="radio" name="cover" value={c.v} defaultChecked={c.v === "keep"} className="peer sr-only" />
              <span className="relative block h-16 overflow-hidden rounded-xl bg-sand ring-offset-2 peer-checked:ring-2 peer-checked:ring-navy peer-focus-visible:ring-2 peer-focus-visible:ring-navy">
                {c.src ? <Image src={c.src} alt="" fill sizes="120px" className="object-cover" /> : <span className="grid h-full place-items-center">{c.v === "keep" ? <ImageIcon className="h-5 w-5" aria-hidden /> : <MapPin className="h-5 w-5" aria-hidden />}</span>}
              </span>
              <span className="mt-1 block text-navy-600">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button disabled={pending} className="justify-self-start rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50">
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}