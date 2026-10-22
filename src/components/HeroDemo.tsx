import { useEffect, useState } from 'react';
import { HERO_SCENES } from '../content';
import { usePrefersReducedMotion } from '../lib/hooks';
import Waveform from './Waveform';

type Phase = 'listening' | 'writing' | 'done';

export default function HeroDemo() {
  const reduced = usePrefersReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listening');
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = HERO_SCENES[sceneIndex];
  const spokenWords = scene.spoken.split(' ');
  const still = reduced || paused;

  useEffect(() => {
    if (still) return;
    const timer = window.setTimeout(
      () => {
        if (phase === 'listening') {
          if (progress < spokenWords.length) setProgress(progress + 1);
          else {
            setPhase('writing');
            setProgress(0);
          }
        } else if (phase === 'writing') {
          if (progress < scene.written.length) setProgress(Math.min(scene.written.length, progress + 3));
          else setPhase('done');
        } else {
          setSceneIndex((sceneIndex + 1) % HERO_SCENES.length);
          setPhase('listening');
          setProgress(0);
        }
      },
      phase === 'listening' ? 140 : phase === 'writing' ? 22 : 2600,
    );
    return () => window.clearTimeout(timer);
  }, [still, phase, progress, sceneIndex, scene.written.length, spokenWords.length]);

  const shownPhase: Phase = still ? 'done' : phase;
  const written = shownPhase === 'done' ? scene.written : shownPhase === 'writing' ? scene.written.slice(0, progress) : '';
  const heard = shownPhase === 'listening' ? spokenWords.slice(0, progress).join(' ') : scene.spoken;

  const selectScene = (index: number) => {
    setSceneIndex(index);
    setPhase('listening');
    setProgress(0);
  };

  return (
    <div className="hero-demo" aria-label="Animated example of Murmur cleaning up speech">
      <div className="hero-window">
        <div className="window-bar">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div className="scene-tabs" role="group" aria-label="Example app">
            {HERO_SCENES.map((item, index) => (
              <button
                key={item.app}
                type="button"
                className={index === sceneIndex ? 'is-active' : ''}
                aria-pressed={index === sceneIndex}
                onClick={() => selectScene(index)}
              >
                {item.app}
              </button>
            ))}
          </div>
          {!reduced && (
            <button type="button" className="pause-btn" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play animation' : 'Pause animation'}>
              {paused ? '▶' : '❚❚'}
            </button>
          )}
        </div>
        <div className="window-body">
          <p className="window-title">{scene.title}</p>
          <div className="heard">
            <span className="heard-label">Heard</span>
            <p>{heard || ' '}</p>
          </div>
          <div className="written" aria-live="off">
            <p>
              {written}
              {shownPhase === 'writing' && <span className="caret" aria-hidden="true" />}
            </p>
          </div>
        </div>
      </div>
      <div className={`flow-pill phase-${shownPhase}`} aria-hidden="true">
        <Waveform active={shownPhase === 'listening'} bars={14} />
        <span className="pill-label">{shownPhase === 'listening' ? 'Listening' : shownPhase === 'writing' ? 'Polishing' : 'Inserted'}</span>
      </div>
    </div>
  );
}
