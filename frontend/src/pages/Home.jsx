import { useState } from 'react'
import Footer from '../components/layout/Footer'
import CTASection from '../components/sections/CTASection'
import HeroSection from '../components/sections/HeroSection'
import InstagramSection from '../components/sections/InstagramSection'
import MarqueeStrip from '../components/ui/MarqueeStrip'
import PageTransition from '../components/ui/PageTransition'
import ProductModal from '../components/ui/ProductModal'
import ProductsSection from '../components/sections/ProductsSection'
import WhySection from '../components/sections/WhySection'
import { useCart } from '../hooks/useCart'

export default function Home() {
  const [selected, setSelected] = useState(null)
  const { openDrawer } = useCart()

  return (
    <PageTransition>
      <main id="contenu-principal">
        <HeroSection />
        <MarqueeStrip />
        <ProductsSection onOpenProduct={setSelected} />
        <WhySection />
        <InstagramSection />
        <CTASection />
        <Footer />
      </main>
      <ProductModal
        product={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onFinalize={openDrawer}
      />
    </PageTransition>
  )
}
