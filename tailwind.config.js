/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #ecfdf5)',
          100: 'var(--brand-100, #d1fae5)',
          200: 'var(--brand-200, #a7f3d0)',
          300: 'var(--brand-300, #6ee7b7)',
          400: 'var(--brand-400, #34d399)',
          500: 'var(--brand-500, #10b981)',
          600: 'var(--brand-600, #059669)',
          700: 'var(--brand-700, #047857)',
          800: 'var(--brand-800, #065f46)',
          900: 'var(--brand-900, #064e3b)',
          950: 'var(--brand-950, #022c22)',
          primary: 'var(--brand-primary, #059669)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
