<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Quản lý tài khoản</div>
        <div class="page-subtitle">
          Quản lý tài khoản Thủ thư và Độc giả, phân quyền và bảo mật đăng nhập
        </div>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadAccounts"
      >
        Tải lại
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="openCreateDialog">
        Tạo tài khoản mới
      </v-btn>
    </div>

    <v-alert
      v-if="message"
      :type="success ? 'success' : 'error'"
      variant="tonal"
      class="mb-4"
      rounded="lg"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      class="mb-4"
      icon="mdi-information-outline"
    >
      Màn hình này gọi endpoint <code>/api/identity/users</code> theo đúng convention REST đã có
      (lock/unlock). Nhóm cần xác nhận lại với backend (tuananh05) đường dẫn chính xác nếu khác.
    </v-alert>

    <v-row class="mb-5">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="stat-label">Tổng tài khoản</div>
          <div class="stat-value">{{ accounts.length }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="stat-label">Thủ thư</div>
          <div class="stat-value">{{ countByRole('Librarian') }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="stat-label">Độc giả</div>
          <div class="stat-value">{{ countByRole('Reader') }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="stat-label">Tài khoản bị khóa</div>
          <div class="stat-value text-error">{{ lockedCount }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" md="5">
          <v-text-field
            v-model="keyword"
            label="Tìm tên / email"
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="roleFilter"
            :items="['Librarian', 'Reader']"
            label="Vai trò"
            density="comfortable"
            clearable
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Đăng nhập gần nhất</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="acc in filteredAccounts" :key="acc.userId || acc.id">
            <td class="font-weight-bold">{{ acc.fullName }}</td>
            <td>{{ acc.email }}</td>
            <td>
              <span class="role-pill" :class="roleClass(acc.role)">{{ roleLabel(acc.role) }}</span>
            </td>
            <td>
              <v-chip size="small" :color="acc.isLocked ? 'error' : 'success'" variant="tonal">
                {{ acc.isLocked ? 'Đã khóa' : 'Hoạt động' }}
              </v-chip>
            </td>
            <td>{{ acc.lastLoginAt ? formatDate(acc.lastLoginAt) : '-' }}</td>
            <td>
              <div class="d-flex justify-center ga-1">
                <v-tooltip text="Đặt lại mật khẩu">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-lock-reset" size="small" variant="text" @click="openResetDialog(acc)" />
                  </template>
                </v-tooltip>

                <v-tooltip :text="acc.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="acc.isLocked ? 'mdi-lock-open-variant-outline' : 'mdi-lock-outline'"
                      size="small"
                      variant="text"
                      :color="acc.isLocked ? 'success' : 'error'"
                      @click="openLockDialog(acc)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && !filteredAccounts.length">
            <td colspan="6" class="text-center pa-6 text-medium-emphasis">
              Không có tài khoản phù hợp
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog tạo tài khoản -->
    <v-dialog v-model="createDialog" max-width="480">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Tạo tài khoản mới</v-card-title>

        <v-card-text>
          <v-text-field v-model="newAccount.fullName" label="Họ và tên" class="mb-2" />
          <v-text-field v-model="newAccount.email" label="Email" class="mb-2" />
          <v-text-field v-model="newAccount.password" label="Mật khẩu tạm thời" type="password" class="mb-2" />
          <v-select v-model="newAccount.role" :items="['Librarian', 'Reader']" label="Vai trò" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Hủy</v-btn>
          <v-btn color="primary" :loading="creating" @click="submitCreate">Tạo tài khoản</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog đặt lại mật khẩu -->
    <v-dialog v-model="resetDialog" max-width="420">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Đặt lại mật khẩu</v-card-title>
        <v-card-text>
          Sẽ gửi email đặt lại mật khẩu tới <strong>{{ targetAccount?.email }}</strong>. Tiếp tục?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="resetDialog = false">Hủy</v-btn>
          <v-btn color="primary" :loading="acting" @click="submitReset">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog khóa/mở khóa -->
    <v-dialog v-model="lockDialog" max-width="420">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">
          {{ targetAccount?.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản' }}
        </v-card-title>
        <v-card-text>
          <template v-if="targetAccount?.isLocked">
            Mở khóa tài khoản <strong>{{ targetAccount?.fullName }}</strong>? Người dùng sẽ đăng nhập lại được ngay.
          </template>
          <template v-else>
            Khóa tài khoản <strong>{{ targetAccount?.fullName }}</strong>? Người này sẽ không thể đăng nhập
            hoặc thực hiện bất kỳ thao tác nào trên hệ thống cho đến khi được mở khóa lại.
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="lockDialog = false">Hủy</v-btn>
          <v-btn :color="targetAccount?.isLocked ? 'success' : 'error'" :loading="acting" @click="submitLockToggle">
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { userApi } from '../../api/userApi'
import { readerApi } from '../../api/readerApi'

const accounts = ref([])
const loading = ref(false)
const message = ref('')
const success = ref(true)

const keyword = ref('')
const roleFilter = ref(null)

const createDialog = ref(false)
const resetDialog = ref(false)
const lockDialog = ref(false)
const creating = ref(false)
const acting = ref(false)
const targetAccount = ref(null)

const newAccount = ref({ fullName: '', email: '', password: '', role: 'Librarian' })

const filteredAccounts = computed(() => {
  return accounts.value.filter(acc => {
    if (roleFilter.value && acc.role !== roleFilter.value) return false

    if (keyword.value) {
      const k = keyword.value.toLowerCase().trim()
      const matches = String(acc.fullName || '').toLowerCase().includes(k) ||
        String(acc.email || '').toLowerCase().includes(k)
      if (!matches) return false
    }

    return true
  })
})

const lockedCount = computed(() => accounts.value.filter(a => a.isLocked).length)

function countByRole(role) {
  return accounts.value.filter(a => a.role === role).length
}

function roleLabel(role) {
  if (role === 'Librarian') return 'Thủ thư'
  if (role === 'Reader') return 'Độc giả'
  if (role === 'Admin') return 'Quản trị viên'
  return role
}

function roleClass(role) {
  if (role === 'Librarian') return 'role-pill-navy'
  if (role === 'Reader') return 'role-pill-green'
  return 'role-pill-gold'
}

function formatDate(value) {
  return new Date(value).toLocaleString('vi-VN')
}

async function loadAccounts() {
  loading.value = true
  message.value = ''

  try {
    // Thử gọi endpoint quản lý user tổng hợp (Librarian + Reader).
    // Nếu backend chưa có endpoint này, fallback sang readerApi để ít nhất
    // hiển thị được danh sách Độc giả.
    try {
      const res = await userApi.getAll()
      accounts.value = res.data || []
    } catch {
      const readerRes = await readerApi.getAll()
      accounts.value = (readerRes.data || []).map(r => ({
        userId: r.userId,
        fullName: r.fullName,
        email: r.email,
        role: 'Reader',
        isLocked: r.isLocked || r.cardStatus === 'Locked',
        lastLoginAt: r.lastLoginAt
      }))

      message.value = 'Chưa kết nối được API quản lý tài khoản nhân sự — đang hiển thị tạm danh sách Độc giả.'
      success.value = false
    }
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được danh sách tài khoản'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  newAccount.value = { fullName: '', email: '', password: '', role: 'Librarian' }
  createDialog.value = true
}

async function submitCreate() {
  creating.value = true

  try {
    await userApi.create(newAccount.value)
    success.value = true
    message.value = `Đã tạo tài khoản ${roleLabel(newAccount.value.role)} cho ${newAccount.value.fullName}`
    createDialog.value = false
    await loadAccounts()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Tạo tài khoản thất bại'
    console.error(err.response || err)
  } finally {
    creating.value = false
  }
}

function openResetDialog(acc) {
  targetAccount.value = acc
  resetDialog.value = true
}

async function submitReset() {
  acting.value = true

  try {
    await userApi.resetPassword(targetAccount.value.userId)
    success.value = true
    message.value = `Đã gửi email đặt lại mật khẩu tới ${targetAccount.value.email}`
    resetDialog.value = false
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Đặt lại mật khẩu thất bại'
    console.error(err.response || err)
  } finally {
    acting.value = false
  }
}

function openLockDialog(acc) {
  targetAccount.value = acc
  lockDialog.value = true
}

async function submitLockToggle() {
  acting.value = true

  try {
    if (targetAccount.value.isLocked) {
      await userApi.unlockUser(targetAccount.value.userId)
      message.value = `Đã mở khóa tài khoản ${targetAccount.value.fullName}`
    } else {
      await userApi.lockUser(targetAccount.value.userId)
      message.value = `Đã khóa tài khoản ${targetAccount.value.fullName}`
    }

    success.value = true
    lockDialog.value = false
    await loadAccounts()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Thao tác thất bại'
    console.error(err.response || err)
  } finally {
    acting.value = false
  }
}

onMounted(loadAccounts)
</script>

<style scoped>
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 24px;
  color: var(--dl-primary-dark);
}

.page-subtitle {
  color: var(--dl-text-muted);
  font-size: 13.5px;
  margin-top: 2px;
}

.stat-card {
  border: 1px solid var(--dl-surface-variant) !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.stat-label {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  font-weight: 600;
}

.stat-value {
  font-family: var(--dl-font-headline);
  font-size: 28px;
  font-weight: 700;
  color: var(--dl-primary-dark);
  margin-top: 4px;
}

.role-pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--dl-radius-full);
}

.role-pill-navy {
  background: rgba(2, 44, 34, 0.1);
  color: var(--dl-primary-dark);
}

.role-pill-green {
  background: rgba(5, 150, 105, 0.12);
  color: var(--dl-success);
}

.role-pill-gold {
  background: rgba(245, 158, 11, 0.15);
  color: #92660a;
}

.dialog-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
}
</style>
