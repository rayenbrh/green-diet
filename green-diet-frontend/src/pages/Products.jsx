import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Footer from '../components/layout/Footer'
import CategoryTabs from '../components/ui/CategoryTabs'
import PageTransition from '../components/ui/PageTransition'
import ProductCard from '../components/ui/ProductCard'
import ProductModal from '../components/ui/ProductModal'
import SectionReveal from '../components/ui/SectionReveal'
import { products } from '../data/products'
import { useCart } from '../hooks/useCart'

const SORTS = [
  { id: 'pop', label: 'Popularité' },
  { id: 'priceAsc', label: 'Prix croissant' },
  { id: 'priceDesc', label: 'Prix décroissant' },
  { id: 'new', label: 'Nouveautés' },
]

function sortList(list, sortId) {
  const copy = [...list]
  if (sortId === 'priceAsc') copy.sort((a, b) => a.priceNum - b.priceNum)
  else if (sortId === 'priceDesc') copy.sort((a, b) => b.priceNum - a.priceNum)
  else if (sortId === 'new') copy.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
  else copy.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
  return copy
}

export default function Products() {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('pop')
  const [selected, setSelected] = useState(null)
  const { openDrawer } = useCart()
  const [heroRef, heroInView] = useInView({ threshold: 0.2, triggerOnce: true })

  const filtered = useMemo(() => {
    const base = tab === 'all' ? products : products.filter((p) => p.category === tab)
    return sortList(base, sort)
  }, [tab, sort])

  return (
    <PageTransition>
      <main id="contenu-principal">
        <section
          ref={heroRef}
          className="relative flex min-h-[180px] items-center justify-center overflow-hidden bg-deep pt-16 md:min-h-[280px] md:pt-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath fill='%23ffffff' fill-opacity='0.04' d='M30 8c-3 8-10 14-10 22a10 10 0 1 0 20 0c0-8-7-14-10-22z'/%3E%3C/svg%3E")`,
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={heroInView ? (reduce ? {} : { opacity: 1, y: 0 }) : {}}
            className="px-6 text-center text-white"
          >
            <p className="text-[11px] font-dm uppercase tracking-[0.18em] text-gold">Catalogue</p>
            <h1 className="mt-2 font-cormorant text-4xl font-light md:text-[52px]">Tous nos produits</h1>
          </motion.div>
        </section>

        <div className="sticky top-14 z-[90] border-b border-border-green bg-[rgba(253,252,248,0.88)] backdrop-blur-[16px] md:top-16">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-16 lg:px-20">
            <CategoryTabs value={tab} onChange={setTab} ariaLabel="Catégories produits" />
            <label className="relative inline-flex items-center gap-2 font-dm text-sm text-text-muted">
              <span className="sr-only">Trier</span>
              <select
                aria-label="Trier les produits"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-pill border-[0.5px] border-border-green bg-warm-white py-2 pl-4 pr-10 text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-leaf">
                ▾
              </span>
            </label>
          </div>
        </div>

        <section className="bg-cream px-5 py-12 md:px-16 md:py-16 lg:px-20">
          <div className="mx-auto max-w-[1200px]">
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-cormorant text-3xl text-leaf">Aucun produit trouvé</p>
                <p className="mt-2 text-sm text-text-muted">Modifiez vos filtres pour voir plus de résultats.</p>
                <button
                  type="button"
                  className="mt-6 rounded-pill bg-deep px-6 py-3 font-dm text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                  onClick={() => {
                    setTab('all')
                    setSort('pop')
                  }}
                >
                  Voir tout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 min-[1280px]:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProductGridItem key={p.id} product={p} index={i} onOpenProduct={setSelected} />
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
      <ProductModal
        product={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onFinalize={openDrawer}
      />
    </PageTransition>
  )
}

function ProductGridItem({ product, index, onOpenProduct }) {
  const [ref, inView] = useInView({ threshold: 0.12, triggerOnce: true })
  return (
    <div ref={ref}>
      <SectionReveal delay={index * 0.05}>
        <ProductCard
          variant="grid"
          product={product}
          index={index}
          rowVisible={inView}
          onOpen={onOpenProduct}
        />
      </SectionReveal>
    </div>
  )
}
