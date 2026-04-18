/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdf9f2',
          100: '#f7efe2',
          200: '#edd8b6',
          300: '#e2c08a',
          400: '#d4a562',
          500: '#c48940',
          600: '#9d692f',
          700: '#734b24',
          800: '#5c3c22',
          900: '#4d331f',
        },
        forest: {
          50: '#eef7f1',
          100: '#d4eadb',
          200: '#aad5ba',
          300: '#7ec094',
          400: '#4da86d',
          500: '#2c8b51',
          600: '#21693d',
          700: '#1a5131',
          800: '#173f28',
          900: '#143321',
          950: '#091b11',
        },
        clay: {
          50: '#fdf1ea',
          100: '#f8dccb',
          200: '#f2ba9b',
          300: '#eb946a',
          400: '#de7045',
          500: '#c85631',
          600: '#a34327',
          700: '#7c321f',
          800: '#652b1e',
          900: '#53261c',
        },
        ink: {
          50: '#e9efee',
          100: '#cdd9d7',
          200: '#a2b6b2',
          300: '#768f8a',
          400: '#54706b',
          500: '#39524e',
          600: '#243733',
          700: '#1d2c29',
          800: '#15211e',
          900: '#0f1917',
          950: '#08100f',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'mesh-radial':
          'radial-gradient(circle at top left, rgba(212, 165, 98, 0.25), transparent 45%), radial-gradient(circle at 80% 10%, rgba(44, 139, 81, 0.18), transparent 30%), linear-gradient(135deg, rgba(253, 249, 242, 0.98), rgba(247, 239, 226, 0.96))',
      },
      boxShadow: {
        soft: '0 18px 40px -28px rgba(15, 25, 23, 0.35)',
        'card-glow': '0 30px 70px -35px rgba(16, 31, 24, 0.45)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.82' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out both',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
