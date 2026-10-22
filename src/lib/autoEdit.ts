// Rule-based "auto edit" used by the in-browser demo. It is intentionally
// simple and fully local: no network calls, no AI model.

export type Style = 'formal' | 'casual' | 'very-casual';

export interface Entry {
  id: string;
  from: string;
  to: string;
}

export interface EditOptions {
  style: Style;
  dictionary: Entry[];
  snippets: Entry[];
}

export interface EditResult {
  text: string;
  stats: {
    fillers: number;
    corrections: number;
    snippets: number;
    dictionary: number;
  };
}

const FILLERS = /\b(?:um+|uh+|erm+|er|hmm+|ah+|uh-huh)\b[,.]?\s*/gi;
const LIKE_FILLER = /,\s*like,\s*/gi;
const YOU_KNOW = /,?\s*\byou know\b,?\s*(?=\S)/gi;

const SPOKEN_PUNCTUATION: [RegExp, string][] = [
  [/\s*\bnew paragraph\b\s*/gi, '\n\n'],
  [/\s*\bnew line\b\s*/gi, '\n'],
  [/\s*\b(?:period|full stop)\b/gi, '.'],
  [/\s*\bcomma\b/gi, ','],
  [/\s*\bquestion mark\b/gi, '?'],
  [/\s*\bexclamation (?:point|mark)\b/gi, '!'],
  [/\s*\bcolon\b/gi, ':'],
];

// Words that a quick self-correction usually swaps: times, numbers, days.
const SWAPPABLE =
  '(?:\\d+(?::\\d+)?(?:\\s?(?:am|pm))?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|tonight)';
const CORRECTION = new RegExp(
  `\\b${SWAPPABLE}\\b,?\\s+(?:no wait|no sorry|sorry|i mean|actually|no)[,]?\\s+(${SWAPPABLE})\\b`,
  'gi',
);
const SCRATCH_THAT = /[^.!?\n]*\bscratch that\b[.,]?\s*/gi;

const CASUAL_TO_FORMAL: [RegExp, string][] = [
  [/\bgonna\b/gi, 'going to'],
  [/\bwanna\b/gi, 'want to'],
  [/\bgotta\b/gi, 'have to'],
  [/\bkinda\b/gi, 'somewhat'],
  [/\byeah\b/gi, 'yes'],
  [/\bnope\b/gi, 'no'],
  [/\bhey\b/gi, 'hello'],
  [/\bthanks\b/gi, 'thank you'],
  [/\bcan't\b/gi, 'cannot'],
  [/\bwon't\b/gi, 'will not'],
  [/\bdon't\b/gi, 'do not'],
  [/\bi'm\b/gi, 'I am'],
  [/\bit's\b/gi, 'it is'],
  [/\blet's\b/gi, 'let us'],
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text: string, pattern: RegExp) {
  return (text.match(pattern) ?? []).length;
}

// Replacements are swapped for placeholders so later punctuation and casing
// passes never touch them (URLs, emails, product names).
function replaceEntries(text: string, entries: Entry[], protectedValues: string[]) {
  let hits = 0;
  let out = text;
  for (const entry of entries) {
    const from = entry.from.trim();
    if (!from) continue;
    const pattern = new RegExp(`\\b${escapeRegExp(from)}\\b`, 'gi');
    out = out.replace(pattern, () => {
      hits += 1;
      protectedValues.push(entry.to);
      return `\uE000${protectedValues.length - 1}\uE000`;
    });
  }
  return { text: out, hits };
}

function restore(text: string, protectedValues: string[]) {
  return text.replace(/\uE000(\d+)\uE000/g, (_m, index: string) => protectedValues[Number(index)]);
}

const PROPER_NOUNS =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|june|july|august|september|october|november|december)\b/gi;
const LEAD_INTERJECTION = /(^|[.!?]\s+|\n)(hello|hey|hi|yes|yeah|no|okay|ok|so|well)\s+(?=[a-z])/gi;

function sentenceCase(text: string) {
  return text
    .replace(/\bi\b/g, 'I')
    .replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_m, lead: string, ch: string) => lead + ch.toUpperCase());
}

export function autoEdit(raw: string, options: EditOptions): EditResult {
  const stats = { fillers: 0, corrections: 0, snippets: 0, dictionary: 0 };
  let text = ` ${raw.replace(/\s+/g, ' ').trim()} `;
  if (!text.trim()) return { text: '', stats };

  stats.fillers += count(text, FILLERS) + count(text, LIKE_FILLER) + count(text, YOU_KNOW);
  text = text.replace(FILLERS, '').replace(LIKE_FILLER, ' ').replace(YOU_KNOW, ' ');

  // Repeated words: "the the" -> "the"
  const repeats = /\b(\w+)(\s+\1\b)+/gi;
  stats.fillers += count(text, repeats);
  text = text.replace(repeats, '$1');

  for (const [pattern, mark] of SPOKEN_PUNCTUATION) text = text.replace(pattern, mark);

  stats.corrections += count(text, SCRATCH_THAT) + count(text, CORRECTION);
  text = text.replace(SCRATCH_THAT, '').replace(CORRECTION, '$1');

  const protectedValues: string[] = [];
  const snippetPass = replaceEntries(text, options.snippets, protectedValues);
  stats.snippets = snippetPass.hits;
  text = snippetPass.text;

  const dictionaryPass = replaceEntries(text, options.dictionary, protectedValues);
  stats.dictionary = dictionaryPass.hits;
  text = dictionaryPass.text;

  if (options.style === 'formal') {
    for (const [pattern, replacement] of CASUAL_TO_FORMAL) text = text.replace(pattern, replacement);
  }

  text = text
    .replace(/[ \t]+([,.!?:])/g, '$1')
    .replace(/([,.!?:])(?=[^\s\d"')\]])/g, '$1 ')
    .replace(/,\s*([.!?])/g, '$1')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[\s,]+/, '')
    .trim();

  text = text.replace(LEAD_INTERJECTION, '$1$2, ');
  text = sentenceCase(text).replace(PROPER_NOUNS, (day) => day[0].toUpperCase() + day.slice(1).toLowerCase());

  if (options.style === 'very-casual') {
    text = text
      .replace(/(^|[.!?]\s+|\n)([A-Z])(?![A-Z])/g, (_m, lead: string, ch: string) => lead + ch.toLowerCase())
      .replace(/\bI\b(?=')/g, 'i')
      .replace(/\.$/, '');
  } else {
    text = text.replace(/([^\s.!?:,])(?=\n)/g, '$1.');
    if (text && !/[.!?:]$/.test(text)) text += '.';
  }

  return { text: restore(text, protectedValues), stats };
}
