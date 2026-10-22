import { useState, type FormEvent } from 'react';
import type { Entry } from '../lib/autoEdit';

interface EditorProps {
  title: string;
  description: string;
  fromLabel: string;
  toLabel: string;
  entries: Entry[];
  onChange: (entries: Entry[]) => void;
}

export default function EntryEditor({ title, description, fromLabel, toLabel, entries, onChange }: EditorProps) {
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
