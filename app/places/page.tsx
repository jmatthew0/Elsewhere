import Image from "next/image";
import TripMap from "@/components/TripMap";
import PlaceSearch from "@/components/PlaceSearch";
import { getTrips } from "@/lib/queries";
import { removePlace } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PlacesPage() {
  const trips = await getTrips();
  const places = trips.flatMap((t) => t.places.map((p) => ({ ...p, trip: t.title })));
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">Saved places</h1>
        <p className="mt-1 text-navy-600">{places.length} places across your trips.</p>
      </header>

      <PlaceSearch trips={trips.map((t) => ({ id: t.id, title: t.title }))} />
      <TripMap pins={places} className="h-96 overflow-hidden rounded-3xl" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl bg-white">
            {p.imageUrl && <div className="relative h-44"><Image src={p.imageUrl} alt={p.name} fill sizes="400px" className="object-cover" /></div>}
            <div className="flex items-start justify-between gap-2 p-4">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-navy-600">{p.category} · {p.trip}</p>
              </div>
              <form action={removePlace}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-sm text-navy-600 underline hover:text-navy">Remove</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}