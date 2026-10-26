/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#0F1117',
          surface: '#1A1D26',
          elevated: '#252936',
        },
        border: {
          subtle: '#2E3445',
        },
        text: {
          primary: '#F0F3FA',
          secondary: '#9DA4B4',
        },
        accent: {
          primary: '#6C5CE7',
          hover: '#5A4BD1',
        },
        chord: {
          major: '#FF5252',
          minor: '#FF7A00',
          dom7: '#FFD600',
          maj7: '#00E676',
          min7: '#00E5FF',
          dim: '#2979FF',
          aug: '#AA00FF',
          custom: '#EC407A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
