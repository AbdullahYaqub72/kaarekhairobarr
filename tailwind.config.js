/** @type {import('tailwindcss').Config} */
// Brand tokens: see CLAUDE.md > Brand & theme.
// Every colour is a CSS variable (RGB channels) defined in src/app/globals.css,
// with a light set on :root and a dark set under prefers-color-scheme: dark.
// So components use the same class names in both themes; never use raw hex.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

const colors = {
  navy: {
    DEFAULT: v('navy'), // brand bands, primary buttons, filled chips
    light: v('navy-light'),
    deep: v('navy-deep'),
    50: v('navy-50'), // soft tint (hover, selected rows)
    100: v('navy-100'), // tinted borders
  },
  gold: {
    DEFAULT: '#c9a84c', // same in both themes; decoration, or text on navy
    dark: v('gold-dark'), // gold-coloured text on surfaces
    soft: v('gold-soft'),
  },
  ink: { DEFAULT: v('ink'), soft: v('ink-soft') },
  muted: v('muted'),
  page: v('page'),
  surface: v('surface'),
  panel: v('panel'),
  line: v('line'),
  callout: v('callout'),
  onnavy: '#cdd6ea',
  // ink = text on the whatsapp-bg tint (themed); on = text on the bright green (fixed).
  whatsapp: { DEFAULT: '#25d366', bg: v('whatsapp-bg'), ink: v('whatsapp-ink'), on: '#0a3d20' },
  success: { DEFAULT: v('success'), bg: v('success-bg') },
  warning: { DEFAULT: v('warning'), bg: v('warning-bg') },
  danger: { DEFAULT: v('danger'), bg: v('danger-bg') },
}

// As text, border, ring or outline, "navy" means "brand ink on the page": dark
// navy in light mode, light blue-white in dark mode. As a background it stays
// the brand navy. `text-navy-deep` is the fixed dark navy for text on gold or white.
const navyInk = {
  DEFAULT: v('navy-ink'),
  light: v('navy-ink-light'),
  deep: '#0b2050',
  50: v('navy-50'),
  100: v('navy-100'),
}

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors,
      textColor: { navy: navyInk },
      borderColor: { navy: navyInk },
      ringColor: { navy: navyInk },
      outlineColor: { navy: navyInk },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'Arial', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', '"Noto Naskh Arabic"', 'serif'],
      },
      borderRadius: {
        card: '10px',
        control: '8px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        bar: 'var(--shadow-bar)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
