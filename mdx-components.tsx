import type { MDXComponents } from 'mdx/types'
import Image, { type ImageProps } from 'next/image'

const components = {
  img: (props) => (
    <Image
      {...(props as ImageProps)}
      sizes="(max-width: 900px) 100vw, 900px"
      style={{ width: '100%', height: 'auto' }}
    />
  ),
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
