// Text, scoring and speech matching for the typing test. Pure functions so
// the maths can be tested without a browser.

export type TextKind = 'words' | 'sentences';

// Everyday English words (no copyrighted list), enough for a 60 second test.
const WORDS = (
  'the of and to in is you that it he was for on are as with his they at be this from have or by one had not but what all were when we there can an your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know get through back much before go good new write our me man too any day same right look think also around another came come work three word must because does part even place well such here take why help put different away again off went old number great tell men say small every found still between name should home big give air line set own under read last never us left end along while might next sound below saw something thought both few those always show large often together asked house world going want school important until form food keep children feet land side without boy once animal life enough took sometimes four head above kind began almost live page got earth need far hand high year mother light country father let night picture being study second soon story since white ever paper hard near sentence better best across during today however sure knew try told young sun thing whole hear example heard several change answer room sea against top turned learn point city play toward five using himself usually'
).split(' ');

// Short original sentences about writing and talking, with real capitals and
// punctuation so the test feels like typing an actual message.
const SENTENCES = [
  'Send the notes before lunch, and I will review them this afternoon.',
  'Most good ideas arrive while you are walking, not while you are typing.',
  'Could you move the review to Friday? I need one more day to finish.',
  'A clear email says what you want in the first two lines.',
  'The meeting ran long, so we agreed to share a summary instead.',
  'Read it out loud once; your ear catches what your eyes skip.',
  'Thanks for the quick reply, that answers everything I was worried about.',
  'Draft fast, edit slowly, and let the second pass do the polishing.',
  'We shipped the update on Tuesday, and the first reports look great.',
  'If the instructions feel long, the first step is usually to cut them.',
  'She spoke for a minute and the page filled itself with clean sentences.',
  'Please add the new teammate to the channel and share the launch plan.',
  'Short paragraphs are easier to read on a phone, so keep them tight.',
  'The best time to write a note is right after the conversation ends.',
  'He mumbled a few ums, paused, and then said exactly what he meant.',
  'Keep one tab for today and close the other twenty without guilt.',
  'Typing is a skill, but talking is something you already do all day.',
  'Before you hit send, check the name, the date, and the attachment.',
];

function pick<T>(items: T[], avoid?: T): T {
  let item = items[Math.floor(Math.random() * items.length)];
  if (avoid !== undefined && items.length > 1 && item === avoid) item = items[(items.indexOf(item) + 1) % items.length];
  return item;
}

export function makeText(kind: TextKind, count: number): string[] {
  const out: string[] = [];
  if (kind === 'words') {
    while (out.length < count) out.push(pick(WORDS, out[out.length - 1]));
    return out;
  }
  let last = '';
  while (out.length < count) {
    last = pick(SENTENCES, last);
    out.push(...last.split(' '));
  }
  return out;
}

export interface Score {
  /** Characters in correct words (plus their spaces) and correct letters in the current word. */
  correctChars: number;
  /** Every character typed, including spaces. */
  rawChars: number;
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  completedWords: number;
}

export function score(words: string[], typed: string[], current: number): Score {
  const s: Score = { correctChars: 0, rawChars: 0, correct: 0, incorrect: 0, extra: 0, missed: 0, completedWords: 0 };
  const last = Math.min(current, words.length - 1);
  for (let i = 0; i <= last; i += 1) {
    const word = words[i];
    const t = typed[i] ?? '';
    const finished = i < current;
    if (!t && !finished) continue;
    let matching = 0;
    for (let j = 0; j < t.length; j += 1) {
      if (j >= word.length) s.extra += 1;
      else if (t[j] === word[j]) {
        matching += 1;
        s.correct += 1;
      } else s.incorrect += 1;
    }
    s.rawChars += t.length + (finished ? 1 : 0);
    if (finished) {
      s.completedWords += 1;
      if (t === word) s.correctChars += word.length + 1;
      else s.missed += Math.max(0, word.length - t.length);
    } else {
      s.correctChars += matching;
    }
  }
  return s;
}

export function netWpm(correctChars: number, ms: number) {
  return ms > 0 ? correctChars / 5 / (ms / 60000) : 0;
}

/** 100 means perfectly even speed from second to second. */
export function consistency(perSecond: number[]) {
  if (perSecond.length < 3) return null;
  const mean = perSecond.reduce((a, b) => a + b, 0) / perSecond.length;
  if (mean <= 0) return 0;
  const variance = perSecond.reduce((a, b) => a + (b - mean) ** 2, 0) / perSecond.length;
  return Math.max(0, Math.round(100 * (1 - Math.sqrt(variance) / mean)));
}

const normalise = (token: string) => token.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export function tokens(text: string) {
  return text.split(/\s+/).map(normalise).filter(Boolean);
}

/**
 * Walks the recognised words along the target text. A recogniser may drop or
 * add a word, so a recognised word may jump up to two target words ahead.
 */
export function matchSpoken(target: string[], spoken: string) {
  const goal = target.map(normalise);
  let pointer = 0;
  let matched = 0;
  for (const word of tokens(spoken)) {
    for (let skip = 0; skip <= 2 && pointer + skip < goal.length; skip += 1) {
      if (goal[pointer + skip] === word) {
        pointer += skip + 1;
        matched += 1;
        break;
      }
    }
    if (pointer >= goal.length) break;
  }
  return { pointer, matched };
}
