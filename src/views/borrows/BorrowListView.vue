<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Phiếu mượn</div>
        <div class="page-subtitle">
          Quản lý tạo phiếu mượn, trả sách, phí phạt và trạng thái thanh toán
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

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
      >
        Tạo phiếu mượn
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
              <div class="stat-label">Tổng phiếu</div>
              <div class="stat-value">{{ borrows.length }}</div>
            </div>

            <v-avatar color="primary" variant="tonal" size="54">
              <v-icon icon="mdi-clipboard-text-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Đang mượn</div>
              <div class="stat-value">{{ borrowingCount }}</div>
            </div>

            <v-avatar color="warning" variant="tonal" size="54">
              <v-icon icon="mdi-book-clock-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Đã trả</div>
              <div class="stat-value">{{ returnedCount }}</div>
            </div>

            <v-avatar color="success" variant="tonal" size="54">
              <v-icon icon="mdi-check-circle-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Chưa thanh toán phạt</div>
              <div class="stat-value">{{ unpaidFineCount }}</div>
            </div>

            <v-avatar color="error" variant="tonal" size="54">
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
          <v-select
            v-model="statusFilter"
            label="Trạng thái"
            :items="statusOptions"
            prepend-inner-icon="mdi-filter"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="borrowFromDate"
            label="Mượn từ ngày"
            type="date"
            prepend-inner-icon="mdi-calendar-start"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-text-field
            v-model="borrowToDate"
            label="Mượn đến ngày"
            type="date"
            prepend-inner-icon="mdi-calendar-end"
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
                  @click="loadBorrows"
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
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th>Phí phạt</th>
              <th>Thanh toán</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="borrow in paginatedBorrows" :key="borrow.id">
              <td>
                <div class="font-weight-bold text-primary">
                  {{ shortId(borrow.id) }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ getReaderCode(borrow) }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  ID: {{ shortId(borrow.readerId) }}
                </div>
              </td>

              <td>{{ borrow.readerName }}</td>

              <td>
                <div class="font-weight-bold">
                  {{ getBookCode(borrow) }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  ID: {{ shortId(borrow.bookId) }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ borrow.bookTitle }}
                </div>
              </td>

              <td>{{ formatDate(borrow.borrowDate) }}</td>
              <td>{{ formatDate(borrow.dueDate) }}</td>
              <td>{{ borrow.returnDate ? formatDate(borrow.returnDate) : '-' }}</td>

              <td>
                <v-chip
                  :color="borrow.status === 'Borrowed' ? 'warning' : 'success'"
                  size="small"
                  variant="tonal"
                >
                  <v-icon
                    start
                    :icon="borrow.status === 'Borrowed' ? 'mdi-book-clock' : 'mdi-check-circle'"
                  />
                  {{ getBorrowStatusText(borrow.status) }}
                </v-chip>
              </td>

              <td>
                <span :class="Number(borrow.fineAmount || 0) > 0 ? 'text-error font-weight-bold' : ''">
                  {{ formatMoney(borrow.fineAmount) }}
                </span>
              </td>

              <td>
                <v-chip
                  :color="getPaymentColor(borrow)"
                  size="small"
                  variant="tonal"
                >
                  {{ getPaymentText(borrow) }}
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
                        @click="openDetailDialog(borrow)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Trả sách">
                    <template #activator="{ props }">
                      <v-btn
                        v-if="borrow.status === 'Borrowed'"
                        v-bind="props"
                        icon="mdi-book-arrow-left"
                        size="small"
                        color="primary"
                        variant="tonal"
                        :loading="loadingId === borrow.id + '-return'"
                        @click="openReturnDialog(borrow)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Thanh toán phí phạt">
                    <template #activator="{ props }">
                      <v-btn
                        v-if="Number(borrow.fineAmount || 0) > 0 && !borrow.isFinePaid"
                        v-bind="props"
                        icon="mdi-credit-card-check"
                        size="small"
                        color="success"
                        variant="tonal"
                        :loading="loadingId === borrow.id + '-pay'"
                        @click="openPayDialog(borrow)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>

            <tr v-if="paginatedBorrows.length === 0">
              <td colspan="12" class="text-center pa-8">
                <v-icon icon="mdi-database-search-outline" size="46" color="grey" />
                <div class="text-subtitle-1 font-weight-bold mt-2">
                  Không tìm thấy phiếu mượn phù hợp
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  Thử thay đổi từ khóa, trạng thái hoặc khoảng ngày mượn.
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
          <b>{{ paginatedBorrows.length }}</b>
          /
          <b>{{ filteredBorrows.length }}</b>
          phiếu mượn
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

    <!-- Dialog tạo phiếu -->
    <v-dialog v-model="createDialog" max-width="760">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-plus-circle" color="primary" class="mr-2" />
          Tạo phiếu mượn

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="createDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="createForm.readerId"
                label="Chọn độc giả"
                :items="readerItems"
                prepend-inner-icon="mdi-account"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="createForm.bookId"
                label="Chọn sách"
                :items="bookItems"
                prepend-inner-icon="mdi-book-open-page-variant"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="createForm.borrowDate"
                label="Ngày mượn"
                type="datetime-local"
                prepend-inner-icon="mdi-calendar-start"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="createForm.dueDate"
                label="Hạn trả"
                type="datetime-local"
                prepend-inner-icon="mdi-calendar-end"
              />
            </v-col>
          </v-row>

          <v-alert
            type="info"
            variant="tonal"
            rounded="lg"
            class="mt-2"
          >
            Hệ thống sẽ kiểm tra trạng thái độc giả, thẻ thư viện và số lượng sách còn lại trước khi tạo phiếu.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="createDialog = false">
            Hủy
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            :loading="creating"
            @click="createBorrow"
          >
            Tạo phiếu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog trả sách -->
    <v-dialog v-model="returnDialog" max-width="560">
      <v-card v-if="selectedBorrow">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-book-arrow-left" color="primary" class="mr-2" />
          Trả sách

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="returnDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <div class="info-box mb-4">
            <div class="info-label">Phiếu mượn</div>
            <div class="info-value">{{ shortId(selectedBorrow.id) }}</div>
          </div>

          <div class="info-box mb-4">
            <div class="info-label">Sách</div>
            <div class="info-value">{{ selectedBorrow.bookTitle }}</div>
          </div>

          <v-text-field
            v-model="returnForm.returnDate"
            label="Ngày trả"
            type="datetime-local"
            prepend-inner-icon="mdi-calendar-check"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="returnDialog = false">
            Hủy
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-check"
            :loading="loadingId === selectedBorrow.id + '-return'"
            @click="confirmReturnBook"
          >
            Xác nhận trả sách
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog thanh toán -->
    <v-dialog v-model="payDialog" max-width="600">
      <v-card v-if="selectedBorrow">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-credit-card-check" color="success" class="mr-2" />
          Thanh toán phí phạt

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="payDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Mã phiếu</div>
                <div class="info-value">{{ shortId(selectedBorrow.id) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Số tiền</div>
                <div class="info-value text-error">
                  {{ formatMoney(selectedBorrow.fineAmount) }}
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="info-box">
                <div class="info-label">Độc giả</div>
                <div class="info-value">
                  {{ selectedBorrow.readerName }}
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="info-box">
                <div class="info-label">Sách</div>
                <div class="info-value">
                  {{ selectedBorrow.bookTitle }}
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="paymentMethod"
                label="Phương thức thanh toán"
                :items="paymentMethods"
                prepend-inner-icon="mdi-cash"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="payDialog = false">
            Hủy
          </v-btn>

          <v-btn
            color="success"
            prepend-icon="mdi-check-circle"
            :loading="loadingId === selectedBorrow.id + '-pay'"
            @click="confirmPayFine"
          >
            Xác nhận thanh toán
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog chi tiết -->
    <v-dialog v-model="detailDialog" max-width="760">
      <v-card v-if="selectedBorrow">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-clipboard-text-search" color="info" class="mr-2" />
          Chi tiết phiếu mượn

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="info-label">Mã phiếu</div>
                <div class="info-value">{{ shortId(selectedBorrow.id) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="info-label">Mã độc giả</div>
                <div class="info-value">{{ getReaderCode(selectedBorrow) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="info-label">Mã sách</div>
                <div class="info-value">{{ getBookCode(selectedBorrow) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Độc giả</div>
                <div class="info-value">{{ selectedBorrow.readerName }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Sách</div>
                <div class="info-value">{{ selectedBorrow.bookTitle }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Ngày mượn</div>
                <div class="info-value">{{ formatDate(selectedBorrow.borrowDate) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Hạn trả</div>
                <div class="info-value">{{ formatDate(selectedBorrow.dueDate) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Ngày trả</div>
                <div class="info-value">
                  {{ selectedBorrow.returnDate ? formatDate(selectedBorrow.returnDate) : '-' }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Phí phạt</div>
                <div class="info-value">{{ formatMoney(selectedBorrow.fineAmount) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { borrowApi } from '../../api/borrowApi'
import { bookApi } from '../../api/bookApi'
import { readerApi } from '../../api/readerApi'

const borrows = ref([])
const books = ref([])
const readers = ref([])

const keyword = ref('')
const statusFilter = ref(null)
const borrowFromDate = ref('')
const borrowToDate = ref('')

const page = ref(1)
const itemsPerPage = ref(10)

const loading = ref(false)
const creating = ref(false)
const loadingId = ref('')

const message = ref('')
const success = ref(true)

const createDialog = ref(false)
const returnDialog = ref(false)
const payDialog = ref(false)
const detailDialog = ref(false)

const selectedBorrow = ref(null)

const paymentMethod = ref('Tiền mặt')

const createForm = ref({
  readerId: '',
  bookId: '',
  borrowDate: toDateTimeLocal(new Date()),
  dueDate: toDateTimeLocal(addDays(new Date(), 7))
})

const returnForm = ref({
  returnDate: toDateTimeLocal(new Date())
})

const statusOptions = [
  { title: 'Đang mượn', value: 'Borrowed' },
  { title: 'Đã trả', value: 'Returned' }
]

const paymentMethods = [
  'Tiền mặt',
  'Chuyển khoản',
  'Ví điện tử'
]

const borrowingCount = computed(() =>
  borrows.value.filter(x => x.status === 'Borrowed').length
)

const returnedCount = computed(() =>
  borrows.value.filter(x => x.status === 'Returned').length
)

const unpaidFineCount = computed(() =>
  borrows.value.filter(x => Number(x.fineAmount || 0) > 0 && !x.isFinePaid).length
)

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

const readerItems = computed(() =>
  readers.value.map(reader => ({
    title: `${getReaderDisplayCode(reader)} - ${reader.fullName} - ${reader.email}`,
    value: reader.userId
  }))
)

const bookItems = computed(() =>
  books.value
    .filter(book => Number(book.availableCopies || 0) > 0)
    .map(book => ({
      title: `${book.isbn || shortId(book.id)} - ${book.title} - Còn ${book.availableCopies}`,
      value: book.id
    }))
)

const filteredBorrows = computed(() => {
  let data = [...borrows.value]

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

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  if (borrowFromDate.value) {
    const from = new Date(borrowFromDate.value)
    data = data.filter(item => new Date(item.borrowDate) >= from)
  }

  if (borrowToDate.value) {
    const to = new Date(borrowToDate.value)
    to.setHours(23, 59, 59, 999)
    data = data.filter(item => new Date(item.borrowDate) <= to)
  }

  return data
})

const pageCount = computed(() => {
  const total = Math.ceil(filteredBorrows.value.length / itemsPerPage.value)
  return total || 1
})

const paginatedBorrows = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  return filteredBorrows.value.slice(start, end)
})

watch([keyword, statusFilter, borrowFromDate, borrowToDate, itemsPerPage], () => {
  page.value = 1
})

async function loadAllData() {
  loading.value = true
  message.value = ''

  try {
    await Promise.all([
      loadReaders(),
      loadBooks(),
      loadBorrows()
    ])

    success.value = true
  } catch (err) {
    success.value = false
    message.value = 'Không tải được dữ liệu phiếu mượn'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

async function loadBorrows() {
  const res = await borrowApi.getAll()
  borrows.value = res.data
}

async function loadBooks() {
  const res = await bookApi.getAll()
  books.value = res.data
}

async function loadReaders() {
  const res = await readerApi.getAll()
  readers.value = res.data
}

function resetFilters() {
  keyword.value = ''
  statusFilter.value = null
  borrowFromDate.value = ''
  borrowToDate.value = ''
  page.value = 1
}

function openCreateDialog() {
  createForm.value = {
    readerId: '',
    bookId: '',
    borrowDate: toDateTimeLocal(new Date()),
    dueDate: toDateTimeLocal(addDays(new Date(), 7))
  }

  createDialog.value = true
}

function openReturnDialog(borrow) {
  selectedBorrow.value = borrow
  returnForm.value.returnDate = toDateTimeLocal(new Date())
  returnDialog.value = true
}

function openPayDialog(borrow) {
  selectedBorrow.value = borrow
  paymentMethod.value = 'Tiền mặt'
  payDialog.value = true
}

function openDetailDialog(borrow) {
  selectedBorrow.value = borrow
  detailDialog.value = true
}

async function createBorrow() {
  const error = validateCreateForm()

  if (error) {
    success.value = false
    message.value = error
    return
  }

  creating.value = true
  message.value = ''

  try {
    const res = await borrowApi.create({
      readerId: createForm.value.readerId,
      bookId: createForm.value.bookId,
      borrowDate: new Date(createForm.value.borrowDate).toISOString(),
      dueDate: new Date(createForm.value.dueDate).toISOString()
    })

    success.value = true
    message.value = res.data.message || 'Tạo phiếu mượn thành công'

    createDialog.value = false
    await loadAllData()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Tạo phiếu mượn thất bại'
    console.error(err.response || err)
  } finally {
    creating.value = false
  }
}

async function confirmReturnBook() {
  if (!selectedBorrow.value) return

  loadingId.value = selectedBorrow.value.id + '-return'
  message.value = ''

  try {
    const res = await borrowApi.returnBook(selectedBorrow.value.id, {
      returnDate: new Date(returnForm.value.returnDate).toISOString()
    })

    success.value = true
    message.value = res.data.message || 'Trả sách thành công'

    returnDialog.value = false
    await loadAllData()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Trả sách thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

async function confirmPayFine() {
  if (!selectedBorrow.value) return

  loadingId.value = selectedBorrow.value.id + '-pay'
  message.value = ''

  try {
    const res = await borrowApi.payFine(selectedBorrow.value.id)

    success.value = true
    message.value = res.data.message || `Thanh toán phí phạt thành công bằng ${paymentMethod.value}`

    payDialog.value = false
    await loadAllData()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Thanh toán phí phạt thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

function validateCreateForm() {
  if (!createForm.value.readerId) return 'Vui lòng chọn độc giả'
  if (!createForm.value.bookId) return 'Vui lòng chọn sách'
  if (!createForm.value.borrowDate) return 'Vui lòng chọn ngày mượn'
  if (!createForm.value.dueDate) return 'Vui lòng chọn hạn trả'

  const borrowDate = new Date(createForm.value.borrowDate)
  const dueDate = new Date(createForm.value.dueDate)

  if (dueDate <= borrowDate) {
    return 'Hạn trả phải lớn hơn ngày mượn'
  }

  return ''
}

function getReaderCode(borrow) {
  const reader = readerMap.value.get(borrow.readerId)

  if (!reader) return shortId(borrow.readerId)

  return getReaderDisplayCode(reader)
}

function getBookCode(borrow) {
  const book = bookMap.value.get(borrow.bookId)

  if (!book) return shortId(borrow.bookId)

  return book.isbn || shortId(book.id)
}

function getReaderDisplayCode(reader) {
  return reader.studentCode || reader.cardNumber || shortId(reader.userId)
}

function getBorrowStatusText(status) {
  if (status === 'Borrowed') return 'Đang mượn'
  if (status === 'Returned') return 'Đã trả'
  return status || '-'
}

function getPaymentText(borrow) {
  const fine = Number(borrow.fineAmount || 0)

  if (fine <= 0) return 'Không phát sinh'
  if (borrow.isFinePaid) return 'Đã thanh toán'
  return 'Chưa thanh toán'
}

function getPaymentColor(borrow) {
  const fine = Number(borrow.fineAmount || 0)

  if (fine <= 0) return 'success'
  if (borrow.isFinePaid) return 'success'
  return 'error'
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

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toDateTimeLocal(date) {
  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
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

.info-box {
  min-height: 78px;
  padding: 14px 16px;
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