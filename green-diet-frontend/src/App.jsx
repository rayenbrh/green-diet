import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { BRAND_LOGO_SRC } from './constants/brand'
import Navbar from './components/layout/Navbar'
import CartDrawer from './components/ui/CartDrawer'
import PWAInstallBanner from './components/ui/PWAInstallBanner'
import AppToaster from './components/ui/Toast'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  const reduce = useReducedMotion()
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-cream">
      <motion.div
        animate={reduce ? {} : { scale: [0.95, 1.05, 0.95] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/30 p-2"
        aria-hidden
      >
        <img
          src={BRAND_LOGO_SRC}
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-contain"
        />
      </motion.div>
      <motion.span
        className="mt-4 h-2 w-2 rounded-full bg-gold"
        animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />
      <p className="sr-only">Chargement…</p>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/produits"
          element={
            <Suspense fallback={<PageLoader />}>
              <Products />
            </Suspense>
          }
        />
        <Route
          path="/a-propos"
          element={
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageLoader />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <a
          href="#contenu-principal"
          className="sr-only rounded-pill bg-deep px-4 py-2 font-dm text-sm text-white focus:fixed focus:left-4 focus:top-4 focus:z-[500] focus:inline-block focus:outline-none focus:ring-2 focus:ring-leaf/50"
        >
          Aller au contenu
        </a>
        <Navbar />
        <AppToaster />
        <CartDrawer />
        <PWAInstallBanner />
        <AnimatedRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}
