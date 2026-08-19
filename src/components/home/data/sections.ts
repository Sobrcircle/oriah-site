export type TextSpan =
  | { type: 'plain'; text: string }
  | { type: 'accent'; text: string }
  | { type: 'callout'; text: string }

export type SectionType = 'hero' | 'feature' | 'beta'

export type HomeSection = {
  id: string
  type: SectionType
  title: string
  /** Small label above the title, naming the surface inside the app. */
  kicker?: string
  content: TextSpan[][]
  phoneImage?: string
}

/**
 * Site copy, rewritten 2026-08-19.
 *
 * WHAT THE RESEARCH SAID
 *
 * Hallow leads with "Find Peace in Prayer" — four words, an outcome, no
 * jargon — and navigates with concrete nouns: Bible, How to Pray, Parishes &
 * Schools. Glorify leads with "Grow with God. Everyday." and names its
 * sections Daily Devotional, Build Your Daily Rhythm, Community.
 *
 * Three things both do that this site was not doing:
 *
 *   1. They name God in the first line. They do not open by saying what they
 *      are NOT. "Not a church app. Not Christian social media." spent the
 *      most valuable line on the page arguing with a category instead of
 *      making a promise.
 *   2. Their section titles are plain nouns describing what is inside. Ours
 *      were one-word brand abstractions — "Rhythm", "Word", "Share" — which
 *      mean something once you already use the app and nothing before that.
 *   3. Nothing is titled after a policy. The old copy had a whole section
 *      arguing that circles are uncapped and explaining how people connect.
 *      That is SobrCircle's fight, inherited wholesale; a reader assumes
 *      unlimited friends and does not need the mechanics of @handles and QR
 *      codes on a landing page.
 *
 * Also gone: the pronunciation line. It taught the reader a word before it
 * gave them a reason to care about it.
 *
 * Every section carries a screenshot, and Why Oriah runs last before the
 * signup so the argument closes before the ask.
 *
 * Verified Churches was cut. It is not built, it had no screenshot, and a
 * concise page cannot afford a section about something that does not exist.
 * Put it back when it ships.
 */
export const sections: HomeSection[] = [
  {
    id: 'home',
    type: 'hero',
    title: 'Oriah',
    content: [
      [{ type: 'accent', text: 'Follow Jesus, one ordinary day at a time.' }],
      [{ type: 'plain', text: 'Pray for your people. Sit with Scripture. Serve in the quiet ways that matter.' }],
      [{ type: 'plain', text: 'No ads. No algorithm. Nothing between you and God.' }],
    ],
    phoneImage: '/assets/app-today.webp',
  },
  {
    id: 'morning',
    kicker: 'Today',
    type: 'feature',
    title: 'Every morning',
    content: [
      [{ type: 'callout', text: 'A passage, a thought, and how long you have been walking.' }],
      [{ type: 'plain', text: 'Oriah opens on the day itself — not a feed. One reading, one reflection, short enough to finish before the coffee is done.' }],
      [{ type: 'accent', text: 'Nothing is deciding what you see.' }],
    ],
    phoneImage: '/assets/app-reading.webp',
  },
  {
    id: 'bible',
    kicker: 'Word',
    type: 'feature',
    title: 'The Bible',
    content: [
      [{ type: 'callout', text: 'All 66 books, on your phone, offline.' }],
      [{ type: 'plain', text: 'Search any phrase. Highlight a verse, keep a note on it, or send it to someone as a prayer. No account, no signal, no paywall.' }],
      [{ type: 'accent', text: 'Scripture you own, not scripture you stream.' }],
    ],
    phoneImage: '/assets/app-word.webp',
  },
  {
    id: 'prayer',
    kicker: 'Share',
    type: 'feature',
    title: 'Pray for your people',
    content: [
      [{ type: 'callout', text: 'The handful of people who actually know you.' }],
      [{ type: 'plain', text: 'Your family, your Bible study, your accountability group. Ask for prayer, answer it, or just say the thing you could not say anywhere else.' }],
      [{ type: 'accent', text: 'Private by default. Every connection is yours to accept.' }],
    ],
    phoneImage: '/assets/app-messages.webp',
  },
  {
    id: 'journal',
    kicker: 'Reflect',
    type: 'feature',
    title: 'Between you and God',
    content: [
      [{ type: 'callout', text: 'Growth needs honesty. Honesty needs somewhere safe.' }],
      [{ type: 'plain', text: 'Prayers, confessions, gratitude — written or spoken aloud, tagged with how you actually arrived rather than how you would like to sound.' }],
      [{ type: 'accent', text: 'Never part of the feed. Not now, not ever.' }],
    ],
    phoneImage: '/assets/app-journal.webp',
  },
  {
    id: 'story',
    type: 'feature',
    title: 'Why Oriah',
    content: [
      [{ type: 'plain', text: 'Christians are scattered across group chats, social feeds and church tools that were never built for the daily walk.' }],
      [{ type: 'plain', text: 'Oriah exists to reverse that — one place for prayer, Scripture, honesty, and the people who actually know you. Scripture, prayer and your journal are free, permanently. Supporters keep it ad-free and open to the person who cannot pay.' }],
      [{ type: 'accent', text: 'Choose what you see. Walk in the light.' }],
    ],
    phoneImage: '/assets/app-scripture.webp',
  },
  {
    id: 'beta',
    type: 'beta',
    title: 'Walk with us',
    content: [
      [{ type: 'plain', text: 'Oriah is in private beta. Leave your email and we will send you an invitation.' }],
    ],
  },
]
