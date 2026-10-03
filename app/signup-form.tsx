'use client'

import { useState, type FormEvent } from 'react'

const EMAIL = /^\S+@\S+\.\S+$/

/**
 * The home signup form. A client component rather than an inline script so
 * the check mounts with the form, including when home is drawn after an
 * in-site click. A bad address is cancelled in onSubmit. A valid address
 * still leaves as a native POST, so Buttondown can redirect for captcha.
 */
export function SignupForm() {
  const [invalid, setInvalid] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const field = event.currentTarget.elements.namedItem('email') as HTMLInputElement
    field.value = field.value.trim()
    if (!EMAIL.test(field.value)) {
      event.preventDefault()
      setInvalid(true)
    }
  }

  return (
    <form
      className="signup-line"
      method="post"
      action="https://buttondown.com/api/emails/embed-subscribe/eikona"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="signup-row">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          name="email"
          required
          onChange={() => setInvalid(false)}
        />
        <input type="hidden" name="embed" value="1" />
        <button type="submit">Subscribe</button>
      </div>
      <p className="signup-error" role="alert" hidden={!invalid}>
        Enter a valid email
      </p>
    </form>
  )
}
