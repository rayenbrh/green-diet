import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import * as productsApi from '../../services/products.service'
import { useCategories } from '../../hooks/useCategories'
import CategoryTabs from '../ui/CategoryTabs'
import ProductCard from '../ui/ProductCard'
import ScrollRow from '../ui/ScrollRow'

export default function ProductsSection({ onOpenProduct }) {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('all')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const rowRef = useRef(null)
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true })
  const { tabs, loading: categoriesLoading } = useCategories()

  useEffect(() => {
    if (tab === 'all') return
    if (!categoriesLoading && !tabs.some((t) => t.id === tab)) setTab('all')
  }, [tab, tabs, categoriesLoading])

  useEffect(() => {
    let cancelled = false
    productsApi
      .getProducts({ limit: 48, sort: 'popular' })
      .then((d) => {
        if (!cancelled) {
          setList(d.products || [])
          setErr(null)
        }
      })
      .catch(() => {
        if (!cancelled) setErr(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'all') return list
    return list.filter((p) => p.category === tab)
  }, [tab, list])

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
          <CategoryTabs
            value={tab}
            onChange={setTab}
            tabs={tabs}
            loading={categoriesLoading}
            ariaLabel="Filtrer les produits par catégorie"
          />
        </div>

        {loading && (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="h-[280px] w-[220px] shrink-0 animate-pulse rounded-card bg-[rgba(74,124,89,0.08)]" />
            ))}
          </div>
        )}
        {err && (
          <p className="text-center text-text-muted">
            Impossible de charger les produits.
            <button type="button" className="ml-2 text-leaf underline" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </p>
        )}

        {!loading && !err && (
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
        )}

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
