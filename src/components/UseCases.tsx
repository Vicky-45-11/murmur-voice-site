import { useRef, useState, type KeyboardEvent } from 'react';
import { USE_CASES } from '../content';
import SectionHeading from './SectionHeading';

export default function UseCases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = USE_CASES[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (event.key in keys) next = (active + keys[event.key] + USE_CASES.length) % USE_CASES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = USE_CASES.length - 1;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="section usecase-section" id="use-cases" aria-labelledby="usecase-title">
      <div className="container">
        <SectionHeading
          id="usecase-title"
          eyebrow="Use cases"
          title={
            <>
              Made for people who <em>write a lot.</em>
            </>
          }
        />
        <div className="usecase-layout">
          <div className="usecase-tabs" role="tablist" aria-label="Use cases" onKeyDown={onKeyDown}>
            {USE_CASES.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={index === active}
                aria-controls={`panel-${item.id}`}
                tabIndex={index === active ? 0 : -1}
                className={index === active ? 'is-active' : ''}
                onClick={() => setActive(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="usecase-panel" role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} key={current.id}>
            <div className="usecase-copy">
              <h3>{current.heading}</h3>
              <p>{current.body}</p>
            </div>
            <div className="usecase-example">
              <div className="example-said">
                <span className="pane-label">You say</span>
                <p>“{current.spoken}”</p>
              </div>
              <div className="example-written">
                <span className="pane-label">Murmur writes</span>
                {current.written.split('\n\n').map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
