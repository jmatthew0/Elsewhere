const COLORS = ["#13233F", "#35507F", "#7C93BD", "#A8935F", "#DCCDAE", "#C9D3E6"];

export function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 40, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90" role="img" aria-label="Spending by category">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F6F0E3" strokeWidth="16" />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const el = <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.label} <span className="text-navy-600">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineChart({ points }: { points: { label: string; value: number }[] }) {
  if (points.length < 2) return <p className="text-sm text-navy-600">Log expenses on at least two different days to see the trend.</p>;
  const w = 400, h = 150;
  const max = Math.max(...points.map((p) => p.value)) || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - (p.value / max) * (h - 12) - 6]);
  const line = xy.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Spending per day">
        <polygon points={`0,${h} ${line} ${w},${h}`} fill="#13233F" opacity="0.12" />
        <polyline points={line} fill="none" stroke="#13233F" strokeWidth="2.5" strokeLinejoin="round" />
        {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#13233F" />)}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-navy-600"><span>{points[0].label}</span><span>{points[points.length - 1].label}</span></div>
    </div>
  );
}

export function HBars({ data, fmt }: { data: { label: string; value: number }[]; fmt: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <ul className="space-y-4">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between text-sm"><span>{d.label}</span><span className="font-medium">{fmt(d.value)}</span></div>
          <div className="mt-1 h-2.5 rounded-full bg-sand">
            <div className="h-2.5 rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}