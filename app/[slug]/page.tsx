import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPost, getPostSlugs } from '@/lib/posts'
import { SITE_NAME } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `/${slug}`,
      publishedTime: post.date,
      images: [{ url: post.lead.src, alt: post.lead.alt }],
    },
  }
}

export default async function PostPage({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const { default: Blurb } = await import(`@/content/posts/${slug}/index.mdx`)

  return (
    <main className="site-shell post-shell">
      <header className="site-header">
        <Link className="site-title" href="/">
          {SITE_NAME}
        </Link>
        <Link className="site-nav" href="/about">
          About
        </Link>
      </header>

      <article>
        <header className="post-header">
          <h1>{post.title}</h1>
          <time dateTime={post.date}>{post.displayDate}</time>
        </header>

        <div className="intro">
          <Blurb />
          {post.location ? <p className="post-location">{post.location}</p> : null}
          {post.film ? <p className="post-film">{`Film: ${post.film}`}</p> : null}
        </div>

        <div className="photo-stack">
          {post.photos.map((photo, index) => (
            <figure key={photo.src} className="photo-figure">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 900px"
              />
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </article>
    </main>
  )
}
