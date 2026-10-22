import HeroDemo from './HeroDemo';

export default function Hero({ onJoin }: { onJoin: () => void }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <p className="hero-badge">
          <span className="dot" aria-hidden="true" /> Concept product · live demo runs in your browser
        </p>
        <h1 id="hero-title" className="hero-title">
          Speak it. <em>It’s written.</em>
        </h1>
        <p className="hero-sub">
          Murmur turns the way you talk into clean, ready-to-send text in any app. Fillers gone, corrections applied,
          tone matched, without touching the keyboard.
        </p>
        <div className="hero-ctas">
          <a href="#demo" className="btn btn-primary btn-lg">
            <MicIcon /> Try the live demo
          </a>
          <button type="button" className="btn btn-outline btn-lg" onClick={onJoin}>
            Join the waitlist
          </button>
        </div>
        <p className="hero-note">Hold a key, talk, let go. That’s the whole interface.</p>
      </div>
      <div className="container">
        <HeroDemo />
      </div>
    </section>
  );
}

export function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
