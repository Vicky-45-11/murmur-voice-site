import { APP_SURFACES } from '../content';

export default function AppStrip() {
  const items = [...APP_SURFACES, ...APP_SURFACES];
  return (
    <section className="app-strip" aria-label="Where Murmur works">
      <p className="strip-label">Works wherever there’s a text box</p>
      <div className="marquee">
        <ul className="marquee-track">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} aria-hidden={index >= APP_SURFACES.length}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
