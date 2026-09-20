import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    // Photos are film scans served as-is; Next's optimizer would re-encode
    // them. This keeps the URLs plain /photos/*.jpg.
    unoptimized: true,
  },
}

const withMDX = createMDX({
  options: {
    // Posts carry YAML frontmatter; this keeps it out of the rendered body.
    remarkPlugins: ['remark-frontmatter'],
  },
})

export default withMDX(nextConfig)
