'use client'

import { useEffect } from 'react'

export const SPLASH_ID = 'eikona-splash'

/**
 * Runs synchronously while the browser parses the HTML, so the decision is
 * made before the first paint: an already-seen tab or a reduced-motion
 * viewer never sees a frame of the splash, and a first visit is covered from
 * the very first frame.
 *
 * The splash is hidden by default in CSS and this opts it in, so if the
 * script is blocked or throws, the site just loads without an intro.
 * It targets the splash element rather than <html> because React resets
 * <html> attributes on its Strict Mode remount in development.
 */
export const splashInit = `(function(){try{
if(sessionStorage.getItem('eikona-splash-seen'))return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
sessionStorage.setItem('eikona-splash-seen','1');
var e=document.getElementById('${SPLASH_ID}');
if(e)e.setAttribute('data-run','');
}catch(e){}})()`

/**
 * Ends the splash. The CSS animation owns the timing; this listens for its
 * end, lets a click or Escape cut it short, and keeps a timer as a guard in
 * case the animation never fires.
 */
export function SplashIntro() {
  useEffect(() => {
    const splash = document.getElementById(SPLASH_ID)
    if (!splash || !splash.hasAttribute('data-run')) return

    let finished = false

    const detach = () => {
      window.clearTimeout(guard)
      window.removeEventListener('pointerdown', finish)
      window.removeEventListener('keydown', onKeyDown)
      splash.removeEventListener('animationend', onAnimationEnd)
    }

    function finish() {
      if (finished) return
      finished = true
      splash?.removeAttribute('data-run')
      detach()
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') finish()
    }

    function onAnimationEnd(event: AnimationEvent) {
      // The word fades on its own timeline; only the veil ending means done.
      if (event.target === splash) finish()
    }

    const guard = window.setTimeout(finish, 2000)

    window.addEventListener('pointerdown', finish)
    window.addEventListener('keydown', onKeyDown)
    splash.addEventListener('animationend', onAnimationEnd)

    // Detach only — leaving the splash running across a Strict Mode remount.
    return detach
  }, [])

  return null
}
