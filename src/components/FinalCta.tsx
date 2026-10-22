import { useReveal } from '../lib/hooks';
import Waveform from './Waveform';

export default function FinalCta({ onJoin }: { onJoin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="final-cta" aria-labelledby="final-title">
      <div ref={ref} className="container final-inner reveal">
        <Waveform active bars={24} />
        <h2 id="final-title">
          Give your keyboard <em>the afternoon off.</em>
        </h2>
        <p>Try the demo now, or join the waitlist to hear when the desktop app is ready.</p>
        <div className="hero-ctas">
          <a href="#demo" className="btn btn-light btn-lg">
            Try the live demo
          </a>
          <button type="button" className="btn btn-outline-light btn-lg" onClick={onJoin}>
            Join the waitlist
          </button>
        </div>
      </div>
    </section>
  );
}
