import { useEffect } from 'react'

export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    const prevTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = prev
      document.body.style.touchAction = prevTouch
    }
  }, [locked])
}
