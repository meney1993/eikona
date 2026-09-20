import Image from 'next/image'
import Link from 'next/link'

const post = {
  title: 'The Weather Between Us',
  date: 'October 14, 2024',
  image: '/photos/coastal-morning.png',
}

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="site-title" href="/">Field Notes</Link>
      </header>

      <section aria-label="Journal entries" className="index-list">
        <Link href="/the-weather-between-us" className="index-entry">
          <Image
            src={post.image}
            alt="A solitary rock in a misty dawn sea"
            width={1800}
            height={1200}
            priority
          />
          <div className="entry-meta">
            <h1>{post.title}</h1>
            <time dateTime="2024-10-14">{post.date}</time>
          </div>
        </Link>
      </section>
    </main>
  )
}

export const metadata = {
  title: 'Field Notes — A Photography Journal',
}

