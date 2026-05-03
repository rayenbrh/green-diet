import { motion, useReducedMotion } from 'framer-motion'
import { useCart } from '../../hooks/useCart'
import SectionReveal from '../ui/SectionReveal'

export default function CTASection() {
  const reduce = useReducedMotion()
  const { openDrawer } = useCart()
  return (
    <section className="relative overflow-hidden bg-gold px-5 py-16 md:px-16 md:py-24 lg:px-20">
      <svg
        className="pointer-events-none absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 text-white/12"
        viewBox="0 0 200 200"
        aria-hidden
      >
        <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        className="pointer-events-none absolute -right-16 top-8 h-[360px] w-[360px] text-white/12"
        viewBox="0 0 200 200"
        aria-hidden
      >
        <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative z-[1] mx-auto max-w-[720px] text-center">
        <SectionReveal>
          <p className="text-xs font-dm uppercase tracking-[0.18em] text-deep">Prêt à bien manger ?</p>
          <h2 className="mt-3 font-cormorant text-[38px] font-light text-deep md:text-6xl">
            Commandez dès <em className="not-italic text-deep-dark">aujourd&apos;hui</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] font-dm text-base font-light leading-relaxed text-deep-dark/70">
            Livraison rapide à Sfax · Produits frais et certifiés · Service client attentionné
          </p>
          <motion.button
            type="button"
            className="mt-8 inline-flex h-[52px] items-center justify-center rounded-pill bg-deep px-8 font-dm text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-dark/40"
            whileHover={reduce ? {} : { scale: 1.02, y: -2 }}
            whileTap={reduce ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={openDrawer}
          >
            Commander maintenant →
          </motion.button>
          <a
            href="https://wa.me/21600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block font-dm text-sm text-deep underline decoration-deep/40 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30"
          >
            📞 Contactez-nous sur WhatsApp
          </a>
        </SectionReveal>
      </div>
    </section>
  )
}
