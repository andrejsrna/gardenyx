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
        sans: ['var(--font-inter)'],
        inter: ['var(--font-inter)']
      },
    },
  },
  plugins: [
    typography,
  ],
}
export default config
