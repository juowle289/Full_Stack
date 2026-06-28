import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const libraryTheme = {
  dark: false,
  colors: {
    background: '#F8FAF6',
    surface: '#FFFFFF',
    primary: '#064E3B',
    'primary-darken-1': '#022C22',
    secondary: '#9B4500',
    accent: '#F59E0B',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0284C7'
  }
}

const libraryThemeDark = {
  dark: true,
  colors: {
    background: '#0B1411',
    surface: '#11201B',
    primary: '#34D399',
    'primary-darken-1': '#022C22',
    secondary: '#F0B66B',
    accent: '#F59E0B',
    success: '#34D399',
    warning: '#F59E0B',
    error: '#F87171',
    info: '#38BDF8'
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