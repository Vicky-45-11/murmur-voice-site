import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings for the Web Speech API, which TypeScript's DOM lib omits.
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  isFinal: boolean;
  0: SpeechAlternative;
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
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
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

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser’s site settings, or type below instead.',
  'service-not-allowed': 'Your browser’s speech service is turned off. You can still type below.',
  'no-speech': 'No speech detected. Try again a little closer to the mic.',
  'audio-capture': 'No microphone was found.',
  network: 'Your browser’s speech service could not be reached. You can still type below.',
};

export type SpeechStatus = 'idle' | 'listening' | 'unsupported' | 'error';

export function useSpeech(onFinal: (text: string) => void) {
  const [status, setStatus] = useState<SpeechStatus>(() => (getRecognition() ? 'idle' : 'unsupported'));
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Only ever called from a click handler, so the mic is never opened without
  // an explicit user action; the browser shows its own permission prompt.
  const start = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor) {
      setStatus('unsupported');
      return;
    }
    const recognition = new Ctor();
    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) onFinalRef.current(result[0].transcript);
        else pending += result[0].transcript;
      }
      setInterim(pending);
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setError(ERROR_MESSAGES[event.error] ?? 'Something went wrong with speech recognition.');
      setStatus('error');
    };
    recognition.onend = () => {
      setInterim('');
      setStatus((current) => (current === 'error' ? current : 'idle'));
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setError('');
    setStatus('listening');
    try {
      recognition.start();
    } catch {
      setError('Speech recognition could not start. Try again.');
      setStatus('error');
    }
  }, []);

  return { status, interim, error, start, stop };
}
