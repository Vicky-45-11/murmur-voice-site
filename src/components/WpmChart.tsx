import { useLayoutEffect, useRef, useState } from 'react';

export interface Sample {
  t: number;
  wpm: number;
  raw: number;
}

const H = 190;
const PAD = { left: 40, right: 14, top: 12, bottom: 28 };

function niceMax(value: number) {
  const step = value > 120 ? 40 : value > 60 ? 20 : 10;
  return Math.max(step * 2, Math.ceil(value / step) * step);
}

// Net speed so far (solid) and raw speed in each second (dashed), drawn on one
// shared scale so the two lines are directly comparable.
export default function WpmChart({ samples }: { samples: Sample[] }) {
  // Draw in real pixels so axis labels stay readable on a phone instead of
  // shrinking with a scaled viewBox.
  const box = useRef<HTMLElement>(null);
  const [W, setW] = useState(560);
  useLayoutEffect(() => {
    const node = box.current;
    if (!node) return;
    const measure = () => setW(Math.max(260, Math.round(node.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [samples.length]);
  if (samples.length < 2) return null;
  const maxT = samples[samples.length - 1].t;
  const maxY = niceMax(Math.max(...samples.map((s) => Math.max(s.wpm, s.raw))));
  const x = (t: number) => PAD.left + (t / maxT) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - v / maxY) * (H - PAD.top - PAD.bottom);
  const line = (key: 'wpm' | 'raw') => samples.map((s, i) => `${i ? 'L' : 'M'}${x(s.t).toFixed(1)} ${y(s[key]).toFixed(1)}`).join(' ');
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxY * f));
  const xStep = Math.max(1, Math.ceil(maxT / 6));
  const xTicks = Array.from({ length: Math.floor(maxT / xStep) + 1 }, (_, i) => i * xStep);
  const end = samples[samples.length - 1];

  return (
    <figure className="wpm-chart" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`Typing speed over ${maxT} seconds, ending at ${Math.round(end.wpm)} words per minute`}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="grid" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="tick">
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="tick">
            {t}s
          </text>
        ))}
        <path d={line('raw')} className="line-raw" fill="none" />
        <path d={line('wpm')} className="line-wpm" fill="none" />
        <circle cx={x(end.t)} cy={y(end.wpm)} r="4" className="dot-wpm" />
      </svg>
      <figcaption>
        <span className="key key-wpm" /> Net wpm so far <span className="key key-raw" /> Raw wpm each second
      </figcaption>
    </figure>
  );
}
