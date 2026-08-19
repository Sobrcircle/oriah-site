import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createCanvas,
  GlobalFonts,
  loadImage,
  type CanvasRenderingContext2D,
} from '@napi-rs/canvas'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets')
const BRANDING_DIR = path.join(ROOT, 'branding')
const SOURCE_ICON = path.join(BRANDING_DIR, 'oriah-icon-source.png')
// 2026-08-19 — the favicon, apple-touch icon, OG card and the logo the site
// itself renders now come from the BARE cross, not the app-icon tile. The
// tile has a rounded-square black background, so everywhere a logo appears
// small and out of context — a browser tab, a Google result, a shared link —
// it read as "an icon in a box" rather than a mark. This source is the same
// cross with a transparent background.
const SOURCE_MARK = path.join(BRANDING_DIR, 'oriah-mark-source.png')

const BG = '#0a0a0a'
const SURFACE = '#121212'
const SURFACE_SOFT = '#171717'
const TEXT = '#f2ede6'
const MUTED = '#867f77'
const ACCENT = '#d1b48d'
const ACCENT_SOFT = 'rgba(209, 180, 141, 0.16)'
const LINE = 'rgba(255, 255, 255, 0.08)'

async function pickSerif(): Promise<string> {
  const candidates = [
    path.join(ROOT, 'scripts/fonts/Times New Roman.ttf'),
    path.join(ROOT, 'scripts/fonts/times.ttf'),
    path.join(ROOT, 'public/assets/fonts/serif.ttf'),
    '/System/Library/Fonts/Supplemental/Times New Roman.ttf',
    '/Library/Fonts/Times New Roman.ttf',
    '/System/Library/Fonts/Times.ttc',
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      GlobalFonts.registerFromPath(candidate, 'OriahSerif')
      return 'OriahSerif'
    } catch {
      continue
    }
  }

  return 'serif'
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  roundRect(ctx, x, y, width, height, radius)
  ctx.fillStyle = color
  ctx.fill()
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  roundRect(ctx, x, y, width, height, radius)
  ctx.strokeStyle = color
  ctx.stroke()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

function findBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  predicate: (r: number, g: number, b: number, a: number) => boolean,
) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const a = data[index + 3]

      if (!predicate(r, g, b, a)) continue

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX || maxY < minY) return null

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

async function buildMark() {
  const image = await loadImage(SOURCE_ICON)
  const temp = createCanvas(image.width, image.height)
  const tempCtx = temp.getContext('2d')
  tempCtx.drawImage(image, 0, 0, image.width, image.height)

  const data = tempCtx.getImageData(0, 0, image.width, image.height).data
  const bounds =
    findBounds(data, image.width, image.height, (r, g, b, a) => a > 8 && (r + g + b) / 3 < 96) ??
    findBounds(data, image.width, image.height, (r, g, b, a) => a > 8 && (r + g + b) / 3 < 245)

  const minX = bounds?.minX ?? 0
  const minY = bounds?.minY ?? 0
  const width = bounds?.width ?? image.width
  const height = bounds?.height ?? image.height
  const sourceSize = Math.max(width, height)
  const sourceX = Math.max(0, minX - Math.round((sourceSize - width) / 2))
  const sourceY = Math.max(0, minY - Math.round((sourceSize - height) / 2))
  const boundedSourceSize = Math.min(
    sourceSize,
    image.width - sourceX,
    image.height - sourceY,
  )
  const cropInset = Math.max(6, Math.round(boundedSourceSize * 0.012))
  const finalSourceX = sourceX + cropInset
  const finalSourceY = sourceY + cropInset
  const finalSourceSize = boundedSourceSize - cropInset * 2

  const canvas = createCanvas(1024, 1024)
  const ctx = canvas.getContext('2d')
  const padding = 56
  const drawSize = 1024 - padding * 2
  const targetX = padding
  const targetY = padding
  const targetRadius = Math.round(drawSize * 0.205)

  ctx.clearRect(0, 0, 1024, 1024)
  fillRoundedRect(ctx, targetX, targetY, drawSize, drawSize, targetRadius, '#050505')
  ctx.save()
  roundRect(ctx, targetX, targetY, drawSize, drawSize, targetRadius)
  ctx.clip()
  ctx.drawImage(
    temp,
    finalSourceX,
    finalSourceY,
    finalSourceSize,
    finalSourceSize,
    targetX,
    targetY,
    drawSize,
    drawSize,
  )
  ctx.restore()

  return canvas
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(width / 2, height * 0.25, 0, width / 2, height * 0.25, width * 0.5)
  glow.addColorStop(0, 'rgba(255, 244, 222, 0.08)')
  glow.addColorStop(0.35, 'rgba(209, 180, 141, 0.05)')
  glow.addColorStop(1, 'rgba(10, 10, 10, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  const floor = ctx.createLinearGradient(0, height * 0.55, 0, height)
  floor.addColorStop(0, 'rgba(255, 255, 255, 0)')
  floor.addColorStop(1, 'rgba(255, 255, 255, 0.04)')
  ctx.fillStyle = floor
  ctx.fillRect(0, height * 0.55, width, height * 0.45)
}

function drawScreenHeader(
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle?: string,
) {
  ctx.fillStyle = MUTED
  ctx.font = '500 22px sans-serif'
  ctx.fillText('Oriah', 44, 38)

  ctx.fillStyle = TEXT
  ctx.font = '600 38px sans-serif'
  ctx.fillText(title, 44, 78)

  if (subtitle) {
    ctx.fillStyle = MUTED
    ctx.font = '500 18px sans-serif'
    ctx.fillText(subtitle, 44, 116)
  }
}

function drawChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  active = false,
) {
  fillRoundedRect(
    ctx,
    x,
    y,
    width,
    38,
    19,
    active ? ACCENT_SOFT : 'rgba(255, 255, 255, 0.04)',
  )
  strokeRoundedRect(ctx, x, y, width, 38, 19, active ? 'rgba(209, 180, 141, 0.35)' : LINE)
  ctx.fillStyle = active ? ACCENT : MUTED
  ctx.font = '600 16px sans-serif'
  ctx.fillText(text, x + 16, y + 24)
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  body: string[],
  accentText?: string,
) {
  fillRoundedRect(ctx, x, y, width, height, 28, SURFACE)
  strokeRoundedRect(ctx, x, y, width, height, 28, LINE)

  ctx.fillStyle = TEXT
  ctx.font = '600 22px sans-serif'
  ctx.fillText(title, x + 22, y + 34)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.fillRect(x + 22, y + 52, width - 44, 1)

  ctx.fillStyle = MUTED
  ctx.font = '500 17px sans-serif'
  let lineY = y + 80
  for (const line of body) {
    for (const wrapped of wrapText(ctx, line, width - 44)) {
      ctx.fillText(wrapped, x + 22, lineY)
      lineY += 26
    }
  }

  if (accentText) {
    ctx.fillStyle = ACCENT
    ctx.font = '600 17px sans-serif'
    ctx.fillText(accentText, x + 22, y + height - 22)
  }
}

function renderScreenSplash(mark: Awaited<ReturnType<typeof buildMark>>, serif: string) {
  const canvas = createCanvas(1170, 2535)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1170, 2535)

  ctx.drawImage(mark, 225, 210, 720, 720)

  ctx.fillStyle = ACCENT
  ctx.font = '600 28px sans-serif'
  ctx.fillText('light of God', 455, 1045)

  ctx.fillStyle = TEXT
  ctx.font = `italic 132px ${serif}`
  ctx.fillText('Oriah', 325, 1215)

  ctx.fillStyle = MUTED
  ctx.font = '500 36px sans-serif'
  ctx.fillText('pronounced oh-RYE-ah', 370, 1295)

  ctx.fillStyle = TEXT
  ctx.font = '600 42px sans-serif'
  ctx.fillText('Walk in the light.', 360, 1535)

  drawChip(ctx, 'Pray', 270, 1700, 170, true)
  drawChip(ctx, 'Word', 500, 1700, 170, true)
  drawChip(ctx, 'Serve', 730, 1700, 170, true)

  ctx.fillStyle = MUTED
  ctx.font = '500 28px sans-serif'
  ctx.fillText('No algorithm. No strangers. No noise.', 240, 1865)

  return canvas.toBuffer('image/png')
}

function renderScreenRhythm(mark: Awaited<ReturnType<typeof buildMark>>) {
  const canvas = createCanvas(1170, 2535)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1170, 2535)
  drawScreenHeader(ctx, 'Pray. Word. Serve.', 'The daily rhythm of the walk.')

  ctx.drawImage(mark, 922, 36, 180, 180)

  drawChip(ctx, 'Pray', 44, 154, 170, true)
  drawChip(ctx, 'Word', 230, 154, 170, true)
  drawChip(ctx, 'Serve', 416, 154, 170, true)

  drawCard(
    ctx,
    44,
    250,
    1082,
    360,
    'Pray',
    ['See prayer requests from the people in your circle.', 'Tap once to pray and leave a word of encouragement.'],
    'Prayer is the heartbeat.',
  )

  drawCard(
    ctx,
    44,
    650,
    1082,
    420,
    'Word',
    ['A scripture card meets you on the home screen.', 'Read the verse, reflection, and continue deeper if you want to linger.'],
    'Scripture first. Not the feed.',
  )

  drawCard(
    ctx,
    44,
    1110,
    1082,
    360,
    'Serve',
    ['Oriah reflects how you showed up: prayed, checked in, encouraged, served.', 'Quiet signals. Real presence.'],
    'A mirror, not a scoreboard.',
  )

  fillRoundedRect(ctx, 44, 1510, 1082, 200, 34, SURFACE_SOFT)
  strokeRoundedRect(ctx, 44, 1510, 1082, 200, 34, LINE)
  ctx.fillStyle = TEXT
  ctx.font = '600 32px sans-serif'
  ctx.fillText('Complete the day in a few faithful minutes.', 78, 1592)
  ctx.fillStyle = MUTED
  ctx.font = '500 22px sans-serif'
  ctx.fillText('Not more content. Just a better rhythm.', 78, 1638)

  return canvas.toBuffer('image/png')
}

function renderScreenCircle() {
  const canvas = createCanvas(1170, 2535)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1170, 2535)
  drawScreenHeader(ctx, 'Your circle', 'Code-based. Invitation only.')

  drawChip(ctx, 'Private', 44, 154, 172, true)
  drawChip(ctx, 'No search', 232, 154, 190)
  drawChip(ctx, 'No strangers', 438, 154, 214)

  drawCard(
    ctx,
    44,
    250,
    1082,
    300,
    'Circle code',
    ['LIGHT-7Q4', 'Share it only with the people you trust.'],
    'Every person is chosen on purpose.',
  )

  fillRoundedRect(ctx, 44, 590, 1082, 660, 30, SURFACE)
  strokeRoundedRect(ctx, 44, 590, 1082, 660, 30, LINE)
  ctx.fillStyle = TEXT
  ctx.font = '600 24px sans-serif'
  ctx.fillText('Group room', 78, 642)

  const bubbles = [
    { x: 78, y: 700, w: 710, text: 'Prayer request: my dad starts treatment tomorrow.' },
    { x: 312, y: 860, w: 748, text: 'Praying now. I am with you and I will check in after church.' },
    { x: 78, y: 1020, w: 690, text: 'Sunday check-in done. See you all tonight.' },
  ]

  for (const bubble of bubbles) {
    fillRoundedRect(ctx, bubble.x, bubble.y, bubble.w, 108, 28, 'rgba(255, 255, 255, 0.05)')
    ctx.fillStyle = TEXT
    ctx.font = '500 20px sans-serif'
    const lines = wrapText(ctx, bubble.text, bubble.w - 36)
    let y = bubble.y + 34
    for (const line of lines) {
      ctx.fillText(line, bubble.x + 18, y)
      y += 28
    }
  }

  drawCard(
    ctx,
    44,
    1290,
    1082,
    300,
    'Built for trust',
    ['No followers. No friend suggestions. No public discovery.', 'A living room, not a megaphone.'],
    'Faith needs safety.',
  )

  return canvas.toBuffer('image/png')
}

function renderScreenChurches() {
  const canvas = createCanvas(1170, 2535)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1170, 2535)
  drawScreenHeader(ctx, 'Verified churches', 'Churches can be found. People cannot.')

  fillRoundedRect(ctx, 44, 170, 1082, 760, 36, SURFACE)
  strokeRoundedRect(ctx, 44, 170, 1082, 760, 36, LINE)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.fillRect(44, 520, 1082, 2)

  const pins = [
    [250, 340],
    [610, 400],
    [860, 300],
    [740, 640],
  ]
  for (const [x, y] of pins) {
    ctx.beginPath()
    ctx.fillStyle = ACCENT
    ctx.arc(x, y, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.arc(x, y, 34, 0, Math.PI * 2)
    ctx.fill()
  }

  drawCard(
    ctx,
    44,
    970,
    1082,
    300,
    'Search nearby',
    ['Find churches by location, denomination, or service time.', 'Follow a church profile without exposing who attends.'],
    'Discovery for congregations. Privacy for people.',
  )

  drawCard(
    ctx,
    44,
    1310,
    1082,
    380,
    'What a church can share',
    ['Service times', 'Announcements and sermon posts', 'Mission opportunities and community partners'],
    'No public member list. Ever.',
  )

  return canvas.toBuffer('image/png')
}

function renderScreenJournal() {
  const canvas = createCanvas(1170, 2535)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1170, 2535)
  drawScreenHeader(ctx, 'Private journal', 'A quiet place for honesty.')

  drawCard(
    ctx,
    44,
    210,
    1082,
    280,
    'Today',
    ['Gratitude for the friend who called back.', 'Prayer for discipline in the small things.'],
    'Only you can see this space.',
  )

  fillRoundedRect(ctx, 44, 530, 1082, 920, 34, SURFACE)
  strokeRoundedRect(ctx, 44, 530, 1082, 920, 34, LINE)
  ctx.fillStyle = TEXT
  ctx.font = '600 28px sans-serif'
  ctx.fillText('Journal entry', 78, 594)

  const journalCopy = [
    'Growth requires honesty.',
    '',
    'Write prayers, reflections, confessions, and gratitude without performing for a feed.',
    '',
    'Oriah keeps this part of the walk quiet on purpose.',
  ]

  ctx.fillStyle = MUTED
  ctx.font = '500 24px sans-serif'
  let journalY = 668
  for (const paragraph of journalCopy) {
    if (!paragraph) {
      journalY += 26
      continue
    }
    for (const line of wrapText(ctx, paragraph, 1000)) {
      ctx.fillText(line, 78, journalY)
      journalY += 36
    }
    journalY += 12
  }

  drawCard(
    ctx,
    44,
    1490,
    1082,
    240,
    'Private by design',
    ['No ads. No public search. No algorithm deciding what enters your day.'],
    'Choose what you see.',
  )

  return canvas.toBuffer('image/png')
}

function renderScreenProfile(mark: Awaited<ReturnType<typeof buildMark>>, serif: string) {
  const canvas = createCanvas(1170, 2535)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1170, 2535)
  drawScreenHeader(ctx, 'Still walking', 'Tenure, not performance.')

  ctx.drawImage(mark, 440, 210, 290, 290)

  ctx.fillStyle = TEXT
  ctx.font = `italic 62px ${serif}`
  ctx.fillText('Walk in the light.', 300, 585)

  fillRoundedRect(ctx, 200, 690, 770, 220, 34, SURFACE)
  strokeRoundedRect(ctx, 200, 690, 770, 220, 34, LINE)
  ctx.fillStyle = ACCENT
  ctx.font = '700 92px sans-serif'
  ctx.fillText('248', 470, 812)
  ctx.fillStyle = MUTED
  ctx.font = '500 24px sans-serif'
  ctx.fillText('days walking with Oriah', 422, 856)

  drawCard(
    ctx,
    44,
    980,
    1082,
    260,
    'Serve reflected back',
    ['Prayed for 3 people', 'Checked in on Sunday', 'Encouraged your circle'],
    'Not a streak. Just a witness.',
  )

  drawCard(
    ctx,
    44,
    1280,
    1082,
    320,
    'Why Oriah exists',
    ['Faith has a daily rhythm.', 'Phones are full of tools that compete for attention instead of forming it.', 'Oriah is built to reverse that.'],
    'A faith operating system for the daily walk.',
  )

  return canvas.toBuffer('image/png')
}

function renderOg(mark: Awaited<ReturnType<typeof buildMark>>, serif: string) {
  const canvas = createCanvas(1200, 630)
  const ctx = canvas.getContext('2d')
  paintBackground(ctx, 1200, 630)

  ctx.drawImage(mark, 72, 92, 220, 220)

  ctx.fillStyle = ACCENT
  ctx.font = '600 24px sans-serif'
  ctx.fillText('joinoriah.com', 72, 364)

  ctx.fillStyle = TEXT
  ctx.font = `italic 84px ${serif}`
  ctx.fillText('Oriah', 72, 404)

  ctx.fillStyle = TEXT
  ctx.font = '600 30px sans-serif'
  ctx.fillText('A faith operating system for your daily walk.', 72, 500)

  ctx.fillStyle = MUTED
  ctx.font = '500 24px sans-serif'
  ctx.fillText('Pray. Word. Serve. Walk in the light.', 72, 546)

  return canvas.toBuffer('image/png')
}

/** The bare cross, centred on a transparent square, at any size. */
async function buildLogoMark(size: number) {
  const image = await loadImage(SOURCE_MARK)
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const pad = size * 0.14
  const inner = size - pad * 2
  const scale = Math.min(inner / image.width, inner / image.height)
  const w = image.width * scale
  const h = image.height * scale
  ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h)
  return canvas
}

async function main() {
  await fs.mkdir(ASSETS_DIR, { recursive: true })
  const serif = await pickSerif()
  const mark = await buildMark()
  const logo512 = await buildLogoMark(512)

  await fs.writeFile(path.join(ASSETS_DIR, 'circle.png'), mark.toBuffer('image/png'))

  const favicon = await buildLogoMark(64)
  const appleIcon = await buildLogoMark(180)

  await Promise.all([
    fs.writeFile(path.join(PUBLIC_DIR, 'favicon-dark-64.png'), favicon.toBuffer('image/png')),
    fs.writeFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleIcon.toBuffer('image/png')),
    fs.writeFile(path.join(ASSETS_DIR, '1.png'), renderScreenSplash(mark, serif)),
    fs.writeFile(path.join(ASSETS_DIR, '2.png'), renderScreenRhythm(mark)),
    fs.writeFile(path.join(ASSETS_DIR, '3.png'), renderScreenCircle()),
    fs.writeFile(path.join(ASSETS_DIR, '4.png'), renderScreenChurches()),
    fs.writeFile(path.join(ASSETS_DIR, '5.png'), renderScreenJournal()),
    fs.writeFile(path.join(ASSETS_DIR, '6.png'), renderScreenProfile(mark, serif)),
    fs.writeFile(path.join(ASSETS_DIR, 'logo-mark.png'), logo512.toBuffer('image/png')),
    fs.writeFile(path.join(ASSETS_DIR, 'og-share.png'), renderOg(logo512, serif)),
  ])

  console.log('[brand-assets] wrote Oriah brand assets')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
