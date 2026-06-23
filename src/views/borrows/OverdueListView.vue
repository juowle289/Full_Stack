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

    <v-row class="mb-5">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Tổng phiếu quá hạn</div>
              <div class="stat-value">{{ overdueBorrows.length }}</div>
            </div>

            <v-avatar color="error" variant="tonal" size="54">
              <v-icon icon="mdi-alert-circle" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Quá hạn ≤ 7 ngày</div>
              <div class="stat-value">{{ shortOverdueCount }}</div>
            </div>

            <v-avatar color="warning" variant="tonal" size="54">
              <v-icon icon="mdi-clock-alert-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Quá hạn > 7 ngày</div>
              <div class="stat-value">{{ longOverdueCount }}</div>
            </div>

            <v-avatar color="error" variant="tonal" size="54">
              <v-icon icon="mdi-calendar-alert" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Phạt dự kiến</div>
              <div class="stat-value money-value">{{ formatMoney(totalEstimatedFine) }}</div>
            </div>

            <v-avatar color="success" variant="tonal" size="54">
              <v-icon icon="mdi-cash-clock" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="soft-card pa-5 mb-5">
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="keyword"
            label="Tìm mã phiếu / độc giả / sách"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="dueFromDate"
            label="Hạn trả từ"
            type="date"
            prepend-inner-icon="mdi-calendar-start"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="dueToDate"
            label="Hạn trả đến"
            type="date"
            prepend-inner-icon="mdi-calendar-end"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="lateLevelFilter"
            label="Mức quá hạn"
            :items="lateLevelOptions"
            prepend-inner-icon="mdi-filter"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="2">
          <div class="d-flex ga-2">
            <v-tooltip text="Xóa bộ lọc">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="secondary"
                  variant="tonal"
                  icon="mdi-filter-remove"
                  @click="resetFilters"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Tải lại">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="primary"
                  icon="mdi-refresh"
                  :loading="loading"
                  @click="loadAllData"
                />
              </template>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="table-card">
      <div class="table-scroll">
        <v-table>
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Mã độc giả</th>
              <th>Độc giả</th>
              <th>Mã sách</th>
              <th>Sách</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Số ngày quá hạn</th>
              <th>Phạt dự kiến</th>
              <th>Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in paginatedOverdueBorrows" :key="item.id">
              <td>
                <div class="font-weight-bold text-primary">
                  {{ shortId(item.id) }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ getReaderCode(item) }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  ID: {{ shortId(item.readerId) }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ item.readerName }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ getBookCode(item) }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  ID: {{ shortId(item.bookId) }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ item.bookTitle }}
                </div>
              </td>

              <td>{{ formatDate(item.borrowDate) }}</td>
              <td>{{ formatDate(item.dueDate) }}</td>

              <td>
                <v-chip
                  :color="getLateDays(item.dueDate) > 7 ? 'error' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  <v-icon start icon="mdi-clock-alert-outline" />
                  {{ getLateDays(item.dueDate) }} ngày
                </v-chip>
              </td>

              <td>
                <span class="text-error font-weight-bold">
                  {{ formatMoney(getEstimatedFine(item)) }}
                </span>
              </td>

              <td>
                <v-chip color="warning" size="small" variant="tonal">
                  <v-icon start icon="mdi-book-clock" />
                  {{ getBorrowStatusText(item.status) }}
                </v-chip>
              </td>

              <td>
                <div class="d-flex justify-center ga-2">
                  <v-tooltip text="Xem chi tiết">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-eye"
                        size="small"
                        color="info"
                        variant="tonal"
                        @click="openDetailDialog(item)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>

            <tr v-if="paginatedOverdueBorrows.length === 0">
              <td colspan="11" class="text-center pa-8">
                <v-icon icon="mdi-check-circle-outline" size="46" color="success" />
                <div class="text-subtitle-1 font-weight-bold mt-2">
                  Không có sách quá hạn phù hợp
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  Thử thay đổi từ khóa, khoảng hạn trả hoặc mức quá hạn.
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
          <b>{{ paginatedOverdueBorrows.length }}</b>
          /
          <b>{{ filteredOverdueBorrows.length }}</b>
          phiếu quá hạn
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
  overdueBorrows.value.filter(item => getLateDays(item.dueDate) <= 7).length
)

const longOverdueCount = computed(() =>
  overdueBorrows.value.filter(item => getLateDays(item.dueDate) > 7).length
)

const totalEstimatedFine = computed(() =>
  overdueBorrows.value.reduce((total, item) => total + getEstimatedFine(item), 0)
)

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

const paginatedOverdueBorrows = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  return filteredOverdueBorrows.value.slice(start, end)
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

function getBorrowStatusText(status) {
  if (status === 'Borrowed') return 'Đang mượn'
  if (status === 'Returned') return 'Đã trả'
  return status || '-'
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

.table-scroll table {
  min-width: 1250px;
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
</style>