<template>
  <div class="settings-page">
    <div class="page-title">Cài đặt</div>
    <div class="page-subtitle">Quản lý thông tin tài khoản, bảo mật và tùy chọn cá nhân</div>

    <v-alert v-if="message" :type="success ? 'success' : 'error'" variant="tonal" class="mb-4 mt-4" rounded="lg"
      closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <!-- Thông tin cá nhân -->
    <v-card class="settings-card" rounded="lg">
      <div class="settings-card-header">
        <div>
          <h3><v-icon icon="mdi-account-outline" size="19" /> Thông tin cá nhân</h3>
          <p>Họ tên, email và thông tin liên hệ hiển thị trên hệ thống</p>
        </div>

        <v-btn v-if="!editingInfo" variant="tonal" color="primary" size="small" prepend-icon="mdi-pencil-outline"
          @click="startEditInfo">
          Chỉnh sửa
        </v-btn>
      </div>

      <div class="info-grid">
        <v-text-field v-model="infoForm.fullName" label="Họ và tên" :disabled="!editingInfo" />
        <v-text-field v-model="infoForm.email" label="Email" :disabled="!editingInfo" />
        <v-text-field v-model="infoForm.phone" label="Số điện thoại" :disabled="!editingInfo" />
        <v-text-field v-model="infoForm.address" label="Địa chỉ" :disabled="!editingInfo" />
      </div>

      <div v-if="editingInfo" class="d-flex justify-end ga-2">
        <v-btn variant="text" @click="cancelEditInfo">Hủy</v-btn>
        <v-btn color="primary" :loading="savingInfo" @click="saveInfo">Lưu thay đổi</v-btn>
      </div>

    </v-card>

    <!-- Đổi mật khẩu -->
    <v-card class="settings-card" rounded="lg">
      <div class="settings-card-header">
        <div>
          <h3><v-icon icon="mdi-lock-outline" size="19" /> Đổi mật khẩu</h3>
          <p>Nên sử dụng mật khẩu mạnh và không dùng lại ở nơi khác</p>
        </div>
      </div>

      <div class="info-grid">
        <v-text-field v-model="passwordForm.currentPassword" label="Mật khẩu hiện tại" type="password" />
        <v-text-field v-model="passwordForm.newPassword" label="Mật khẩu mới" type="password" />
        <v-text-field v-model="passwordForm.confirmPassword" label="Xác nhận mật khẩu mới" type="password"
          :error-messages="confirmError" />
      </div>

      <div class="d-flex justify-end">
        <v-btn color="primary" :loading="changing" @click="submitChangePassword">Cập nhật mật khẩu</v-btn>
      </div>
    </v-card>

    <!-- Giao diện -->
    <v-card class="settings-card" rounded="lg">
      <div class="settings-card-header">
        <div>
          <h3><v-icon icon="mdi-theme-light-dark" size="19" /> Giao diện &amp; Ngôn ngữ</h3>
          <p>Tùy chỉnh hiển thị theo sở thích của bạn</p>
        </div>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Chế độ tối (Dark mode)</div>
          <div class="toggle-caption">Đổi giao diện sang nền tối, dịu mắt hơn vào ban đêm</div>
        </div>
        <v-switch :model-value="isDark" color="primary" hide-details @update:model-value="onToggleDark" />
      </div>

      <v-divider class="my-3" />

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Ngôn ngữ hiển thị</div>
          <div class="toggle-caption">Hiện tại hệ thống chỉ hỗ trợ đầy đủ Tiếng Việt</div>
        </div>
        <v-select v-model="language" :items="['Tiếng Việt', 'English']" density="compact" hide-details
          style="max-width: 160px;" @update:model-value="saveLanguage" />
      </div>
    </v-card>

    <!-- Thông báo -->
    <v-card class="settings-card" rounded="lg">
      <div class="settings-card-header">
        <div>
          <h3><v-icon icon="mdi-bell-outline" size="19" /> Tùy chọn thông báo</h3>
          <p>Chọn cách bạn muốn nhận nhắc hạn trả sách và thông báo hệ thống</p>
        </div>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Thông báo qua Email</div>
          <div class="toggle-caption">Nhận email nhắc hạn trả sách, xác nhận giao dịch</div>
        </div>
        <v-switch v-model="notifications.email" color="primary" hide-details @update:model-value="saveNotifications" />
      </div>

      <v-divider class="my-3" />

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Tin nhắn SMS</div>
          <div class="toggle-caption">Nhận SMS nhắc hạn trả sách (áp dụng phụ phí viễn thông)</div>
        </div>
        <v-switch v-model="notifications.sms" color="primary" hide-details @update:model-value="saveNotifications" />
      </div>
    </v-card>

    <!-- Bảo mật -->
    <v-card class="settings-card" rounded="lg">
      <div class="settings-card-header">
        <div>
          <h3><v-icon icon="mdi-shield-key-outline" size="19" /> Bảo mật đăng nhập</h3>
          <p>Tăng cường bảo mật cho tài khoản của bạn</p>
        </div>
      </div>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Xác thực 2 lớp (2FA)</div>
          <div class="toggle-caption">Yêu cầu mã OTP gửi qua email mỗi khi đăng nhập từ thiết bị mới</div>
        </div>
        <v-switch v-model="twoFactorEnabled" color="primary" hide-details @update:model-value="saveTwoFactor" />
      </div>

      <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-3" icon="mdi-information-outline">
        Tính năng 2FA hiện là giao diện minh họa — backend chưa có hệ thống gửi/xác thực OTP.
      </v-alert>
    </v-card>

    <!-- Vùng nguy hiểm -->
    <v-card class="settings-card danger-card" rounded="lg">
      <div class="settings-card-header">
        <div>
          <h3 class="text-error"><v-icon icon="mdi-alert-octagon-outline" size="19" /> Vùng nguy hiểm</h3>
          <p>Các hành động dưới đây ảnh hưởng trực tiếp đến quyền truy cập tài khoản của bạn</p>
        </div>
      </div>

      <div class="danger-row">
        <div>
          <div class="toggle-label">Đăng xuất khỏi thiết bị này</div>
          <div class="toggle-caption">Bạn cần đăng nhập lại để tiếp tục sử dụng</div>
        </div>
        <v-btn variant="tonal" color="secondary" prepend-icon="mdi-logout" @click="logout">Đăng xuất</v-btn>
      </div>

      <v-divider class="my-3" />

      <div class="danger-row">
        <div>
          <div class="toggle-label">Xóa tài khoản</div>
          <div class="toggle-caption">Toàn bộ dữ liệu cá nhân sẽ bị xóa vĩnh viễn, không thể hoàn tác</div>
        </div>
        <v-btn variant="tonal" color="error" prepend-icon="mdi-delete-outline" @click="confirmDeleteDialog = true">
          Xóa tài khoản
        </v-btn>
      </div>
    </v-card>

    <!-- Confirm xóa tài khoản -->
    <v-dialog v-model="confirmDeleteDialog" max-width="440">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title text-error">Xác nhận xóa tài khoản</v-card-title>
        <v-card-text>
          Hành động này sẽ xóa <strong>vĩnh viễn</strong> tài khoản và toàn bộ dữ liệu liên quan
          (lịch sử mượn, thẻ thư viện...). Bạn không thể hoàn tác sau khi xác nhận. Nhập
          <strong>"XÓA"</strong> để xác nhận.
        </v-card-text>
        <v-card-text class="pt-0">
          <v-text-field v-model="deleteConfirmText" placeholder="Nhập XÓA để xác nhận" density="comfortable"
            hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDeleteDialog = false">Hủy</v-btn>
          <v-btn color="error" :disabled="deleteConfirmText !== 'XÓA'" @click="deleteAccount">
            Xóa vĩnh viễn
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../api/authApi'
import { useThemeMode } from '../../composables/useThemeMode'

const router = useRouter()
const auth = useAuthStore()
const { isDark, setDark } = useThemeMode()

const message = ref('')
const success = ref(true)

// Thông tin cá nhân
const editingInfo = ref(false)
const savingInfo = ref(false)
const infoForm = ref({
  fullName: auth.fullName || '',
  email: auth.email || '',
  phone: auth.user?.phone || '',
  address: auth.user?.address || ''
})
let infoBackup = null

function startEditInfo() {
  infoBackup = { ...infoForm.value }
  editingInfo.value = true
}

function cancelEditInfo() {
  infoForm.value = { ...infoBackup }
  editingInfo.value = false
}

async function saveInfo() {
  savingInfo.value = true

  try {
    await authApi.updateProfile(infoForm.value)
    success.value = true
    message.value = 'Đã lưu thông tin cá nhân'
    editingInfo.value = false
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Cập nhật thông tin thất bại'
    console.error(err.response || err)
  } finally {
    savingInfo.value = false
  }
}

// Đổi mật khẩu
const changing = ref(false)
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

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

// Giao diện / ngôn ngữ
const language = ref(localStorage.getItem('language') || 'Tiếng Việt')

function onToggleDark(value) {
  setDark(value)
  success.value = true
  message.value = value ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng'
}

function saveLanguage(value) {
  localStorage.setItem('language', value)
  message.value = value === 'Tiếng Việt'
    ? 'Đã lưu tùy chọn ngôn ngữ'
    : 'English UI is not implemented yet — hệ thống vẫn hiển thị Tiếng Việt.'
  success.value = true
}

// Thông báo
const notifications = ref({
  email: localStorage.getItem('notif:email') !== 'false',
  sms: localStorage.getItem('notif:sms') === 'true'
})

function saveNotifications() {
  localStorage.setItem('notif:email', notifications.value.email)
  localStorage.setItem('notif:sms', notifications.value.sms)
  success.value = true
  message.value = 'Đã lưu tùy chọn thông báo'
}

// 2FA
const twoFactorEnabled = ref(localStorage.getItem('2fa') === 'true')

function saveTwoFactor(value) {
  localStorage.setItem('2fa', value)
  success.value = true
  message.value = value ? 'Đã bật xác thực 2 lớp (minh họa)' : 'Đã tắt xác thực 2 lớp'
}

// Đăng xuất / Xóa tài khoản
const confirmDeleteDialog = ref(false)
const deleteConfirmText = ref('')

function logout() {
  auth.logout()
  router.push('/')
}

function deleteAccount() {
  // ⚠️ Chưa có endpoint xóa tài khoản thật - cần xác nhận với backend.
  confirmDeleteDialog.value = false
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.settings-page {
  max-width: 760px;
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

.settings-card {
  padding: 22px;
  margin-top: 20px;
  border: 1px solid var(--dl-surface-variant) !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.settings-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.settings-card-header h3 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--dl-font-headline);
  font-size: 17px;
  color: var(--dl-text-primary);
  margin: 0 0 2px;
}

.settings-card-header p {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin-bottom: 12px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle-label {
  font-weight: 700;
  font-size: 14px;
  color: var(--dl-text-primary);
}

.toggle-caption {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin-top: 2px;
}

.danger-card {
  border-color: rgba(220, 38, 38, 0.25) !important;
  background: rgba(220, 38, 38, 0.02) !important;
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dialog-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .toggle-row,
  .danger-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
