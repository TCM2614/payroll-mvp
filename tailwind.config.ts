import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pantone Color Palette - Financial & Phantom Theme
        'ethereal': {
          50: '#E8F5F9',
          100: '#D1EBF3',
          200: '#A8D8EA',
          300: '#7FC5E1',
          400: '#56B2D8',
          500: '#2D9FCF',
          600: '#257F9F',
          700: '#1C5F6F',
          800: '#133F3F',
          900: '#0A1F1F',
        },
        'sea-jet': {
          50: '#E8F2F5',
          100: '#D1E5EB',
          200: '#A3CBD7',
          300: '#75B1C3',
          400: '#4A8B9E',
          500: '#3A6F7E',
          600: '#2A535E',
          700: '#1A373F',
          800: '#0A1B1F',
          900: '#050F12',
        },
        'aqua': {
          50: '#E8F7F7',
          100: '#D1EFEF',
          200: '#A3DFDF',
          300: '#7BC4C4',
          400: '#62A4A4',
          500: '#4A8484',
          600: '#3A6A6A',
          700: '#2A5050',
          800: '#1A3636',
          900: '#0A1C1C',
        },
        'brilliant': {
          50: '#E8F0F7',
          100: '#D1E1EF',
          200: '#A3C3DF',
          300: '#75A5CF',
          400: '#4A7FAF',
          500: '#2E5C8A',
          600: '#254A6E',
          700: '#1C3852',
          800: '#132636',
          900: '#0A141A',
        },
        'navy': {
          50: '#E8EAED',
          100: '#D1D5DB',
          200: '#A3ABBA',
          300: '#758198',
          400: '#47576D',
          500: '#1A2B3C',
          600: '#15222F',
          700: '#101922',
          800: '#0A1115',
          900: '#05080A',
        },
      },
    },
  },
  plugins: [],
};

export default config;

