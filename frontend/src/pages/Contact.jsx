import { useState } from 'react'
import toast from 'react-hot-toast'
import Footer from '../components/layout/Footer'
import PageTransition from '../components/ui/PageTransition'
import SectionReveal from '../components/ui/SectionReveal'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e) => {
    e.preventDefault()
    toast.success('Message envoyé 🌿')
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <PageTransition>
      <main id="contenu-principal" className="bg-cream pb-16 pt-28 md:pt-32">
        <div className="mx-auto max-w-xl px-5 md:px-8">
          <SectionReveal>
            <p className="text-[11px] font-dm uppercase tracking-[0.16em] text-leaf">Contact</p>
            <h1 className="mt-2 font-cormorant text-4xl font-light text-text-main md:text-5xl">
              Parlons de votre bien-être
            </h1>
            <p className="mt-4 font-dm text-sm font-light leading-relaxed text-text-muted">
              Une question sur nos produits, une livraison à Sfax ou un partenariat ? Écrivez-nous.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.08} className="mt-10">
            <form onSubmit={submit} className="space-y-5 font-dm text-sm">
              <div>
                <label htmlFor="name" className="mb-1 block text-text-muted">
                  Nom
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-card border border-border-green bg-warm-white px-4 py-3 text-text-main outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/30"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-text-muted">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-card border border-border-green bg-warm-white px-4 py-3 text-text-main outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/30"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-text-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-y rounded-card border border-border-green bg-warm-white px-4 py-3 text-text-main outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/30"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-pill bg-deep py-3 font-dm text-sm text-white transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
              >
                Envoyer
              </button>
            </form>
          </SectionReveal>
        </div>
        <Footer />
      </main>
    </PageTransition>
  )
}
