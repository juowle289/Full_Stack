import { ref } from 'vue'
import { useTheme } from 'vuetify'

const isDark = ref(localStorage.getItem('themeMode') === 'dark')

export function useThemeMode() {
  const theme = useTheme()

  function applyTheme(dark) {
    isDark.value = dark
    theme.global.name.value = dark ? 'libraryThemeDark' : 'libraryTheme'

    if (dark) {
      document.documentElement.classList.add('theme-dark')
    } else {
      document.documentElement.classList.remove('theme-dark')
    }

    localStorage.setItem('themeMode', dark ? 'dark' : 'light')
  }

  function toggleDark() {
    applyTheme(!isDark.value)
  }

  function setDark(value) {
    applyTheme(value)
  }

  function initTheme() {
    applyTheme(isDark.value)
  }

  return { isDark, toggleDark, setDark, initTheme }
}
