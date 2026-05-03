export default function Badge({ children, variant = 'leaf', className = '' }) {
  const styles =
    variant === 'gold'
      ? 'bg-gold text-text-main'
      : 'bg-leaf text-warm-white'
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[10px] font-dm font-medium uppercase tracking-wide ${styles} ${className}`}
    >
      {children}
    </span>
  )
}
