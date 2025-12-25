// Mafqood light color palette
// Matches usage across screens (primary, accent, highlight, neutral, text, background)

export const lightColors = {
  primary: {
    50: '#E6F3F9',
    100: '#CCE7F3',
    200: '#99CFE6',
    300: '#66B7DA',
    400: '#339FCD',
    500: '#0D7FB5', // deep turquoise/navy blend
    600: '#0B6F9E',
    700: '#095E86',
  },
  accent: {
    50: '#E9FBF7',
    100: '#C7F5EB',
    200: '#92E9D6',
    300: '#5CDDC2',
    400: '#26D2AD',
    500: '#00C39A', // turquoise accent
    600: '#00A985',
    700: '#008F70',
  },
  highlight: {
    50: '#FFF7EB',
    100: '#FFEAC7',
    200: '#FFD48F',
    300: '#FFBE57',
    400: '#FFA720',
    500: '#F28C00', // warm amber highlight
    600: '#D07400',
    700: '#A55B00',
  },
  neutral: {
    50: '#F7F9FB',
    100: '#EFF3F6',
    200: '#D9E1E8',
    300: '#C3CED9',
    400: '#9AA7B6',
    500: '#6F7C8C',
    600: '#4D5966',
    700: '#2E3944',
    white: '#FFFFFF',
  },
  text: {
    primary: '#0C1B2A',
    secondary: '#4D5966',
    tertiary: '#6F7C8C',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F4F7FA',
  },
};

export type LightColors = typeof lightColors;
