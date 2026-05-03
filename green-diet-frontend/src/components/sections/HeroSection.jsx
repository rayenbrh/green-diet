import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BRAND_LOGO_SRC } from '../../constants/brand'
import FloatingBubble from '../ui/FloatingBubble'

const leafPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='%234A7C59' fill-opacity='0.06' d='M20 6c-2 5-6 9-6 15a6 6 0 1 0 12 0c0-6-4-10-6-15z'/%3E%3C/svg%3E\")"

const line2Words = ['sans']
const line3Words = ['compromis.']

function WordSpan({ children, delay, reduce, italicLeaf }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block"
        initial={reduce ? false : { y: 40, opacity: 0 }}
        animate={reduce ? false : { y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {italicLeaf ? <em className="italic text-leaf">{children}</em> : children}
      </motion.span>
    </span>
  )
}

const WORD_DELAYS = (() => {
  let i = 0
  const base = 0.35
  const next = () => base + (i++) * 0.04
  return {
    manger: next(),
    sain: next(),
    sans: next(),
    compromis: next(),
  }
})()

export default function HeroSection() {
  const reduce = useReducedMotion()

  return (
    <section className="relative grid min-h-[100svh] grid-cols-1 bg-cream pb-16 pt-20 md:grid-cols-[55%_45%] md:min-h-0 md:pb-24 md:pt-24">
      <div className="order-2 flex flex-col justify-center px-5 pb-10 pt-6 md:order-1 md:px-12 lg:pl-20 lg:pr-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.2, duration: reduce ? 0 : 0.5 }}
          className="mb-6 inline-flex max-w-max items-center gap-2 rounded-pill border border-border-green bg-warm-white/80 px-3 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-leaf opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
          </span>
          <span className="text-[11px] font-dm uppercase tracking-[0.12em] text-text-muted">
            Sans Gluten · 100% Bio · Sfax
          </span>
        </motion.div>

        <h1 className="font-cormorant text-[44px] font-light leading-[1.05] text-text-main md:text-[68px] lg:text-[76px]">
          <span className="block">
            <span className="mr-[0.2em] inline-block">
              <WordSpan delay={WORD_DELAYS.manger} reduce={reduce}>
                Manger
              </WordSpan>
            </span>
            <span className="mr-[0.2em] inline-block">
              <WordSpan delay={WORD_DELAYS.sain} reduce={reduce} italicLeaf>
                sain,
              </WordSpan>
            </span>
          </span>
          <span className="relative mt-1 block">
            {line2Words.map((w) => (
              <span key={w} className="relative inline-block">
                <WordSpan delay={WORD_DELAYS.sans} reduce={reduce}>
                  {w}
                </WordSpan>
                <svg
                  className="pointer-events-none absolute -bottom-1 left-0 w-full overflow-visible"
                  height="10"
                  viewBox="0 0 120 10"
                  aria-hidden
                >
                  <path
                    d="M4 7 Q30 2 60 6 T116 5"
                    fill="none"
                    stroke="#F5C842"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="120"
                    strokeDashoffset="120"
                    className={reduce ? '' : 'animate-dash-underline'}
                  />
                </svg>
              </span>
            ))}
          </span>
          <span className="mt-1 block">
            {line3Words.map((w) => (
              <span key={w} className="mr-[0.15em] inline-block">
                <WordSpan delay={WORD_DELAYS.compromis} reduce={reduce}>
                  {w}
                </WordSpan>
              </span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.75, duration: reduce ? 0 : 0.6 }}
          className="mt-6 max-w-[380px] font-dm text-[15px] font-light leading-[1.7] text-text-muted"
        >
          Des produits sans gluten soigneusement sélectionnés pour votre bien-être. Pâtes, pains,
          farines et biscuits bio livrés à Sfax.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.9, duration: reduce ? 0 : 0.5 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            to="/produits"
            className="inline-flex items-center justify-center rounded-pill bg-deep px-6 py-3 font-dm text-sm text-white transition hover:-translate-y-px hover:bg-leaf active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
          >
            Découvrir les produits →
          </Link>
          <Link
            to="/a-propos"
            className="inline-flex items-center justify-center rounded-pill border border-[rgba(26,26,20,0.3)] bg-transparent px-6 py-3 font-dm text-sm text-text-main transition hover:border-leaf hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
          >
            ▶ Notre histoire
          </Link>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? false : { opacity: 1 }}
          transition={{ delay: reduce ? 0 : 1, staggerChildren: reduce ? 0 : 0.1 }}
          className="mt-12 grid max-w-md grid-cols-3 gap-4"
        >
          {[
            ['50+', 'Produits bio'],
            ['100%', 'Sans gluten'],
            ['Sfax', 'Livraison locale'],
          ].map(([num, lab], i) => (
            <motion.div
              key={lab}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? false : { opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 1 + i * 0.1, duration: 0.5 }}
              className={`text-center ${i > 0 ? 'border-l border-[rgba(74,124,89,0.15)] pl-4' : ''}`}
            >
              <p className="font-cormorant text-[34px] font-semibold text-deep">{num}</p>
              <p className="mt-1 text-[11px] font-dm uppercase tracking-[0.12em] text-text-muted">
                {lab}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div
        className="relative order-1 h-[280px] overflow-hidden md:order-2 md:h-auto md:min-h-[560px]"
        style={{
          backgroundColor: '#F5C842',
          backgroundImage: `${leafPattern}, radial-gradient(circle at 60% 35%, rgba(255,255,255,0.28), transparent 55%)`,
        }}
      >
        <svg
          className="pointer-events-none absolute right-0 top-0 h-40 w-40 text-white/20 md:h-56 md:w-56"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <path d="M100 0 A100 100 0 0 0 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 text-white/20 md:h-56 md:w-56"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <path d="M0 100 A100 100 0 0 0 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative mx-auto flex h-full max-w-[420px] items-center justify-center md:max-w-none">
          <motion.div
            animate={
              reduce
                ? {}
                : { y: [0, -14, 0], scale: 1, opacity: 1 }
            }
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            transition={{
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 120, damping: 12, delay: 0.4 },
              opacity: { type: 'spring', stiffness: 120, damping: 12, delay: 0.4 },
            }}
            className="relative z-[2] flex h-[180px] w-[180px] flex-col items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/50 p-4 text-center shadow-lg backdrop-blur-[8px] md:h-[220px] md:w-[220px] md:p-5"
          >
            <img
              src={BRAND_LOGO_SRC}
              alt="Green Diet — Sans gluten"
              width={200}
              height={200}
              className="h-full w-full max-h-[140px] max-w-[140px] object-contain md:max-h-[168px] md:max-w-[168px]"
              loading="eager"
              decoding="async"
            />
          </motion.div>

          <FloatingBubble emoji="🍝" size={96} top="12%" left="8%" index={0} durationClass="animate-float-slow" />
          <FloatingBubble
            emoji="🥖"
            size={78}
            top="18%"
            left="78%"
            index={1}
            delay={-1.1}
            durationClass="animate-float-mid"
          />
          <FloatingBubble
            emoji="🌾"
            size={112}
            top="72%"
            left="6%"
            index={2}
            delay={-2.3}
            durationClass="animate-float-slow"
          />
          <FloatingBubble
            emoji="🍪"
            size={88}
            top="68%"
            left="80%"
            index={3}
            delay={-0.7}
            durationClass="animate-float-mid"
          />
          <FloatingBubble
            emoji="🥐"
            size={68}
            top="44%"
            left="4%"
            index={4}
            delay={-3.1}
            durationClass="animate-float-fast"
          />
          <FloatingBubble
            emoji="🫙"
            size={74}
            top="46%"
            left="82%"
            index={5}
            delay={-1.6}
            durationClass="animate-float-mid"
          />
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-dm uppercase tracking-[0.2em] text-deep/70 md:flex">
          <motion.span
            animate={reduce ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="text-lg"
            aria-hidden
          >
            ⌄
          </motion.span>
          Défiler
        </div>
      </div>
    </section>
  )
}
