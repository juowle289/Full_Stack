<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Quản lý độc giả</div>
        <div class="page-subtitle">
          Quản lý hồ sơ độc giả, tài khoản, thẻ thư viện và trạng thái sử dụng
        </div>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadReaders"
      >
        Tải lại
      </v-btn>

      <v-btn
        v-if="canManageUser"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-file-excel-outline"
        @click="importDialog = true"
      >
        Nhập Excel
      </v-btn>
    </div>

    <ImportExcelDialog
      v-model="importDialog"
      entity-label="độc giả"
      :template-columns="readerImportColumns"
      :create-fn="importReaderRow"
      @imported="loadReaders"
    />

    <v-alert
      v-if="message"
      :type="success ? 'success' : 'error'"
      variant="tonal"
      class="mb-4"
      rounded="lg"
    >
      {{ message }}
    </v-alert>

    <div class="toolbar-row">
      <div class="search-box">
        <v-icon icon="mdi-magnify" size="20" />
        <input v-model="keyword" placeholder="Tìm mã độc giả, tên, email, số thẻ..." />
      </div>

      <v-menu v-model="filterMenu" :close-on-content-click="false" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="outlined" color="primary" prepend-icon="mdi-filter-variant">
            Lọc danh sách
            <v-badge v-if="activeFilterCount" :content="activeFilterCount" color="error" inline />
          </v-btn>
        </template>

        <v-card width="320" class="pa-4">
          <v-select
            v-model="userStatusFilter"
            label="Trạng thái tài khoản"
            :items="userStatusOptions"
            clearable
            hide-details
            class="mb-3"
          />

          <v-select
            v-model="cardStatusFilter"
            label="Trạng thái thẻ"
            :items="cardStatusOptions"
            clearable
            hide-details
            class="mb-3"
          />

          <div class="text-caption text-grey-darken-1 mb-1">Hạn thẻ từ ngày</div>
          <v-text-field v-model="expiredFromDate" type="date" density="comfortable" hide-details class="mb-3" />

          <div class="text-caption text-grey-darken-1 mb-1">Đến ngày</div>
          <v-text-field v-model="expiredToDate" type="date" density="comfortable" hide-details class="mb-4" />

          <v-btn block variant="tonal" color="secondary" @click="resetFilters">Xóa bộ lọc</v-btn>
        </v-card>
      </v-menu>
    </div>

    <v-card class="table-card">
      <!-- Thanh tĩnh trên đầu bảng: chỉ Chọn tất cả + Xuất dữ liệu (không cần chọn dòng nào) -->
      <div class="select-toolbar">
        <label class="select-all-label">
          <v-checkbox-btn
            :model-value="allSelected"
            :indeterminate="isIndeterminate"
            color="primary"
            @update:model-value="toggleSelectAll"
          />
          Chọn tất cả
        </label>

        <v-divider vertical class="mx-2" />

        <button class="toolbar-action" type="button" @click="exportCsv">
          <v-icon icon="mdi-download-outline" size="18" />
          Xuất dữ liệu
        </button>

        <v-spacer />

        <div class="result-count">
          Hiển thị <b>{{ paginatedReaders.length }}</b> / <b>{{ filteredReaders.length }}</b> độc giả
        </div>
      </div>

      <v-divider />

      <div class="table-scroll">
        <v-table>
          <thead>
            <tr>
              <th style="width: 44px;"></th>
              <th>Độc giả</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="reader in paginatedReaders" :key="reader.userId">
              <td>
                <v-checkbox-btn v-model="selectedReaderIds" :value="reader.userId" color="primary" />
              </td>

              <td>
                <div class="d-flex align-center">
                  <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
                    <v-icon icon="mdi-account" />
                  </v-avatar>

                  <div class="min-width-0">
                    <div class="font-weight-bold text-truncate">{{ reader.fullName }}</div>
                    <div class="text-caption text-grey-darken-1">ID: {{ getReaderCode(reader) }}</div>
                  </div>
                </div>
              </td>

              <td>
                <div class="text-body-2">{{ reader.email }}</div>
                <div class="text-caption text-grey-darken-1">{{ reader.phone || '-' }}</div>
              </td>

              <td>
                <div class="address-cell">{{ reader.address || '-' }}</div>
              </td>

              <td>
                <v-chip
                  :color="readerOverallStatusColor(reader)"
                  size="small"
                  variant="tonal"
                >
                  <v-icon start :icon="readerOverallStatusIcon(reader)" />
                  {{ readerOverallStatusText(reader) }}
                </v-chip>
              </td>

              <td>
                <div class="d-flex justify-center">
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon="mdi-dots-vertical" size="small" variant="text" />
                    </template>

                    <v-list density="compact">
                      <v-list-item prepend-icon="mdi-card-account-details" title="Xem thẻ" @click="viewCard(reader)" />

                      <v-list-item
                        v-if="canManageCard"
                        prepend-icon="mdi-calendar-plus"
                        title="Gia hạn thẻ"
                        @click="renewCard(reader)"
                      />

                      <v-list-item
                        v-if="canManageCard && reader.cardStatus === 'Active'"
                        prepend-icon="mdi-card-off"
                        title="Khóa thẻ"
                        @click="lockCard(reader)"
                      />

                      <v-list-item
                        v-if="canManageCard && reader.cardStatus === 'Locked'"
                        prepend-icon="mdi-card-account-details-star"
                        title="Mở khóa thẻ"
                        @click="unlockCard(reader)"
                      />

                      <v-divider v-if="canManageUser" class="my-1" />

                      <v-list-item
                        v-if="canManageUser && reader.userStatus === 'Active'"
                        prepend-icon="mdi-lock"
                        title="Khóa tài khoản"
                        base-color="error"
                        @click="lockUser(reader)"
                      />

                      <v-list-item
                        v-if="canManageUser && reader.userStatus === 'Locked'"
                        prepend-icon="mdi-lock-open"
                        title="Mở tài khoản"
                        base-color="success"
                        @click="unlockUser(reader)"
                      />
                    </v-list>
                  </v-menu>
                </div>
              </td>
            </tr>

            <tr v-if="paginatedReaders.length === 0">
              <td colspan="6" class="text-center pa-8">
                <v-icon icon="mdi-database-search-outline" size="46" color="grey" />
                <div class="text-subtitle-1 font-weight-bold mt-2">
                  Không tìm thấy độc giả phù hợp
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  Thử thay đổi từ khóa hoặc bộ lọc đang chọn.
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <v-divider />

      <div class="d-flex align-center justify-space-between flex-wrap pa-4 ga-3">
        <div class="text-body-2 text-grey-darken-1">
          Hiển thị
          <b>{{ paginatedReaders.length }}</b>
          /
          <b>{{ filteredReaders.length }}</b>
          độc giả
        </div>

        <div class="d-flex align-center ga-3">
          <v-select
            v-model="itemsPerPage"
            :items="[5, 10, 20, 50]"
            label="Số dòng"
            density="compact"
            hide-details
            style="width: 110px;"
          />

          <v-pagination
            v-model="page"
            :length="pageCount"
            rounded="circle"
            density="comfortable"
            total-visible="5"
          />
        </div>
      </div>
    </v-card>

    <!-- Bulk action bar nổi -->
    <transition name="dl-fade">
      <div v-if="selectedReaderIds.length" class="bulk-bar">
        <div class="bulk-count"><strong>{{ selectedReaderIds.length }}</strong> độc giả đã chọn</div>

        <v-divider vertical class="bulk-divider" />

        <button
          v-if="canManageCard"
          class="bulk-btn bulk-btn-danger"
          type="button"
          @click="confirmBulkLock = true"
        >
          <v-icon icon="mdi-card-off-outline" size="16" />
          Khóa thẻ
        </button>

        <button class="bulk-btn bulk-btn-gold" type="button" @click="exportCsv">
          <v-icon icon="mdi-download-outline" size="16" />
          Xuất CSV
        </button>

        <button class="bulk-btn bulk-btn-ghost" type="button" @click="selectedReaderIds = []">
          Bỏ chọn
        </button>
      </div>
    </transition>

    <!-- Confirm khóa thẻ hàng loạt -->
    <v-dialog v-model="confirmBulkLock" max-width="420">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Xác nhận khóa thẻ</v-card-title>
        <v-card-text>
          Khóa thẻ thư viện của <strong>{{ selectedReaderIds.length }}</strong> độc giả đã chọn?
          Họ sẽ không thể mượn sách cho đến khi được mở khóa lại.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmBulkLock = false">Hủy</v-btn>
          <v-btn color="error" :loading="bulkLocking" @click="bulkLockCards">Khóa thẻ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cardDialog" max-width="760">
      <v-card v-if="selectedCard">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-card-account-details" color="primary" class="mr-2" />
          Thông tin thẻ thư viện

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="cardDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="5">
              <v-card class="reader-card pa-5">
                <div class="d-flex align-center justify-space-between mb-7">
                  <div>
                    <div class="text-caption text-white opacity-80">
                      LIBRARY CARD
                    </div>
                    <div class="text-h6 font-weight-black text-white">
                      Digital Library
                    </div>
                  </div>

                  <v-avatar color="white" size="46">
                    <v-icon icon="mdi-library" color="primary" />
                  </v-avatar>
                </div>

                <div class="text-caption text-white opacity-80">
                  SỐ THẺ
                </div>

                <div class="reader-card-number">
                  {{ selectedCard.cardNumber }}
                </div>

                <div class="mt-7">
                  <div class="text-caption text-white opacity-80">
                    CHỦ THẺ
                  </div>
                  <div class="text-white font-weight-bold">
                    {{ selectedCard.fullName }}
                  </div>
                </div>

                <div class="mt-5">
                  <div class="text-caption text-white opacity-80">
                    TRẠNG THÁI
                  </div>

                  <v-chip
                    class="mt-1"
                    :color="selectedCard.status === 'Active' ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                  >
                    {{ getCardStatusText(selectedCard.status) }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="7">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-box">
                    <div class="info-label">Độc giả</div>
                    <div class="info-value">{{ selectedCard.fullName }}</div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="info-box">
                    <div class="info-label">Email</div>
                    <div class="info-value">{{ selectedCard.email }}</div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="info-box">
                    <div class="info-label">Số thẻ</div>
                    <div class="info-value">{{ selectedCard.cardNumber }}</div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="info-box">
                    <div class="info-label">Trạng thái</div>
                    <div class="info-value">
                      {{ getCardStatusText(selectedCard.status) }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="info-box">
                    <div class="info-label">Ngày cấp</div>
                    <div class="info-value">{{ formatDate(selectedCard.issuedDate) }}</div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="info-box">
                    <div class="info-label">Ngày hết hạn</div>
                    <div class="info-value">{{ formatDate(selectedCard.expiredDate) }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="cardDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { readerApi } from '../../api/readerApi'
import { userApi } from '../../api/userApi'
import { libraryCardApi } from '../../api/libraryCardApi'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../stores/authStore'
import ImportExcelDialog from '../../components/ImportExcelDialog.vue'

const auth = useAuthStore()

const importDialog = ref(false)

const readerImportColumns = [
  { key: 'fullName', label: 'Họ và tên', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'password', label: 'Mật khẩu tạm thời', required: true },
  { key: 'studentCode', label: 'Mã SV/Mã độc giả', required: false },
  { key: 'phone', label: 'Số điện thoại', required: false },
  { key: 'address', label: 'Địa chỉ', required: false }
]

function importReaderRow(row) {
  return authApi.register({
    fullName: row.fullName,
    email: row.email,
    password: row.password,
    studentCode: row.studentCode || '',
    phone: row.phone || '',
    address: row.address || ''
  })
}

const readers = ref([])
const keyword = ref('')
const userStatusFilter = ref(null)
const cardStatusFilter = ref(null)
const expiredFromDate = ref('')
const expiredToDate = ref('')

const page = ref(1)
const itemsPerPage = ref(10)

const loading = ref(false)
const loadingId = ref('')
const message = ref('')
const success = ref(true)

const cardDialog = ref(false)
const selectedCard = ref(null)

const filterMenu = ref(false)
const selectedReaderIds = ref([])
const confirmBulkLock = ref(false)
const bulkLocking = ref(false)

const userStatusOptions = [
  { title: 'Hoạt động', value: 'Active' },
  { title: 'Bị khóa', value: 'Locked' }
]

const cardStatusOptions = [
  { title: 'Hoạt động', value: 'Active' },
  { title: 'Bị khóa', value: 'Locked' },
  { title: 'Hết hạn', value: 'Expired' }
]

const canManageUser = computed(() => auth.role === 'Admin')

const canManageCard = computed(() =>
  ['Admin', 'Librarian'].includes(auth.role)
)

const activeUserCount = computed(() =>
  readers.value.filter(x => x.userStatus === 'Active').length
)

const lockedUserCount = computed(() =>
  readers.value.filter(x => x.userStatus === 'Locked').length
)

const expiredCardCount = computed(() =>
  readers.value.filter(x => isCardExpired(x)).length
)

const activeFilterCount = computed(() => {
  let count = 0
  if (userStatusFilter.value) count++
  if (cardStatusFilter.value) count++
  if (expiredFromDate.value) count++
  if (expiredToDate.value) count++
  return count
})

const allSelected = computed(() =>
  paginatedReaders.value.length > 0 &&
  paginatedReaders.value.every(r => selectedReaderIds.value.includes(r.userId))
)

const isIndeterminate = computed(() =>
  !allSelected.value && paginatedReaders.value.some(r => selectedReaderIds.value.includes(r.userId))
)

function toggleSelectAll(value) {
  const pageIds = paginatedReaders.value.map(r => r.userId)

  if (value) {
    selectedReaderIds.value = [...new Set([...selectedReaderIds.value, ...pageIds])]
  } else {
    selectedReaderIds.value = selectedReaderIds.value.filter(id => !pageIds.includes(id))
  }
}

function readerOverallStatusText(reader) {
  if (reader.userStatus === 'Locked') return 'Tài khoản bị khóa'
  return getCardStatusText(reader.cardStatus)
}

function readerOverallStatusColor(reader) {
  if (reader.userStatus === 'Locked') return 'error'
  return getCardStatusColor(reader.cardStatus)
}

function readerOverallStatusIcon(reader) {
  if (reader.userStatus === 'Locked') return 'mdi-account-lock'
  if (reader.cardStatus === 'Active') return 'mdi-card-account-details-star'
  if (reader.cardStatus === 'Expired') return 'mdi-card-account-details-outline'
  return 'mdi-card-off'
}

async function bulkLockCards() {
  bulkLocking.value = true
  message.value = ''

  try {
    for (const id of selectedReaderIds.value) {
      await libraryCardApi.lockCard(id)
    }

    success.value = true
    message.value = `Đã khóa thẻ của ${selectedReaderIds.value.length} độc giả`
    selectedReaderIds.value = []
    confirmBulkLock.value = false

    await loadReaders()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Khóa thẻ hàng loạt thất bại'
    console.error(err.response || err)
  } finally {
    bulkLocking.value = false
  }
}

function exportCsv() {
  const data = filteredReaders.value

  if (!data.length) return

  const header = ['Mã độc giả', 'Họ tên', 'Email', 'SĐT', 'Địa chỉ', 'Trạng thái TK', 'Trạng thái thẻ']
  const body = data
    .map(r => [getReaderCode(r), r.fullName, r.email, r.phone, r.address, getUserStatusText(r.userStatus), getCardStatusText(r.cardStatus)]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(','))
    .join('\n')

  const csv = `${header.join(',')}\n${body}`
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `danh-sach-doc-gia-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const filteredReaders = computed(() => {
  let data = [...readers.value]

  if (keyword.value) {
    const search = keyword.value.toLowerCase().trim()

    data = data.filter(reader =>
      String(getReaderCode(reader)).toLowerCase().includes(search) ||
      String(reader.fullName || '').toLowerCase().includes(search) ||
      String(reader.email || '').toLowerCase().includes(search) ||
      String(reader.phone || '').toLowerCase().includes(search) ||
      String(reader.cardNumber || '').toLowerCase().includes(search) ||
      String(reader.userId || '').toLowerCase().includes(search)
    )
  }

  if (userStatusFilter.value) {
    data = data.filter(reader => reader.userStatus === userStatusFilter.value)
  }

  if (cardStatusFilter.value) {
    data = data.filter(reader => reader.cardStatus === cardStatusFilter.value)
  }

  if (expiredFromDate.value) {
    const from = new Date(expiredFromDate.value)
    data = data.filter(reader =>
      reader.expiredDate && new Date(reader.expiredDate) >= from
    )
  }

  if (expiredToDate.value) {
    const to = new Date(expiredToDate.value)
    to.setHours(23, 59, 59, 999)

    data = data.filter(reader =>
      reader.expiredDate && new Date(reader.expiredDate) <= to
    )
  }

  return data
})

const pageCount = computed(() => {
  const total = Math.ceil(filteredReaders.value.length / itemsPerPage.value)
  return total || 1
})

const paginatedReaders = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  return filteredReaders.value.slice(start, end)
})

watch([keyword, userStatusFilter, cardStatusFilter, expiredFromDate, expiredToDate, itemsPerPage], () => {
  page.value = 1
})

async function loadReaders() {
  loading.value = true
  message.value = ''

  try {
    const res = await readerApi.getAll()
    readers.value = res.data
    success.value = true
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được danh sách độc giả'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  keyword.value = ''
  userStatusFilter.value = null
  cardStatusFilter.value = null
  expiredFromDate.value = ''
  expiredToDate.value = ''
  page.value = 1
}

async function viewCard(reader) {
  message.value = ''

  try {
    const res = await libraryCardApi.getCard(reader.userId)

    selectedCard.value = res.data
    cardDialog.value = true
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không xem được thẻ thư viện'
    console.error(err.response || err)
  }
}

async function renewCard(reader) {
  const confirmed = confirm(`Gia hạn thẻ thư viện cho "${reader.fullName}" thêm 1 năm?`)

  if (!confirmed) return

  loadingId.value = reader.userId + '-renew'
  message.value = ''

  try {
    const res = await libraryCardApi.renewCard(reader.userId)

    success.value = true
    message.value = res.data.message || 'Gia hạn thẻ thành công'

    await loadReaders()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Gia hạn thẻ thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

async function lockCard(reader) {
  const confirmed = confirm(`Khóa thẻ thư viện của "${reader.fullName}"?`)

  if (!confirmed) return

  loadingId.value = reader.userId + '-lock-card'
  message.value = ''

  try {
    const res = await libraryCardApi.lockCard(reader.userId)

    success.value = true
    message.value = res.data.message || 'Khóa thẻ thành công'

    await loadReaders()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Khóa thẻ thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

async function unlockCard(reader) {
  const confirmed = confirm(`Mở khóa thẻ thư viện của "${reader.fullName}"?`)

  if (!confirmed) return

  loadingId.value = reader.userId + '-unlock-card'
  message.value = ''

  try {
    const res = await libraryCardApi.unlockCard(reader.userId)

    success.value = true
    message.value = res.data.message || 'Mở khóa thẻ thành công'

    await loadReaders()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Mở khóa thẻ thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

async function lockUser(reader) {
  const confirmed = confirm(`Khóa tài khoản "${reader.fullName}"? Độc giả sẽ không thể mượn sách.`)

  if (!confirmed) return

  loadingId.value = reader.userId + '-lock-user'
  message.value = ''

  try {
    const res = await userApi.lockUser(reader.userId)

    success.value = true
    message.value = res.data.message || 'Khóa tài khoản thành công'

    await loadReaders()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Khóa tài khoản thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

async function unlockUser(reader) {
  const confirmed = confirm(`Mở khóa tài khoản "${reader.fullName}"?`)

  if (!confirmed) return

  loadingId.value = reader.userId + '-unlock-user'
  message.value = ''

  try {
    const res = await userApi.unlockUser(reader.userId)

    success.value = true
    message.value = res.data.message || 'Mở khóa tài khoản thành công'

    await loadReaders()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Mở khóa tài khoản thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

function getReaderCode(reader) {
  return reader.studentCode || reader.cardNumber || shortId(reader.userId)
}

function getUserStatusText(status) {
  if (status === 'Active') return 'Hoạt động'
  if (status === 'Locked') return 'Bị khóa'
  return status || '-'
}

function getUserStatusColor(status) {
  if (status === 'Active') return 'success'
  if (status === 'Locked') return 'error'
  return 'secondary'
}

function getCardStatusText(status) {
  if (status === 'Active') return 'Hoạt động'
  if (status === 'Locked') return 'Bị khóa'
  if (status === 'Expired') return 'Hết hạn'
  return status || '-'
}

function getCardStatusColor(status) {
  if (status === 'Active') return 'success'
  if (status === 'Locked') return 'error'
  if (status === 'Expired') return 'warning'
  return 'secondary'
}

function isCardExpired(reader) {
  if (!reader.expiredDate) return false

  return new Date(reader.expiredDate).getTime() < new Date().getTime()
}

function getCardExpiredText(reader) {
  if (!reader.expiredDate) return 'Chưa có hạn thẻ'

  const expired = new Date(reader.expiredDate).getTime()
  const now = new Date().getTime()
  const diff = expired - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return `Đã hết hạn ${Math.abs(days)} ngày`
  if (days === 0) return 'Hết hạn hôm nay'

  return `Còn ${days} ngày`
}

function formatDate(value) {
  if (!value) return '-'

  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(0, 8)
}

onMounted(loadReaders)
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
}

.table-scroll table {
  min-width: 1320px;
}

.address-cell {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reader-card {
  min-height: 300px;
  border-radius: 28px !important;
  color: white;
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.28), transparent 28%),
    radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.35), transparent 32%),
    linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%) !important;
  box-shadow: 0 28px 70px rgba(30, 64, 175, 0.28) !important;
}

.reader-card::before {
  content: '';
  position: absolute;
  right: -60px;
  bottom: -60px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.reader-card > * {
  position: relative;
  z-index: 2;
}

.reader-card-number {
  color: white;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.08em;
  margin-top: 8px;
}

.info-box {
  min-height: 88px;
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.info-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.info-value {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  word-break: break-word;
}
</style>