import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Scrabble bonus-square palette (reused in overlay + board grid).
        bonus: {
          dl: '#7fb3d5', // dubbele letter  (light blue)
          tl: '#2e86c1', // driedubbele letter (dark blue)
          dw: '#e59866', // dubbel woord (pink/orange)
          tw: '#cb4335', // driedubbel woord (red)
          star: '#e59866',
        },
      },
    },
  },
  plugins: [],
};

export default config;
