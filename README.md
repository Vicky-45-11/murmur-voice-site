# Murmur: voice-to-text concept site

A standalone marketing site for a fictional voice-dictation product, inspired by the
layout and feel of modern voice-AI product sites. Original name, logo, copy and art.
No third-party brand assets, testimonials or customer statistics are used.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
npm run lint
```

Requires Node 18+.

## What's on the page

| Section | What works |
| --- | --- |
| Nav | Sticky, blurs on scroll, anchor links, mobile menu (Esc closes, closes on link) |
| Hero | Animated app window: speech is "heard", then cleaned text types in. Mail / Chat / Editor tabs, pause button |
| App strip | Looping marquee of places you type (pauses on hover) |
| Live demo | Real dictation with the browser's Web Speech API (mic only after a click), "Play a sample", or type. Styles: Formal / Casual / Very casual. Editable Dictionary and Snippets (saved in localStorage). Copy button |
| Features | Six cards with before/after examples |
| Use cases | Keyboard-accessible tabs (arrow keys, Home/End) |
| Speed calculator | Sliders for typing speed and words per day vs. a stated 150 wpm speaking pace |
| Privacy | What runs where |
| Pricing | Monthly / yearly toggle; buttons open the waitlist (labelled illustrative) |
| FAQ | Accordion |
| Waitlist | Native `<dialog>` with validation; email is stored only in localStorage |

## How the cleanup works

`src/lib/autoEdit.ts` is a small, local rule set (no AI, no network):
removes fillers and repeated words, applies quick self-corrections
("3 no wait 4", "scratch that"), converts spoken punctuation ("comma",
"new paragraph"), expands snippets, applies the dictionary, and adjusts tone.

## Honest limitations

- There is no desktop app; the site says so in the hero badge, FAQ and pricing.
- Live dictation needs Chrome, Edge or Safari. Firefox falls back to typing/samples.
  Chrome's speech recognition sends audio to Google's servers; the page discloses this.
- Cleanup rules are English-only and simple compared with a real AI editor.

## Structure

```
src/
  App.tsx              page composition + waitlist state
  content.ts           all copy and data
  styles.css           design tokens + section styles
  lib/autoEdit.ts      cleanup engine
  lib/useSpeech.ts     Web Speech API hook
  lib/hooks.ts         reduced motion, scroll reveal, safe localStorage
  components/          one file per section
```
