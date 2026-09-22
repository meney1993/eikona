import Image from 'next/image'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { SITE_NAME } from '@/lib/site'
import { SPLASH_ID, SplashIntro, splashInit } from './splash-intro'

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <>
      {/* Home only: the splash lives on this route, so deep links never gate. */}
      <div id={SPLASH_ID} className="splash" aria-hidden="true">
        <span className="splash-word">{SITE_NAME}</span>
      </div>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: splashInit }}
      />
      <SplashIntro />

      <main className="site-shell">
        <header className="site-header">
          <Link className="site-title" href="/">
            {SITE_NAME}
          </Link>
          <Link className="site-nav" href="/about">
            About
          </Link>
        </header>

        <section aria-label="Journal entries" className="index-list">
          {posts.map((post, index) => (
            <Link key={post.slug} href={`/${post.slug}`} className="index-entry">
              <Image
                src={post.lead.src}
                alt={post.lead.alt}
                width={post.lead.width}
                height={post.lead.height}
                sizes="(max-width: 900px) 100vw, 900px"
                priority={index === 0}
              />
              <div className="entry-meta">
                <h2>{post.title}</h2>
                <time dateTime={post.date}>{post.displayDate}</time>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </>
  )
}
