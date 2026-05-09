/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F2',
        'warm-white': '#FDFCF8',
        gold: '#F5C842',
        'gold-light': '#FBE18A',
        leaf: '#4A7C59',
        'leaf-light': '#A8C5A0',
        deep: '#2D5A3D',
        'deep-dark': '#1E3D29',
        'text-main': '#1A1A14',
        'text-muted': '#6B6B5A',
        'border-green': 'rgba(74,124,89,0.15)',
      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        pill: '100px',
        card: '18px',
        modal: '24px',
      },
      animation: {
        'float-slow': 'floatY 6s ease-in-out infinite',
        'float-mid': 'floatY 5s ease-in-out infinite',
        'float-fast': 'floatY 4s ease-in-out infinite',
        marquee: 'marqueeScroll 22s linear infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-right': 'slideRight 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-dot': 'pulseDot 1.8s ease-in-out infinite',
        'bounce-chevron': 'bounceChevron 1.4s ease-in-out infinite',
        'dash-underline': 'dashUnderline 0.8s ease forwards 1.2s',
      },
      keyframes: {
        floatY: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(4deg)' },
        },
        marqueeScroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.90) translateY(16px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.4' },
        },
        bounceChevron: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        dashUnderline: {
          from: { strokeDashoffset: '120' },
          to: { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
