export type TextSpan =
  | { type: 'plain'; text: string }
  | { type: 'accent'; text: string }
  | { type: 'callout'; text: string }

export type SectionType = 'hero' | 'feature'

export type HomeSection = {
  id: string
  type: SectionType
  title: string
  content: TextSpan[][]
  phoneImage?: string
}

export const sections: HomeSection[] = [
  {
    id: 'home',
    type: 'hero',
    title: 'Oriah',
    content: [
      [{ type: 'plain', text: 'Not a church app. Not Christian social media.' }],
      [{ type: 'accent', text: 'A faith operating system for your daily walk.' }],
      [{ type: 'plain', text: 'Pray. Word. Serve. Private by invitation. Built for the people you trust.' }],
    ],
    phoneImage: '/assets/1.png?v=1',
  },
  {
    id: 'rhythm',
    type: 'feature',
    title: 'Pray. Word. Serve.',
    content: [
      [{ type: 'callout', text: 'The daily walk needs a daily rhythm.' }],
      [{ type: 'plain', text: 'Oriah opens to three actions that shape the day: pray for your people, meet scripture where you are, and show up in quiet ways that matter.' }],
      [{ type: 'accent', text: 'No algorithm. No trending tab. No noise between you and what matters.' }],
    ],
    phoneImage: '/assets/2.png?v=1',
  },
  {
    id: 'circles',
    type: 'feature',
    title: 'Private Circles',
    content: [
      [{ type: 'callout', text: 'Your world inside Oriah is built by invitation.' }],
      [{ type: 'plain', text: 'Create a circle, share a code, and bring in the people you trust: your Bible study, your family, your accountability group, your mission team.' }],
      [{ type: 'accent', text: 'No friend requests. No followers. No way for strangers to find you.' }],
    ],
    phoneImage: '/assets/3.png?v=1',
  },
  {
    id: 'churches',
    type: 'feature',
    title: 'Verified Churches',
    content: [
      [{ type: 'callout', text: 'Churches can be found. People cannot.' }],
      [{ type: 'plain', text: 'Verified churches can publish service times, public posts, events, and church codes that help people find a congregation without turning individuals into searchable profiles.' }],
      [{ type: 'accent', text: 'Discovery for congregations. Privacy for believers.' }],
    ],
    phoneImage: '/assets/4.png?v=1',
  },
  {
    id: 'journal',
    type: 'feature',
    title: 'Journal',
    content: [
      [{ type: 'callout', text: 'Growth requires honesty. Honesty requires safety.' }],
      [{ type: 'plain', text: 'Write prayers, reflections, confessions, and gratitude in a private space designed for the part of faith that should not become performance.' }],
      [{ type: 'accent', text: 'Between you and God. Never part of the feed.' }],
    ],
    phoneImage: '/assets/5.png?v=1',
  },
  {
    id: 'story',
    type: 'feature',
    title: 'Why Oriah',
    content: [
      [{ type: 'plain', text: 'Christians are scattered across group chats, social feeds, and church tools that were never built for the daily walk.' }],
      [{ type: 'plain', text: 'Oriah exists to reverse that with a private space for prayer, scripture, service, and the trusted people you actually know.' }],
      [{ type: 'accent', text: 'Choose what you see. Walk in the light.' }],
    ],
    phoneImage: '/assets/6.png?v=1',
  },
]
