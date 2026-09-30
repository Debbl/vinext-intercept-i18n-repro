'use client'

import { useRouter } from 'next/navigation'

// Closing an intercepted route means going back to the page it opened over.
export function CloseButton() {
  const router = useRouter()
  return (
    <button id='close' type='button' onClick={() => router.back()}>
      Close
    </button>
  )
}
