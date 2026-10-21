import Link from "next/link";

type Range = { id: string; title: string; start: Date; end: Date };
const ym = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;

export default function Calendar({ year, month, trips }: { year: number; month: number; trips: Range[] }) {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const cells: (number | null)[] = [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: last.getUTCDate() }, (_, i) => i + 1)];
  const prev = month === 0 ? ym(year - 1, 11) : ym(year, month - 1);
  const next = month === 11 ? ym(year + 1, 0) : ym(year, month + 1);
  const title = first.toLocaleDateString("en-PH", { month: "long", year: "numeric", timeZone: "UTC" });
  const now = new Date();
  const isToday = (d: number) => now.getFullYear() === year && now.getMonth() === month && now.getDate() === d;
  const tripOn = (d: number) => trips.find((t) => { const x = Date.UTC(year, month, d); return x >= t.start.getTime() && x <= t.end.getTime(); });
  const inMonth = trips.filter((t) => t.start <= last && t.end >= first);
  const fmt = (d: Date) => d.toLocaleDateString("en-PH", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        <div className="flex gap-1 text-lg">
          <Link href={`/?m=${prev}`} aria-label="Previous month" className="rounded-full px-2 hover:bg-sand-200">‹</Link>
          <Link href={`/?m=${next}`} aria-label="Next month" className="rounded-full px-2 hover:bg-sand-200">›</Link>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-sm">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="text-xs text-navy-600">{d}</span>)}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const t = tripOn(d);
          const base = "mx-auto grid h-9 w-9 place-items-center rounded-full";
          if (t) return <Link key={i} href={`/trips/${t.id}`} title={t.title} className={`${base} bg-navy text-white hover:bg-navy-800`}>{d}</Link>;
          return <span key={i} className={`${base} ${isToday(d) ? "ring-2 ring-navy" : ""}`}>{d}</span>;
        })}
      </div>
      {inMonth.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-sand pt-3 text-sm">
          {inMonth.map((t) => (
            <li key={t.id}><Link href={`/trips/${t.id}`} className="flex justify-between hover:underline"><span>{t.title}</span><span className="text-navy-600">{fmt(t.start)} – {fmt(t.end)}</span></Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}