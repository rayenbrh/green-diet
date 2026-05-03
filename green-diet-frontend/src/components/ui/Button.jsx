export default function Button({
  children,
  as: Comp = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-pill font-dm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50 disabled:opacity-50'
  const variants = {
    primary:
      'bg-deep text-warm-white hover:bg-leaf active:scale-[0.97] px-6 py-3',
    outline:
      'border border-[rgba(26,26,20,0.3)] text-text-main bg-transparent hover:bg-cream hover:border-leaf px-6 py-3',
    ghost: 'text-leaf hover:bg-cream/80 px-4 py-2',
  }
  return (
    <Comp className={`${base} ${variants[variant] ?? variants.primary} ${className}`} {...props}>
      {children}
    </Comp>
  )
}
