import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const libraryTheme = {
  dark: false,
  colors: {
    background: '#F2F9FF',
    surface: '#FFFFFF',
    primary: '#264361',
    'primary-darken-1': '#16263A',
    secondary: '#3B6EA5',
    accent: '#F0A85E',
    success: '#1F9D6B',
    warning: '#D97706',
    error: '#DC2626',
    info: '#3B6EA5'
  }
}

const libraryThemeDark = {
  dark: true,
  colors: {
    background: '#0C1622',
    surface: '#16263A',
    primary: '#6FA8D8',
    'primary-darken-1': '#0C1622',
    secondary: '#8FC1E8',
    accent: '#F0A85E',
    success: '#34D399',
    warning: '#F0A85E',
    error: '#F87171',
    info: '#6FA8D8'
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'libraryTheme',
    themes: {
      libraryTheme,
      libraryThemeDark
    }
  },
  defaults: {
    VCard: {
      rounded: 'xl',
      elevation: 0
    },
    VBtn: {
      rounded: 'lg',
      elevation: 0
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg'
    },
    VChip: {
      rounded: 'lg'
    }
  }
})