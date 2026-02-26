/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Dark Theme Base Colors
      colors: {
        // Backgrounds - Deep blacks and charcoals
        'obsidian': '#0a0a0a',
        'charcoal': '#121212',
        'graphite': '#1a1a1a',
        'smoke': '#2a2a2a',
        
        // Text Colors - High contrast for accessibility
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
        
        // Jewel Tone Accents
        // Sapphire - Primary actions, links
        'sapphire': {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Emerald - Success states
        'emerald': {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        // Amethyst - Accents, highlights, decorative
        'amethyst': {
          DEFAULT: '#8b5cf6',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        
        // Burgundy - Errors, warnings, important
        'burgundy': {
          DEFAULT: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Legacy colors mapped to new palette (for compatibility)
        'bg-main': '#0a0a0a',
        'accent': '#2a2a2a',
        'muted-blue': '#94a3b8',
        'primary': '#3b82f6',
        'dark-blue': '#1e40af',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      
      // Animation definitions
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // Background image utilities for gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at center, rgba(26, 26, 26, 0.8) 0%, rgba(10, 10, 10, 1) 70%)',
        'sapphire-gradient': 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        'amethyst-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      },
      
      // Box shadow utilities for glow effects
      boxShadow: {
        'glow-sapphire': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-sapphire-lg': '0 0 40px rgba(59, 130, 246, 0.5)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-amethyst': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-burgundy': '0 0 20px rgba(220, 38, 38, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      
      // Border radius extensions
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      
      // Backdrop blur extensions
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
