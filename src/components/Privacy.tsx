import { useReveal } from '../lib/hooks';

const POINTS = [
  {
    title: 'Mic off by default',
    body: 'Nothing listens until you press the button. Your browser asks for permission, and you can stop at any time.',
  },
  {
    title: 'No account, no server',
    body: 'This site has no backend. Your dictionary, snippets and style live in your own browser’s storage.',
  },
  {
    title: 'Clear about what runs where',
    body: 'Speech recognition is your browser’s. Cleanup is local rules you can read. No hidden AI calls, no API keys in the page.',
  },
];

export default function Privacy() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="section privacy-section" aria-labelledby="privacy-title">
      <div ref={ref} className="container privacy-inner reveal">
        <div>
          <p className="eyebrow">Privacy</p>
          <h2 id="privacy-title">
            Your words, <em>on your terms.</em>
          </h2>
        </div>
        <ul className="privacy-list">
          {POINTS.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
