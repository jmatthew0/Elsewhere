"use client";
import { useState } from "react";

export default function ConfirmDelete({ action, fields, what, label = "Delete", className = "" }: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  what: string;
  label?: string;
  className?: string;
}) {
  const [ask, setAsk] = useState(false);
  if (!ask) return <button type="button" onClick={() => setAsk(true)} className={className}>{label}</button>;
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-2 text-xs">
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <span>Delete {what}?</span>
      <button className="rounded bg-navy px-2 py-1 font-medium text-white">Yes, delete</button>
      <button type="button" onClick={() => setAsk(false)} className="underline">Cancel</button>
    </form>
  );
}