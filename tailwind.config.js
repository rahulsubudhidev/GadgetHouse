/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B1A',
          600: '#EA580C',
          700: '#C2410C',
          DEFAULT: '#FF6B1A',
          emberStart: '#FF8A3D',
          emberEnd: '#FF4D00',
          amberSoft: '#FFC27A'
        },
        dark: {
          base: '#07090F',
          surface: '#0E131D',
          card: '#151B28',
          cardHover: '#1B2335',
          border: 'rgba(255, 255, 255, 0.08)',
          borderStrong: 'rgba(255, 255, 255, 0.15)',
          muted: '#9AA4B5',
          subtle: '#626D80'
        },
        light: {
          base: '#F6F3EE',
          surface: '#ECE7DF',
          card: '#FFFFFF',
          cardHover: '#FBF9F6',
          border: 'rgba(0, 0, 0, 0.08)',
          text: '#11151E',
          muted: '#687282'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Devanagari"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        'headline': '-0.02em',
        'label': '0.08em',
      },
      lineHeight: {
        'hero': '1.05',
      },
      borderRadius: {
        'card-lg': '28px',
        'card-sm': '16px',
      },
      boxShadow: {
        'glow-orange': '0 0 60px -10px rgba(255, 107, 26, 0.35)',
        'glow-subtle': '0 0 40px -15px rgba(255, 107, 26, 0.2)',
        'plate': '0 20px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'inner-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'floating': '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(255, 107, 26, 0.25)',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
