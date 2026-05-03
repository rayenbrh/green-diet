import { motion, useReducedMotion } from 'framer-motion'

export default function FloatingBubble({
  emoji,
  size = 80,
  top,
  left,
  delay = 0,
  durationClass = 'animate-float-mid',
  index = 0,
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`absolute z-[1] flex cursor-default items-center justify-center rounded-full bg-white/70 shadow-[0_8px_30px_rgba(74,124,89,0.12)] backdrop-blur-sm transition-transform duration-300 hover:scale-110 hover:rotate-3 ${durationClass}`}
      style={{ top, left, width: size, height: size }}
      initial={reduce ? false : { scale: 0, opacity: 0 }}
      animate={reduce ? false : { scale: 1, opacity: 1 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 200, damping: 16, delay: index * 0.08 + delay }
      }
      aria-hidden
    >
      <span className="select-none text-[clamp(28px,6vw,52px)] leading-none">{emoji}</span>
    </motion.div>
  )
}
