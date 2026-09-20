import { excerpt, getAllPosts, type Photo, type Post } from '@/lib/posts'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

// Buttondown renders content:encoded as the email body, so the markup below is
// written for email clients: nested tables, inline styles, absolute URLs, and
// no flex/grid. Widths are the classic 600px newsletter column.
const EMAIL_WIDTH = 600
const GUTTER = 12
const CELL_WIDTH = (EMAIL_WIDTH - GUTTER) / 2
const BACKGROUND = '#0a0a0a'
const FOREGROUND = '#d3d3d0'
const MUTED = '#777773'
const FONT = 'Arial, Helvetica, sans-serif'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cdata(value: string) {
  return `<![CDATA[${value.replace(/]]>/g, ']]&gt;')}]]>`
}

/**
 * An <img> sized to `width`, with the matching height so clients reserve the
 * right space before the image loads. Photos exported square give the tidiest
 * 2x2 grid; other ratios keep their aspect rather than being squashed.
 */
function emailImage(photo: Photo, width: number) {
  const height = Math.round((width * photo.height) / photo.width)

  return [
    `<img src="${escapeHtml(absoluteUrl(photo.src))}"`,
    `alt="${escapeHtml(photo.alt)}"`,
    `width="${width}" height="${height}"`,
    `style="display:block;width:100%;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none"`,
    '/>',
  ].join(' ')
}

function photoGrid(photos: Photo[], url: string) {
  const rows: string[] = []

  for (let i = 0; i < photos.length; i += 2) {
    const cells = photos.slice(i, i + 2).map((photo, column) => {
      const padding =
        column === 0
          ? `padding:0 ${GUTTER / 2}px ${GUTTER}px 0`
          : `padding:0 0 ${GUTTER}px ${GUTTER / 2}px`

      return [
        `<td width="${CELL_WIDTH}" valign="top" style="${padding}">`,
        `<a href="${escapeHtml(url)}" style="display:block;text-decoration:none">`,
        emailImage(photo, CELL_WIDTH),
        '</a>',
        '</td>',
      ].join('')
    })

    // Keep the grid rectangular if a post ends on an odd photo.
    if (cells.length === 1) {
      cells.push(`<td width="${CELL_WIDTH}">&nbsp;</td>`)
    }

    rows.push(`<tr>${cells.join('')}</tr>`)
  }

  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse">`,
    ...rows,
    '</table>',
  ].join('')
}

function emailBody(post: Post) {
  const url = absoluteUrl(`/${post.slug}`)
  const grid = post.photos.filter((photo) => photo.src !== post.lead.src).slice(0, 4)
  const blurb = excerpt(post.body, 2)

  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BACKGROUND}" style="width:100%;border-collapse:collapse;background-color:${BACKGROUND}">`,
    `<tr><td align="center" style="padding:32px 16px 40px">`,
    `<table role="presentation" width="${EMAIL_WIDTH}" cellpadding="0" cellspacing="0" border="0" style="width:${EMAIL_WIDTH}px;max-width:100%;border-collapse:collapse">`,

    // Lead photo
    `<tr><td style="padding-bottom:${GUTTER}px">`,
    `<a href="${escapeHtml(url)}" style="display:block;text-decoration:none">`,
    emailImage(post.lead, EMAIL_WIDTH),
    '</a></td></tr>',

    // 2x2 grid of the remaining photos
    grid.length > 0 ? `<tr><td>${photoGrid(grid, url)}</td></tr>` : '',

    // Title
    `<tr><td style="padding-top:20px">`,
    `<a href="${escapeHtml(url)}" style="color:${FOREGROUND};text-decoration:none">`,
    `<span style="font-family:${FONT};font-size:26px;line-height:1.15;color:${FOREGROUND}">${escapeHtml(post.title)}</span>`,
    '</a></td></tr>',

    // Date, and location when the post has one
    `<tr><td style="padding-top:10px;font-family:${FONT};font-size:12px;line-height:1.4;color:${MUTED}">`,
    escapeHtml(
      post.location ? `${post.displayDate} · ${post.location}` : post.displayDate
    ),
    '</td></tr>',

    // First two sentences of the blurb
    blurb
      ? `<tr><td style="padding-top:18px;font-family:${FONT};font-size:16px;line-height:1.65;color:#b8b8b4">${escapeHtml(blurb)}</td></tr>`
      : '',

    // Link back to the post
    `<tr><td style="padding-top:22px;font-family:${FONT};font-size:13px;line-height:1.4">`,
    `<a href="${escapeHtml(url)}" style="color:${FOREGROUND};text-decoration:underline">Read the full entry on ${escapeHtml(SITE_NAME)}</a>`,
    '</td></tr>',

    '</table></td></tr></table>',
  ].join('')
}

function item(post: Post) {
  const url = absoluteUrl(`/${post.slug}`)
  const description = post.description ?? excerpt(post.body, 2)

  return [
    '<item>',
    `<title>${escapeHtml(post.title)}</title>`,
    `<link>${escapeHtml(url)}</link>`,
    `<guid isPermaLink="true">${escapeHtml(url)}</guid>`,
    `<pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>`,
    `<description>${escapeHtml(description)}</description>`,
    `<content:encoded>${cdata(emailBody(post))}</content:encoded>`,
    '</item>',
  ].join('')
}

export function GET() {
  const posts = getAllPosts()

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeHtml(SITE_NAME)}</title>`,
    `<link>${escapeHtml(SITE_URL)}</link>`,
    `<description>${escapeHtml(SITE_DESCRIPTION)}</description>`,
    '<language>en</language>',
    `<atom:link href="${escapeHtml(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />`,
    posts[0]
      ? `<lastBuildDate>${new Date(`${posts[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>`
      : '',
    ...posts.map(item),
    '</channel>',
    '</rss>',
  ].join('')

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
