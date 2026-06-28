<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeMode } from './composables/useThemeMode'

const { initTheme } = useThemeMode()

onMounted(initTheme)
</script>