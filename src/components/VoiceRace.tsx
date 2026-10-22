import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readStored } from '../lib/hooks';
import { matchSpoken } from '../lib/typing';
import { defaultLanguage, useSpeech, type FinalPhrase } from '../lib/useSpeech';
import { MicIcon } from './Hero';

export const TYPICAL_SPEAKING_WPM = 150;
const MAX_PLAUSIBLE_WPM = 320;

interface Props {
  words: string[];
  typingWpm: number;
  onSpeakingWpm: (wpm: number) => void;
}

type Outcome = { kind: 'measured' | 'estimate'; wpm: number } | { kind: 'too-few' };

export default function VoiceRace({ words, typingWpm, onSpeakingWpm }: Props) {
  const lang = useMemo(() => readStored('murmur.lang', defaultLanguage()), []);
  const [spoken, setSpoken] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const startAt = useRef(0);
  const lastAdvance = useRef(0);
  const wasListening = useRef(false);

  const onFinal = useCallback(({ text }: FinalPhrase) => setSpoken((current) => `${current} ${text}`.trim()), []);
  const speech = useSpeech(onFinal, lang);
  const listening = speech.status === 'listening';

  const heard = speech.interim ? `${spoken} ${speech.interim}` : spoken;
  const { pointer, matched } = useMemo(() => matchSpoken(words, heard), [words, heard]);

  // Clock runs from the first recognised word to the last one, so time spent
  // reaching for the mic or thinking before you start doesn't count.
  useEffect(() => {
    if (!listening || matched === 0) return;
    const now = performance.now();
    if (!startAt.current) startAt.current = now - 400; // the first word had to be spoken before it was recognised
    lastAdvance.current = now;
  }, [listening, matched]);

  useEffect(() => {
    if (listening && pointer >= words.length) speech.stop();
  }, [listening, pointer, words.length, speech]);

  useEffect(() => {
    if (wasListening.current && !listening) {
      const seconds = (lastAdvance.current - startAt.current) / 1000;
      const wpm = seconds > 0 ? Math.round(matched / (seconds / 60)) : 0;
      // Recognisers sometimes deliver a burst of words at once; nobody talks
      // this fast, so don't report it as a result.
      if (matched >= 3 && seconds > 0.5 && wpm <= MAX_PLAUSIBLE_WPM) {
        setOutcome({ kind: 'measured', wpm });
        onSpeakingWpm(wpm);
      } else {
        setOutcome({ kind: 'too-few' });
      }
    }
    wasListening.current = listening;
  }, [listening, matched, onSpeakingWpm]);

  const begin = () => {
    setSpoken('');
    setOutcome(null);
    startAt.current = 0;
    lastAdvance.current = 0;
    speech.start();
  };

  const useEstimate = () => {
    setOutcome({ kind: 'estimate', wpm: TYPICAL_SPEAKING_WPM });
    onSpeakingWpm(TYPICAL_SPEAKING_WPM);
  };

  const speakingWpm = outcome && outcome.kind !== 'too-few' ? outcome.wpm : null;
  const ratio = speakingWpm && typingWpm > 0 ? speakingWpm / typingWpm : null;
  const barMax = Math.max(typingWpm, speakingWpm ?? 0, 1);

  return (
    <div className="voice-race">
      <div className="voice-head">
        <div>
          <p className="eyebrow">Round two</p>
          <h3>Now say it out loud</h3>
        </div>
        {!listening && (
          <button type="button" className="btn btn-primary" onClick={begin} disabled={speech.status === 'unsupported'}>
            <MicIcon /> {outcome ? 'Try again' : 'Start reading aloud'}
          </button>
        )}
        {listening && (
          <button type="button" className="btn btn-light" onClick={speech.stop}>
            Stop
          </button>
        )}
      </div>
      <p className="voice-text" aria-label="Words to read aloud">
        {words.map((word, index) => (
          <span key={index} className={index < pointer ? 'said' : ''}>
            {word}{' '}
          </span>
        ))}
      </p>
      <p className="voice-status" role="status">
        {speech.status === 'unsupported' && 'This browser can’t listen. Use Chrome, Edge or Safari, or take the estimate below.'}
        {speech.status === 'error' && speech.error}
        {listening && (speech.hearing ? 'Hearing you. Keep reading…' : 'Listening. Start reading the words above.')}
        {!listening && outcome?.kind === 'too-few' && 'I couldn’t get a reliable reading (too few words, or they arrived all at once). Check your mic and try again, or use the estimate below.'}
        {!listening && !outcome && speech.status === 'idle' && `Read these ${words.length} words at your natural pace. The mic only turns on when you press the button.`}
      </p>

      {speakingWpm !== null && (
        <div className="race-result">
          <div className="race-bars" aria-hidden="true">
            <div className="race-row">
              <span>Typing</span>
              <div className="race-bar">
                <i style={{ width: `${(typingWpm / barMax) * 100}%` }} />
              </div>
              <b>{Math.round(typingWpm)} wpm</b>
            </div>
            <div className="race-row is-voice">
              <span>Talking</span>
              <div className="race-bar">
                <i style={{ width: `${(speakingWpm / barMax) * 100}%` }} />
              </div>
              <b>{speakingWpm} wpm</b>
            </div>
          </div>
          <p className="race-verdict">
            {ratio === null && <>Type a few words correctly in the test above to compare the two.</>}
            {ratio !== null && ratio >= 1.15 && (
              <>
                You talk <strong>{ratio.toFixed(1)}× faster</strong> than you type.
              </>
            )}
            {ratio !== null && ratio < 1.15 && ratio > 0.87 && <>Dead even this time. Voice still spares your wrists.</>}
            {ratio !== null && ratio <= 0.87 && <>Typing won this round. Voice still wins on long messages and tired hands.</>}{' '}
            <span className="race-note">
              {outcome?.kind === 'estimate'
                ? `Estimate: ${TYPICAL_SPEAKING_WPM} wpm is a typical conversational pace, not a measurement of you.`
                : 'Measured from your first to last recognised word. The speech service adds some delay, so treat it as approximate.'}
            </span>
          </p>
        </div>
      )}

      {speakingWpm === null && !listening && (
        <button type="button" className="link-btn" onClick={useEstimate}>
          No mic? Compare with a typical {TYPICAL_SPEAKING_WPM} wpm speaking pace instead
        </button>
      )}
    </div>
  );
}
