const inner = (
  <>
    <span>Sans Gluten</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>Pâtes Bio</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>Pain Artisanal</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>Farine Alternative</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>Biscuits Sains</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>Livraison Sfax</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>100% Naturel</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
    <span>Bio & Savoureux</span>
    <span className="mx-5 text-[8px] text-gold" aria-hidden>
      ✦
    </span>
  </>
)

export default function MarqueeStrip() {
  return (
    <div className="h-[38px] overflow-hidden bg-deep md:h-11">
      <div className="flex h-full items-center">
        <div className="animate-marquee flex w-max whitespace-nowrap hover:[animation-play-state:paused]">
          <div className="inline-flex items-center pr-16 font-dm text-[11px] uppercase tracking-[0.14em] text-white/85 sm:text-xs">
            {inner}
          </div>
          <div className="inline-flex items-center pr-16 font-dm text-[11px] uppercase tracking-[0.14em] text-white/85 sm:text-xs">
            {inner}
          </div>
        </div>
      </div>
    </div>
  )
}
