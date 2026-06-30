<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Sách quá hạn</div>
        <div class="page-subtitle">
          Theo dõi các phiếu mượn chưa trả sách đúng hạn, số ngày quá hạn và tiền phạt dự kiến
        </div>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadAllData"
      >
        Tải lại
      </v-btn>
    </div>

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
        <input v-model="keyword" placeholder="Tìm mã phiếu, độc giả, sách..." />
      </div>

      <v-menu v-model="filterMenu" :close-on-content-click="false" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="outlined" color="primary" prepend-icon="mdi-filter-variant">
            Lọc
            <v-badge v-if="activeFilterCount" :content="activeFilterCount" color="error" inline />
          </v-btn>
        </template>

        <v-card width="300" class="pa-4">
          <div class="text-caption text-grey-darken-1 mb-1">Hạn trả từ ngày</div>
          <v-text-field v-model="dueFromDate" type="date" density="comfortable" hide-details class="mb-3" />

          <div class="text-caption text-grey-darken-1 mb-1">Đến ngày</div>
          <v-text-field v-model="dueToDate" type="date" density="comfortable" hide-details class="mb-3" />

          <v-select
            v-model="lateLevelFilter"
            label="Mức quá hạn"
            :items="lateLevelOptions"
            clearable
            hide-details
            class="mb-4"
          />

          <v-btn block variant="tonal" color="secondary" @click="resetFilters">Xóa bộ lọc</v-btn>
        </v-card>
      </v-menu>
    </div>

    <div class="overdue-layout">
      <!-- Cảnh báo nghiêm trọng -->
      <v-card class="critical-card" rounded="lg">
        <div class="critical-icon">
          <v-icon icon="mdi-alert" size="26" />
        </div>

        <h3>Cần lưu ý gấp</h3>

        <div class="critical-number">{{ longOverdueCount }}</div>
        <p class="critical-caption">Phiếu quá hạn trên 14 ngày.</p>

        <v-btn block variant="tonal" color="error" @click="lateLevelFilter = '15+'">
          Xem danh sách
        </v-btn>

        <v-divider class="my-4" />

        <div class="critical-stat-row">
          <span>Quá hạn 1-14 ngày</span>
          <strong>{{ shortOverdueCount + midOverdueCount }}</strong>
        </div>
        <div class="critical-stat-row">
          <span>Tổng phạt dự kiến</span>
          <strong class="text-error">{{ formatMoney(totalEstimatedFine) }}</strong>
        </div>
      </v-card>

      <!-- Danh sách ưu tiên -->
      <v-card class="priority-card" rounded="lg">
        <div class="priority-header">
          <h3>Danh sách ưu tiên</h3>
          <span class="priority-sort">Sắp xếp theo mức độ nghiêm trọng</span>
        </div>

        <v-divider />

        <div v-if="loading" class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="!sortedOverdueBorrows.length" class="empty-box">
          <v-icon icon="mdi-check-circle-outline" size="44" color="var(--dl-success)" />
          <h4>Không có sách quá hạn</h4>
          <p>Tất cả phiếu mượn đều đang trong hạn trả.</p>
        </div>

        <div v-else class="priority-list">
          <div v-for="item in pagedOverdueBorrows" :key="item.id" class="priority-item">
            <v-checkbox-btn v-model="selectedIds" :value="item.id" color="primary" />

            <div class="priority-cover">
              <v-img v-if="getBookCover(item)" :src="getBookCover(item)" width="48" height="64" cover rounded="lg" />
              <div v-else class="cover-fallback-sm">
                <v-icon icon="mdi-book-open-page-variant" size="20" />
              </div>
            </div>

            <div class="priority-info">
              <div class="priority-title">{{ item.bookTitle }}</div>
              <div class="priority-meta">
                Mượn bởi: <strong>{{ item.readerName }}</strong> (Mã: {{ getReaderCode(item) }})
              </div>
            </div>

            <v-chip :color="severityColor(item)" size="small" variant="tonal" class="priority-badge">
              <v-icon start icon="mdi-clock-alert-outline" />
              {{ getLateDays(item.dueDate) }} ngày quá hạn
            </v-chip>

            <div class="priority-actions">
              <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-email-outline" @click="sendNotice(item)">
                {{ getLateDays(item.dueDate) > 7 ? 'Gửi thông báo' : 'Gửi nhắc nhở' }}
              </v-btn>

              <v-btn
                v-if="getLateDays(item.dueDate) > 7"
                size="small"
                variant="outlined"
                color="warning"
                prepend-icon="mdi-cash-multiple"
                @click="openDetailDialog(item)"
              >
                Xem &amp; lập phạt
              </v-btn>

              <v-btn v-else size="small" variant="text" prepend-icon="mdi-eye-outline" @click="openDetailDialog(item)">
                Xem chi tiết
              </v-btn>
            </div>
          </div>
        </div>

        <v-divider v-if="sortedOverdueBorrows.length" />

        <div v-if="sortedOverdueBorrows.length" class="d-flex align-center justify-space-between flex-wrap pa-4 ga-3">
          <div class="text-body-2 text-grey-darken-1">
            Hiển thị <b>{{ pagedOverdueBorrows.length }}</b> / <b>{{ sortedOverdueBorrows.length }}</b> phiếu quá hạn
          </div>

          <v-pagination v-model="page" :length="pageCount" rounded="circle" density="comfortable" total-visible="5" />
        </div>
      </v-card>
    </div>

    <!-- Bulk action bar nổi -->
    <transition name="dl-fade">
      <div v-if="selectedIds.length" class="bulk-bar">
        <div class="bulk-count"><strong>{{ selectedIds.length }}</strong> đã chọn</div>

        <v-divider vertical class="bulk-divider" />

        <button class="bulk-btn bulk-btn-ghost" type="button" @click="selectedIds = []">
          Bỏ chọn
        </button>

        <button class="bulk-btn bulk-btn-gold" type="button" @click="confirmBulkNotice = true">
          <v-icon icon="mdi-send-outline" size="16" />
          Gửi thông báo nhắc nhở
        </button>
      </div>
    </transition>

    <!-- Confirm gửi thông báo hàng loạt -->
    <v-dialog v-model="confirmBulkNotice" max-width="420">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Xác nhận gửi thông báo</v-card-title>
        <v-card-text>
          Gửi thông báo nhắc nhở quá hạn tới <strong>{{ selectedIds.length }}</strong> độc giả đã chọn?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmBulkNotice = false">Hủy</v-btn>
          <v-btn color="primary" @click="sendBulkNotice">Gửi ngay</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="760">
      <v-card v-if="selectedOverdue">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-alert-circle" color="error" class="mr-2" />
          Chi tiết phiếu quá hạn

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="info-label">Mã phiếu</div>
                <div class="info-value text-primary">{{ shortId(selectedOverdue.id) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="info-label">Mã độc giả</div>
                <div class="info-value">{{ getReaderCode(selectedOverdue) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="info-label">Mã sách</div>
                <div class="info-value">{{ getBookCode(selectedOverdue) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Độc giả</div>
                <div class="info-value">{{ selectedOverdue.readerName }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Sách</div>
                <div class="info-value">{{ selectedOverdue.bookTitle }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Ngày mượn</div>
                <div class="info-value">{{ formatDate(selectedOverdue.borrowDate) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Hạn trả</div>
                <div class="info-value text-error">{{ formatDate(selectedOverdue.dueDate) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Số ngày quá hạn</div>
                <div class="info-value text-error">
                  {{ getLateDays(selectedOverdue.dueDate) }} ngày
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Tiền phạt dự kiến</div>
                <div class="info-value text-error">
                  {{ formatMoney(getEstimatedFine(selectedOverdue)) }}
                </div>
              </div>
            </v-col>
          </v-row>

          <v-alert
            type="warning"
            variant="tonal"
            rounded="lg"
            class="mt-4"
          >
            Khoản phạt chính thức sẽ được tính khi thủ thư thực hiện thao tác trả sách.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="detailDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { borrowApi } from '../../api/borrowApi'
import { readerApi } from '../../api/readerApi'
import { bookApi } from '../../api/bookApi'
import { getBorrowStatusText } from '../../utils/borrowStatus'

const overdueBorrows = ref([])
const readers = ref([])
const books = ref([])

const keyword = ref('')
const dueFromDate = ref('')
const dueToDate = ref('')
const lateLevelFilter = ref(null)

const page = ref(1)
const itemsPerPage = ref(10)

const loading = ref(false)
const message = ref('')
const success = ref(true)

const detailDialog = ref(false)
const selectedOverdue = ref(null)

const filterMenu = ref(false)
const selectedIds = ref([])
const confirmBulkNotice = ref(false)

const finePerLateDay = 5000

const lateLevelOptions = [
  { title: 'Quá hạn 1 - 7 ngày', value: '1-7' },
  { title: 'Quá hạn 8 - 14 ngày', value: '8-14' },
  { title: 'Quá hạn trên 14 ngày', value: '15+' }
]

const readerMap = computed(() => {
  const map = new Map()

  for (const reader of readers.value) {
    map.set(reader.userId, reader)
  }

  return map
})

const bookMap = computed(() => {
  const map = new Map()

  for (const book of books.value) {
    map.set(book.id, book)
  }

  return map
})

const shortOverdueCount = computed(() =>
  overdueBorrows.value.filter(item => getLateDays(item.dueDate) >= 1 && getLateDays(item.dueDate) <= 7).length
)

const midOverdueCount = computed(() =>
  overdueBorrows.value.filter(item => getLateDays(item.dueDate) >= 8 && getLateDays(item.dueDate) <= 14).length
)

const longOverdueCount = computed(() =>
  overdueBorrows.value.filter(item => getLateDays(item.dueDate) > 14).length
)

const activeFilterCount = computed(() => {
  let count = 0
  if (dueFromDate.value) count++
  if (dueToDate.value) count++
  if (lateLevelFilter.value) count++
  return count
})

const totalEstimatedFine = computed(() =>
  overdueBorrows.value.reduce((total, item) => total + getEstimatedFine(item), 0)
)

// Danh sách ưu tiên: sắp xếp theo số ngày quá hạn giảm dần (nghiêm trọng nhất lên đầu)
const sortedOverdueBorrows = computed(() =>
  [...filteredOverdueBorrows.value].sort((a, b) => getLateDays(b.dueDate) - getLateDays(a.dueDate))
)

const pagedOverdueBorrows = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return sortedOverdueBorrows.value.slice(start, start + itemsPerPage.value)
})

function severityColor(item) {
  const days = getLateDays(item.dueDate)
  if (days > 14) return 'error'
  if (days > 7) return 'warning'
  return 'secondary'
}

function getBookCover(item) {
  return bookMap.value.get(item.bookId)?.coverImageUrl || null
}

function sendNotice(item) {
  success.value = true
  message.value = `Đã gửi thông báo quá hạn tới ${item.readerName} (mô phỏng - chưa nối email/SMS thật).`
}

function sendBulkNotice() {
  success.value = true
  message.value = `Đã gửi thông báo nhắc nhở tới ${selectedIds.value.length} độc giả (mô phỏng - chưa nối email/SMS thật).`
  selectedIds.value = []
  confirmBulkNotice.value = false
}

const filteredOverdueBorrows = computed(() => {
  let data = [...overdueBorrows.value]

  if (keyword.value) {
    const search = keyword.value.toLowerCase().trim()

    data = data.filter(item =>
      String(shortId(item.id)).toLowerCase().includes(search) ||
      String(item.readerName || '').toLowerCase().includes(search) ||
      String(item.bookTitle || '').toLowerCase().includes(search) ||
      String(getReaderCode(item) || '').toLowerCase().includes(search) ||
      String(getBookCode(item) || '').toLowerCase().includes(search)
    )
  }

  if (dueFromDate.value) {
    const from = new Date(dueFromDate.value)
    data = data.filter(item => new Date(item.dueDate) >= from)
  }

  if (dueToDate.value) {
    const to = new Date(dueToDate.value)
    to.setHours(23, 59, 59, 999)
    data = data.filter(item => new Date(item.dueDate) <= to)
  }

  if (lateLevelFilter.value) {
    data = data.filter(item => {
      const days = getLateDays(item.dueDate)

      if (lateLevelFilter.value === '1-7') return days >= 1 && days <= 7
      if (lateLevelFilter.value === '8-14') return days >= 8 && days <= 14
      if (lateLevelFilter.value === '15+') return days >= 15

      return true
    })
  }

  return data
})

const pageCount = computed(() => {
  const total = Math.ceil(filteredOverdueBorrows.value.length / itemsPerPage.value)
  return total || 1
})

watch([keyword, dueFromDate, dueToDate, lateLevelFilter, itemsPerPage], () => {
  page.value = 1
})

async function loadAllData() {
  loading.value = true
  message.value = ''

  try {
    await Promise.all([
      loadOverdue(),
      loadReaders(),
      loadBooks()
    ])

    success.value = true
  } catch (err) {
    success.value = false
    message.value = 'Không tải được dữ liệu sách quá hạn'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

async function loadOverdue() {
  const res = await borrowApi.getOverdue()
  overdueBorrows.value = res.data
}

async function loadReaders() {
  const res = await readerApi.getAll()
  readers.value = res.data
}

async function loadBooks() {
  const res = await bookApi.getAll()
  books.value = res.data
}

function resetFilters() {
  keyword.value = ''
  dueFromDate.value = ''
  dueToDate.value = ''
  lateLevelFilter.value = null
  page.value = 1
}

function openDetailDialog(item) {
  selectedOverdue.value = item
  detailDialog.value = true
}

function getLateDays(dueDate) {
  if (!dueDate) return 0

  const due = new Date(dueDate)
  const now = new Date()

  const diff = now.getTime() - due.getTime()

  if (diff <= 0) return 0

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getEstimatedFine(item) {
  const currentFine = Number(item.fineAmount || 0)

  if (currentFine > 0) return currentFine

  return getLateDays(item.dueDate) * finePerLateDay
}

function getReaderCode(item) {
  const reader = readerMap.value.get(item.readerId)

  if (!reader) return shortId(item.readerId)

  return reader.studentCode || reader.cardNumber || shortId(reader.userId)
}

function getBookCode(item) {
  const book = bookMap.value.get(item.bookId)

  if (!book) return shortId(item.bookId)

  return book.isbn || shortId(book.id)
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

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(0, 8)
}

onMounted(loadAllData)
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
}

.money-value {
  font-size: 22px;
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

/* Layout 2 cột: Critical Attention + Danh sách ưu tiên */
.overdue-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  align-items: flex-start;
}

.critical-card {
  padding: 22px;
  background: rgba(220, 38, 38, 0.04) !important;
  border: 1px solid rgba(220, 38, 38, 0.2) !important;
}

.critical-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.12);
  color: var(--dl-error);
  display: grid;
  place-items: center;
  margin-bottom: 14px;
}

.critical-card h3 {
  font-family: var(--dl-font-headline);
  font-size: 18px;
  color: var(--dl-text-primary);
  margin-bottom: 12px;
}

.critical-number {
  font-family: var(--dl-font-headline);
  font-size: 44px;
  font-weight: 700;
  color: var(--dl-error);
  line-height: 1;
}

.critical-caption {
  font-size: 13px;
  color: var(--dl-text-muted);
  margin: 6px 0 16px;
}

.critical-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--dl-text-muted);
  padding: 6px 0;
}

.priority-card {
  border: 1px solid var(--dl-surface-variant);
  box-shadow: var(--dl-shadow-card);
  overflow: hidden;
}

.priority-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px;
  flex-wrap: wrap;
  gap: 6px;
}

.priority-header h3 {
  font-family: var(--dl-font-headline);
  font-size: 17px;
  color: var(--dl-text-primary);
  margin: 0;
}

.priority-sort {
  font-size: 12px;
  color: var(--dl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.priority-list {
  display: flex;
  flex-direction: column;
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--dl-border);
  flex-wrap: wrap;
}

.priority-item:last-child {
  border-bottom: none;
}

.priority-cover {
  width: 48px;
  height: 64px;
  flex: 0 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--dl-primary-dark), var(--dl-primary));
}

.cover-fallback-sm {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.7);
}

.priority-info {
  flex: 1;
  min-width: 180px;
}

.priority-title {
  font-weight: 700;
  font-size: 14.5px;
  color: var(--dl-text-primary);
}

.priority-meta {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin-top: 2px;
}

.priority-badge {
  flex: 0 0 auto;
}

.priority-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-box {
  text-align: center;
  padding: 60px 20px;
  color: var(--dl-text-muted);
}

.empty-box h4 {
  font-family: var(--dl-font-headline);
  color: var(--dl-text-primary);
  margin: 12px 0 4px;
}

@media (max-width: 960px) {
  .overdue-layout {
    grid-template-columns: 1fr;
  }
}
</style>