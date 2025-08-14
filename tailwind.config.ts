import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/Login/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-navy': '#0D1117',
        'dark-card': '#1A1F29',
        'dark-border': '#30363D',
        'dark-hover': '#21262D',
        'dark-text': {
          primary: '#F0F6FC',
          secondary: '#8B949E',
        },
        'gradient': {
          blue: '#4F8CFF',
          purple: '#A855F7',
          pink: '#FF6B81',
        },
      },
      backgroundImage: {
        'gradient-text': 'linear-gradient(to right, #4F8CFF, #A855F7, #FF6B81)',
      },
    },
  },
  plugins: [],
};

export default config; 