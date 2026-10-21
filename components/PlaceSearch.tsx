"use client";
import { useEffect, useState } from "react";
import { savePlace } from "@/lib/actions";
import { field, label, button } from "@/lib/ui";

type Hit = { id: string; name: string; sub: string; lat: number; lng: number };
const CATEGORIES = ["Sight", "Food", "Stay", "Neighborhood", "Activity", "Other"];

export default function PlaceSearch({ trips = [], tripId }: { trips?: { id: string; title: string }[]; tripId?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [picked, setPicked] = useState<Hit | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || picked || q.trim().length < 3) { setHits([]); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodeURIComponent(q)}&limit=5&access_token=${token}`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error("search failed");
        const json = await res.json();
        setHits(
          (json.features ?? []).map((f: any) => ({
            id: f.properties.mapbox_id ?? f.id,
            name: f.properties.name,
            sub: f.properties.place_formatted ?? f.properties.full_address ?? "",
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
          }))
        );
        setError("");
      } catch (e: any) {
        if (e.name !== "AbortError") setError("Search isn't working. Check your Mapbox token in .env and restart the app.");
      }
    }, 400);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q, picked, token]);

  return (
    <div className="rounded-3xl bg-white p-5">
      <h2 className="font-display text-xl">Add a place</h2>
      {!token && <p className="mt-2 text-sm text-navy-600">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env to search for places.</p>}
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setPicked(null); }}
        placeholder="Search for a landmark, restaurant or hotel"
        className={`${field} mt-3`}
        disabled={!token}
      />
      {error && <p className="mt-2 text-sm text-sand-600">{error}</p>}

      {hits.length > 0 && (
        <ul className="mt-2 divide-y divide-sand rounded-xl border border-sand-400">
          {hits.map((h) => (
            <li key={h.id}>
              <button type="button" onClick={() => { setPicked(h); setQ(h.name); setHits([]); }} className="w-full px-3 py-2 text-left hover:bg-sand-200">
                <p className="font-medium">{h.name}</p>
                <p className="text-sm text-navy-600">{h.sub}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!picked && q.trim().length >= 3 && hits.length === 0 && token && !error && (
        <p className="mt-2 text-sm text-navy-600">No results yet. Try adding the city, like “Colosseum Rome”.</p>
      )}

      {picked && (
        <form
          className="mt-4 grid gap-3"
          action={async (fd) => {
            setSaving(true);
            try { await savePlace(fd); setPicked(null); setQ(""); setError(""); }
            catch { setError("Couldn't save that place. Try again."); }
            finally { setSaving(false); }
          }}
        >
          <p className="text-sm"><span className="font-medium">{picked.name}</span> <span className="text-navy-600">{picked.sub}</span></p>
          <input type="hidden" name="name" value={picked.name} />
          <input type="hidden" name="lat" value={picked.lat} />
          <input type="hidden" name="lng" value={picked.lng} />
          {tripId ? (
            <input type="hidden" name="tripId" value={tripId} />
          ) : (
            <label className={label}>Save to trip
              <select name="tripId" className={field}>{trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
            </label>
          )}
          <label className={label}>Category
            <select name="category" className={field}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <button disabled={saving} className={`${button} justify-self-start disabled:opacity-50`}>{saving ? "Saving…" : "Save place"}</button>
        </form>
      )}
    </div>
  );
}