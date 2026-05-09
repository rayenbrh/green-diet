import SectionReveal from '../ui/SectionReveal'

const picks = [
  { id: '1', emoji: '🍝', bg: '#FFF5E0', label: 'Pâtes' },
  { id: '2', emoji: '🍞', bg: '#E8F4E8', label: 'Pains' },
  { id: '3', emoji: '🌾', bg: '#F0EAD6', label: 'Farines' },
  { id: '4', emoji: '🍪', bg: '#FAF0E6', label: 'Biscuits' },
  { id: '5', emoji: '🫙', bg: '#FFFACD', label: 'Épicerie' },
  { id: '6', emoji: '🥐', bg: '#FFF8DC', label: 'Brioche' },
]

export default function InstagramSection() {
  return (
    <section id="sfax" className="bg-cream px-5 py-12 md:px-16 md:py-20 lg:px-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionReveal>
          <p className="text-[11px] font-dm uppercase tracking-[0.16em] text-leaf">Suivez-nous</p>
          <h2 className="mt-2 font-cormorant text-[38px] font-light text-text-main md:text-[42px]">
            Notre communauté <em className="not-italic text-leaf">verte</em>
          </h2>
        </SectionReveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {picks.map((p, i) => (
            <SectionReveal key={p.id} delay={i * 0.05}>
              <div
                className="group relative aspect-square overflow-hidden rounded-[14px]"
                style={{ backgroundColor: p.bg }}
              >
                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                  <span className="text-5xl">{p.emoji}</span>
                  <p className="mt-3 font-cormorant text-lg text-deep/90">{p.label}</p>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-0 flex-col items-center justify-end bg-[rgba(45,90,61,0.75)] pb-4 text-center text-white transition-[height] duration-300 ease-out group-hover:h-full md:pointer-events-auto">
                  <span className="translate-y-4 text-[13px] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    green.diet.sfax
                  </span>
                  <span className="mt-1 translate-y-4 text-xs opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Instagram
                  </span>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="https://www.instagram.com/green.diet.sfax"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill border border-leaf px-6 py-3 font-dm text-[13px] font-medium uppercase tracking-[0.12em] text-leaf transition hover:bg-leaf hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
          >
            Voir sur Instagram →
          </a>
        </div>
      </div>
    </section>
  )
}
