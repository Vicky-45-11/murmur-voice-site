import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { readStored, writeStored } from '../lib/hooks';

interface Props {
  open: boolean;
  plan: string;
  onClose: () => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistDialog({ open, plan, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<string | null>(() => readStored<string | null>('murmur.waitlist', null));
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    const value = email.trim();
    writeStored('murmur.waitlist', value);
    setSaved(value);
    setEmail('');
    setError('');
  };

  const clear = () => {
    try {
      window.localStorage.removeItem('murmur.waitlist');
    } catch {
      // ignore unavailable storage
    }
    setSaved(null);
  };

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="dialog-body">
        <button type="button" className="dialog-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">{plan} plan</p>
        <h2 id={titleId}>Join the waitlist</h2>
        {saved ? (
          <>
            <p>
              You’re on the list as <strong>{saved}</strong>.
            </p>
            <p className="dialog-note">
              This is a concept site, so your email was saved only in this browser. Nothing was sent anywhere.
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Done
              </button>
              <button type="button" className="btn btn-ghost" onClick={clear}>
                Remove my email
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <p>Get a note when the desktop app is ready to try.</p>
            <label htmlFor="waitlist-email">Email</label>
            <input
              id="waitlist-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby="waitlist-help"
              placeholder="you@example.com"
            />
            <p id="waitlist-help" className={error ? 'field-error' : 'dialog-note'}>
              {error || 'Stored only in this browser. This concept site has no server.'}
            </p>
            <button type="submit" className="btn btn-primary btn-lg">
              Join waitlist
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
