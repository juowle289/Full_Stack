<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" width="280" class="dl-drawer">
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
        <v-btn v-if="quickAction" block color="primary" rounded="lg" :prepend-icon="quickAction.icon"
          @click="router.push(quickAction.to)">
          {{ quickAction.label }}
        </v-btn>
      </div>

      <!-- Sidebar chia khối theo nhóm: mỗi khối có tiêu đề nhỏ + danh sách item riêng -->
      <div v-for="group in navGroups" :key="group.title" class="drawer-group">
        <div class="drawer-group-title">{{ group.title }}</div>

        <v-list nav density="comfortable" class="drawer-menu">
          <v-list-item v-for="item in group.items" :key="item.title" :title="item.title" :prepend-icon="item.icon"
            :to="item.action ? undefined : item.to" rounded="lg" :class="{ 'logout-item': item.action === 'logout' }"
            @click="item.action === 'logout' ? logout() : null" />
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-app-bar flat height="72" class="dl-topbar">
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <div class="topbar-search d-none d-md-flex">
        <v-icon icon="mdi-magnify" size="20" />

        <input v-model="searchKeyword" placeholder="Tìm kiếm sách, độc giả, phiếu mượn..."
          @keyup.enter="handleSearch" />
      </div>

      <div class="topbar-title d-md-none">Thư Viện Số</div>

      <v-spacer />

      <div class="topbar-actions">
        <v-menu v-model="notifMenu" :close-on-content-click="false" location="bottom end" width="360">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" @click="loadNotifications">
              <v-badge :content="unreadCount" :model-value="unreadCount > 0" color="error">
                <v-icon icon="mdi-bell-outline" />
              </v-badge>
            </v-btn>
          </template>

          <v-card rounded="lg" class="notif-panel">
            <div class="notif-header">
              <h4>Thông báo</h4>
              <v-btn v-if="unreadCount > 0" variant="text" size="small" color="primary" @click="markAllRead">
                Đọc tất cả
              </v-btn>
            </div>

            <v-divider />

            <div v-if="notifLoading" class="notif-empty">
              <v-progress-circular indeterminate color="primary" size="24" />
            </div>

            <div v-else-if="!notifications.length" class="notif-empty">
              <v-icon icon="mdi-bell-off-outline" size="28" color="var(--dl-text-muted)" />
              <p>Không có thông báo nào</p>
            </div>

            <div v-else class="notif-list">
              <div v-for="item in notifications" :key="item.id" class="notif-item"
                :class="{ 'notif-item-unread': !item.isRead }" @click="markOneRead(item)">
                <v-icon :icon="notifIcon(item.type)" size="18" :color="notifColor(item.type)" />
                <div class="notif-body">
                  <div class="notif-message">{{ item.message }}</div>
                  <div class="notif-time">{{ formatNotifTime(item.createdAt) }}</div>
                </div>
                <span v-if="!item.isRead" class="notif-dot"></span>
              </div>
            </div>
          </v-card>
        </v-menu>

        <router-link to="/app/account-settings" class="topbar-user d-none d-md-flex">
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { notificationApi } from '../api/notificationApi'

const drawer = ref(true)
const searchKeyword = ref('')

const notifMenu = ref(false)
const notifLoading = ref(false)
const notifications = ref([])

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

async function loadNotifications() {
  notifLoading.value = true

  try {
    const res = await notificationApi.getAll()
    notifications.value = res.data || []
  } catch (err) {
    notifications.value = []
    console.error(err.response || err)
  } finally {
    notifLoading.value = false
  }
}

async function markOneRead(item) {
  if (item.isRead) return

  try {
    await notificationApi.markAsRead(item.id)
    item.isRead = true
  } catch (err) {
    console.error(err.response || err)
  }
}

async function markAllRead() {
  try {
    await notificationApi.markAllAsRead()
    notifications.value.forEach(n => { n.isRead = true })
  } catch (err) {
    console.error(err.response || err)
  }
}

function notifIcon(type) {
  if (type === 'BorrowCreated') return 'mdi-book-arrow-right-outline'
  if (type === 'BookReturned') return 'mdi-book-arrow-left-outline'
  if (type === 'FineCreated') return 'mdi-cash-multiple'
  return 'mdi-information-outline'
}

function notifColor(type) {
  if (type === 'BorrowCreated') return 'var(--dl-primary)'
  if (type === 'BookReturned') return 'var(--dl-success)'
  if (type === 'FineCreated') return 'var(--dl-error)'
  return 'var(--dl-text-muted)'
}

function formatNotifTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(loadNotifications)

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

// Sidebar duy nhất, chia khối theo nhóm - nội dung từng khối đổi theo vai trò
const navGroups = computed(() => {
  const supportGroup = {
    title: 'Hỗ trợ',
    items: [
      { title: 'Cài đặt', icon: 'mdi-account-cog-outline', to: '/app/account-settings' },
      { title: 'Trợ giúp', icon: 'mdi-help-circle-outline', to: '/app/help' },
      { title: 'Đăng xuất', icon: 'mdi-logout', action: 'logout' }
    ]
  }

  if (auth.role === 'Admin') {
    return [
      {
        title: 'Tổng quan',
        items: [
          { title: 'Tổng quan', icon: 'mdi-view-dashboard-outline', to: '/app/dashboard' }
        ]
      },
      {
        title: 'Quản lý',
        items: [
          { title: 'Quản lý sách', icon: 'mdi-book-open-page-variant-outline', to: '/app/books' },
          { title: 'Quản lý độc giả', icon: 'mdi-account-group-outline', to: '/app/readers' },
          { title: 'Quản lý tài khoản', icon: 'mdi-account-key-outline', to: '/app/accounts' },
          { title: 'Phiếu mượn/trả', icon: 'mdi-clipboard-text-outline', to: '/app/borrows' },
          { title: 'Sách quá hạn', icon: 'mdi-alert-circle-outline', to: '/app/overdue' },
          { title: 'Công nợ phí phạt', icon: 'mdi-cash-multiple', to: '/app/fines' },
          { title: 'Báo cáo & thống kê', icon: 'mdi-chart-bar', to: '/app/reports' },
          { title: 'Cấu hình hệ thống', icon: 'mdi-cog-outline', to: '/app/settings' }
        ]
      },
      supportGroup
    ]
  }

  if (auth.role === 'Librarian') {
    return [
      {
        title: 'Tổng quan',
        items: [
          { title: 'Tổng quan', icon: 'mdi-view-dashboard-outline', to: '/app/dashboard' }
        ]
      },
      {
        title: 'Quản lý',
        items: [
          { title: 'Quản lý sách', icon: 'mdi-book-open-page-variant-outline', to: '/app/books' },
          { title: 'Quản lý độc giả', icon: 'mdi-account-group-outline', to: '/app/readers' },
          { title: 'Quầy lưu thông', icon: 'mdi-swap-horizontal-circle-outline', to: '/app/circulation' },
          { title: 'Sách quá hạn', icon: 'mdi-alert-circle-outline', to: '/app/overdue' },
          { title: 'Công nợ phí phạt', icon: 'mdi-cash-multiple', to: '/app/fines' }
        ]
      },
      supportGroup
    ]
  }

  if (auth.role === 'Reader') {
    return [
      {
        title: 'Tổng quan',
        items: [
          { title: 'Khám phá sách', icon: 'mdi-compass-outline', to: '/app/browse' }
        ]
      },
      {
        title: 'Của tôi',
        items: [
          { title: 'Giỏ giữ sách', icon: 'mdi-cart-outline', to: '/app/my-cart' },
          { title: 'Thẻ thư viện của tôi', icon: 'mdi-card-account-details-outline', to: '/app/my-card' },
          { title: 'Lịch sử mượn sách', icon: 'mdi-history', to: '/app/my-borrows' },
          { title: 'Công nợ của tôi', icon: 'mdi-cash-multiple', to: '/app/my-fines' }
        ]
      },
      supportGroup
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
  box-shadow: 0 10px 40px rgba(22, 38, 58, 0.05) !important;
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

.drawer-group {
  margin-bottom: 6px;
}

.drawer-group-title {
  padding: 14px 24px 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dl-text-muted);
}

.drawer-menu {
  padding: 0 12px;
}

.drawer-menu :deep(.v-list-item) {
  min-height: 44px;
  margin-bottom: 4px;
  color: var(--dl-on-surface-variant);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.drawer-menu :deep(.v-list-item:hover) {
  background: var(--dl-surface-container-low);
  color: var(--dl-text-primary);
}

.drawer-menu :deep(.v-list-item:hover) {
  background: var(--dl-surface-container-low);
  color: var(--dl-text-primary) !important;
}

.logout-item :deep(.v-list-item-title),
.logout-item :deep(.v-icon) {
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
  box-shadow: 0 0 0 3px rgba(38, 67, 97, 0.1);
}

.topbar-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dl-text-muted);
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

.notif-panel {
  max-height: 420px;
  display: flex;
  flex-direction: column;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.notif-header h4 {
  font-family: var(--dl-font-headline);
  font-size: 16px;
  margin: 0;
  color: var(--dl-text-primary);
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 16px;
  color: var(--dl-text-muted);
  font-size: 13px;
}

.notif-list {
  overflow-y: auto;
  max-height: 340px;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--dl-border);
  position: relative;
}

.notif-item:hover {
  background: var(--dl-surface-container-low);
}

.notif-item-unread {
  background: rgba(38, 67, 97, 0.03);
}

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-message {
  font-size: 13px;
  color: var(--dl-text-primary);
  line-height: 1.5;
}

.notif-time {
  font-size: 11px;
  color: var(--dl-text-muted);
  margin-top: 2px;
}

.notif-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dl-error);
  margin-top: 4px;
  flex: 0 0 auto;
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
  background: rgba(240, 168, 94, 0.15);
  color: #92660a;
}

.badge-navy {
  background: rgba(22, 38, 58, 0.1);
  color: var(--dl-primary-dark);
}

.badge-green {
  background: rgba(31, 157, 107, 0.12);
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
