/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
      },
      colors: {
        primary: {
          light: '#10B981',
          dark: '#059669'
        }
      }
    },
  },
  plugins: [],
}