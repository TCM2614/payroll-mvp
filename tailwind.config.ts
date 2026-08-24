import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#050816',        // deep navy
          surface: '#070B17',   // slightly lighter for cards
          primary: '#3B82F6',   // blue accent
          primarySoft: '#1D4ED8',
          accent: '#22C55E',    // success/positive
          accentSoft: '#16A34A',
          border: '#1F2937',
          muted: '#9CA3AF',
          text: '#E5E7EB',
          textMuted: '#6B7280',
          warning: '#FBBF24',
          danger: '#F97373',
        },
      },
      boxShadow: {
        'soft-xl': '0 18px 45px rgba(15,23,42,0.52)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;

