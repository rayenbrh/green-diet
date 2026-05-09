import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Footer from '../components/layout/Footer'
import CTASection from '../components/sections/CTASection'
import WhySection from '../components/sections/WhySection'
import FloatingBubble from '../components/ui/FloatingBubble'
import PageTransition from '../components/ui/PageTransition'
import SectionReveal from '../components/ui/SectionReveal'

const milestones = [
  {
    year: '2018',
    title: 'Les premières idées',
    text: 'Une passion pour l’alimentation saine et locale naît à Sfax, autour de recettes sans gluten testées en famille.',
    side: 'left',
  },
  {
    year: '2020',
    title: 'Green Diet voit le jour',
    text: 'Lancement des premiers pains et pâtes artisanaux, accueillis par une communauté exigeante et fidèle.',
    side: 'right',
  },
  {
    year: '2022',
    title: 'Rayon élargi',
    text: 'Farines alternatives, biscuits et épicerie fine rejoignent le catalogue pour offrir une expérience complète.',
    side: 'left',
  },
  {
    year: '2024',
    title: 'Une marque reconnue',
    text: 'Partenariats locaux, livraison optimisée et engagement bio renforcé pour servir tout le Grand Sfax.',
    side: 'right',
  },
]

export default function About() {
  const reduce = useReducedMotion()
  return (
    <PageTransition>
      <main id="contenu-principal">
        <section className="grid min-h-[70vh] grid-cols-1 pt-16 md:grid-cols-2 md:pt-20">
          <div className="flex flex-col justify-center bg-warm-white px-6 py-16 md:px-16 lg:px-20">
            <SectionReveal>
              <p className="text-[11px] font-dm uppercase tracking-[0.16em] text-leaf">Notre histoire</p>
              <h1 className="mt-4 font-cormorant text-4xl font-light leading-tight text-text-main md:text-6xl">
                Une maison sans gluten, ancrée à Sfax
              </h1>
              <p className="mt-6 max-w-xl font-dm text-[15px] font-light leading-relaxed text-text-muted">
                Green Diet est née d’une conviction simple : le sans gluten peut être luxueux, savoureux et accessible.
                Nous sélectionnons des ingrédients bio, travaillons avec des producteurs de confiance et faisons
                grandir une communauté autour du bien manger.
              </p>
            </SectionReveal>
          </div>
          <div
            className="relative min-h-[280px] bg-gold md:min-h-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='%234A7C59' fill-opacity='0.06' d='M20 6c-2 5-6 9-6 15a6 6 0 1 0 12 0c0-6-4-10-6-15z'/%3E%3C/svg%3E")`,
            }}
          >
            <div className="relative mx-auto flex h-full min-h-[320px] max-w-lg items-center justify-center p-8">
              <FloatingBubble emoji="🥖" size={88} top="15%" left="10%" index={0} durationClass="animate-float-slow" />
              <FloatingBubble emoji="🍝" size={72} top="55%" left="70%" index={1} delay={-1} durationClass="animate-float-mid" />
              <FloatingBubble emoji="🌾" size={96} top="40%" left="38%" index={2} delay={-2} durationClass="animate-float-slow" />
            </div>
          </div>
        </section>

        <section className="bg-cream px-5 py-20 md:px-16 lg:px-20">
          <div className="mx-auto max-w-[900px]">
            <SectionReveal>
              <h2 className="text-center font-cormorant text-4xl font-light text-deep">Notre parcours</h2>
              <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-muted">
                Quelques étapes marquantes de l’aventure Green Diet.
              </p>
            </SectionReveal>
            <div className="relative mx-auto mt-16 max-w-2xl">
              <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border-green md:block" aria-hidden />
              <ul className="space-y-12">
                {milestones.map((m, i) => (
                  <TimelineItem key={m.year} {...m} index={i} reduce={reduce} />
                ))}
              </ul>
            </div>
          </div>
        </section>

        <WhySection />
        <CTASection />
        <Footer />
      </main>
    </PageTransition>
  )
}

function TimelineItem({ year, title, text, side, index, reduce }) {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })
  const fromX = side === 'left' ? -56 : 56
  const card = (
    <motion.article
      initial={reduce ? false : { opacity: 0, x: fromX }}
      animate={inView ? (reduce ? {} : { opacity: 1, x: 0 }) : {}}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-card border border-border-green bg-warm-white p-6 shadow-sm ${
        side === 'left' ? 'md:mr-4 md:text-right' : 'md:ml-4'
      }`}
    >
      <p className="text-xs font-dm uppercase tracking-[0.14em] text-gold">{year}</p>
      <h3 className="mt-2 font-cormorant text-2xl text-text-main">{title}</h3>
      <p className="mt-2 font-dm text-sm leading-relaxed text-text-muted">{text}</p>
    </motion.article>
  )
  return (
    <li ref={ref} className="relative z-[1] grid grid-cols-1 md:grid-cols-2 md:gap-10">
      {side === 'left' ? (
        <>
          <div>{card}</div>
          <div className="hidden md:block" aria-hidden />
        </>
      ) : (
        <>
          <div className="hidden md:block" aria-hidden />
          <div>{card}</div>
        </>
      )}
    </li>
  )
}
