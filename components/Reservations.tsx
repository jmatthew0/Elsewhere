import Link from "next/link";
import { Plane, Bed, Ticket, CalendarCheck, type LucideIcon } from "lucide-react";
import Money from "@/components/Money";
import ConfirmDelete from "@/components/ConfirmDelete";
import { deleteReservation } from "@/lib/actions";

export type Item = { id: string; kind: string; title: string; details: string | null; reference: string | null; status: string; date: Date | null; costCents: number };

export const ICONS: Record<string, LucideIcon> = { Flight: Plane, Hotel: Bed, Activity: Ticket, Other: CalendarCheck };
export const TAG: Record<string, string> = {
  BOOKED: "bg-sand",
  CONFIRMED: "bg-sand-400/60",
  PAID: "bg-navy text-white",
  PENDING: "border border-sand-400 bg-white",
};
const tag = "inline-block rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide";
const fmt = (d: Date) => d.toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

// Shown inside a day of the timeline.
export function DayReservation({ r }: { r: Item }) {
  const Icon = ICONS[r.kind] ?? CalendarCheck;
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-dashed border-sand-400 bg-sand-200/60 p-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sand"><Icon className="h-5 w-5" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-navy-600">Reservation · {r.kind}{r.reference ? ` · Ref ${r.reference}` : ""}</p>
        <p className="font-medium">{r.title}</p>
        {r.details && <p className="text-xs text-navy-600">{r.details}</p>}
      </div>
      <span className={`${tag} ${TAG[r.status] ?? "bg-sand"}`}>{r.status}</span>
    </li>
  );
}

export default function Reservations({ items, cur, rate, title = "Reservations" }: { items: Item[]; cur: string; rate: number; title?: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-navy-600">No bookings saved yet. Add a flight or hotel below.</p>
      ) : (
        <ul className="mt-3 divide-y divide-sand">
          {items.map((r) => {
            const Icon = ICONS[r.kind] ?? CalendarCheck;
            return (
              <li key={r.id} className="py-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sand"><Icon className="h-4 w-4" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{r.title}</p>
                    {r.details && <p className="text-xs text-navy-600">{r.details}</p>}
                    <p className="text-xs text-navy-600">{[r.date ? fmt(r.date) : null, r.reference ? `Ref ${r.reference}` : null].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="text-right text-sm">
                    {r.costCents > 0 && <Money cents={r.costCents} cur={cur} rate={rate} />}
                    <span className={`mt-1 ${tag} ${TAG[r.status] ?? "bg-sand"}`}>{r.status}</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-end gap-3 text-xs">
                  <Link href={`/reservations/${r.id}/edit`} className="text-navy-600 underline">Edit</Link>
                  <ConfirmDelete action={deleteReservation} fields={{ id: r.id }} what="this reservation" className="text-xs text-navy-600 underline" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}