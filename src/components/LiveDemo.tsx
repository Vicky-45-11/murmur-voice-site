import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_DICTIONARY, DEFAULT_SNIPPETS, SAMPLES, STYLES } from '../content';
import { autoEdit, punctuatePhrase, type Entry, type Style } from '../lib/autoEdit';
import { readStored, usePrefersReducedMotion, writeStored } from '../lib/hooks';
import { useMicLevel } from '../lib/useMicLevel';
import { LANGUAGES, defaultLanguage, useSpeech, type FinalPhrase } from '../lib/useSpeech';
import EntryEditor from './EntryEditor';
import { MicIcon } from './Hero';
import SectionHeading from './SectionHeading';
import Waveform from './Waveform';

interface Recent {
  id: string;
  text: string;
  at: number;
}

const LOW_CONFIDENCE = 0.5;

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function formatClock(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function LiveDemo() {
  const reduced = usePrefersReducedMotion();
  const [raw, setRaw] = useState('');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [style, setStyle] = useState<Style>(() => readStored('murmur.style', 'casual'));
  const [lang, setLang] = useState(() => readStored('murmur.lang', defaultLanguage()));
  const [autoPunctuate, setAutoPunctuate] = useState(() => readStored('murmur.autoPunctuate', true));
  const [dictionary, setDictionary] = useState<Entry[]>(() => readStored('murmur.dictionary', DEFAULT_DICTIONARY));
  const [snippets, setSnippets] = useState<Entry[]>(() => readStored('murmur.snippets', DEFAULT_SNIPPETS));
  const [recent, setRecent] = useState<Recent[]>(() => readStored('murmur.recent', []));
  const [copied, setCopied] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [spokenWords, setSpokenWords] = useState(0);
  const [lastConfidence, setLastConfidence] = useState(1);
  const sampleIndex = useRef(0);
  const playTimer = useRef<number>();
  const english = lang.startsWith('en');
  // Latest text, readable synchronously when several phrases arrive at once.
  const rawRef = useRef(raw);
  rawRef.current = raw;

  useEffect(() => writeStored('murmur.style', style), [style]);
  useEffect(() => writeStored('murmur.lang', lang), [lang]);
  useEffect(() => writeStored('murmur.autoPunctuate', autoPunctuate), [autoPunctuate]);
  useEffect(() => writeStored('murmur.dictionary', dictionary), [dictionary]);
  useEffect(() => writeStored('murmur.snippets', snippets), [snippets]);
  useEffect(() => writeStored('murmur.recent', recent), [recent]);
  useEffect(() => () => window.clearInterval(playTimer.current), []);

  const appendPhrase = useCallback(
    ({ text, confidence }: FinalPhrase) => {
      const phrase = autoPunctuate ? punctuatePhrase(text, english) : text;
      const current = rawRef.current;
      const next = `${current} ${phrase}`.trim();
      rawRef.current = next;
      setUndoStack((stack) => [...stack.slice(-49), current]);
      setRaw(next);
      setSpokenWords((words) => words + countWords(text));
      // Chrome reports 0 when it has no estimate; only flag real low scores.
      setLastConfidence(confidence > 0 ? confidence : 1);
    },
    [autoPunctuate, english],
  );
  const speech = useSpeech(appendPhrase, lang);
  const listening = speech.status === 'listening';
  const level = useMicLevel(listening && speech.audioActive);

  // Session timer for the words-per-minute readout.
  useEffect(() => {
    if (!listening) return;
    const startedAt = Date.now() - elapsed;
    const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when listening toggles
  }, [listening]);

  const liveRaw = listening && speech.interim ? `${raw} ${speech.interim}`.trim() : raw;
  const result = useMemo(
    () => autoEdit(liveRaw, { style, dictionary, snippets }),
    [liveRaw, style, dictionary, snippets],
  );

  // Keep each finished dictation so it isn't lost when you start the next one.
  const wasListening = useRef(false);
  const latestText = useRef(result.text);
  latestText.current = result.text;
  useEffect(() => {
    if (wasListening.current && !listening && latestText.current) {
      const text = latestText.current;
      setRecent((items) =>
        items[0]?.text === text ? items : [{ id: `r-${Date.now()}`, text, at: Date.now() }, ...items].slice(0, 5),
      );
    }
    wasListening.current = listening;
  }, [listening]);

  const stopSample = () => {
    window.clearInterval(playTimer.current);
    setPlaying(false);
  };

  const resetSession = () => {
    setElapsed(0);
    setSpokenWords(0);
    setLastConfidence(1);
  };

  const playSample = () => {
    if (listening) speech.stop();
    stopSample();
    resetSession();
    setUndoStack([]);
    const words = SAMPLES[sampleIndex.current % SAMPLES.length].split(' ');
    sampleIndex.current += 1;
    if (reduced) {
      setRaw(words.join(' '));
      return;
    }
    setRaw('');
    setPlaying(true);
    let i = 0;
    playTimer.current = window.setInterval(() => {
      i += 1;
      setRaw(words.slice(0, i).join(' '));
      if (i >= words.length) stopSample();
    }, 110);
  };

  const toggleMic = () => {
    stopSample();
    if (listening) {
      speech.stop();
      return;
    }
    if (!raw) resetSession();
    speech.start();
  };

  const toggleRef = useRef(toggleMic);
  toggleRef.current = toggleMic;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' && event.ctrlKey && event.shiftKey && !event.repeat) {
        event.preventDefault();
        toggleRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const undo = () => {
    if (!undoStack.length) return;
    setRaw(undoStack[undoStack.length - 1]);
    setUndoStack(undoStack.slice(0, -1));
    setLastConfidence(1);
  };

  const clear = () => {
    stopSample();
    setRaw('');
    setUndoStack([]);
    resetSession();
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
    } catch {
      setCopied(null);
    }
  };

  const { fillers, corrections, snippets: snippetHits, dictionary: dictionaryHits } = result.stats;
  const chips = [
    fillers && `${fillers} filler${fillers > 1 ? 's' : ''} removed`,
    corrections && `${corrections} correction${corrections > 1 ? 's' : ''} applied`,
    snippetHits && `${snippetHits} snippet${snippetHits > 1 ? 's' : ''} expanded`,
    dictionaryHits && `${dictionaryHits} dictionary fix${dictionaryHits > 1 ? 'es' : ''}`,
  ].filter(Boolean) as string[];

  const minutes = elapsed / 60000;
  const wpm = elapsed > 5000 && spokenWords ? Math.round(spokenWords / minutes) : null;
  const sessionLine = `${formatClock(elapsed)} · ${spokenWords} word${spokenWords === 1 ? '' : 's'}${wpm ? ` · ${wpm} wpm` : ''}`;

  let status: string;
  if (speech.status === 'unsupported') {
    status = 'Live dictation isn’t available in this browser. Use Chrome, Edge or Safari, or type and play a sample instead.';
  } else if (speech.status === 'error') {
    status = speech.error;
  } else if (listening) {
    status = speech.hearing ? 'Hearing you…' : 'Listening. Start talking whenever you’re ready.';
  } else if (speech.notice) {
    status = speech.notice;
  } else if (spokenWords) {
    status = `Last session ${sessionLine}`;
  } else {
    status = 'Press the mic (or Ctrl + Shift + Space) and talk. Pauses become sentence breaks.';
  }

  return (
    <section className="section demo-section" id="demo" aria-labelledby="demo-title">
      <div className="container">
        <SectionHeading
          id="demo-title"
          eyebrow="Live demo"
          title={
            <>
              Talk like a person. <em>Read like an editor.</em>
            </>
          }
          body="Press the mic and say something the way you’d actually say it, ums and all. Or play a sample, or just type messy text into the left side."
        />

        <div className="demo-card">
          <div className="demo-toolbar">
            <div className="demo-controls">
              <button
                type="button"
                className={`mic-btn ${listening ? 'is-listening' : ''}`}
                onClick={toggleMic}
                disabled={speech.status === 'unsupported'}
                aria-pressed={listening}
                aria-keyshortcuts="Control+Shift+Space"
              >
                {listening ? <Waveform active bars={6} /> : <MicIcon />}
                <span>{listening ? 'Stop' : 'Start dictating'}</span>
                {listening && <span className="mic-clock">{formatClock(elapsed)}</span>}
              </button>
              <button type="button" className="btn btn-outline" onClick={playing ? stopSample : playSample}>
                {playing ? 'Stop sample' : 'Play a sample'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={undo} disabled={!undoStack.length || playing}>
                Undo last phrase
              </button>
              <button type="button" className="btn btn-ghost" onClick={clear} disabled={!raw}>
                Clear
              </button>
            </div>
            <div className="segmented" role="radiogroup" aria-label="Writing style">
              {STYLES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={style === option.id}
                  className={style === option.id ? 'is-active' : ''}
                  title={option.hint}
                  onClick={() => setStyle(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-settings">
            <label className="field-inline" htmlFor="speech-lang">
              <span>Language &amp; accent</span>
              <select id="speech-lang" value={lang} onChange={(e) => setLang(e.target.value)} disabled={listening}>
                {LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="toggle" htmlFor="auto-punctuate">
              <input
                id="auto-punctuate"
                type="checkbox"
                checked={autoPunctuate}
                onChange={(e) => setAutoPunctuate(e.target.checked)}
              />
              <span>Pauses end sentences</span>
            </label>
            <span className="shortcut-hint">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> to start or stop
            </span>
          </div>

          <div className={`demo-status ${speech.status === 'error' ? 'is-error' : ''}`}>
            {listening && (
              <span className="level" aria-hidden="true">
                <i style={{ transform: `scaleX(${Math.max(0.04, level)})` }} />
              </span>
            )}
            <p role="status">{status}</p>
            {listening && <span className="session-line">{sessionLine}</span>}
          </div>
          {lastConfidence < LOW_CONFIDENCE && (
            <p className="confidence-hint">
              That last phrase came through unclear. Use <strong>Undo last phrase</strong> and say it again, or add the
              word to your Dictionary below.
            </p>
          )}

          <div className="demo-panes">
            <div className="pane">
              <label htmlFor="raw-input" className="pane-label">
                What you said {listening && <span className="live-dot">Live</span>}
              </label>
              {listening ? (
                <div id="raw-input" className="live-transcript" aria-live="off">
                  {raw}
                  {speech.interim && <span className="interim-inline"> {speech.interim}</span>}
                  <span className="caret" aria-hidden="true" />
                </div>
              ) : (
                <textarea
                  id="raw-input"
                  value={raw}
                  onChange={(event) => {
                    stopSample();
                    setRaw(event.target.value);
                  }}
                  placeholder="um so hey can we move the sync to 3 no wait 4 period"
                  rows={7}
                />
              )}
            </div>
            <div className="pane pane-output">
              <div className="pane-head">
                <span className="pane-label" id="output-label">
                  What Murmur writes
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => copy(result.text, 'output')}
                  disabled={!result.text}
                >
                  {copied === 'output' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="output" aria-labelledby="output-label" aria-live={listening ? 'off' : 'polite'}>
                {result.text ? result.text : <span className="placeholder">Your clean text shows up here.</span>}
              </div>
              <ul className="chips" aria-label="Edits applied">
                {chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </div>
          </div>

          {recent.length > 0 && (
            <div className="recent">
              <div className="recent-head">
                <h3>Recent dictations</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRecent([])}>
                  Clear all
                </button>
              </div>
              <ul>
                {recent.map((item) => (
                  <li key={item.id}>
                    <p>{item.text}</p>
                    <div className="recent-actions">
                      <time dateTime={new Date(item.at).toISOString()}>
                        {new Date(item.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </time>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(item.text, item.id)}>
                        {copied === item.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        aria-label="Remove this dictation"
                        onClick={() => setRecent((items) => items.filter((entry) => entry.id !== item.id))}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="demo-lists">
            <EntryEditor
              title="Dictionary"
              description="When it mishears a word, teach it the right spelling"
              fromLabel="Heard as"
              toLabel="Write as"
              entries={dictionary}
              onChange={setDictionary}
            />
            <EntryEditor
              title="Snippets"
              description="Say a cue, get the full text"
              fromLabel="Cue"
              toLabel="Expands to"
              entries={snippets}
              onChange={setSnippets}
            />
          </div>

          <details className="tips">
            <summary>Tips for better accuracy</summary>
            <ul>
              <li>Pick the language and accent closest to how you speak. English (India) is noticeably better for Indian English than English (US).</li>
              <li>Speak at a normal pace in full phrases, and pause briefly where a sentence should end.</li>
              <li>Use a headset or sit close to the mic; the level bar should move when you talk.</li>
              <li>If a name or term keeps coming out wrong, add what it hears to the Dictionary.</li>
              <li>Say “comma”, “question mark” or “new paragraph” for exact punctuation; say “no wait” or “scratch that” to correct yourself.</li>
            </ul>
          </details>

          <p className="demo-fineprint">
            The mic only turns on when you press <strong>Start dictating</strong>, and your browser asks first. Recognition
            uses your browser’s built-in speech service; some browsers (like Chrome) process audio on their own servers.
            Cleanup runs locally with simple rules, not an AI model{english ? '' : ', and its rules are written for English'}.
          </p>
        </div>
      </div>
    </section>
  );
}
