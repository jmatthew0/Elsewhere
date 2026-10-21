"use client";
import { useState } from "react";
import Image from "next/image";

export type Dest = { name: string; country: string; blurb: string; image: string | null };

export default function ExploreGrid({ items }: { items: Dest[] }) {
  const [q, setQ] = useState("");
  const shown = items.filter((d) => `${d.name} ${d.country} ${d.blurb}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search destinations"
        className="w-full max-w-md rounded-full border border-sand-400 bg-white px-5 py-3"
      />
      {shown.length === 0 && <p className="text-navy-600">No destinations match “{q}”. Try a different word.</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((d) => (
          <article key={d.name} className="overflow-hidden rounded-3xl bg-white">
            <div className="relative h-52 bg-gradient-to-br from-navy-600 to-navy">
              {d.image && <Image src={d.image} alt={d.name} fill sizes="400px" className="object-cover" />}
            </div>
            <div className="p-4">
              <h3 className="font-display text-xl">{d.name}, {d.country}</h3>
              <p className="text-sm text-navy-600">{d.blurb}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}