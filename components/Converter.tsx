"use client";
import { useState } from "react";

export default function Converter({ cur, rate, live }: { cur: string; rate: number; live: boolean }) {
  const [php, setPhp] = useState("10000");
  const [fx, setFx] = useState((10000 / rate).toFixed(2));
  const num = (v: string) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);
  const field = "w-full rounded-xl border border-sand-400 bg-sand-200 px-3 py-2 text-lg";
  return (
    <div className="rounded-3xl bg-white p-5">
      <h2 className="font-display text-xl">Money abroad</h2>
      <p className="text-sm text-navy-600">1 {cur} = ₱{rate.toFixed(rate < 1 ? 4 : 2)} {live ? "(live rate)" : "(approximate, couldn’t reach the rate service)"}</p>
      <label className="mt-4 block text-sm">Philippine peso (PHP)
        <input className={field} inputMode="decimal" value={php} onChange={(e) => { setPhp(e.target.value); setFx((num(e.target.value) / rate).toFixed(2)); }} />
      </label>
      <label className="mt-3 block text-sm">{cur}
        <input className={field} inputMode="decimal" value={fx} onChange={(e) => { setFx(e.target.value); setPhp((num(e.target.value) * rate).toFixed(2)); }} />
      </label>
    </div>
  );
}