export default function Waveform({ active, bars = 18 }: { active: boolean; bars?: number }) {
  return (
    <span className={`waveform ${active ? 'is-active' : ''}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} style={{ animationDelay: `${(i * 97) % 600}ms` }} />
      ))}
    </span>
  );
}
