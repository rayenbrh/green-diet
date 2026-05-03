import { BRAND_LOGO_SRC } from '../../constants/brand'

/**
 * Logo officiel Green Diet (image PNG avec typographie intégrée).
 * @param {{ variant?: 'default' | 'light', className?: string, imgClassName?: string }} props
 */
export default function LogoMark({ variant = 'default', className = '', imgClassName = '' }) {
  const isLight = variant === 'light'
  const size =
    isLight
      ? 'h-11 w-auto max-h-[52px] md:h-12'
      : 'h-9 w-auto max-h-10 md:h-10'
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={BRAND_LOGO_SRC}
        alt="Green Diet"
        width={160}
        height={160}
        className={`${size} object-contain object-left ${imgClassName} ${
          isLight ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]' : ''
        }`}
        decoding="async"
        fetchPriority="high"
      />
    </span>
  )
}
