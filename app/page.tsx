import Image from "next/image";
import Link from "next/link";
import { places, trip } from "@/lib/data";
import TripMap from "@/components/TripMap";

export default function Home() {
  const saved = places.filter((p) => p.category === "Saved");
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl">Welcome back, Ann</h1>
        <p className="mt-1 text-navy-600">You have one trip coming up.</p>
      </header>

      <Link href={`/trips/${trip.id}`} className="group relative block h-80 overflow-hidden rounded-3xl bg-navy">
        <Image src={trip.cover} alt="" fill sizes="900px" className="object-cover opacity-80 transition group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
        <div className="absolute bottom-0 p-8 text-white">
          <p className="text-sm text-sand-400">{trip.dates} · {trip.where}</p>
          <h2 className="font-display text-4xl">{trip.title}</h2>
          <span className="mt-4 inline-block rounded-full bg-sand px-5 py-2 text-sm font-medium text-navy">Open itinerary</span>
        </div>
      </Link>

      <section id="places">
        <h2 className="font-display text-2xl mb-4">Saved places</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-2xl bg-white">
              <div className="relative h-44"><Image src={p.image} alt={p.name} fill sizes="400px" className="object-cover" /></div>
              <div className="p-4"><h3 className="font-medium">{p.name}</h3><p className="text-sm text-navy-600">{p.category}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Your map</h2>
        <TripMap pins={places} className="h-96 overflow-hidden rounded-3xl" />
        <p className="mt-2 text-sm text-navy-600">{saved.length} places saved for later</p>
      </section>
    </div>
  );
}
