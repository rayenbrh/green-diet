import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function SectionReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) {
  const reduce = useReducedMotion()
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true })

  const from =
    direction === 'left'
      ? { x: -40, opacity: 0 }
      : direction === 'right'
        ? { x: 40, opacity: 0 }
        : { y: 40, opacity: 0 }

  const to = { x: 0, y: 0, opacity: 1 }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : from}
      animate={reduce || inView ? (reduce ? {} : to) : from}
      transition={{
        duration: reduce ? 0 : 0.65,
        delay: reduce ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
