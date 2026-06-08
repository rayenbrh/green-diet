import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'

export default function CategoryTabs({
  value,
  onChange,
  tabs = [{ id: 'all', label: 'Tout' }],
  loading = false,
  ariaLabel = 'Catégories',
}) {
  const reduce = useReducedMotion()

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4].map((k) => (
          <div
            key={k}
            className="h-9 w-24 shrink-0 animate-pulse rounded-pill bg-[rgba(74,124,89,0.1)]"
          />
        ))}
      </div>
    )
  }

  return (
    <LayoutGroup id="categoryTabs">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scroll-snap-type:x_mandatory]"
      >
        {tabs.map((tab) => {
          const active = value === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`relative flex-shrink-0 scroll-snap-start rounded-pill border px-4 py-2 font-dm text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50 ${
                active
                  ? 'border-transparent text-white'
                  : 'border-[0.5px] border-border-green bg-transparent text-text-muted hover:text-leaf'
              }`}
            >
              {active && !reduce && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 -z-10 rounded-pill bg-leaf shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {active && reduce && (
                <span className="absolute inset-0 -z-10 rounded-pill bg-leaf" />
              )}
              <span className="relative z-10 whitespace-nowrap">
                {tab.emoji ? `${tab.emoji} ` : ''}
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
