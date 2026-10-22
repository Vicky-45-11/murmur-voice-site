import { useEffect, useState } from 'react';

// A live input-level reading so people can see the mic is actually picking
// them up. Runs only while `active` is true (i.e. after the user pressed the
// mic button) and releases the microphone as soon as it stops.
export function useMicLevel(active: boolean) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!active || !navigator.mediaDevices?.getUserMedia) return;
    // Phones often can't share the mic between two listeners; skip the meter there.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let cancelled = false;
    let frame = 0;
    let last = 0;
    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;

    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 512;
        context.createMediaStreamSource(media).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const tick = (time: number) => {
          frame = requestAnimationFrame(tick);
          if (time - last < 60) return;
          last = time;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const value of data) sum += ((value - 128) / 128) ** 2;
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(1, rms * 4));
        };
        frame = requestAnimationFrame(tick);
      })
      .catch(() => {
        // The meter is a nicety; recognition reports permission problems itself.
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      context?.close().catch(() => undefined);
      setLevel(0);
    };
  }, [active]);

  return level;
}
