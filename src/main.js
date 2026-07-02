import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import './assets/digital-library-theme.css'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import reveal from './directives/reveal'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .directive('reveal', reveal)
  .mount('#app')