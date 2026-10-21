import Image from "next/image";
import Link from "next/link";
import TripMap from "@/components/TripMap";
import { getCurrentUser, getTrips } from "@/lib/queries";
import { money } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [user, trips] = await Promise.all([getCurrentUser(), getTrips()]);
  const places = trips.flatMap((t) => t.places);

  if (trips.length === 0)
    return <p>No trips yet. Run <code>npx prisma db seed</code> to load the sample trips.</p>;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl">Welcome back, {user?.name?.split(" ")[0] ?? "traveler"}</h1>
        <p className="mt-1 text-navy-600">{trips.length} trips planned.</p>
      </header>

      <section id="trips" className="grid gap-6 md:grid-cols-2">
        {trips.map((t) => (
          <Link key={t.id} href={`/trips/${t.id}`} className="group relative block h-72 overflow-hidden rounded-3xl bg-navy">
            {t.coverUrl && <Image src={t.coverUrl} alt="" fill sizes="600px" className="object-cover opacity-80 transition group-hover:scale-[1.02]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white">
              <p className="text-sm text-sand-400">{t.destination} · budget {money(t.budgetCents, t.currency)}</p>
              <h2 className="font-display text-3xl">{t.title}</h2>
            </div>
          </Link>
        ))}
      </section>

      <section id="places">
        <h2 className="font-display text-2xl mb-4">Saved places</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-2xl bg-white">
              {p.imageUrl && <div className="relative h-44"><Image src={p.imageUrl} alt={p.name} fill sizes="400px" className="object-cover" /></div>}
              <div className="p-4"><h3 className="font-medium">{p.name}</h3><p className="text-sm text-navy-600">{p.category}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">Your map</h2>
        <TripMap pins={places} className="h-96 overflow-hidden rounded-3xl" />
      </section>
    </div>
  );
}