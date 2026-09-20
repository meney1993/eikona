import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  options: {
    // Posts carry YAML frontmatter; this keeps it out of the rendered body.
    remarkPlugins: ['remark-frontmatter'],
  },
})

export default withMDX(nextConfig)
