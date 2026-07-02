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

      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadAccounts">
        Tải lại
      </v-btn>

      <v-btn variant="outlined" color="primary" prepend-icon="mdi-file-excel-outline" @click="importDialog = true">
        Nhập Excel
      </v-btn>

      <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="openCreateDialog">
        Tạo tài khoản mới
      </v-btn>
    </div>

    <ImportExcelDialog v-model="importDialog" entity-label="tài khoản" :template-columns="accountImportColumns"
      :create-fn="importAccountRow" @imported="loadAccounts" />

    <v-alert v-if="message" ref="alertEl" :type="success ? 'success' : 'error'" variant="tonal" class="mb-4" rounded="lg"
      closable @click:close="message = ''">
      {{ message }}
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
          <v-text-field v-model="keyword" label="Tìm tên / email" prepend-inner-icon="mdi-magnify" density="comfortable"
            clearable />
        </v-col>

        <v-col cols="12" md="4">
          <v-select v-model="roleFilter" :items="['Librarian', 'Reader']" label="Vai trò" density="comfortable"
            clearable />
        </v-col>
      </v-row>
    </v-card>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th style="width: 44px;">
              <v-checkbox-btn :model-value="allAccountsSelected" :indeterminate="isAccountsIndeterminate"
                color="primary" @update:model-value="toggleSelectAllAccounts" />
            </th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Đăng nhập gần nhất</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="acc in paginatedAccounts" :key="acc.userId || acc.id" :class="{ 'row-updating': actingIds.includes(acc.userId) }">
            <td>
              <v-checkbox-btn v-model="selectedAccountIds" :value="acc.userId" color="primary" />
            </td>
            <td class="font-weight-bold">{{ acc.fullName }}</td>
            <td>{{ acc.email }}</td>
            <td>
              <span class="role-pill" :class="roleClass(acc.role)">{{ roleLabel(acc.role) }}</span>
            </td>
            <td>
              <v-chip :color="accountStatusColor(acc)" size="small" variant="tonal">
                <v-icon start :icon="accountStatusIcon(acc)" />
                {{ accountStatusText(acc) }}
              </v-chip>
            </td>
            <td>{{ acc.lastLoginAt ? formatDate(acc.lastLoginAt) : '-' }}</td>
            <td>
              <div class="d-flex justify-center ga-1">
                <v-tooltip text="Đặt lại mật khẩu">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-lock-reset" size="small" variant="text"
                      @click="openResetDialog(acc)" />
                  </template>
                </v-tooltip>

                <v-tooltip :text="acc.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" :icon="acc.isLocked ? 'mdi-lock-open-variant-outline' : 'mdi-lock-outline'"
                      size="small" variant="text" :color="acc.isLocked ? 'success' : 'error'"
                      :loading="actingIds.includes(acc.userId)" @click="openLockDialog(acc)" />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && !filteredAccounts.length">
            <td colspan="7" class="text-center pa-6 text-medium-emphasis">
              Không có tài khoản phù hợp
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-divider />

      <div class="d-flex align-center justify-space-between flex-wrap pa-4 ga-3">
        <div class="text-body-2 text-grey-darken-1">
          Hiển thị
          <b>{{ paginatedAccounts.length }}</b>
          /
          <b>{{ filteredAccounts.length }}</b>
          tài khoản
        </div>

        <div class="d-flex align-center ga-3">
          <v-select v-model="itemsPerPage" :items="[5, 10, 20, 50]" label="Số dòng" density="compact" hide-details
            style="width: 110px;" />

          <v-pagination v-model="page" :length="pageCount" rounded="circle" density="comfortable"
            total-visible="5" />
        </div>
      </div>
    </v-card>

    <!-- Bulk action bar nổi -->
    <transition name="dl-fade">
      <div v-if="selectedAccountIds.length" class="bulk-bar">
        <div class="bulk-count"><strong>{{ selectedAccountIds.length }}</strong> tài khoản đã chọn</div>

        <v-divider vertical class="bulk-divider" />

        <button class="bulk-btn bulk-btn-danger" type="button" @click="confirmBulkLock = true">
          <v-icon icon="mdi-lock-outline" size="16" />
          Khóa
        </button>

        <button class="bulk-btn bulk-btn-ghost" type="button" @click="selectedAccountIds = []">
          Bỏ chọn
        </button>
      </div>
    </transition>

    <!-- Confirm khóa hàng loạt -->
    <v-dialog v-model="confirmBulkLock" max-width="420">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Xác nhận khóa tài khoản</v-card-title>
        <v-card-text>
          Khóa <strong>{{ selectedAccountIds.length }}</strong> tài khoản đã chọn? Họ sẽ không thể
          đăng nhập cho đến khi được mở khóa lại.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmBulkLock = false">Hủy</v-btn>
          <v-btn color="error" :loading="bulkActing" @click="bulkLockAccounts">Khóa tài khoản</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { computed, onMounted, ref, watch } from 'vue'
import { userApi } from '../../api/userApi'
import { readerApi } from '../../api/readerApi'
import ImportExcelDialog from '../../components/ImportExcelDialog.vue'

const accounts = ref([])
const loading = ref(false)

const selectedAccountIds = ref([])
const confirmBulkLock = ref(false)
const bulkActing = ref(false)

const importDialog = ref(false)

const accountImportColumns = [
  { key: 'fullName', label: 'Họ và tên', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'password', label: 'Mật khẩu tạm thời', required: true },
  { key: 'role', label: 'Vai trò (Librarian/Reader)', required: true }
]

function importAccountRow(row) {
  return userApi.create({
    fullName: row.fullName,
    email: row.email,
    password: row.password,
    role: row.role === 'Librarian' ? 'Librarian' : 'Reader'
  })
}
const message = ref('')
const success = ref(true)

const keyword = ref('')
const roleFilter = ref(null)

const page = ref(1)
const itemsPerPage = ref(10)
const actingIds = ref([])
const alertEl = ref(null)

const createDialog = ref(false)
const resetDialog = ref(false)
const lockDialog = ref(false)
const creating = ref(false)
const acting = ref(false)
const targetAccount = ref(null)

const newAccount = ref({ fullName: '', email: '', password: '', role: 'Librarian' })

const allAccountsSelected = computed(() =>
  paginatedAccounts.value.length > 0 &&
  paginatedAccounts.value.every(a => selectedAccountIds.value.includes(a.userId))
)

const isAccountsIndeterminate = computed(() =>
  !allAccountsSelected.value && paginatedAccounts.value.some(a => selectedAccountIds.value.includes(a.userId))
)

function toggleSelectAllAccounts(value) {
  const ids = paginatedAccounts.value.map(a => a.userId)

  if (value) {
    selectedAccountIds.value = [...new Set([...selectedAccountIds.value, ...ids])]
  } else {
    selectedAccountIds.value = selectedAccountIds.value.filter(id => !ids.includes(id))
  }
}

const pageCount = computed(() => {
  const total = Math.ceil(filteredAccounts.value.length / itemsPerPage.value)
  return total || 1
})

const paginatedAccounts = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAccounts.value.slice(start, end)
})

watch([keyword, roleFilter, itemsPerPage], () => {
  page.value = 1
})

watch(page, () => {
  selectedAccountIds.value = []
})

function scrollToAlert() {
  requestAnimationFrame(() => {
    const el = alertEl.value?.$el || alertEl.value
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  })
}

function accountStatusText(acc) {
  return acc.isLocked ? 'Tài khoản bị khóa' : 'Đang hoạt động'
}

function accountStatusColor(acc) {
  return acc.isLocked ? 'error' : 'success'
}

function accountStatusIcon(acc) {
  return acc.isLocked ? 'mdi-account-lock' : 'mdi-account-check'
}

async function bulkLockAccounts() {
  bulkActing.value = true
  const targetIds = [...selectedAccountIds.value]
  let okCount = 0
  let failCount = 0

  for (const id of targetIds) {
    actingIds.value.push(id)
    const idx = accounts.value.findIndex(a => a.userId === id)
    const previousState = idx !== -1 ? accounts.value[idx].isLocked : false

    try {
      // eslint-disable-next-line no-await-in-loop
      await userApi.lockUser(id)
      if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], isLocked: true }
      okCount++
    } catch (err) {
      failCount++
      console.error(err.response || err)
    } finally {
      actingIds.value = actingIds.value.filter(x => x !== id)
    }
  }

  success.value = failCount === 0
  message.value = failCount === 0
    ? `Đã khóa ${okCount} tài khoản`
    : `Khóa thành công ${okCount}/${targetIds.length} tài khoản. ${failCount} tài khoản thất bại (có thể do backend chưa hỗ trợ API này).`

  selectedAccountIds.value = []
  confirmBulkLock.value = false
  bulkActing.value = false

  if (failCount > 0) scrollToAlert()
}

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
      const raw = res.data || []

      // Normalize user shape so components can rely on `userId` and `isLocked`
      accounts.value = raw.map(u => ({
        userId: u.userId || u.id,
        fullName: u.fullName || u.name || u.full_name,
        email: u.email,
        role: u.role || (u.roles && u.roles[0]) || 'Reader',
        isLocked: typeof u.isLocked !== 'undefined' ? u.isLocked : (u.locked || false),
        lastLoginAt: u.lastLoginAt || u.lastLogin || u.lastSeen || null
      }))
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
  const acc = targetAccount.value
  if (!acc) return

  const previousState = acc.isLocked
  acting.value = true
  actingIds.value.push(acc.userId)
  lockDialog.value = false // đóng dialog ngay để người dùng thấy phản hồi tức thì trên bảng

  // Optimistic update: cập nhật ngay trên bảng, không đợi reload toàn bộ danh sách
  const idx = accounts.value.findIndex(a => a.userId === acc.userId)
  if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], isLocked: !previousState }

  try {
    if (previousState) {
      await userApi.unlockUser(acc.userId)
      message.value = `Đã mở khóa tài khoản ${acc.fullName}`
    } else {
      await userApi.lockUser(acc.userId)
      message.value = `Đã khóa tài khoản ${acc.fullName}`
    }

    success.value = true
  } catch (err) {
    // Rollback lại trạng thái cũ vì API thất bại
    if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], isLocked: previousState }

    success.value = false
    message.value = err.response?.status === 404
      ? `Backend chưa hỗ trợ API khóa/mở tài khoản (thiếu /api/identity/users/${acc.userId}/${previousState ? 'unlock' : 'lock'}). Cần báo bên Identity bổ sung endpoint này.`
      : (err.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.')
    console.error(err.response || err)
    scrollToAlert()
  } finally {
    acting.value = false
    actingIds.value = actingIds.value.filter(id => id !== acc.userId)
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
  background: rgba(22, 38, 58, 0.1);
  color: var(--dl-primary-dark);
}

.role-pill-green {
  background: rgba(31, 157, 107, 0.12);
  color: var(--dl-success);
}

.role-pill-gold {
  background: rgba(240, 168, 94, 0.15);
  color: #92660a;
}

.dialog-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
}

.row-updating {
  opacity: 0.55;
  transition: opacity 0.2s ease;
}
</style>
