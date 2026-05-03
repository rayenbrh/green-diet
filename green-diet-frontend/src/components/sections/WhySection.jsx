import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaLeaf, FaMapMarkerAlt, FaShieldAlt, FaStar } from 'react-icons/fa'
import SectionReveal from '../ui/SectionReveal'

const cards = [
  {
    title: '100% Bio',
    desc: 'Tous nos produits issus de l’agriculture biologique, sans pesticides ni additifs synthétiques.',
    Icon: FaLeaf,
  },
  {
    title: 'Sans Gluten Certifié',
    desc: 'Chaque produit est rigoureusement testé et certifié sans gluten, sécurisé pour les personnes coeliaques.',
    Icon: FaShieldAlt,
  },
  {
    title: 'Local · Sfax',
    desc: 'Basés au cœur de Sfax, nous livrons rapidement et tissons des liens authentiques avec notre communauté.',
    Icon: FaMapMarkerAlt,
  },
  {
    title: 'Qualité Premium',
    desc: 'Une sélection exigeante des meilleurs ingrédients pour un goût authentique qui ne déçoit jamais.',
    Icon: FaStar,
  },
]

export default function WhySection() {
  const reduce = useReducedMotion()
  return (
    <section className="bg-deep px-5 py-16 text-white md:px-16 md:py-24 lg:px-20">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[40%_60%] lg:items-start">
        <SectionReveal>
          <p className="text-[11px] font-dm uppercase tracking-[0.16em] text-gold">Nos engagements</p>
          <h2 className="mt-3 font-cormorant text-[34px] font-light leading-tight md:text-5xl">
            Pourquoi choisir
            <br />
            <span className="italic text-leaf-light">Green Diet ?</span>
          </h2>
          <p className="mt-5 max-w-md font-dm text-[15px] font-light leading-relaxed text-white/60">
            Nous croyons que manger sans gluten ne doit jamais être un compromis sur le goût, la qualité, ou le
            plaisir.
          </p>
          <Link
            to="/a-propos"
            className="mt-6 inline-block text-[13px] font-dm uppercase tracking-[0.14em] text-gold underline decoration-gold/80 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            En savoir plus →
          </Link>
        </SectionReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((c, i) => (
            <SectionReveal key={c.title} delay={i * 0.08}>
              <motion.article
                whileHover={
                  reduce
                    ? {}
                    : {
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(255,255,255,0.25)',
                      }
                }
                transition={{ duration: 0.3 }}
                className="h-full rounded-card border border-white/[0.14] bg-transparent p-6 transition-colors md:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <c.Icon className="text-lg" aria-hidden />
                </div>
                <h3 className="mt-4 font-cormorant text-2xl font-light text-white/95">{c.title}</h3>
                <p className="mt-2 font-dm text-[13px] leading-relaxed text-white/55">{c.desc}</p>
              </motion.article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
