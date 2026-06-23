import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const libraryTheme = {
  dark: false,
  colors: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    primary: '#2563EB',
    secondary: '#0F172A',
    accent: '#06B6D4',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#0284C7'
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'libraryTheme',
    themes: {
      libraryTheme
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