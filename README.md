# Eikona

A quiet photography journal — [eikona.gallery](https://eikona.gallery).

Next.js App Router, Tailwind, posts written as MDX. Built with [v0](https://v0.app);
every merge to `main` deploys.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a monthly post

A post is one folder of content plus one folder of photos.

1. Put the photos in `public/photos/<slug>/`. Export them at roughly 2000px on
   the long edge. Next.js image optimization is off (`images.unoptimized`), so
   the file you commit is the file the browser gets, uncompressed by the
   framework — and the RSS feed links the same file. Keep an eye on weight:
   these land around 300KB-1MB each, and email subscribers download them
   at full size.

2. Create `content/posts/<slug>/index.mdx`:

   ```mdx
   ---
   title: Contrasts
   date: 2026-09-14
   location: Back yard, late summer
   description: A set about hard light and what it leaves in shadow.
   lead: /photos/contrasts/murray-mower.jpg
   photos:
     - src: /photos/contrasts/murray-mower.jpg
       alt: A red Murray mower in a dark shed, lit by hard sun
       caption: An optional one-line caption.
     - src: /photos/contrasts/door-shadow.jpg
       alt: A shadow falling across a white-painted door laid in the sun
   ---

   The blurb goes here, as ordinary markdown. The first two sentences are what
   the email shows, so make them carry the entry on their own.
   ```

   | Field         | Required | Notes                                                              |
   | ------------- | -------- | ------------------------------------------------------------------ |
   | `title`       | yes      |                                                                     |
   | `date`        | yes      | `yyyy-mm-dd`; posts are listed newest first                         |
   | `lead`        | no       | Must be one of `photos`; defaults to the first. Used on the index.  |
   | `photos`      | yes      | 4–5 reads best. `alt` is required on every one; `caption` optional. |
   | `location`    | no       | One line under the blurb, and in the email                          |
   | `description` | no       | Page metadata and the RSS `<description>`; falls back to the blurb  |

3. `pnpm build`. The folder name becomes the URL (`/contrasts`), the
   post appears on the index, and it enters the feed. Photo dimensions are read
   from the files, so there is nothing to measure by hand.

A missing photo, missing alt text, or a `lead` that isn't in `photos` fails the
build with a message naming the post.

## Environment variables

| Variable               | Default                  | Used for                                          |
| ---------------------- | ------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://eikona.gallery` | Absolute URLs in `feed.xml`, canonicals, OG images |

Set it on preview deployments so the feed and metadata point at the preview
rather than production. No trailing slash.

## Feed

`/feed.xml` is an RSS 2.0 feed generated from post frontmatter, built as a static
file at deploy time. Each item's `content:encoded` is the email body: nested
tables with inline styles, absolute `https` URLs, a lead photo above a 2×2 grid
of the next four, then the title, the first two sentences of the blurb, and a
link back to the post.

Buttondown is the intended consumer — point its RSS-to-email automation at
`https://eikona.gallery/feed.xml`. The signup form is not built yet; it's the
next piece of work.

## Layout

```
app/
  page.tsx          index — lead photo, title, date per post
  [slug]/page.tsx   post route, rendered from MDX
  feed.xml/route.ts RSS
  globals.css       the whole visual system
content/posts/      one folder per post
public/photos/      one folder per post
lib/posts.ts        reads frontmatter, validates it, sorts posts
lib/site.ts         site name, description, NEXT_PUBLIC_SITE_URL
```
