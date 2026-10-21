import { money } from "@/lib/currency";

export default function Money({ cents, cur, rate }: { cents: number; cur: string; rate: number }) {
  return (
    <span>
      {money(cents, cur)}
      {cur !== "PHP" && <span className="block text-xs text-navy-600">≈ {money(Math.round(cents * rate), "PHP")}</span>}
    </span>
  );
}