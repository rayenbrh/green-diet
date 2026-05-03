import { useCallback, useEffect, useState } from 'react'

export function usePWAInstall() {
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    const onBip = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice.catch(() => {})
    setDeferred(null)
  }, [deferred])

  const dismiss = useCallback(() => setDeferred(null), [])

  return {
    canInstall: Boolean(deferred),
    install,
    dismiss,
  }
}
