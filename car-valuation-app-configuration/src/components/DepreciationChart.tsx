import { smoothPath } from "../lib/charts";
import { formatLakh } from "../lib/engine";

interface Props {
  points: { age: number; value: number }[];
  currentAge: number;
  currentValue: number;
}

export default function DepreciationChart({ points, currentAge, currentValue }: Props) {
  const W = 520;
  const H = 170;
  const padX = 12;
  const padY = 16;
  const maxV = Math.max(...points.map((p) => p.value));
  const maxAge = points[points.length - 1]?.age || 25;

  const x = (age: number) => padX + (age / maxAge) * (W - padX * 2);
  const y = (v: number) => padY + (1 - v / maxV) * (H - padY * 2);

  const line = smoothPath(points.map((p) => ({ x: x(p.age), y: y(p.value) })));
  const area = `${line} L${x(maxAge).toFixed(1)},${H - padY} L${x(0).toFixed(1)},${H - padY} Z`;

  const cx = x(currentAge);
  const cy = y(currentValue);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 170 }}>
        <defs>
          <linearGradient id="dep-area-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fcab3" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8fcab3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={W - padX}
            y1={padY + f * (H - padY * 2)}
            y2={padY + f * (H - padY * 2)}
            stroke="#eef1f3"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill="url(#dep-area-light)" />
        <path d={line} fill="none" stroke="#2f7d5f" strokeWidth="2.2" strokeLinecap="round" />

        <line x1={cx} x2={cx} y1={padY} y2={H - padY} stroke="#f2a541" strokeDasharray="4 4" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r="9" fill="rgba(47,125,95,0.16)" />
        <circle cx={cx} cy={cy} r="4.5" fill="#2f7d5f" stroke="#fff" strokeWidth="2" />
      </svg>

      <div className="mt-1 flex justify-between px-1 text-[10px] text-muted">
        {[0, 5, 10, 15, 20, 25].map((a) => (
          <span key={a}>{a}y</span>
        ))}
      </div>
      <div className="pointer-events-none absolute top-1 right-2 rounded-full bg-canvas px-2.5 py-1 text-[10px] font-medium text-forest">
        now · {formatLakh(currentValue)}
      </div>
    </div>
  );
}
