import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { imageSize } from 'image-size'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const PUBLIC_DIR = path.join(process.cwd(), 'public')

export type Photo = {
  /** Path under /public, e.g. /photos/contrasts/murray-mower.jpg */
  src: string
  alt: string
  caption?: string
  width: number
  height: number
}

export type Post = {
  slug: string
  title: string
  /** ISO date, yyyy-mm-dd */
  date: string
  /** e.g. October 14, 2024 */
  displayDate: string
  location?: string
  /** Film stock, e.g. Kodak Gold 200. The "Film:" label lives in the template. */
  film?: string
  description?: string
  /** Shown on the index and at the top of the email */
  lead: Photo
  photos: Photo[]
  /** The MDX body, frontmatter stripped — used for the feed excerpt */
  body: string
}

function readPhoto(raw: unknown, slug: string): Photo {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`${slug}: each entry in "photos" must be an object`)
  }

  const { src, alt, caption } = raw as Record<string, unknown>

  if (typeof src !== 'string' || !src.startsWith('/')) {
    throw new Error(`${slug}: photo "src" must be a path under /public`)
  }
  if (typeof alt !== 'string' || alt.trim() === '') {
    throw new Error(`${slug}: photo ${src} is missing alt text`)
  }

  const file = path.join(PUBLIC_DIR, src)
  if (!fs.existsSync(file)) {
    throw new Error(`${slug}: photo ${src} was not found in /public`)
  }

  const { width, height } = imageSize(fs.readFileSync(file))
  if (!width || !height) {
    throw new Error(`${slug}: could not read the dimensions of ${src}`)
  }

  return {
    src,
    alt,
    width,
    height,
    ...(typeof caption === 'string' && caption.trim() !== ''
      ? { caption }
      : {}),
  }
}

/** gray-matter turns an unquoted yyyy-mm-dd into a Date at UTC midnight. */
function readDate(raw: unknown, slug: string) {
  const date = raw instanceof Date ? raw : new Date(String(raw))
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${slug}: "date" must be a yyyy-mm-dd date`)
  }
  return date
}

function readPost(slug: string): Post {
  const source = fs.readFileSync(
    path.join(POSTS_DIR, slug, 'index.mdx'),
    'utf8'
  )
  const { data, content } = matter(source)

  if (typeof data.title !== 'string' || data.title.trim() === '') {
    throw new Error(`${slug}: "title" is required`)
  }
  if (!Array.isArray(data.photos) || data.photos.length === 0) {
    throw new Error(`${slug}: "photos" must list at least one photo`)
  }

  const date = readDate(data.date, slug)
  const photos = data.photos.map((photo: unknown) => readPhoto(photo, slug))

  // The lead is one of the photos, so its alt text is written only once.
  const leadSrc = typeof data.lead === 'string' ? data.lead : photos[0].src
  const lead = photos.find((photo) => photo.src === leadSrc)
  if (!lead) {
    throw new Error(`${slug}: "lead" (${leadSrc}) is not one of "photos"`)
  }

  return {
    slug,
    title: data.title,
    date: date.toISOString().slice(0, 10),
    displayDate: date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    ...(typeof data.location === 'string' ? { location: data.location } : {}),
    ...(typeof data.film === 'string' ? { film: data.film } : {}),
    ...(typeof data.description === 'string'
      ? { description: data.description }
      : {}),
    lead,
    photos,
    body: content,
  }
}

export function getPostSlugs() {
  if (!fs.existsSync(POSTS_DIR)) return []

  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(path.join(POSTS_DIR, entry.name, 'index.mdx'))
    )
    .map((entry) => entry.name)
}

/** Every post, newest first. */
export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug: string): Post | undefined {
  return getPostSlugs().includes(slug) ? readPost(slug) : undefined
}

/**
 * The first `count` sentences of the body as plain text, for the feed. Handles
 * the small amount of markdown a blurb is likely to use.
 */
export function excerpt(body: string, count = 2) {
  const text = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block !== '' && !block.startsWith('import '))[0]

  if (!text) return ''

  const plain = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const sentences = plain.match(/[^.!?]+[.!?]+(?=\s|$)/g)
  if (!sentences) return plain

  return sentences
    .slice(0, count)
    .map((sentence) => sentence.trim())
    .join(' ')
}
