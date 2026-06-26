<template>
  <div class="profile-page">
    <div class="page-title">Hồ sơ cá nhân</div>
    <div class="page-subtitle">Thông tin tài khoản và bảo mật đăng nhập</div>

    <v-alert
      v-if="message"
      :type="success ? 'success' : 'error'"
      variant="tonal"
      class="mb-4 mt-4"
      rounded="lg"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <div class="profile-grid">
      <!-- Thông tin cá nhân -->
      <v-card class="profile-card" rounded="lg">
        <div class="profile-identity">
          <v-avatar size="64" color="primary" variant="tonal">
            <v-icon icon="mdi-account" size="34" />
          </v-avatar>

          <div>
            <div class="profile-name">{{ auth.fullName || 'Người dùng' }}</div>
            <span class="role-badge" :class="roleBadgeClass">{{ displayRole }}</span>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="info-row">
          <span>Email</span>
          <strong>{{ auth.email || '-' }}</strong>
        </div>
        <div class="info-row">
          <span>Vai trò</span>
          <strong>{{ displayRole }}</strong>
        </div>

        <div v-if="auth.role === 'Reader'" class="reader-links">
          <router-link to="/app/my-card" class="reader-link">
            <v-icon icon="mdi-card-account-details-outline" size="16" /> Thẻ thư viện của tôi
          </router-link>
          <router-link to="/app/my-borrows" class="reader-link">
            <v-icon icon="mdi-history" size="16" /> Lịch sử mượn sách
          </router-link>
        </div>
      </v-card>

      <!-- Đổi mật khẩu -->
      <v-card class="profile-card" rounded="lg">
        <h3>Đổi mật khẩu</h3>
        <p class="card-subtitle">Nên sử dụng mật khẩu mạnh và không dùng lại ở nơi khác.</p>

        <v-text-field
          v-model="passwordForm.currentPassword"
          label="Mật khẩu hiện tại"
          type="password"
          density="comfortable"
          class="mb-1"
        />
        <v-text-field
          v-model="passwordForm.newPassword"
          label="Mật khẩu mới"
          type="password"
          density="comfortable"
          class="mb-1"
        />
        <v-text-field
          v-model="passwordForm.confirmPassword"
          label="Xác nhận mật khẩu mới"
          type="password"
          density="comfortable"
          :error-messages="confirmError"
        />

        <v-btn color="primary" rounded="lg" class="mt-2" :loading="changing" @click="submitChangePassword">
          Cập nhật mật khẩu
        </v-btn>

        <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-4" icon="mdi-information-outline">
          Endpoint đổi mật khẩu hiện là giả định (<code>/api/identity/auth/change-password</code>) —
          cần xác nhận lại với backend.
        </v-alert>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../api/authApi'

const auth = useAuthStore()

const message = ref('')
const success = ref(true)
const changing = ref(false)

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

const displayRole = computed(() => {
  if (auth.role === 'Admin') return 'Quản trị viên'
  if (auth.role === 'Librarian') return 'Thủ thư'
  if (auth.role === 'Reader') return 'Độc giả'
  return auth.role || 'Người dùng'
})

const roleBadgeClass = computed(() => {
  if (auth.role === 'Admin') return 'badge-gold'
  if (auth.role === 'Librarian') return 'badge-navy'
  return 'badge-green'
})

const confirmError = computed(() => {
  if (!passwordForm.value.confirmPassword) return ''
  return passwordForm.value.confirmPassword !== passwordForm.value.newPassword
    ? 'Mật khẩu xác nhận không khớp'
    : ''
})

async function submitChangePassword() {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    success.value = false
    message.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  if (confirmError.value) {
    success.value = false
    message.value = confirmError.value
    return
  }

  changing.value = true

  try {
    await authApi.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })

    success.value = true
    message.value = 'Đổi mật khẩu thành công'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Đổi mật khẩu thất bại'
    console.error(err.response || err)
  } finally {
    changing.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 900px;
}

.page-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 26px;
  color: var(--dl-primary-dark);
}

.page-subtitle {
  color: var(--dl-text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 20px;
  margin-top: 8px;
}

.profile-card {
  padding: 22px;
  border: 1px solid var(--dl-surface-variant) !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.profile-card h3 {
  font-family: var(--dl-font-headline);
  font-size: 18px;
  color: var(--dl-text-primary);
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 13px;
  color: var(--dl-text-muted);
  margin-bottom: 16px;
}

.profile-identity {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-name {
  font-weight: 700;
  font-size: 17px;
  color: var(--dl-text-primary);
}

.role-badge {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
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

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  padding: 8px 0;
  color: var(--dl-text-muted);
}

.info-row strong {
  color: var(--dl-text-primary);
}

.reader-links {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reader-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dl-primary);
  text-decoration: none;
}

.reader-link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
