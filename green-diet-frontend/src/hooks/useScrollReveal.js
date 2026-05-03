import { useInView } from 'react-intersection-observer'

/**
 * @param {{ threshold?: number, triggerOnce?: boolean, rootMargin?: string }} opts
 */
export function useScrollReveal(opts = {}) {
  const { threshold = 0.15, triggerOnce = true, rootMargin = '0px' } = opts
  const [ref, inView] = useInView({ threshold, triggerOnce, rootMargin })
  return { ref, inView }
}
