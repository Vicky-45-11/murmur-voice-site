import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { readStored, writeStored } from '../lib/hooks';
import { consistency, makeText, netWpm, score, type TextKind } from '../lib/typing';
import SectionHeading from './SectionHeading';
import VoiceRace, { TYPICAL_SPEAKING_WPM } from './VoiceRace';
import WpmChart, { type Sample } from './WpmChart';

interface Mode {
  id: string;
  label: string;
  seconds?: number;
  count: number;
}

const MODES: Mode[] = [
  { id: 't15', label: '15 s', seconds: 15, count: 120 },
  { id: 't30', label: '30 s', seconds: 30, count: 180 },
  { id: 't60', label: '60 s', seconds: 60, count: 260 },
  { id: 'w25', label: '25 words', count: 25 },
];

const KINDS: { id: TextKind; label: string; hint: string }[] = [
  { id: 'words', label: 'Words', hint: 'Plain everyday words' },
  { id: 'sentences', label: 'Sentences', hint: 'Capitals and punctuation, like a real message' },
];

// Characters per second at a conversational speaking pace.
const GHOST_CPS = (TYPICAL_SPEAKING_WPM * 5) / 60;
const MAX_EXTRA = 8;

interface Result {
  id: number;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number | null;
  seconds: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  samples: Sample[];
  completedWords: number;
  best: number;
  isBest: boolean;
}

interface WordProps {
  word: string;
  typed: string | undefined;
  active: boolean;
  ghost: number;
}

const Word = memo(function Word({ word, typed, active, ghost }: WordProps) {
  const done = typed !== undefined && !active;
  const t = typed ?? '';
  const chars = word.split('').map((char, j) => {
    let state = 'idle';
    if (j < t.length) state = t[j] === char ? 'ok' : 'bad';
    else if (done) state = 'missed';
    return (
      <span key={j} className={`c-${state}${j === ghost ? ' is-ghost' : ''}`}>
        {j === t.length && active && <i className="tt-caret" aria-hidden="true" />}
        {char}
      </span>
    );
  });
  const extras = t.slice(word.length).split('');
  const incorrect = done && t !== word;
  return (
    <span className={`tt-word${incorrect ? ' is-wrong' : ''}`} data-current={active || undefined}>
      {chars}
      {extras.map((char, j) => (
        <span key={`x${j}`} className="c-extra">
          {char}
        </span>
      ))}
      {active && t.length >= word.length && <i className="tt-caret" aria-hidden="true" />}
    </span>
  );
});

type Phase = 'idle' | 'running' | 'done';

interface Props {
  onTypingWpm: (wpm: number) => void;
  onSpeakingWpm: (wpm: number) => void;
}

export default function TypingTest({ onTypingWpm, onSpeakingWpm }: Props) {
  const [kind, setKind] = useState<TextKind>(() => readStored('murmur.typing.kind', 'words'));
  const [modeId, setModeId] = useState(() => readStored('murmur.typing.mode', 't30'));
  const [ghostOn, setGhostOn] = useState(() => readStored('murmur.typing.ghost', true));
  const mode = MODES.find((m) => m.id === modeId) ?? MODES[1];

  const [words, setWords] = useState<string[]>(() => makeText(kind, mode.count));
  const [typed, setTyped] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [focused, setFocused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [layoutTick, setLayoutTick] = useState(0);
  const [shift, setShift] = useState(0);

  // Mutable mirror of the test so key handling and timers never read stale state.
  const live = useRef({ words, typed: [] as string[], current: 0, phase: 'idle' as Phase });
  const keys = useRef({ total: 0, wrong: 0 });
  const startedAt = useRef(0);
  const samples = useRef<Sample[]>([]);
  const lastRaw = useRef(0);
  const resultId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => writeStored('murmur.typing.kind', kind), [kind]);
  useEffect(() => writeStored('murmur.typing.mode', modeId), [modeId]);
  useEffect(() => writeStored('murmur.typing.ghost', ghostOn), [ghostOn]);

  const restart = useCallback(
    (focus = true) => {
      const next = makeText(kind, mode.count);
      live.current = { words: next, typed: [], current: 0, phase: 'idle' };
      keys.current = { total: 0, wrong: 0 };
      samples.current = [];
      lastRaw.current = 0;
      setWords(next);
      setTyped([]);
      setCurrent(0);
      setPhase('idle');
      setElapsed(0);
      setResult(null);
      setShift(0);
      if (focus) window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [kind, mode.count],
  );

  // A new text whenever the kind or length changes (and once on mount).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      live.current.words = words;
      return;
    }
    restart(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart already depends on kind and mode
  }, [restart]);

  const finish = useCallback(
    (ms: number) => {
      if (live.current.phase === 'done') return;
      live.current.phase = 'done';
      const { words: w, typed: t, current: c } = live.current;
      const sc = score(w, t, c);
      const net = netWpm(sc.correctChars, ms);
      const raw = netWpm(sc.rawChars, ms);
      const accuracy = keys.current.total ? Math.round((1 - keys.current.wrong / keys.current.total) * 100) : 100;
      const perSecond = samples.current.map((s) => s.raw);
      const seconds = Math.round(ms / 100) / 10;
      if (!samples.current.length || samples.current[samples.current.length - 1].t < Math.floor(ms / 1000)) {
        samples.current.push({ t: Math.max(1, Math.round(ms / 1000)), wpm: net, raw });
      }
      const bestKey = `${kind}-${modeId}`;
      const bests = readStored<Record<string, number>>('murmur.typing.best', {});
      const previous = bests[bestKey] ?? 0;
      const rounded = Math.round(net);
      const isBest = rounded > previous && rounded > 0;
      if (isBest) writeStored('murmur.typing.best', { ...bests, [bestKey]: rounded });
      resultId.current += 1;
      setResult({
        id: resultId.current,
        wpm: net,
        raw,
        accuracy,
        consistency: consistency(perSecond),
        seconds,
        correct: sc.correct,
        incorrect: sc.incorrect,
        extra: sc.extra,
        missed: sc.missed,
        samples: [...samples.current],
        completedWords: sc.completedWords,
        best: Math.max(previous, rounded),
        isBest,
      });
      setPhase('done');
      setElapsed(ms);
      onTypingWpm(net);
    },
    [kind, modeId, onTypingWpm],
  );

  // Clock: ticks while the test is running, records a sample each second.
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setInterval(() => {
      const ms = performance.now() - startedAt.current;
      if (mode.seconds && ms >= mode.seconds * 1000) {
        finish(mode.seconds * 1000);
        return;
      }
      setElapsed(ms);
      const second = Math.floor(ms / 1000);
      if (second > samples.current.length) {
        const { words: w, typed: t, current: c } = live.current;
        const sc = score(w, t, c);
        samples.current.push({
          t: second,
          wpm: netWpm(sc.correctChars, second * 1000),
          raw: Math.max(0, (sc.rawChars - lastRaw.current) * 12),
        });
        lastRaw.current = sc.rawChars;
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, mode.seconds, finish]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const s = live.current;
    if (s.phase === 'done') return;
    const word = s.words[s.current];
    if (word === undefined) return;
    const value = event.target.value;
    if (s.phase === 'idle' && value.replace(/ /g, '')) {
      s.phase = 'running';
      startedAt.current = performance.now();
      setPhase('running');
    }
    const spaceAt = value.indexOf(' ');
    const body = (spaceAt === -1 ? value : value.slice(0, spaceAt)).slice(0, word.length + MAX_EXTRA);
    if (spaceAt !== -1 && !body) return; // a space before any letter does nothing

    const previous = s.typed[s.current] ?? '';
    for (let k = previous.length; k < body.length; k += 1) {
      keys.current.total += 1;
      if (k >= word.length || body[k] !== word[k]) keys.current.wrong += 1;
    }
    s.typed[s.current] = body;

    let done = false;
    if (spaceAt !== -1) {
      keys.current.total += 1;
      if (body !== word) keys.current.wrong += 1;
      s.current += 1;
      done = s.current >= s.words.length;
    } else if (s.current === s.words.length - 1 && body.length >= word.length) {
      done = true; // the last word needs no trailing space
    }
    setTyped([...s.typed]);
    setCurrent(s.current);
    if (done) finish(performance.now() - startedAt.current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      restart();
    }
  };

  // Keep the current line in the middle row of a three-row window.
  const rowStep = useRef(0);
  useLayoutEffect(() => {
    const el = wordsRef.current?.querySelector<HTMLElement>('[data-current]');
    if (!el) return;
    if (!rowStep.current || layoutTick) rowStep.current = el.offsetHeight;
    setShift(Math.max(0, el.offsetTop - rowStep.current));
  }, [current, words, layoutTick]);

  useEffect(() => {
    const onResize = () => {
      rowStep.current = 0;
      setLayoutTick((tick) => tick + 1);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Where the "talking pace" ghost caret is right now.
  const offsets = useMemo(() => {
    const out: number[] = [];
    let total = 0;
    for (const w of words) {
      out.push(total);
      total += w.length + 1;
    }
    return out;
  }, [words]);
  const ghostIndex = ghostOn && phase === 'running' ? Math.floor((elapsed / 1000) * GHOST_CPS) : -1;
  let ghostWord = -1;
  let ghostChar = -1;
  if (ghostIndex >= 0) {
    for (let i = offsets.length - 1; i >= 0; i -= 1) {
      if (offsets[i] <= ghostIndex) {
        ghostWord = i;
        ghostChar = Math.min(ghostIndex - offsets[i], words[i].length - 1);
        break;
      }
    }
  }

  const liveScore = score(words, typed, current);
  const liveWpm = phase === 'running' && elapsed > 2000 ? Math.round(netWpm(liveScore.correctChars, elapsed)) : null;
  const remaining = mode.seconds ? Math.max(0, Math.ceil(mode.seconds - elapsed / 1000)) : null;
  const progress = mode.seconds ? `${remaining}s` : `${Math.min(current, words.length)}/${words.length}`;

  const raceWords = useMemo(() => {
    if (!result) return [];
    return words.slice(0, Math.min(30, Math.max(12, result.completedWords)));
  }, [result, words]);

  return (
    <section className="section typing-section" id="typing" aria-labelledby="typing-title">
      <div className="container">
        <SectionHeading
          id="typing-title"
          eyebrow="Typing test"
          title={
            <>
              How fast do you <em>actually</em> type?
            </>
          }
          body="Take a quick test, then read the same words out loud and see which one wins. A lilac marker runs along the text at a normal speaking pace, so you can race it."
        />

        <div className="tt-card">
          <div className="tt-bar">
            <div className="segmented segmented-dark" role="radiogroup" aria-label="Text type">
              {KINDS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={kind === option.id}
                  className={kind === option.id ? 'is-active' : ''}
                  title={option.hint}
                  onClick={() => setKind(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="segmented segmented-dark" role="radiogroup" aria-label="Test length">
              {MODES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={modeId === option.id}
                  className={modeId === option.id ? 'is-active' : ''}
                  onClick={() => setModeId(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="toggle toggle-dark" htmlFor="ghost-toggle">
              <input id="ghost-toggle" type="checkbox" checked={ghostOn} onChange={(e) => setGhostOn(e.target.checked)} />
              <span>Speaking-pace marker</span>
            </label>
          </div>

          {phase !== 'done' && (
            <>
              <div className="tt-live" aria-hidden="true">
                <span className="tt-clock">{progress}</span>
                <span className="tt-wpm">{liveWpm !== null ? `${liveWpm} wpm` : phase === 'running' ? '…' : ''}</span>
              </div>
              <div className={`tt-stage ${focused ? 'is-focused' : ''}`} onClick={() => inputRef.current?.focus()}>
                <input
                  ref={inputRef}
                  className="tt-input"
                  type="text"
                  value={typed[current] ?? ''}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  aria-label="Typing test input. Type the words shown. Press Escape to restart."
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  maxLength={40}
                />
                <div className={`tt-window ${focused ? '' : 'is-blurred'}`} aria-hidden="true">
                  <div ref={wordsRef} className="tt-words" style={{ transform: `translateY(${-shift}px)` }}>
                    {words.map((word, index) => (
                      <Word
                        key={index}
                        word={word}
                        typed={typed[index]}
                        active={index === current}
                        ghost={index === ghostWord ? ghostChar : -1}
                      />
                    ))}
                  </div>
                </div>
                {!focused && (
                  <button type="button" className="tt-focus" onClick={() => inputRef.current?.focus()}>
                    Click here or tap to start typing
                  </button>
                )}
              </div>
              <div className="tt-foot">
                <span>
                  {phase === 'idle' ? 'The clock starts on your first key.' : 'Keep going.'} <kbd>Esc</kbd> restarts.
                </span>
                <button type="button" className="btn btn-outline-light btn-sm" onClick={() => restart()}>
                  New text
                </button>
              </div>
            </>
          )}

          {phase === 'done' && result && (
            <div className="tt-results" role="region" aria-label="Typing test results">
              <div className="tt-headline">
                <div>
                  <p className="tt-label">Speed</p>
                  <p className="tt-big" aria-live="polite">
                    {Math.round(result.wpm)}
                    <small> wpm</small>
                  </p>
                  <p className="tt-sub">
                    {result.isBest ? 'New personal best for this mode.' : result.best > 0 ? `Your best here: ${result.best} wpm` : ' '}
                  </p>
                </div>
                <div>
                  <p className="tt-label">Accuracy</p>
                  <p className="tt-big">
                    {result.accuracy}
                    <small>%</small>
                  </p>
                </div>
                <ul className="tt-stats">
                  <li>
                    <span>Raw</span>
                    <b>{Math.round(result.raw)}</b>
                  </li>
                  <li>
                    <span>Consistency</span>
                    <b>{result.consistency === null ? '–' : `${result.consistency}%`}</b>
                  </li>
                  <li>
                    <span>Time</span>
                    <b>{result.seconds}s</b>
                  </li>
                  <li title="correct / incorrect / extra / missed">
                    <span>Characters</span>
                    <b>
                      {result.correct}/{result.incorrect}/{result.extra}/{result.missed}
                    </b>
                  </li>
                </ul>
              </div>
              <WpmChart samples={result.samples} />
              <div className="tt-actions">
                <button type="button" className="btn btn-light" onClick={() => restart()}>
                  Try again
                </button>
                <a href="#speed-title" className="btn btn-outline-light">
                  See what that means for your week
                </a>
              </div>
              <VoiceRace key={result.id} words={raceWords} typingWpm={result.wpm} onSpeakingWpm={onSpeakingWpm} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
