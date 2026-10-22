import { useState } from 'react';
import { FAQS } from '../content';
import SectionHeading from './SectionHeading';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section faq-section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <SectionHeading id="faq-title" align="left" eyebrow="FAQ" title={<>Questions, <em>answered.</em></>} />
        <ul className="faq-list">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    {item.q}
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-answer" id={`faq-a-${index}`} role="region" aria-labelledby={`faq-q-${index}`}>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
