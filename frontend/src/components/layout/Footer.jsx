import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import LogoMark from '../brand/LogoMark'

const social = [
  {
    href: 'https://www.instagram.com/green.diet.sfax',
    label: 'Instagram',
    Icon: FaInstagram,
  },
  {
    href: 'https://www.facebook.com/',
    label: 'Facebook',
    Icon: FaFacebookF,
  },
  {
    href: 'https://wa.me/21600000000',
    label: 'WhatsApp',
    Icon: FaWhatsapp,
  },
]

export default function Footer() {
  return (
    <footer className="bg-deep px-5 pb-10 pt-12 text-white md:px-16 md:pb-10 md:pt-16 lg:px-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 md:grid-cols-4 md:gap-12">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <LogoMark variant="light" />
          <p className="font-cormorant text-sm italic text-white/60">Manger sain, vivre bien.</p>
          <div className="flex gap-2">
            {social.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-gold">Liens</h3>
          <ul className="space-y-2 font-dm text-sm text-white/60">
            {[
              ['/', 'Accueil'],
              ['/produits', 'Produits'],
              ['/a-propos', 'À propos'],
              ['/contact', 'Contact'],
            ].map(([to, lab]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                  {lab}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-gold">Produits</h3>
          <ul className="space-y-2 font-dm text-sm text-white/60">
            {['Pâtes', 'Pains & Brioches', 'Farines', 'Biscuits', 'Épicerie bio'].map((t) => (
              <li key={t}>
                <Link
                  to="/produits"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h3 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-gold">Nous trouver</h3>
          <p className="text-sm text-white/70">Sfax, Tunisie</p>
          <a href="tel:+21600000000" className="mt-1 block text-sm text-white/80 underline">
            +216 00 000 000
          </a>
          <p className="mt-2 text-xs text-white/55">Lun–Sam: 8h–20h</p>
          <div className="mt-4 flex h-20 w-full items-center justify-center rounded-xl bg-white/[0.07] text-xs text-gold">
            📍 Sfax, Tunisie
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1200px] flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-white/40 sm:flex-row sm:justify-between">
        <span>© 2025 Green Diet · Tous droits réservés</span>
        <span>Fait avec 💚 à Sfax</span>
      </div>
    </footer>
  )
}
