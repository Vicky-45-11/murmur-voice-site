import { useId, useState } from 'react';
import SectionHeading from './SectionHeading';

// A commonly cited range for conversational English is roughly 130–160 words
// per minute; we use the midpoint and say so on the page.
const SPEAKING_WPM = 150;

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export default function SpeedCalculator() {
  const [typing, setTyping] = useState(40);
  const [words, setWords] = useState(2500);
  const typingId = useId();
  const wordsId = useId();

  const typingMinutes = words / typing;
  const speakingMinutes = words / SPEAKING_WPM;
  const savedWeekly = Math.max(0, (typingMinutes - speakingMinutes) * 5);
  const ratio = typing >= SPEAKING_WPM ? 1 : SPEAKING_WPM / typing;

  return (
    <section className="section speed-section" aria-labelledby="speed-title">
      <div className="container speed-layout">
        <SectionHeading
          id="speed-title"
          align="left"
          eyebrow="Do the math"
          title={
            <>
              Most people talk faster <em>than they type.</em>
            </>
          }
          body={`Slide in your own numbers. We assume a conversational pace of ${SPEAKING_WPM} words per minute, a common estimate for spoken English.`}
        />
        <div className="speed-card">
          <div className="slider">
            <label htmlFor={typingId}>
              Your typing speed <output htmlFor={typingId}>{typing} wpm</output>
            </label>
            <input id={typingId} type="range" min={15} max={120} step={5} value={typing} onChange={(e) => setTyping(Number(e.target.value))} />
          </div>
          <div className="slider">
            <label htmlFor={wordsId}>
              Words you write per day <output htmlFor={wordsId}>{words.toLocaleString()}</output>
            </label>
            <input id={wordsId} type="range" min={500} max={10000} step={250} value={words} onChange={(e) => setWords(Number(e.target.value))} />
          </div>
          <div className="bars" aria-hidden="true">
            <div className="bar-row">
              <span>Typing</span>
              <div className="bar">
                <i style={{ width: '100%' }} />
              </div>
              <b>{formatMinutes(typingMinutes)}</b>
            </div>
            <div className="bar-row is-voice">
              <span>Speaking</span>
              <div className="bar">
                <i style={{ width: `${Math.min(100, (speakingMinutes / typingMinutes) * 100)}%` }} />
              </div>
              <b>{formatMinutes(speakingMinutes)}</b>
            </div>
          </div>
          <p className="speed-result" aria-live="polite">
            {savedWeekly > 0 ? (
              <>
                About <strong>{formatMinutes(savedWeekly)}</strong> back per five-day week, roughly {ratio.toFixed(1)}× faster.
              </>
            ) : (
              <>You already type as fast as most people talk. Voice may still save your wrists.</>
            )}
          </p>
          <p className="speed-note">Estimate only. Real speed depends on editing, accuracy and how you work.</p>
        </div>
      </div>
    </section>
  );
}
