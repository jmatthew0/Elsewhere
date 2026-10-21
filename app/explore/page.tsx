import ExploreGrid, { type Dest } from "@/components/ExploreGrid";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const destinations: Dest[] = [
  { name: "Kyoto", country: "Japan", blurb: "Temples, tea houses and cherry blossom.", image: img("photo-1493976040374-85c8e12f0c0e") },
  { name: "Santorini", country: "Greece", blurb: "White villages above the caldera.", image: img("photo-1570077188670-e3a8d69ac5ff") },
  { name: "Rome", country: "Italy", blurb: "Ancient ruins and long lunches.", image: img("photo-1552832230-c0197dd311b5") },
  { name: "Porto", country: "Portugal", blurb: "Riverside streets and port cellars.", image: img("photo-1555881400-74d7acaacd8b") },
  { name: "El Nido", country: "Philippines", blurb: "Limestone cliffs and island hopping.", image: null },
];

export default function ExplorePage() {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-navy p-8 text-sand md:p-12">
        <h1 className="font-display text-4xl md:text-5xl">Where to next?</h1>
        <p className="mt-2 text-sand-400">Find a place worth saving, then plan the trip around it.</p>
      </header>
      <ExploreGrid items={destinations} />
    </div>
  );
}