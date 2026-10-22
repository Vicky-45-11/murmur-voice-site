import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings for the Web Speech API, which TypeScript's DOM lib omits.
interface SpeechAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechAlternative;
}
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}
interface SpeechErrorEvent {
  error: string;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionConstructor = new () => Recognition;

function getRecognition(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Errors that mean "stop trying"; anything else (no-speech, a dropped
// session) is recovered by quietly restarting while the user still wants to talk.
const inFrame = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const FATAL_ERRORS: Record<string, string> = {
  'not-allowed': inFrame
    ? 'This preview window blocks the microphone. Open the site in its own tab (your Vercel link) to dictate, or type below.'
    : 'Microphone access was blocked. Allow it from the lock icon in the address bar, then press the mic again.',
  'service-not-allowed': 'Your browser’s speech service is turned off. You can still type below.',
  'audio-capture': 'No microphone was found. Check that one is plugged in and selected in your system settings.',
  network:
    'Your browser’s speech service could not be reached. Check your connection. Brave and some privacy browsers block it; Chrome or Edge work.',
  'language-not-supported': 'This browser can’t recognise the selected language. Pick another one.',
};

export const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
];

export function defaultLanguage() {
  const preferred = typeof navigator === 'undefined' ? 'en-US' : navigator.language;
  return (
    LANGUAGES.find((lang) => lang.code.toLowerCase() === preferred.toLowerCase())?.code ??
    LANGUAGES.find((lang) => lang.code.slice(0, 2) === preferred.slice(0, 2))?.code ??
    'en-US'
  );
}

export type SpeechStatus = 'idle' | 'listening' | 'unsupported' | 'error';

export interface FinalPhrase {
  text: string;
  confidence: number;
}

function bestAlternative(result: SpeechResult): SpeechAlternative {
  let best = result[0];
  for (let i = 1; i < result.length; i += 1) {
    if (result[i] && result[i].confidence > best.confidence) best = result[i];
  }
  return best;
}

export function useSpeech(onFinal: (phrase: FinalPhrase) => void, lang: string) {
  const [status, setStatus] = useState<SpeechStatus>(() => (getRecognition() ? 'idle' : 'unsupported'));
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [hearing, setHearing] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [notice, setNotice] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);
  const wantedRef = useRef(false);
  const restartTimer = useRef<number>();
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const teardown = useCallback(() => {
    window.clearTimeout(restartTimer.current);
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.abort();
    }
  }, []);

  useEffect(() => () => {
    wantedRef.current = false;
    teardown();
  }, [teardown]);

  const open = useCallback((isRestart: boolean) => {
    const Ctor = getRecognition();
    if (!Ctor) {
      setStatus('unsupported');
      return;
    }
    const recognition = new Ctor();
    recognition.lang = lang;
    // Chrome on Android repeats and merges results in continuous mode, so
    // there we take one phrase per session and reopen after each pause.
    recognition.continuous = !/android/i.test(navigator.userAgent);
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    // Results already handed over in this session, so a browser that re-sends
    // finished results (Chrome on Android does) can't duplicate words.
    const committed = new Set<number>();
    // Chrome on Android sends each final result as the whole session so far
    // ("send the", "send the file"); keep only the new words.
    let sessionText = '';
    let pendingText = '';
    const commit = (raw: string, confidence: number) => {
      let text = raw.trim();
      const lower = text.toLowerCase();
      const seen = sessionText.toLowerCase();
      if (seen.split(' ').length >= 3 && lower === seen) return;
      if (seen && lower.length > seen.length && lower.startsWith(`${seen} `)) text = text.slice(seen.length).trim();
      if (!text) return;
      sessionText = `${sessionText} ${text}`.trim();
      onFinalRef.current({ text, confidence });
    };

    recognition.onaudiostart = () => setAudioActive(true);
    recognition.onspeechstart = () => setHearing(true);
    recognition.onresult = (event) => {
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alternative = bestAlternative(result);
        if (result.isFinal) {
          if (committed.has(i)) continue;
          committed.add(i);
          commit(alternative.transcript, alternative.confidence);
        } else {
          pending += alternative.transcript;
        }
      }
      pendingText = pending.trim();
      setInterim(pendingText);
      setHearing(true);
    };
    recognition.onerror = (event) => {
      const message = FATAL_ERRORS[event.error];
      if (!message) return; // no-speech, aborted: the onend restart handles it
      wantedRef.current = false;
      if (isRestart && event.error === 'not-allowed') {
        // Safari and iOS refuse to reopen the mic without a fresh tap.
        setNotice('Paused after a silence. Press the mic to keep going.');
        return;
      }
      setError(message);
      setStatus('error');
    };
    recognition.onend = () => {
      // Some engines end the session without finalising the last words.
      if (pendingText) commit(pendingText, 0);
      pendingText = '';
      setInterim('');
      setHearing(false);
      setAudioActive(false);
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      // Browsers end a session after a pause or about a minute of audio.
      // Reopen it so long dictation keeps going until the user presses stop.
      if (wantedRef.current) {
        restartTimer.current = window.setTimeout(() => open(true), 150);
      } else {
        setStatus((current) => (current === 'error' ? current : 'idle'));
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      wantedRef.current = false;
      recognitionRef.current = null;
      setError('Speech recognition could not start. Try again.');
      setStatus('error');
    }
  }, [lang]);

  // Only ever called from a user action, so the mic is never opened without
  // one; the browser shows its own permission prompt the first time.
  const start = useCallback(() => {
    teardown();
    wantedRef.current = true;
    setError('');
    setNotice('');
    setStatus('listening');
    open(false);
  }, [open, teardown]);

  const stop = useCallback(() => {
    wantedRef.current = false;
    window.clearTimeout(restartTimer.current);
    const recognition = recognitionRef.current;
    if (recognition) recognition.stop(); // stop() flushes the last phrase as final
    else setStatus((current) => (current === 'listening' ? 'idle' : current));
  }, []);

  return { status, interim, error, notice, hearing, audioActive, start, stop };
}
