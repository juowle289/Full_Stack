<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      width="292"
      class="professional-drawer"
    >
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          <v-icon icon="mdi-library" size="25" />
        </div>

        <div>
          <div class="sidebar-title">Library System</div>
          <div class="sidebar-subtitle">Digital Microservices</div>
        </div>
      </div>

      <v-divider class="mx-4 mb-3" color="white" opacity="0.12" />

      <v-list nav density="comfortable">
        <v-list-item
          title="Trang chủ"
          prepend-icon="mdi-home"
          to="/"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Dashboard"
          prepend-icon="mdi-view-dashboard"
          to="/app/dashboard"
        />

        <v-list-item
          title="Quản lý sách"
          prepend-icon="mdi-book-open-page-variant"
          to="/app/books"
        />

        <v-list-item
          v-if="isReader"
          title="Lịch sử mượn của tôi"
          prepend-icon="mdi-history"
          to="/app/my-borrows"
        />

        <v-list-item
          v-if="isReader"
          title="Thẻ thư viện của tôi"
          prepend-icon="mdi-card-account-details"
          to="/app/my-card"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Quản lý độc giả"
          prepend-icon="mdi-account-group"
          to="/app/readers"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Phiếu mượn"
          prepend-icon="mdi-clipboard-text"
          to="/app/borrows"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Sách quá hạn"
          prepend-icon="mdi-alert-circle"
          to="/app/overdue"
        />

        <v-list-item
          v-if="isAdminOrLibrarian"
          title="Công nợ phí phạt"
          prepend-icon="mdi-cash-multiple"
          to="/app/fines"
        />
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-card class="pa-4" color="rgba(255,255,255,0.08)" rounded="xl">
            <div class="text-caption text-white opacity-70">
              Đăng nhập với vai trò
            </div>

            <div class="text-white font-weight-bold mt-1">
              {{ displayRole }}
            </div>

            <v-btn
              block
              class="mt-4"
              color="red"
              variant="flat"
              prepend-icon="mdi-logout"
              @click="logout"
            >
              Đăng xuất
            </v-btn>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      flat
      height="72"
      class="top-app-bar"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <div>
        <v-app-bar-title class="font-weight-bold">
          Hệ thống quản lý thư viện số
        </v-app-bar-title>

        <div class="text-caption text-grey-darken-1 ml-4">
          ASP.NET Core · VueJS · SQL Server · API Gateway
        </div>
      </div>

      <v-spacer />

      <div class="d-none d-md-flex align-center mr-4">
        <div class="text-right mr-3">
          <div class="font-weight-bold text-secondary">
            {{ auth.fullName || 'Người dùng' }}
          </div>

          <div class="text-caption text-grey-darken-1">
            {{ auth.email }}
          </div>
        </div>

        <div class="role-pill">
          {{ displayRole }}
        </div>
      </div>
    </v-app-bar>

    <v-main>
      <div class="content-shell">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const drawer = ref(true)
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

function logout() {
  auth.logout()
  router.push('/')
}
</script>