export const SITE_NAME = 'Eikona'

export const SITE_DESCRIPTION =
  'A quiet photography journal of light, weather, and the spaces between.'

/**
 * Absolute origin of the site, without a trailing slash. Set
 * NEXT_PUBLIC_SITE_URL in preview deployments so feeds and metadata point at
 * the deployment rather than production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://eikona.gallery'
).replace(/\/+$/, '')

export function absoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}
