import type { Entry, Style } from './lib/autoEdit';

export const NAV_LINKS = [
  { href: '#demo', label: 'Try it' },
  { href: '#features', label: 'Features' },
  { href: '#use-cases', label: 'Use cases' },
  { href: '#typing', label: 'Typing test' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export const HERO_SCENES = [
  {
    app: 'Mail',
    title: 'Re: Thursday planning',
    spoken: 'um hey jordan so i think we should uh move the review to thursday no wait friday at 2 comma does that work for you question mark',
    written: 'Hey Jordan, I think we should move the review to Friday at 2. Does that work for you?',
  },
  {
    app: 'Chat',
    title: '#launch-room',
    spoken: 'okay so like the the build is green and uh i’ll ship it after lunch exclamation point',
    written: 'Okay, the build is green and I’ll ship it after lunch!',
  },
  {
    app: 'Editor',
    title: 'prompt.md',
    spoken: 'write a function that uh takes a list of orders and you know returns the total for each customer sorted by amount',
    written: 'Write a function that takes a list of orders and returns the total for each customer, sorted by amount.',
  },
];

export const APP_SURFACES = ['Email', 'Team chat', 'Docs', 'Notes', 'Code editors', 'AI prompts', 'Browsers', 'Spreadsheets', 'CRMs', 'Support desks'];

export const SAMPLES = [
  'um so hey team i wanted to uh share a quick update the the launch is moving to tuesday no wait wednesday comma and you know we still need final copy period thanks',
  'can you send my calendar link to the new hire question mark also the post gress migration finished new paragraph scratch that it finishes tonight',
  'yeah i’m gonna review the pull request after lunch and uh leave comments on the auth flow period',
];

export const DEFAULT_DICTIONARY: Entry[] = [
  { id: 'd1', from: 'post gress', to: 'Postgres' },
  { id: 'd2', from: 'murmur', to: 'Murmur' },
];

export const DEFAULT_SNIPPETS: Entry[] = [
  { id: 's1', from: 'my calendar link', to: 'cal.example.com/you' },
  { id: 's2', from: 'my sign off', to: '— Talk soon' },
];

export const STYLES: { id: Style; label: string; hint: string }[] = [
  { id: 'formal', label: 'Formal', hint: 'Full sentences, no slang' },
  { id: 'casual', label: 'Casual', hint: 'Natural and friendly' },
  { id: 'very-casual', label: 'Very casual', hint: 'lowercase, no final period' },
];

export const FEATURES = [
  {
    id: 'edits',
    title: 'Auto-edits as you speak',
    body: 'Filler words, false starts and repeated words drop out. Say “no wait” or “scratch that” and the correction sticks.',
    demo: { before: 'meet at uh 3 no wait 4', after: 'Meet at 4.' },
  },
  {
    id: 'dictionary',
    title: 'A dictionary that learns your words',
    body: 'Names, acronyms and product terms get spelled the way your team spells them, every time.',
    demo: { before: 'the post gress index', after: 'The Postgres index.' },
  },
  {
    id: 'snippets',
    title: 'Snippets for things you repeat',
    body: 'Say a short cue and get the full text: links, addresses, sign-offs, boilerplate replies.',
    demo: { before: 'here is my calendar link', after: 'Here is cal.example.com/you.' },
  },
  {
    id: 'styles',
    title: 'Tone that fits the app',
    body: 'Formal in email, casual in chat, all lowercase with friends. Pick a style per app and stop fixing it by hand.',
    demo: { before: 'yeah i’m gonna send it', after: 'Yes, I am going to send it.' },
  },
  {
    id: 'commands',
    title: 'Punctuation you can say',
    body: '“Comma”, “period”, “question mark”, “new paragraph”. Speak structure as naturally as the words.',
    demo: { before: 'ready question mark', after: 'Ready?' },
  },
  {
    id: 'everywhere',
    title: 'One shortcut, every text box',
    body: 'Hold a key, talk, let go. Text lands wherever your cursor is. No copy and paste between windows.',
    demo: { before: 'hold fn · speak · release', after: 'Text appears at your cursor.' },
  },
];

export const USE_CASES = [
  {
    id: 'developers',
    label: 'Developers',
    heading: 'Describe the change, not the keystrokes',
    body: 'Talk through a bug, a commit message or a long prompt for your coding assistant. Technical terms stay intact with your dictionary.',
    spoken: 'refactor the use auth hook so it uh caches the session and add a test for the expired token case',
    written: 'Refactor the useAuth hook so it caches the session, and add a test for the expired-token case.',
  },
  {
    id: 'writers',
    label: 'Writers',
    heading: 'Get the first draft out of your head',
    body: 'Speak at the pace you think. Clean up structure afterwards instead of fighting the blank page.',
    spoken: 'the house had been empty for years but uh the garden somehow kept growing new paragraph nobody knew who watered it',
    written: 'The house had been empty for years, but the garden somehow kept growing.\n\nNobody knew who watered it.',
  },
  {
    id: 'students',
    label: 'Students',
    heading: 'Notes and essays without the typing bottleneck',
    body: 'Capture lecture thoughts, outline essays and answer discussion posts in a fraction of the keystrokes.',
    spoken: 'the main cause of the uh 1929 crash was speculation on margin comma not just you know the banks',
    written: 'The main cause of the 1929 crash was speculation on margin, not just the banks.',
  },
  {
    id: 'sales',
    label: 'Sales & support',
    heading: 'Follow up while the call is still fresh',
    body: 'Dictate CRM notes and customer replies between meetings. Snippets fill in links and policy text.',
    spoken: 'thanks for the call today here is my calendar link to book the next one',
    written: 'Thanks for the call today. Here is cal.example.com/you to book the next one.',
  },
  {
    id: 'access',
    label: 'Accessibility',
    heading: 'Less strain, same output',
    body: 'For RSI, low vision or anyone who finds long typing sessions tiring, voice keeps the work moving.',
    spoken: 'please reschedule my appointment to monday morning if possible',
    written: 'Please reschedule my appointment to Monday morning if possible.',
  },
];

export const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    monthly: 0,
    yearly: 0,
    blurb: 'For trying voice in your daily writing.',
    features: ['2,000 words per week', 'Auto-edits and spoken punctuation', 'Personal dictionary', 'Desktop and phone'],
    cta: 'Join the waitlist',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 14,
    yearly: 11,
    blurb: 'For people who write all day.',
    features: ['Unlimited words', 'Styles per app', 'Snippets and shared dictionary', 'Command mode for rewriting', 'Priority support'],
    cta: 'Join the waitlist',
    featured: true,
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 12,
    yearly: 10,
    perSeat: true,
    blurb: 'For teams that want shared vocabulary.',
    features: ['Everything in Pro', 'Team dictionary and snippets', 'Admin controls and SSO', 'Usage dashboard'],
    cta: 'Talk to us',
  },
];

export const FAQS = [
  {
    q: 'Is Murmur a real product?',
    a: 'Murmur is a concept: a design and front-end study of a voice-dictation product. The in-page demo is real and runs in your browser, but there is no desktop app to download yet. Pricing shown is illustrative.',
  },
  {
    q: 'What happens to my voice in the demo?',
    a: 'The demo only starts listening after you press the microphone button, and your browser asks for permission first. It uses your browser’s built-in speech recognition, which in some browsers (such as Chrome) sends audio to the browser maker’s speech service. Murmur itself stores nothing on a server.',
  },
  {
    q: 'Which browsers support live dictation?',
    a: 'Chrome, Edge and Safari support the Web Speech API. In Firefox and some privacy-focused browsers it is not available, so the demo lets you type or play a sample instead. The auto-edit rules work the same either way.',
  },
  {
    q: 'How does the cleanup work?',
    a: 'In this demo, it is a set of transparent rules that run locally: removing fillers and repeated words, applying quick self-corrections, converting spoken punctuation, expanding snippets and applying your dictionary and style. It is not an AI model, so it will miss things a production system would catch.',
  },
  {
    q: 'Does it work in other languages?',
    a: 'Live recognition uses your browser’s language setting. The cleanup rules in this demo are written for English.',
  },
  {
    q: 'What does the waitlist do with my email?',
    a: 'Nothing leaves your browser. The form saves your email to this browser’s local storage so you can see the flow work, and you can clear it any time.',
  },
];
