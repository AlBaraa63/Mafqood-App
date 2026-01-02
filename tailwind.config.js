/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#1890FF',
          600: '#096DD9',
          700: '#0050B3',
          800: '#003A8C',
          900: '#002766',
        },
        // Accent Colors
        accent: {
          50: '#FFF0F6',
          100: '#FFD6E7',
          200: '#FFADD2',
          300: '#FF85C0',
          400: '#F759AB',
          500: '#EB2F96',
          600: '#C41D7F',
          700: '#9E1068',
          800: '#780650',
          900: '#520339',
        },
        // Semantic Colors
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#F5222D',
        info: '#1890FF',
        // Background
        background: {
          primary: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
        },
        // Text
        text: {
          primary: '#262626',
          secondary: '#595959',
          tertiary: '#8C8C8C',
          disabled: '#BFBFBF',
          inverse: '#FFFFFF',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '52px',
        '6xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['22px', { lineHeight: '30px' }],
        '2xl': ['26px', { lineHeight: '34px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['38px', { lineHeight: '46px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
      },
      fontFamily: {
        sans: ['System'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08)',
        md: '0 4px 12px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
        xl: '0 12px 32px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
