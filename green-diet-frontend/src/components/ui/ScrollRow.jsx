import { forwardRef } from 'react'

const ScrollRow = forwardRef(function ScrollRow({ children, className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`scrollbar-hide flex gap-5 overflow-x-auto scroll-smooth pb-2 [scroll-snap-type:x_mandatory] ${className}`}
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  )
})

export default ScrollRow
