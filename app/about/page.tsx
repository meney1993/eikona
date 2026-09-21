import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="site-title" href="/">
          {SITE_NAME}
        </Link>
        <Link className="site-nav" href="/about" aria-current="page">
          About
        </Link>
      </header>

      <article>
        <header className="post-header">
          <h1>About</h1>
        </header>

        <div className="intro">
          <p>Exploring 35mm film photography and documenting my experience with a 1974 Minolta SRT 102. No editing on the photos, trying to capture what I find interesting, as it is.</p>
        </div>
      </article>
    </main>
  )
}
