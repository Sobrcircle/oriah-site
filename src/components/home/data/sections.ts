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
  /** Marks a section as describing something not yet shipped. */
  upcoming?: boolean
}

/**
 * Site copy, rewritten 2026-08-18 to describe the app that exists rather than
 * the one that was planned when this site launched.
 *
 * What changed, and why — every one of these was a claim the app no longer
 * backs:
 *
 *  - "Private by invitation" / "share a code" / "No friend requests. No
 *    followers. No way for strangers to find you." The Uncapping (2026-07-17)
 *    made circles uncapped and free, and connection now happens by @handle,
 *    share link, QR, or opt-in discovery. Contact matching exists. So "no way
 *    for strangers to find you" was not a promise the code kept. The true and
 *    stronger claim is that being findable is not the same as being reachable:
 *    every connection is still yours to accept.
 *  - The Bible was missing entirely, and it is the largest thing the app
 *    gained since this copy was written — the whole BSB, on the device,
 *    offline.
 *  - Daily Reading, Days Walked and Messages were all missing too.
 *  - Verified Churches was written as though it had shipped. It has not, and
 *    it now says so instead of quietly implying otherwise.
 *  - Nothing said what the app costs or how it is paid for. A faith app that
 *    is coy about money has a problem.
 *
 * No price appears anywhere on this page on purpose. The subscription is
 * priced regionally by the stores ($6.99 USD, $9.99 CAD, £5.99, and so on),
 * and the app itself never hardcodes a number for the same reason — see
 * `paywallBillingDisclaimer` in the Flutter repo.
 */
export const sections: HomeSection[] = [
  {
    id: 'home',
    type: 'hero',
    title: 'Oriah',
    content: [
      [{ type: 'plain', text: 'Not a church app. Not Christian social media.' }],
      [{ type: 'accent', text: 'A faith operating system for your daily walk.' }],
      [{ type: 'plain', text: 'Pray. Word. Serve. No ads, no algorithm, and nothing between you and the people you trust.' }],
    ],
    phoneImage: '/assets/app-today.webp',
  },
  {
    id: 'rhythm',
    kicker: 'Today',
    type: 'feature',
    title: 'Pray. Word. Serve.',
    content: [
      [{ type: 'callout', text: 'The daily walk needs a daily rhythm.' }],
      [{ type: 'plain', text: 'Oriah opens on the day itself: how long you have been walking, a passage chosen for this morning, and a short reflection you can finish before the coffee is done.' }],
      [{ type: 'accent', text: 'No algorithm. No trending tab. Nothing deciding what you see.' }],
    ],
    phoneImage: '/assets/app-reading.webp',
  },
  {
    id: 'word',
    kicker: 'Word',
    type: 'feature',
    title: 'The whole Bible, already on your phone',
    content: [
      [{ type: 'callout', text: 'All 66 books. No account, no signal, no paywall.' }],
      [{ type: 'plain', text: 'The Berean Standard Bible ships inside the app and reads offline — in a basement, on a plane, at 3am with one bar. Search any phrase instantly. Highlight a verse, keep a note on it, or send it to someone as a prayer.' }],
      [{ type: 'accent', text: 'Scripture you own, not scripture you stream.' }],
    ],
    phoneImage: '/assets/app-word.webp',
  },
  {
    id: 'circles',
    kicker: 'Share',
    type: 'feature',
    title: 'Private circles',
    content: [
      [{ type: 'callout', text: 'The people you actually know, and no one else.' }],
      [{ type: 'plain', text: 'Bring in your family, your Bible study, your accountability group — by @handle, a share link, or a QR code across the table. Your circle is uncapped and free, and it is that way for everyone.' }],
      [{ type: 'accent', text: 'Being findable is not being reachable. Every connection is yours to accept.' }],
    ],
    phoneImage: '/assets/app-messages.webp',
  },
  {
    id: 'reflect',
    kicker: 'Reflect',
    type: 'feature',
    title: 'The part that should not be performed',
    content: [
      [{ type: 'callout', text: 'Growth requires honesty. Honesty requires safety.' }],
      [{ type: 'plain', text: 'Prayers, reflections, confessions, gratitude — written by hand or spoken as a voice note, tagged with how you actually arrived rather than how you would like to sound.' }],
      [{ type: 'accent', text: 'Between you and God. Never part of the feed.' }],
    ],
    phoneImage: '/assets/app-reflect.webp',
  },
  {
    id: 'support',
    kicker: 'Support',
    type: 'feature',
    title: 'Free where it counts',
    content: [
      [{ type: 'callout', text: 'Scripture, prayer, journal and your circle are free. Permanently.' }],
      [{ type: 'plain', text: 'Nothing about the daily walk sits behind a price, and your circle has never had a cap. Supporters unlock what creates work for everyone else — starting your own small groups, hosting your own prayer rooms — and keep Oriah ad-free and open to the person who cannot pay.' }],
      [{ type: 'accent', text: 'We sell a subscription, not your data. There is no second business model here.' }],
    ],
  },
  {
    id: 'churches',
    kicker: 'Coming',
    type: 'feature',
    title: 'Verified churches',
    upcoming: true,
    content: [
      [{ type: 'callout', text: 'Churches can be found. People cannot.' }],
      [{ type: 'plain', text: 'Verified congregations will be able to publish service times, events and a church code — so someone new to a city can find a church without any individual becoming a searchable profile.' }],
      [{ type: 'accent', text: 'Not built yet. It is next, and it is written here so you can hold us to it.' }],
    ],
  },
  {
    id: 'beta',
    type: 'beta',
    title: 'Walk with us',
    content: [
      [{ type: 'plain', text: 'Oriah is in private beta with a small group of believers. Leave your email and we will send you an invitation.' }],
    ],
  },
  {
    id: 'story',
    type: 'feature',
    title: 'Why Oriah',
    content: [
      [{ type: 'plain', text: 'Christians are scattered across group chats, social feeds and church tools that were never built for the daily walk.' }],
      [{ type: 'plain', text: 'Oriah exists to reverse that — one place for prayer, scripture, honesty, and the handful of people who actually know you.' }],
      [{ type: 'accent', text: 'Choose what you see. Walk in the light.' }],
    ],
    phoneImage: '/assets/app-journal.webp',
  },
]
