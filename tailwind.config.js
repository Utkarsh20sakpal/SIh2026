/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark Industrial Command Center Palette
        bg: {
          DEFAULT: '#0B1117', // Main application background
          secondary: '#101820', // Secondary background
        },
        surface: {
          DEFAULT: '#151E27', // Standard cards and containers
          elevated: '#1B2631', // Elevated panels, popovers, dropdowns
          header: '#121B24',
        },
        border: {
          DEFAULT: '#273542', // Standard border
          subtle: '#202C36', // Subtle divider
          focus: '#22D3EE',
        },
        accent: {
          DEFAULT: '#22D3EE', // Primary interactive accent (Cyan)
          secondary: '#38BDF8', // Secondary accent (Sky)
          muted: 'rgba(34, 211, 238, 0.12)',
        },
        text: {
          DEFAULT: '#F1F5F9', // Primary text
          secondary: '#A7B4C0', // Secondary text
          muted: '#6F7D89', // Muted technical text
        },
        // Semantic Status Colors (Engineering Precision)
        healthy: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        info: '#38BDF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        none: '0px',
      },
      boxShadow: {
        panel: '0 4px 12px rgba(0, 0, 0, 0.35)',
        overlay: '0 8px 24px rgba(0, 0, 0, 0.55)',
      },
    },
  },
  plugins: [],
}
