import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
      },
        animation: {
          'spin-slow': 'spin 20s linear infinite',
      },
      fontFamily: {
        sans: ['var(--font-nunito-sans)'],
        heading: ['var(--font-fraunces)'],
        fraunces: ['var(--font-fraunces)'],
        nunito: ['var(--font-nunito-sans)'],
      },
    },
  },
  plugins: [
    typography,
  ],
}
export default config
