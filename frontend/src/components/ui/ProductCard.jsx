import { motion, useReducedMotion } from 'framer-motion'
import { useCart } from '../../hooks/useCart'
import { getProductCoverImage } from '../../lib/productImage'
import Badge from './Badge'

function Stars({ rating }) {
  const full = Math.round(rating)
  const stars = Array.from({ length: 5 }, (_, i) => (i < full ? '★' : '☆'))
  return (
    <span className="text-gold" aria-hidden>
      {stars.join('')}
    </span>
  )
}

export default function ProductCard({
  product,
  index = 0,
  rowVisible = true,
  onOpen,
  variant = 'row',
}) {
  const { addToCart } = useCart()
  const reduce = useReducedMotion()
  const coverImage = getProductCoverImage(product)

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen?.(product)
    }
  }

  return (
    <motion.article
      role="article"
      tabIndex={0}
      aria-label={`${product.name}, ${product.price} TND`}
      onKeyDown={onKeyDown}
      layout
      className={`cursor-pointer rounded-card border-[0.5px] border-border-green bg-warm-white ${
        variant === 'grid'
          ? 'w-full max-w-sm justify-self-center'
          : 'w-[160px] flex-shrink-0 scroll-snap-start md:w-[220px]'
      }`}
      initial={reduce ? false : { y: 30, opacity: 0 }}
      animate={
        reduce || rowVisible ? (reduce ? {} : { y: 0, opacity: 1 }) : { y: 30, opacity: 0 }
      }
      transition={
        reduce
          ? { duration: 0 }
          : { delay: index * 0.07, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }
      }
      whileHover={
        reduce
          ? {}
          : { y: -6, boxShadow: '0 16px 40px rgba(74,124,89,0.14)' }
      }
      style={{ transition: 'box-shadow 0.2s' }}
    >
      <div
        className="relative h-[120px] overflow-hidden rounded-t-card md:h-[160px]"
        style={{ backgroundColor: product.bgColor }}
        onClick={() => onOpen?.(product)}
      >
        {product.isNew ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-2 top-2 z-[2]"
          >
            <Badge>Nouveau</Badge>
          </motion.div>
        ) : product.isBestSeller ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-2 top-2 z-[2]"
          >
            <Badge variant="gold">⭐ Best-seller</Badge>
          </motion.div>
        ) : null}
        {coverImage ? (
          <img src={coverImage} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-[52px]">{product.emoji}</div>
        )}
      </div>
      <div className="space-y-2 p-3.5" onClick={() => onOpen?.(product)}>
        <h3 className="font-cormorant text-lg leading-tight text-text-main">{product.name}</h3>
        <p className="text-[11px] text-text-muted">
          {product.weight} · {product.tags[0]}
        </p>
        <div className="flex items-center gap-1 text-[11px] text-text-muted">
          <Stars rating={product.rating} />
          <span>({product.reviews} avis)</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="font-cormorant text-xl font-semibold text-deep">
            {product.price} <span className="text-sm font-dm font-normal text-text-muted">TND</span>
          </p>
          <motion.button
            type="button"
            aria-label={`Ajouter ${product.name} au panier`}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-leaf text-lg font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
            whileHover={reduce ? {} : { scale: 1.1, backgroundColor: '#2D5A3D' }}
            whileTap={reduce ? {} : { scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              addToCart(product)
            }}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
