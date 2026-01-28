import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // SOS Brand Colors (from current site)
        primary: {
          DEFAULT: '#002F6C',
          50: '#E6EEF7',
          100: '#CCDDEF',
          200: '#99BBE0',
          300: '#6699D0',
          400: '#3377C1',
          500: '#002F6C',
          600: '#002659',
          700: '#001C43',
          800: '#02234D',
          900: '#001229',
          dark: '#02234D',
        },
        secondary: {
          DEFAULT: '#DE7C00',
          50: '#FFF3E6',
          100: '#FFE7CC',
          200: '#FFCF99',
          300: '#FFB766',
          400: '#FF9F33',
          500: '#DE7C00',
          600: '#B86600',
          700: '#8F5000',
          800: '#663900',
          900: '#3D2200',
          light: '#FCD0A4',
        },
        tertiary: {
          DEFAULT: '#8BBEE8',
          50: '#F4F9FD',
          100: '#E9F3FB',
          200: '#D3E8F7',
          300: '#BDDCF3',
          400: '#A7D1EF',
          500: '#8BBEE8',
          600: '#5FA4DC',
          700: '#338AD0',
          800: '#266BA3',
          900: '#1A4C76',
        },
        success: {
          DEFAULT: '#6BBBAE',
          500: '#6BBBAE',
        },
        info: {
          DEFAULT: '#6BBBAE',
          500: '#6BBBAE',
        },
        warning: {
          DEFAULT: '#DE7C00',
          500: '#DE7C00',
          light: '#FCD0A4',
        },
        danger: {
          DEFAULT: '#FF3951',
          500: '#FF3951',
          sos: '#FF384F',
          red: '#F42B1B',
        },
        // Legacy color names for compatibility
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'Georgia', 'serif'],
        display: ['var(--font-merriweather)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
