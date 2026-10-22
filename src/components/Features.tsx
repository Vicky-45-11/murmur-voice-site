import { FEATURES } from '../content';
import { useReveal } from '../lib/hooks';
import SectionHeading from './SectionHeading';

export default function Features() {
  const gridRef = useReveal<HTMLUListElement>();
  return (
    <section className="section features-section" id="features" aria-labelledby="features-title">
      <div className="container">
        <SectionHeading
          id="features-title"
          eyebrow="Features"
          title={
            <>
              Everything between your voice <em>and the send button.</em>
            </>
          }
          body="Dictation that only transcribes leaves you editing. Murmur is designed to hand you text you’d actually send."
        />
        <ul ref={gridRef} className="feature-grid reveal-stagger">
          {FEATURES.map((feature) => (
            <li key={feature.id} className="feature-card">
              <div className="feature-demo" aria-hidden="true">
                <span className="before">{feature.demo.before}</span>
                <span className="after">{feature.demo.after}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
