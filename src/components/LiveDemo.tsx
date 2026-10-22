import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { DEFAULT_DICTIONARY, DEFAULT_SNIPPETS, SAMPLES, STYLES } from '../content';
import { autoEdit, type Entry, type Style } from '../lib/autoEdit';
import { readStored, usePrefersReducedMotion, writeStored } from '../lib/hooks';
import { useSpeech } from '../lib/useSpeech';
import { MicIcon } from './Hero';
import SectionHeading from './SectionHeading';
import Waveform from './Waveform';

export default function LiveDemo() {
  const reduced = usePrefersReducedMotion();
  const [raw, setRaw] = useState('');
  const [style, setStyle] = useState<Style>(() => readStored('murmur.style', 'casual'));
  const [dictionary, setDictionary] = useState<Entry[]>(() => readStored('murmur.dictionary', DEFAULT_DICTIONARY));
  const [snippets, setSnippets] = useState<Entry[]>(() => readStored('murmur.snippets', DEFAULT_SNIPPETS));
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const sampleIndex = useRef(0);
  const playTimer = useRef<number>();

  useEffect(() => writeStored('murmur.style', style), [style]);
  useEffect(() => writeStored('murmur.dictionary', dictionary), [dictionary]);
  useEffect(() => writeStored('murmur.snippets', snippets), [snippets]);
  useEffect(() => () => window.clearInterval(playTimer.current), []);

  const appendSpeech = useCallback((text: string) => {
    setRaw((current) => `${current} ${text}`.trim());
  }, []);
  const speech = useSpeech(appendSpeech);
  const listening = speech.status === 'listening';

  const result = useMemo(() => autoEdit(raw, { style, dictionary, snippets }), [raw, style, dictionary, snippets]);

  const stopSample = () => {
    window.clearInterval(playTimer.current);
    setPlaying(false);
  };

  const playSample = () => {
    if (listening) speech.stop();
    stopSample();
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
    if (listening) speech.stop();
    else speech.start();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const { fillers, corrections, snippets: snippetHits, dictionary: dictionaryHits } = result.stats;
  const chips = [
    fillers && `${fillers} filler${fillers > 1 ? 's' : ''} removed`,
    corrections && `${corrections} correction${corrections > 1 ? 's' : ''} applied`,
    snippetHits && `${snippetHits} snippet${snippetHits > 1 ? 's' : ''} expanded`,
    dictionaryHits && `${dictionaryHits} dictionary fix${dictionaryHits > 1 ? 'es' : ''}`,
  ].filter(Boolean) as string[];

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
              >
                {listening ? <Waveform active bars={6} /> : <MicIcon />}
                <span>{listening ? 'Stop listening' : 'Start dictating'}</span>
              </button>
              <button type="button" className="btn btn-outline" onClick={playing ? stopSample : playSample}>
                {playing ? 'Stop sample' : 'Play a sample'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  stopSample();
                  setRaw('');
                }}
                disabled={!raw}
              >
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

          <p className="demo-status" role="status">
            {speech.status === 'unsupported' && 'Live dictation isn’t available in this browser. Type or play a sample instead; the cleanup works the same.'}
            {speech.status === 'error' && speech.error}
            {listening && 'Listening… speak naturally, then press stop.'}
          </p>

          <div className="demo-panes">
            <div className="pane">
              <label htmlFor="raw-input" className="pane-label">
                What you said
              </label>
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
              {speech.interim && <p className="interim">{speech.interim}</p>}
            </div>
            <div className="pane pane-output">
              <div className="pane-head">
                <span className="pane-label" id="output-label">
                  What Murmur writes
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={copy} disabled={!result.text}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="output" aria-labelledby="output-label" aria-live="polite">
                {result.text ? result.text : <span className="placeholder">Your clean text shows up here.</span>}
              </div>
              <ul className="chips" aria-label="Edits applied">
                {chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="demo-lists">
            <EntryEditor
              title="Dictionary"
              description="When it hears…, write…"
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

          <p className="demo-fineprint">
            The mic only turns on when you press <strong>Start dictating</strong>, and your browser asks first. Recognition
            uses your browser’s built-in speech service; some browsers (like Chrome) process audio on their own servers.
            Cleanup runs locally with simple rules, not an AI model.
          </p>
        </div>
      </div>
    </section>
  );
}

interface EditorProps {
  title: string;
  description: string;
  fromLabel: string;
  toLabel: string;
  entries: Entry[];
  onChange: (entries: Entry[]) => void;
}

function EntryEditor({ title, description, fromLabel, toLabel, entries, onChange }: EditorProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const idBase = title.toLowerCase();

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!from.trim() || !to.trim()) return;
    onChange([...entries, { id: `${idBase}-${Date.now()}`, from: from.trim(), to: to.trim() }]);
    setFrom('');
    setTo('');
  };

  return (
    <div className="entry-editor">
      <h3>{title}</h3>
      <p className="entry-desc">{description}</p>
      <ul className="entries">
        {entries.map((entry) => (
          <li key={entry.id}>
            <span className="entry-from">{entry.from}</span>
            <span className="entry-arrow" aria-hidden="true">
              →
            </span>
            <span className="entry-to">{entry.to}</span>
            <button
              type="button"
              className="entry-remove"
              aria-label={`Remove ${entry.from}`}
              onClick={() => onChange(entries.filter((item) => item.id !== entry.id))}
            >
              ×
            </button>
          </li>
        ))}
        {entries.length === 0 && <li className="entries-empty">Nothing yet.</li>}
      </ul>
      <form className="entry-form" onSubmit={add}>
        <label className="sr-only" htmlFor={`${idBase}-from`}>
          {fromLabel}
        </label>
        <input id={`${idBase}-from`} value={from} onChange={(e) => setFrom(e.target.value)} placeholder={fromLabel} />
        <label className="sr-only" htmlFor={`${idBase}-to`}>
          {toLabel}
        </label>
        <input id={`${idBase}-to`} value={to} onChange={(e) => setTo(e.target.value)} placeholder={toLabel} />
        <button type="submit" className="btn btn-outline btn-sm" disabled={!from.trim() || !to.trim()}>
          Add
        </button>
      </form>
    </div>
  );
}
