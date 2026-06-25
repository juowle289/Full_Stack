<template>
  <div class="dl-page public-shell">
    <!-- Header -->
    <header class="public-header" :class="{ 'is-scrolled': isScrolled }">
      <div class="public-container header-inner">
        <router-link to="/" class="brand">
          <span class="brand-mark">
            <v-icon icon="mdi-bookshelf" size="22" />
          </span>
          <span class="brand-text">Thư Viện Số</span>
        </router-link>

        <nav class="desktop-nav">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            exact-active-class="nav-link-active"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <div class="desktop-actions">
          <template v-if="auth.isLoggedIn">
            <div class="user-mini">
              <div class="user-name">{{ auth.fullName || 'Người dùng' }}</div>
              <div class="user-role">{{ displayRole }}</div>
            </div>

            <v-btn
              color="primary"
              rounded="pill"
              prepend-icon="mdi-view-dashboard-outline"
              @click="goToApp"
            >
              Vào hệ thống
            </v-btn>

            <v-btn
              variant="tonal"
              color="error"
              rounded="pill"
              icon="mdi-logout"
              size="small"
              @click="logout"
            />
          </template>

          <template v-else>
            <v-btn
              variant="outlined"
              color="primary"
              rounded="pill"
              class="btn-outline-login"
              @click="router.push('/login')"
            >
              Đăng nhập
            </v-btn>

            <v-btn
              color="primary"
              rounded="pill"
              @click="router.push('/register')"
            >
              Đăng ký thẻ thư viện
            </v-btn>
          </template>
        </div>

        <v-btn
          class="mobile-menu-btn"
          icon="mdi-menu"
          variant="text"
          @click="mobileMenu = !mobileMenu"
        />
      </div>

      <transition name="dl-fade">
        <div v-if="mobileMenu" class="mobile-menu public-container">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="mobile-nav-link"
            @click="mobileMenu = false"
          >
            {{ item.label }}
          </router-link>

          <div class="mobile-menu-actions">
            <template v-if="auth.isLoggedIn">
              <v-btn block color="primary" rounded="pill" @click="goToApp">
                Vào hệ thống
              </v-btn>
              <v-btn block variant="tonal" color="error" rounded="pill" @click="logout">
                Đăng xuất
              </v-btn>
            </template>

            <template v-else>
              <v-btn block variant="outlined" color="primary" rounded="pill" @click="router.push('/login')">
                Đăng nhập
              </v-btn>
              <v-btn block color="primary" rounded="pill" @click="router.push('/register')">
                Đăng ký thẻ thư viện
              </v-btn>
            </template>
          </div>
        </div>
      </transition>
    </header>

    <!-- Nội dung từng trang -->
    <main class="public-main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="public-footer">
      <div class="public-container footer-grid">
        <div class="footer-brand">
          <div class="brand-text footer-brand-title">Thư Viện Số</div>
          <p>
            Hệ thống thư viện hiện đại, kết nối tri thức và độc giả qua nền tảng số tiên tiến.
          </p>
        </div>

        <div class="footer-col">
          <h3>Liên kết nhanh</h3>
          <router-link to="/">Trang chủ</router-link>
          <router-link to="/catalog">Danh mục sách</router-link>
          <router-link to="/guide">Hướng dẫn &amp; Quy định</router-link>
        </div>

        <div class="footer-col">
          <h3>Thông tin</h3>
          <router-link to="/about">Về chúng tôi</router-link>
          <router-link to="/contact">Liên hệ</router-link>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="public-container">
          © {{ new Date().getFullYear() }} Thư Viện Số. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const isScrolled = ref(false)
const mobileMenu = ref(false)

const navItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Danh mục sách', to: '/catalog' },
  { label: 'Hướng dẫn & Quy định', to: '/guide' },
  { label: 'Về chúng tôi', to: '/about' },
  { label: 'Liên hệ', to: '/contact' }
]

const displayRole = computed(() => {
  if (auth.role === 'Admin') return 'Quản trị viên'
  if (auth.role === 'Librarian') return 'Thủ thư'
  if (auth.role === 'Reader') return 'Độc giả'
  return auth.role || 'Người dùng'
})

function goToApp() {
  if (['Admin', 'Librarian'].includes(auth.role)) {
    router.push('/app/dashboard')
  } else {
    router.push('/app/books')
  }
}

function logout() {
  auth.logout()
  router.push('/')
}

function handleScroll() {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.public-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.public-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(248, 250, 246, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.public-header.is-scrolled {
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  border-color: var(--dl-border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-primary);
  color: #fff;
}

.brand-text {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 22px;
  color: var(--dl-primary);
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  font-family: var(--dl-font-body);
  font-weight: 600;
  font-size: 14px;
  color: var(--dl-on-surface-variant);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.nav-link:hover {
  color: var(--dl-primary);
}

.nav-link-active {
  color: var(--dl-primary);
  border-bottom-color: var(--dl-primary);
}

.desktop-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-mini {
  text-align: right;
  margin-right: 0.25rem;
  line-height: 1.2;
}

.user-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--dl-text-primary);
}

.user-role {
  font-size: 12px;
  color: var(--dl-text-muted);
}

.mobile-menu-btn {
  display: none;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  padding-bottom: 1.25rem;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 0;
  font-weight: 600;
  color: var(--dl-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--dl-border);
}

.mobile-menu-actions {
  display: grid;
  gap: 0.625rem;
  margin-top: 1rem;
}

.public-main {
  flex: 1;
}

/* Footer */
.public-footer {
  margin-top: auto;
  background: var(--dl-primary-dark);
  color: rgba(255, 255, 255, 0.85);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
  padding: 3rem 2rem 2rem;
}

.footer-brand-title {
  font-size: 22px;
  color: var(--dl-accent-gold);
  margin-bottom: 0.75rem;
}

.footer-brand p {
  max-width: 22rem;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.footer-col h3 {
  font-family: var(--dl-font-body);
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  margin-bottom: 1rem;
}

.footer-col a {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: 0.625rem;
  transition: color 0.2s ease;
}

.footer-col a:hover {
  color: #fff;
  text-decoration: underline;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
}

.footer-bottom .public-container {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.dl-fade-enter-active,
.dl-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dl-fade-enter-from,
.dl-fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .public-container {
    padding: 0 1rem;
  }

  .desktop-nav,
  .desktop-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .mobile-menu {
    display: flex;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    padding: 2.5rem 1rem 1.5rem;
  }
}
</style>
