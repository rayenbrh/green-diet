import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

const toastOptions = {
  duration: 2800,
  style: {
    background: '#FDFCF8',
    color: '#1A1A14',
    border: '0.5px solid rgba(74,124,89,0.2)',
    borderRadius: '100px',
    padding: '10px 18px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    boxShadow: '0 8px 24px rgba(74,124,89,0.14)',
  },
  iconTheme: { primary: '#4A7C59', secondary: '#FDFCF8' },
}

export default function AppToaster() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const fn = () => setMobile(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  return (
    <Toaster
      position={mobile ? 'bottom-center' : 'bottom-right'}
      toastOptions={toastOptions}
    />
  )
}
