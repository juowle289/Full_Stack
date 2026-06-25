<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      width="292"
      class="academic-drawer"
    >
      <div class="drawer-brand">
        <div class="drawer-logo">
          <v-icon icon="mdi-library" size="25" />
        </div>

        <div>
          <div class="drawer-title">Library System</div>
          <div class="drawer-subtitle">Digital Microservices</div>
        </div>
      </div>

      <v-divider class="mx-5 mb-5" />

      <v-list nav density="comfortable" class="drawer-menu">
        <v-list-item
          title="Trang chủ"
          prepend-icon="mdi-home"
          to="/"
          rounded="lg"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Dashboard"
          prepend-icon="mdi-view-dashboard"
          to="/app/dashboard"
          rounded="lg"
        />

        <v-list-item
          title="Quản lý sách"
          prepend-icon="mdi-book-open-page-variant"
          to="/app/books"
          rounded="lg"
        />

        <v-list-item
          v-if="isReader"
          title="Lịch sử mượn của tôi"
          prepend-icon="mdi-history"
          to="/app/my-borrows"
          rounded="lg"
        />

        <v-list-item
          v-if="isReader"
          title="Thẻ thư viện của tôi"
          prepend-icon="mdi-card-account-details"
          to="/app/my-card"
          rounded="lg"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Quản lý độc giả"
          prepend-icon="mdi-account-group"
          to="/app/readers"
          rounded="lg"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Phiếu mượn"
          prepend-icon="mdi-clipboard-text"
          to="/app/borrows"
          rounded="lg"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Sách quá hạn"
          prepend-icon="mdi-alert-circle"
          to="/app/overdue"
          rounded="lg"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Công nợ phí phạt"
          prepend-icon="mdi-cash-multiple"
          to="/app/fines"
          rounded="lg"
        />
      </v-list>

      <template #append>
        <div class="drawer-user-box">
          <div class="mini-user-card">
            <div class="d-flex align-center ga-3">
              <div class="mini-avatar">
                <v-icon icon="mdi-account-circle" size="28" />
              </div>

              <div class="min-w-0">
                <div class="mini-user-name">
                  {{ auth.fullName || 'Người dùng' }}
                </div>

                <div class="mini-user-email">
                  {{ auth.email || 'library@system.local' }}
                </div>
              </div>
            </div>

            <div class="role-chip mt-4">
              {{ displayRole }}
            </div>

            <v-btn
              block
              class="mt-4"
              color="error"
              variant="tonal"
              prepend-icon="mdi-logout"
              rounded="lg"
              @click="logout"
            >
              Đăng xuất
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      flat
      height="72"
      class="academic-topbar"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <div class="topbar-search d-none d-md-flex">
        <v-icon icon="mdi-magnify" size="22" />

        <input
          v-model="searchKeyword"
          placeholder="Tìm kiếm sách, độc giả, phiếu mượn..."
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="topbar-title d-md-none">
        Thư viện số
      </div>

      <v-spacer />

      <div class="topbar-actions">
        <v-tooltip text="Thông báo">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              class="notification-btn"
            >
              <v-badge color="error" dot>
                <v-icon icon="mdi-bell-outline" />
              </v-badge>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Trợ giúp">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-help-circle-outline"
              variant="text"
            />
          </template>
        </v-tooltip>

        <div class="topbar-user d-none d-md-flex">
          <div class="text-right">
            <div class="topbar-user-name">
              {{ auth.fullName || 'Người dùng' }}
            </div>

            <div class="topbar-user-role">
              {{ displayRole }}
            </div>
          </div>

          <div class="topbar-avatar">
            <v-icon icon="mdi-account-circle" size="32" />
          </div>
        </div>
      </div>
    </v-app-bar>

    <v-main class="main-background">
      <div class="layout-content-shell">
        <router-view />
      </div>

      <footer class="layout-footer">
        <div>
          © 2026 Library System · ASP.NET Core · VueJS · SQL Server · API Gateway
        </div>

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

const isAdminOrLibrarian = computed(() =>
  ['Admin', 'Librarian'].includes(auth.role)
)

const isReader = computed(() =>
  auth.role === 'Reader'
)

const displayRole = computed(() => {
  if (auth.role === 'Admin') return 'Quản trị viên'
  if (auth.role === 'Librarian') return 'Thủ thư'
  if (auth.role === 'Reader') return 'Độc giả'
  return auth.role || 'Người dùng'
})

function handleSearch() {
  if (!searchKeyword.value.trim()) return

  router.push('/app/books')
}

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.academic-drawer {
  background: #ffffff !important;
  border-right: 1px solid rgba(198, 198, 205, 0.35) !important;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06) !important;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 28px 22px 26px;
}

.drawer-logo {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #131b2e;
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
}

.drawer-title {
  color: #0f172a;
  font-size: 20px;
  font-weight: 1000;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.drawer-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.drawer-menu {
  padding: 0 12px;
}

.drawer-menu :deep(.v-list-item) {
  min-height: 48px;
  margin-bottom: 7px;
  color: #475569;
  font-weight: 800;
  transition: all 0.22s ease;
}

.drawer-menu :deep(.v-list-item:hover) {
  background: #eff4ff;
  color: #0f172a;
  transform: translateX(4px);
}

.drawer-menu :deep(.v-list-item--active) {
  background: rgba(87, 223, 254, 0.18) !important;
  color: #00687a !important;
  border-right: 4px solid #00687a;
}

.drawer-menu :deep(.v-list-item--active .v-icon) {
  color: #00687a !important;
}

.drawer-user-box {
  padding: 18px;
}

.mini-user-card {
  padding: 18px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(87, 223, 254, 0.18), transparent 34%),
    linear-gradient(135deg, #f8f9ff, #eff4ff);
  border: 1px solid rgba(198, 198, 205, 0.42);
}

.mini-avatar {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #0f172a;
  background: #dce9ff;
  border: 2px solid #ffffff;
}

.mini-user-name {
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-user-email {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  color: #00687a;
  background: rgba(0, 104, 122, 0.1);
  font-size: 12px;
  font-weight: 950;
}

.academic-topbar {
  background: rgba(248, 249, 255, 0.74) !important;
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(198, 198, 205, 0.42) !important;
  box-shadow: 0 8px 36px rgba(15, 23, 42, 0.045) !important;
}

.topbar-search {
  width: min(620px, 48vw);
  height: 44px;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(198, 198, 205, 0.48);
  color: #00687a;
  transition: all 0.24s ease;
}

.topbar-search:focus-within {
  transform: scale(1.015);
  border-color: rgba(0, 104, 122, 0.45);
  box-shadow: 0 0 0 4px rgba(0, 104, 122, 0.08);
}

.topbar-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.topbar-search input::placeholder {
  color: #94a3b8;
}

.topbar-title {
  color: #0f172a;
  font-weight: 950;
  font-size: 18px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-btn {
  position: relative;
}

.topbar-user {
  align-items: center;
  gap: 12px;
  padding-left: 18px;
  margin-left: 8px;
  border-left: 1px solid rgba(198, 198, 205, 0.55);
}

.topbar-user-name {
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
  line-height: 1.1;
}

.topbar-user-role {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  margin-top: 3px;
}

.topbar-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #0f172a;
  background: #dce9ff;
  border: 2px solid #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.main-background {
  background: #f8f9ff;
}

.layout-content-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 32px;
}

.layout-footer {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 22px 32px 30px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid rgba(198, 198, 205, 0.35);
}

.footer-links {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.min-w-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .layout-content-shell {
    padding: 20px;
  }

  .layout-footer {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .academic-drawer {
    width: 280px !important;
  }

  .drawer-brand {
    padding: 22px 18px;
  }
}
</style>