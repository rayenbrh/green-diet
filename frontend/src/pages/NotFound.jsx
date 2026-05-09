import { Link } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'

export default function NotFound() {
  return (
    <PageTransition>
      <main
        id="contenu-principal"
        className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-6 text-center"
      >
        <p className="font-cormorant text-4xl text-deep">404 · Page introuvable</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-pill border border-leaf px-6 py-3 font-dm text-sm text-leaf transition hover:bg-leaf hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
        >
          ← Accueil
        </Link>
      </main>
    </PageTransition>
  )
}
