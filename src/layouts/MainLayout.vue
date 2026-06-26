<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      width="280"
      class="dl-drawer"
    >
      <div class="drawer-brand">
        <div class="drawer-logo">
          <v-icon icon="mdi-bookshelf" size="22" />
        </div>

        <div>
          <div class="drawer-title">Thư Viện Số</div>
          <div class="drawer-subtitle">{{ roleSubtitle }}</div>
        </div>
      </div>

      <div class="drawer-quick-action">
        <v-btn
          v-if="quickAction"
          block
          color="primary"
          rounded="lg"
          :prepend-icon="quickAction.icon"
          @click="router.push(quickAction.to)"
        >
          {{ quickAction.label }}
        </v-btn>
      </div>

      <v-list nav density="comfortable" class="drawer-menu">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :title="item.title"
          :prepend-icon="item.icon"
          :to="item.to"
          rounded="lg"
        />
      </v-list>

      <template #append>
        <v-list nav density="comfortable" class="drawer-menu drawer-menu-footer">
          <v-list-item
            title="Hồ sơ cá nhân"
            prepend-icon="mdi-account-circle-outline"
            to="/app/profile"
            rounded="lg"
          />

          <v-list-item
            title="Đăng xuất"
            prepend-icon="mdi-logout"
            rounded="lg"
            class="logout-item"
            @click="logout"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat height="72" class="dl-topbar">
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <div class="topbar-search d-none d-md-flex">
        <v-icon icon="mdi-magnify" size="20" />

        <input
          v-model="searchKeyword"
          placeholder="Tìm kiếm sách, độc giả, phiếu mượn..."
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="topbar-title d-md-none">Thư Viện Số</div>

      <v-spacer />

      <div class="topbar-actions">
        <v-tooltip text="Thông báo">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text">
              <v-badge color="error" dot>
                <v-icon icon="mdi-bell-outline" />
              </v-badge>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Trợ giúp">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-help-circle-outline" variant="text" />
          </template>
        </v-tooltip>

        <router-link to="/app/profile" class="topbar-user d-none d-md-flex">
          <div class="text-right">
            <div class="topbar-user-name">{{ auth.fullName || 'Người dùng' }}</div>
            <span class="role-badge" :class="roleBadgeClass">{{ displayRole }}</span>
          </div>

          <div class="topbar-avatar">
            <v-icon icon="mdi-account-circle" size="32" />
          </div>
        </router-link>
      </div>
    </v-app-bar>

    <v-main class="dl-main-bg">
      <div class="layout-content-shell">
        <router-view />
      </div>

      <footer class="layout-footer">
        <div>© 2026 Thư Viện Số · ASP.NET Core · VueJS · SQL Server · API Gateway</div>

        <div class="footer-links">
          <span>Microservices</span>
          <span>JWT Security</span>
          <span>Digital Library</span>
        </div>
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const drawer = ref(true)
const searchKeyword = ref('')

const router = useRouter()
const auth = useAuthStore()

const displayRole = computed(() => {
  if (auth.role === 'Admin') return 'Quản trị viên'
  if (auth.role === 'Librarian') return 'Thủ thư'
  if (auth.role === 'Reader') return 'Độc giả'
  return auth.role || 'Người dùng'
})

const roleSubtitle = computed(() => {
  if (auth.role === 'Admin') return 'Quản trị hệ thống'
  if (auth.role === 'Librarian') return 'Nghiệp vụ thủ thư'
  if (auth.role === 'Reader') return 'Không gian độc giả'
  return 'Digital Microservices'
})

const roleBadgeClass = computed(() => {
  if (auth.role === 'Admin') return 'badge-gold'
  if (auth.role === 'Librarian') return 'badge-navy'
  if (auth.role === 'Reader') return 'badge-green'
  return ''
})

// Menu item theo từng vai trò - CHỈ MỘT sidebar duy nhất, nội dung đổi theo role
const navItems = computed(() => {
  if (auth.role === 'Admin') {
    return [
      { title: 'Tổng quan', icon: 'mdi-view-dashboard-outline', to: '/app/dashboard' },
      { title: 'Quản lý sách', icon: 'mdi-book-open-page-variant-outline', to: '/app/books' },
      { title: 'Quản lý độc giả', icon: 'mdi-account-group-outline', to: '/app/readers' },
      { title: 'Quản lý tài khoản', icon: 'mdi-account-key-outline', to: '/app/accounts' },
      { title: 'Phiếu mượn/trả', icon: 'mdi-clipboard-text-outline', to: '/app/borrows' },
      { title: 'Sách quá hạn', icon: 'mdi-alert-circle-outline', to: '/app/overdue' },
      { title: 'Công nợ phí phạt', icon: 'mdi-cash-multiple', to: '/app/fines' }
    ]
  }

  if (auth.role === 'Librarian') {
    return [
      { title: 'Tổng quan', icon: 'mdi-view-dashboard-outline', to: '/app/dashboard' },
      { title: 'Quản lý sách', icon: 'mdi-book-open-page-variant-outline', to: '/app/books' },
      { title: 'Quản lý độc giả', icon: 'mdi-account-group-outline', to: '/app/readers' },
      { title: 'Quầy lưu thông', icon: 'mdi-swap-horizontal-circle-outline', to: '/app/circulation' },
      { title: 'Sách quá hạn', icon: 'mdi-alert-circle-outline', to: '/app/overdue' },
      { title: 'Công nợ phí phạt', icon: 'mdi-cash-multiple', to: '/app/fines' }
    ]
  }

  if (auth.role === 'Reader') {
    return [
      { title: 'Khám phá sách', icon: 'mdi-compass-outline', to: '/app/browse' },
      { title: 'Thẻ thư viện của tôi', icon: 'mdi-card-account-details-outline', to: '/app/my-card' },
      { title: 'Lịch sử mượn sách', icon: 'mdi-history', to: '/app/my-borrows' },
      { title: 'Công nợ của tôi', icon: 'mdi-cash-multiple', to: '/app/my-fines' }
    ]
  }

  return []
})

const quickAction = computed(() => {
  if (auth.role === 'Admin' || auth.role === 'Librarian') {
    return { label: 'Thêm sách mới', icon: 'mdi-plus', to: '/app/books' }
  }

  return null
})

function handleSearch() {
  if (!searchKeyword.value.trim()) return

  if (auth.role === 'Reader') {
    router.push({ path: '/app/browse', query: { keyword: searchKeyword.value } })
  } else {
    router.push({ path: '/app/books', query: { keyword: searchKeyword.value } })
  }
}

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.dl-drawer {
  background: var(--dl-surface) !important;
  border-right: 1px solid var(--dl-surface-variant) !important;
  box-shadow: 0 10px 40px rgba(2, 44, 34, 0.05) !important;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 18px;
}

.drawer-logo {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--dl-primary);
  color: #fff;
}

.drawer-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 19px;
  color: var(--dl-primary-dark);
  line-height: 1.15;
}

.drawer-subtitle {
  margin-top: 2px;
  color: var(--dl-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.drawer-quick-action {
  padding: 0 16px 14px;
}

.drawer-menu {
  padding: 0 12px;
}

.drawer-menu :deep(.v-list-item) {
  min-height: 46px;
  margin-bottom: 4px;
  color: var(--dl-on-surface-variant);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.drawer-menu :deep(.v-list-item:hover) {
  background: var(--dl-surface-container-low);
  color: var(--dl-primary-dark);
}

.drawer-menu :deep(.v-list-item--active) {
  background: var(--dl-primary-dark) !important;
  color: #fff !important;
}

.drawer-menu :deep(.v-list-item--active .v-icon) {
  color: #fff !important;
}

.drawer-menu-footer {
  border-top: 1px solid var(--dl-border);
  padding-top: 10px;
  margin-top: 6px;
}

.logout-item {
  color: var(--dl-error) !important;
}

.dl-topbar {
  background: rgba(248, 250, 246, 0.92) !important;
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--dl-surface-variant) !important;
  box-shadow: none !important;
}

.topbar-search {
  width: min(560px, 46vw);
  height: 42px;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-radius: var(--dl-radius-full);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  color: var(--dl-text-muted);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.topbar-search:focus-within {
  border-color: var(--dl-primary);
  box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.1);
}

.topbar-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dl-text-primary);
  font-size: 14px;
}

.topbar-title {
  font-family: var(--dl-font-headline);
  color: var(--dl-primary-dark);
  font-weight: 700;
  font-size: 18px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.topbar-user {
  align-items: center;
  gap: 10px;
  padding-left: 16px;
  margin-left: 6px;
  border-left: 1px solid var(--dl-border);
  text-decoration: none;
}

.topbar-user-name {
  color: var(--dl-text-primary);
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.2;
}

.role-badge {
  display: inline-block;
  margin-top: 3px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 1px 8px;
  border-radius: var(--dl-radius-full);
}

.badge-gold {
  background: rgba(245, 158, 11, 0.15);
  color: #92660a;
}

.badge-navy {
  background: rgba(2, 44, 34, 0.1);
  color: var(--dl-primary-dark);
}

.badge-green {
  background: rgba(5, 150, 105, 0.12);
  color: var(--dl-success);
}

.topbar-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--dl-primary-dark);
  background: var(--dl-surface-container-low);
  border: 2px solid #fff;
}

.dl-main-bg {
  background: var(--dl-background-paper);
}

.layout-content-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 32px;
}

.layout-footer {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 18px 32px 28px;
  color: var(--dl-text-muted);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--dl-border);
}

.footer-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .layout-content-shell {
    padding: 18px;
  }

  .layout-footer {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 18px;
  }
}
</style>
