import Image from "next/image";
import ExploreGrid, { type Dest } from "@/components/ExploreGrid";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

const destinations: Dest[] = [
  { name: "Kyoto", country: "Japan", blurb: "Temples, tea houses and cherry blossom.", image: img("photo-1493976040374-85c8e12f0c0e") },
  { name: "Santorini", country: "Greece", blurb: "White villages above the caldera.", image: img("photo-1570077188670-e3a8d69ac5ff") },
  { name: "Rome", country: "Italy", blurb: "Ancient ruins and long lunches.", image: img("photo-1552832230-c0197dd311b5") },
  { name: "Porto", country: "Portugal", blurb: "Riverside streets and port cellars.", image: img("photo-1555881400-74d7acaacd8b") },
  { name: "El Nido", country: "Philippines", blurb: "Limestone cliffs and island hopping.", image: null },
];

const collections = [
  { title: "Romantic getaways", text: "Hand-picked stays for anniversaries and honeymoons.", image: img("photo-1529260830199-42c24126f198") },
  { title: "Budget-friendly gems", text: "Places that look expensive and aren't.", image: img("photo-1525874684015-58379d421a52") },
];

export default function ExplorePage() {
  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-navy">
        <Image src={img("photo-1529260830199-42c24126f198")} alt="" fill sizes="1200px" className="object-cover opacity-50" priority />
        <div className="relative px-8 py-16 text-center text-white md:py-24">
          <h1 className="font-display text-4xl md:text-6xl">Where to next?</h1>
          <p className="mt-3 text-sand">Find a place worth saving, then plan the trip around it.</p>
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-display text-2xl">Trending now</h2>
        <ExploreGrid items={destinations} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">Curated collections</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {collections.map((c) => (
            <article key={c.title} className="relative h-64 overflow-hidden rounded-3xl bg-navy">
              <Image src={c.image} alt="" fill sizes="600px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <h3 className="font-display text-2xl">{c.title}</h3>
                <p className="text-sm text-sand">{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-3xl bg-navy p-10 text-center text-sand">
        <p className="mx-auto max-w-2xl font-display text-2xl md:text-3xl">“The world is a book and those who do not travel read only one page.”</p>
        <p className="mt-3 text-sm text-sand-400">Saint Augustine</p>
      </aside>
    </div>
  );
}