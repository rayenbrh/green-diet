import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { products } from '../../data/products'
import CategoryTabs from '../ui/CategoryTabs'
import ProductCard from '../ui/ProductCard'
import ScrollRow from '../ui/ScrollRow'

export default function ProductsSection({ onOpenProduct }) {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('all')
  const rowRef = useRef(null)
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true })

  const filtered = useMemo(() => {
    if (tab === 'all') return products
    return products.filter((p) => p.category === tab)
  }, [tab])

  const scrollBy = (dir) => {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  return (
    <motion.section
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={inView ? (reduce ? {} : { opacity: 1, y: 0 }) : reduce ? {} : { opacity: 0, y: 40 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-cream px-5 py-12 md:px-16 md:py-20 lg:px-20"
      aria-labelledby="home-products-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-dm uppercase tracking-[0.16em] text-leaf">Notre sélection</p>
            <h2
              id="home-products-heading"
              className="mt-2 font-cormorant text-[32px] font-light text-text-main md:text-[46px]"
            >
              Produits <em className="not-italic text-leaf">préférés</em>
            </h2>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              aria-label="Faire défiler vers la gauche"
              className="flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-border-green bg-warm-white text-sm transition hover:scale-105 hover:border-leaf hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
              onClick={() => scrollBy(-1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Faire défiler vers la droite"
              className="flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-border-green bg-warm-white text-sm transition hover:scale-105 hover:border-leaf hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
              onClick={() => scrollBy(1)}
            >
              →
            </button>
            <Link
              to="/produits"
              className="text-xs font-dm uppercase tracking-[0.14em] text-leaf underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
            >
              Voir tout →
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <CategoryTabs value={tab} onChange={setTab} ariaLabel="Filtrer les produits par catégorie" />
        </div>

        <ScrollRow ref={rowRef} className="-mx-1 px-1">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              rowVisible={inView}
              onOpen={onOpenProduct}
            />
          ))}
        </ScrollRow>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/produits"
            className="text-xs font-dm uppercase tracking-[0.14em] text-leaf underline underline-offset-4"
          >
            Voir tout →
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
