<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Quản lý sách</div>
        <div class="page-subtitle">Tra cứu, thêm mới và quản lý kho tài liệu của thư viện</div>
      </div>

      <v-spacer />

      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadBooks">
        Tải lại
      </v-btn>

      <v-btn v-if="canManageBook" variant="outlined" color="primary" prepend-icon="mdi-file-excel-outline"
        @click="importDialog = true">
        Nhập Excel
      </v-btn>

      <v-btn v-if="canManageBook" color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Thêm sách
      </v-btn>
    </div>

    <ImportExcelDialog v-model="importDialog" entity-label="sách" :template-columns="bookImportColumns"
      :upload-fn="bookApi.importExcel" @imported="loadBooks" />

    <v-alert v-if="message" :type="success ? 'success' : 'error'" variant="tonal" class="mb-4" rounded="lg" closable
      @click:close="message = ''">
      {{ message }}
    </v-alert>

    <!-- Toolbar tìm kiếm/lọc - gọn theo Stitch, không còn 4 stat-card -->
    <div class="toolbar-row">
      <div class="search-box">
        <v-icon icon="mdi-magnify" size="20" />
        <input v-model="keyword" placeholder="Tìm tựa sách, tác giả, ISBN..." @keyup.enter="loadBooks" />
      </div>

      <v-select v-model="category" :items="categoryOptions" label="Tất cả thể loại" density="comfortable"
        variant="outlined" hide-details clearable class="toolbar-select" />

      <v-select v-model="statusFilter" :items="statusOptions" label="Trạng thái" density="comfortable"
        variant="outlined" hide-details clearable class="toolbar-select" />
    </div>

    <!-- Layout 2 cột: bảng + panel chi tiết -->
    <div class="content-split">
      <v-card class="table-card" :class="{ 'table-card-narrow': selectedBook }">
        <div class="table-scroll">
          <v-table>
            <thead>
              <tr>
                <th v-if="canManageBook" style="width: 44px;">
                  <v-checkbox-btn v-model="allCurrentPageSelected" :indeterminate="isCurrentPageIndeterminate"
                    color="primary" />
                </th>
                <th>Tựa sách &amp; Tác giả</th>
                <th>Thể loại</th>
                <th v-if="!selectedBook">NXB</th>
                <th v-if="!selectedBook">Còn / Tổng</th>
                <th>Trạng thái</th>
                <th v-if="canManageBook" class="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="book in paginatedBooks" :key="book.id" :class="{ 'row-active': selectedBook?.id === book.id }">
                <td v-if="canManageBook">
                  <v-checkbox-btn v-model="selectedBookIds" :value="book.id" color="primary" />
                </td>

                <td>
                  <div class="title-cell">
                    <div class="book-cover">
                      <v-img v-if="hasCover(book)" :src="book.coverUrl" width="44" height="60" cover rounded="lg"
                        @error="markImageError(book.id)" />
                      <div v-else class="cover-fallback">
                        <v-icon icon="mdi-book-open-page-variant" size="22" />
                      </div>
                    </div>

                    <div class="min-width-0">
                      <div class="font-weight-bold text-truncate">{{ book.title }}</div>
                      <div class="text-caption text-grey-darken-1">{{ book.author }}</div>
                    </div>
                  </div>
                </td>

                <td>{{ book.category || '-' }}</td>
                <td v-if="!selectedBook">{{ book.publisher || '-' }}</td>
                <td v-if="!selectedBook">
                  <span
                    :class="Number(book.availableCopies || 0) > 0 ? 'text-success font-weight-bold' : 'text-error font-weight-bold'">
                    {{ book.availableCopies }}
                  </span>
                  / {{ book.totalCopies }}
                </td>

                <td>
                  <v-chip :color="isBookAvailable(book) ? 'success' : 'error'" size="small" variant="tonal">
                    {{ isBookAvailable(book) ? 'Còn sách' : 'Hết sách' }}
                  </v-chip>
                </td>

                <td v-if="canManageBook">
                  <div class="d-flex justify-center ga-1">
                    <v-tooltip text="Xem chi tiết">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-eye" size="small" color="info" variant="tonal"
                          @click="openDetail(book)" />
                      </template>
                    </v-tooltip>

                    <v-tooltip text="Sửa sách">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-pencil" size="small" color="warning" variant="tonal"
                          @click="openEditDialog(book)" />
                      </template>
                    </v-tooltip>

                    <v-tooltip text="Xóa sách">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-delete" size="small" color="error" variant="tonal"
                          @click="deleteBook(book)" />
                      </template>
                    </v-tooltip>
                  </div>
                </td>
              </tr>

              <tr v-if="paginatedBooks.length === 0">
                <td :colspan="8" class="text-center pa-8">
                  <v-icon icon="mdi-database-search-outline" size="46" color="grey" />
                  <div class="text-subtitle-1 font-weight-bold mt-2">Không tìm thấy sách phù hợp</div>
                  <div class="text-body-2 text-grey-darken-1">Thử thay đổi từ khóa, thể loại hoặc trạng thái lọc.</div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-divider />

        <div class="d-flex align-center justify-space-between flex-wrap pa-4 ga-3">
          <div class="text-body-2 text-grey-darken-1">
            Hiển thị <b>{{ paginatedBooks.length }}</b> trong số <b>{{ filteredBooks.length }}</b> sách
          </div>

          <v-pagination v-model="page" :length="pageCount" rounded="circle" density="comfortable" total-visible="5" />
        </div>
      </v-card>

      <!-- Panel chi tiết bên phải -->
      <transition name="dl-slide">
        <v-card v-if="selectedBook" class="detail-panel" rounded="lg">
          <div class="detail-panel-header">
            <h3>Chi tiết đầu sách</h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="selectedBook = null" />
          </div>

          <div class="detail-panel-body">
            <div class="detail-top">
              <div class="detail-cover-sm">
                <v-img v-if="hasCover(selectedBook)" :src="selectedBook.coverUrl" width="96" height="128" cover
                  rounded="lg" />
                <div v-else class="cover-fallback" style="width:96px;height:128px;">
                  <v-icon icon="mdi-book-open-page-variant" size="28" />
                </div>
              </div>

              <div class="min-width-0">
                <div class="detail-title">{{ selectedBook.title }}</div>
                <div class="detail-author">{{ selectedBook.author }}</div>
                <div class="detail-meta">{{ selectedBook.publisher || 'Chưa rõ NXB' }}, {{
                  getPublishedYear(selectedBook) ||
                  '-'
                  }}</div>

                <div class="detail-description">
                  {{ selectedBook.description || 'Chưa có mô tả cho sách này.' }}
                </div>

                <div class="detail-chips">
                  <v-chip size="small" variant="tonal" color="primary">{{ selectedBook.category || 'Khác' }}</v-chip>
                  <v-chip size="small" variant="tonal">ISBN: {{ selectedBook.isbn || shortId(selectedBook.id)
                    }}</v-chip>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <button class="detail-action-btn" type="button" @click="openEditDialog(selectedBook)">
                <v-icon icon="mdi-pencil-outline" size="20" />
                <span>Chỉnh sửa</span>
              </button>

              <button class="detail-action-btn" type="button" @click="barcodeDialog = true">
                <v-icon icon="mdi-barcode" size="20" />
                <span>Mã vạch</span>
              </button>

              <button class="detail-action-btn" type="button" @click="openHistory(selectedBook)">
                <v-icon icon="mdi-history" size="20" />
                <span>Lịch sử</span>
              </button>
            </div>

            <v-divider class="my-4" />

            <div class="copies-header">
              <h4>Danh sách bản sao ({{ selectedBook.totalCopies || 0 }})</h4>
            </div>

            <div class="copies-tabs">
              <button v-for="tab in copyTabs" :key="tab.value" class="copies-tab"
                :class="{ 'copies-tab-active': copyTab === tab.value }" @click="copyTab = tab.value">
                {{ tab.label }}
              </button>
            </div>

            <div class="copies-list">
              <div v-for="copy in filteredCopies" :key="copy.code" class="copy-item">
                <v-icon icon="mdi-book-outline" size="18" color="var(--dl-text-muted)" />
                <div class="copy-info">
                  <div class="copy-code">{{ copy.code }}</div>
                </div>
                <v-chip size="small" :color="copy.available ? 'success' : 'warning'" variant="tonal">
                  {{ copy.available ? 'Sẵn sàng' : 'Đang mượn' }}
                </v-chip>
              </div>

              <div v-if="!filteredCopies.length" class="copies-empty">Không có bản sao trong nhóm này.</div>
            </div>

            <p class="copies-note">
              * Danh sách minh họa theo số liệu tổng/còn lại — hệ thống hiện chưa quản lý mã riêng cho từng bản sao.
            </p>
          </div>
        </v-card>
      </transition>
    </div>

    <!-- Bulk action bar nổi -->
    <transition name="dl-fade">
      <div v-if="selectedBookIds.length" class="bulk-bar">
        <div class="bulk-count">
          <strong>{{ selectedBookIds.length }}</strong> sách đã chọn
        </div>

        <v-divider vertical class="bulk-divider" />

        <button class="bulk-btn bulk-btn-danger" type="button" @click="deleteSelectedBooks">
          <v-icon icon="mdi-delete-outline" size="18" /> Xóa
        </button>

        <button class="bulk-btn bulk-btn-gold" type="button" @click="exportSelectedCsv">
          <v-icon icon="mdi-file-excel-outline" size="18" /> Xuất CSV
        </button>

        <button class="bulk-btn bulk-btn-ghost" type="button" @click="selectedBookIds = []">
          Bỏ chọn
        </button>
      </div>
    </transition>

    <!-- Dialog tạo/sửa sách -->
    <v-dialog v-model="dialog" max-width="980">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon :icon="isEditMode ? 'mdi-pencil' : 'mdi-plus-circle'" class="mr-2" color="primary" />
          {{ isEditMode ? 'Sửa thông tin sách' : 'Thêm sách mới' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="8">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.isbn" label="Mã sách / ISBN" prepend-inner-icon="mdi-barcode" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="form.title" label="Tên sách" prepend-inner-icon="mdi-book-open-page-variant" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="form.author" label="Tác giả" prepend-inner-icon="mdi-account-edit" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="form.publisher" label="Nhà xuất bản" prepend-inner-icon="mdi-domain" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="form.category" label="Thể loại" prepend-inner-icon="mdi-shape-outline" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="form.publishedYear" label="Năm xuất bản" type="number"
                    prepend-inner-icon="mdi-calendar" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="form.totalCopies" label="Tổng số bản" type="number"
                    prepend-inner-icon="mdi-counter" />
                </v-col>

                <v-col cols="12">
                  <v-textarea v-model="form.description" label="Mô tả" prepend-inner-icon="mdi-text" rows="2" />
                </v-col>

                <v-col cols="12">
                  <v-text-field v-model="form.coverUrl" label="Link ảnh bìa" prepend-inner-icon="mdi-image" />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="soft-card pa-4 h-100">
                <div class="text-subtitle-2 font-weight-bold mb-3">Xem trước ảnh bìa</div>

                <div class="preview-cover">
                  <v-img v-if="form.coverUrl" :src="form.coverUrl" height="260" cover rounded="xl">
                    <template #error>
                      <div class="preview-fallback">
                        <v-icon icon="mdi-image-broken" size="42" />
                        <div class="text-body-2 mt-2">Không tải được ảnh</div>
                      </div>
                    </template>
                  </v-img>

                  <div v-else class="preview-fallback">
                    <v-icon icon="mdi-book-open-page-variant" size="56" />
                    <div class="text-body-2 mt-2">Chưa nhập link ảnh bìa</div>
                  </div>
                </div>

                <div class="text-caption text-grey-darken-1 mt-3">
                  Nên dùng ảnh dọc, rõ bìa sách, định dạng JPG/PNG/WebP.
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Hủy</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="saveBook">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog mã vạch -->
    <v-dialog v-model="barcodeDialog" max-width="380">
      <v-card rounded="lg" class="pa-5 text-center" v-if="selectedBook">
        <h3 class="mb-4">Mã vạch sách</h3>

        <div class="barcode-visual">
          <span v-for="n in 28" :key="n" :style="{ width: (n % 3 === 0 ? '3px' : '1.5px') }"></span>
        </div>

        <div class="barcode-isbn">{{ selectedBook.isbn || shortId(selectedBook.id) }}</div>
        <div class="barcode-title">{{ selectedBook.title }}</div>

        <v-btn block variant="tonal" color="primary" class="mt-4" @click="barcodeDialog = false">Đóng</v-btn>
      </v-card>
    </v-dialog>

    <!-- Dialog lịch sử mượn của sách -->
    <v-dialog v-model="historyDialog" max-width="560">
      <v-card rounded="lg" v-if="selectedBook">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-history" color="primary" class="mr-2" />
          Lịch sử mượn: {{ selectedBook.title }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="historyDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <div v-if="loadingHistory" class="text-center pa-6">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="!bookHistory.length" class="text-center pa-6 text-medium-emphasis">
            Chưa có lượt mượn nào được ghi nhận cho sách này.
          </div>

          <div v-else class="history-list">
            <div v-for="item in bookHistory" :key="item.id" class="history-item">
              <v-icon icon="mdi-account-circle-outline" size="20" color="var(--dl-text-muted)" />
              <div class="min-width-0">
                <div class="font-weight-bold">{{ item.readerName }}</div>
                <div class="text-caption text-grey-darken-1">
                  Mượn {{ formatDate(item.borrowDate) }} ·
                  {{ item.returnDate ? `Trả ${formatDate(item.returnDate)}` : 'Đang mượn' }}
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { bookApi } from '../../api/bookApi'
import { borrowApi } from '../../api/borrowApi'
import { useAuthStore } from '../../stores/authStore'
import ImportExcelDialog from '../../components/ImportExcelDialog.vue'

const auth = useAuthStore()

const importDialog = ref(false)

// Cột mẫu sách cho download template. Thứ tự và tên cột khớp với yêu cầu:
// mã sách, tên sách, tác giả, nhà xuất bản, thẻ loại, năm xuất bản,
// mô tả, tổng số bản, số bản còn lại, link ảnh bìa (link address image ảnh trực tuyến).
const bookImportColumns = [
  { key: 'isbn', label: 'Mã sách / ISBN', required: true },
  { key: 'title', label: 'Tên sách', required: true },
  { key: 'author', label: 'Tác giả', required: true },
  { key: 'publisher', label: 'Nhà xuất bản', required: false },
  { key: 'category', label: 'Thể loại', required: true },
  { key: 'publishedYear', label: 'Năm xuất bản', required: false },
  { key: 'description', label: 'Mô tả', required: false },
  { key: 'totalCopies', label: 'Tổng số bản', required: true },
  { key: 'availableCopies', label: 'Số bản còn lại', required: true },
  { key: 'coverUrl', label: 'Link ảnh bìa (link address image ảnh trực tuyến)', required: false }
]

const books = ref([])
const selectedBookIds = ref([])
const brokenImageIds = ref([])

const keyword = ref('')
const category = ref('')
const statusFilter = ref(null)

const page = ref(1)
const itemsPerPage = ref(10)

const dialog = ref(false)
const selectedBook = ref(null)
const barcodeDialog = ref(false)
const historyDialog = ref(false)
const bookHistory = ref([])
const loadingHistory = ref(false)
const copyTab = ref('all')

const loading = ref(false)
const saving = ref(false)
const isEditMode = ref(false)
const selectedBookId = ref(null)

const message = ref('')
const success = ref(true)

const form = ref({
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  publishedYear: null,
  category: '',
  description: '',
  coverUrl: '',
  totalCopies: null,
  availableCopies: null
})

const statusOptions = [
  { title: 'Còn sách', value: 'available' },
  { title: 'Hết sách', value: 'unavailable' }
]

const copyTabs = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang có sẵn', value: 'available' },
  { label: 'Đang mượn', value: 'borrowed' }
]

const canManageBook = computed(() => ['Admin', 'Librarian'].includes(auth.role))

const categoryOptions = computed(() => {
  const set = new Set(books.value.map(b => b.category).filter(Boolean))
  return Array.from(set)
})

const filteredBooks = computed(() => {
  let data = [...books.value]

  if (keyword.value) {
    const search = keyword.value.toLowerCase().trim()
    data = data.filter(book =>
      String(book.isbn || '').toLowerCase().includes(search) ||
      String(book.title || '').toLowerCase().includes(search) ||
      String(book.author || '').toLowerCase().includes(search)
    )
  }

  if (category.value) {
    data = data.filter(book => book.category === category.value)
  }

  if (statusFilter.value === 'available') data = data.filter(book => isBookAvailable(book))
  if (statusFilter.value === 'unavailable') data = data.filter(book => !isBookAvailable(book))

  return data
})

const pageCount = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage.value) || 1)

const paginatedBooks = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return filteredBooks.value.slice(start, start + itemsPerPage.value)
})

const allCurrentPageSelected = computed({
  get() {
    if (paginatedBooks.value.length === 0) return false
    return paginatedBooks.value.every(book => selectedBookIds.value.includes(book.id))
  },
  set(value) {
    const ids = paginatedBooks.value.map(book => book.id)

    if (value) {
      selectedBookIds.value = Array.from(new Set([...selectedBookIds.value, ...ids]))
    } else {
      selectedBookIds.value = selectedBookIds.value.filter(id => !ids.includes(id))
    }
  }
})

const isCurrentPageIndeterminate = computed(() => {
  const ids = paginatedBooks.value.map(book => book.id)
  const selectedCount = ids.filter(id => selectedBookIds.value.includes(id)).length
  return selectedCount > 0 && selectedCount < ids.length
})

// Danh sách bản sao minh họa - suy ra từ totalCopies/availableCopies thật,
// vì backend chưa có entity quản lý từng bản sao riêng lẻ.
const allCopies = computed(() => {
  if (!selectedBook.value) return []

  const total = Number(selectedBook.value.totalCopies || 0)
  const available = Number(selectedBook.value.availableCopies || 0)
  const isbn = selectedBook.value.isbn || shortId(selectedBook.value.id)

  return Array.from({ length: total }, (_, i) => ({
    code: `${isbn}-${String(i + 1).padStart(2, '0')}`,
    available: i < available
  }))
})

const filteredCopies = computed(() => {
  if (copyTab.value === 'available') return allCopies.value.filter(c => c.available)
  if (copyTab.value === 'borrowed') return allCopies.value.filter(c => !c.available)
  return allCopies.value
})

watch([keyword, category, statusFilter, itemsPerPage], () => {
  page.value = 1
})

watch(selectedBook, () => {
  copyTab.value = 'all'
})

async function loadBooks() {
  loading.value = true
  message.value = ''

  // Backend luôn phân trang (mặc định pageSize=10 nếu không truyền). App này đang
  // lọc/phân trang phía client trên toàn bộ kết quả khớp, nên cần xin số lượng lớn
  // trong 1 lần gọi để không bị cắt mất dữ liệu.
  const params = { page: 1, pageSize: 1000 }
  if (keyword.value) params.keyword = keyword.value
  if (category.value) params.category = category.value

  try {
    const res = await bookApi.getAll(params)
    books.value = (res.data || []).map(book => ({
      ...book,
      publishedYear: book.publishedYear ?? book.publishingYear
    }))
    selectedBookIds.value = []
    success.value = true
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được danh sách sách'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    isbn: '', title: '', author: '', publisher: '',
    publishedYear: null, category: '', description: '',
    coverUrl: '', totalCopies: null, availableCopies: null
  }
}

function openCreateDialog() {
  isEditMode.value = false
  selectedBookId.value = null
  resetForm()
  dialog.value = true
}

function openEditDialog(book) {
  isEditMode.value = true
  selectedBookId.value = book.id

  form.value = {
    isbn: book.isbn, title: book.title, author: book.author,
    publisher: book.publisher,
    publishedYear: book.publishedYear ?? book.publishingYear ?? null,
    category: book.category, description: book.description || '', coverUrl: book.coverUrl,
    totalCopies: book.totalCopies ?? null, availableCopies: book.availableCopies ?? null
  }

  dialog.value = true
}

function openDetail(book) {
  selectedBook.value = selectedBook.value?.id === book.id ? null : book
}

async function openHistory(book) {
  historyDialog.value = true
  loadingHistory.value = true

  try {
    const res = await borrowApi.getAll()
    bookHistory.value = (res.data || []).filter(b => b.bookId === book.id)
  } catch (err) {
    bookHistory.value = []
    console.error(err.response || err)
  } finally {
    loadingHistory.value = false
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function normalizeOptionalNumber(value) {
  if (value === '' || value == null) return null
  const normalized = Number(value)
  return Number.isNaN(normalized) ? null : normalized
}

function validateForm() {
  if (!form.value.isbn) return 'Mã sách / ISBN không được để trống'
  if (!form.value.title) return 'Tên sách không được để trống'
  if (!form.value.author) return 'Tác giả không được để trống'

  const publishedYear = normalizeOptionalNumber(form.value.publishedYear)
  const totalCopies = normalizeOptionalNumber(form.value.totalCopies)
  const availableCopies = normalizeOptionalNumber(form.value.availableCopies)

  if (publishedYear != null && publishedYear <= 0) return 'Năm xuất bản không hợp lệ'
  if (totalCopies != null && totalCopies <= 0) return 'Tổng số bản phải lớn hơn 0'
  if (availableCopies != null && availableCopies < 0) return 'Số bản còn lại không được âm'
  if (totalCopies != null && availableCopies != null && availableCopies > totalCopies) {
    return 'Số bản còn lại không được lớn hơn tổng số bản'
  }

  return ''
}

async function saveBook() {
  const error = validateForm()

  if (error) {
    success.value = false
    message.value = error
    return
  }

  saving.value = true
  message.value = ''

  try {
    const payload = { ...form.value }
    payload.publishedYear = normalizeOptionalNumber(payload.publishedYear)
    payload.totalCopies = normalizeOptionalNumber(payload.totalCopies)
    payload.availableCopies = normalizeOptionalNumber(payload.availableCopies)

    if (payload.publishedYear == null) delete payload.publishedYear
    if (payload.totalCopies == null) delete payload.totalCopies
    if (payload.availableCopies == null) delete payload.availableCopies

    if (!isEditMode.value && payload.totalCopies != null && payload.availableCopies == null) {
      payload.availableCopies = payload.totalCopies
    }

    if (isEditMode.value) {
      await bookApi.update(selectedBookId.value, payload)
      success.value = true
      message.value = 'Cập nhật sách thành công'
    } else {
      await bookApi.create(payload)
      success.value = true
      message.value = 'Thêm sách thành công'
    }

    dialog.value = false
    await loadBooks()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Lưu sách thất bại'
    console.error(err.response || err)
  } finally {
    saving.value = false
  }
}

function getPublishedYear(book) {
  return book?.publishedYear ?? book?.publishingYear
}

async function deleteBook(book) {
  const confirmed = confirm(`Bạn có chắc muốn xóa sách "${book.title}" không?`)
  if (!confirmed) return

  try {
    await bookApi.remove(book.id)
    success.value = true
    message.value = 'Xóa sách thành công'

    if (selectedBook.value?.id === book.id) selectedBook.value = null
    await loadBooks()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Xóa sách thất bại'
    console.error(err.response || err)
  }
}

async function deleteSelectedBooks() {
  if (selectedBookIds.value.length === 0) return

  const confirmed = confirm(`Bạn có chắc muốn xóa ${selectedBookIds.value.length} sách đã chọn không? Hành động này không thể hoàn tác.`)
  if (!confirmed) return

  loading.value = true
  message.value = ''

  try {
    for (const id of selectedBookIds.value) {
      await bookApi.remove(id)
    }

    success.value = true
    message.value = `Đã xóa ${selectedBookIds.value.length} sách`

    selectedBookIds.value = []
    selectedBook.value = null
    await loadBooks()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Xóa nhiều sách thất bại'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function exportSelectedCsv() {
  const selected = books.value.filter(b => selectedBookIds.value.includes(b.id))
  if (!selected.length) return

  const cols = ['isbn', 'title', 'author', 'publisher', 'category', 'publishedYear', 'totalCopies', 'availableCopies']
  const header = cols.join(',')
  const body = selected.map(b => cols.map(c => `"${String(b[c] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const csv = `${header}\n${body}`

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sach-da-chon-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function isBookAvailable(book) {
  if (typeof book.isAvailable === 'boolean') return book.isAvailable
  return Number(book.availableCopies || 0) > 0
}

function hasCover(book) {
  if (!book?.coverUrl && !book?.coverImageUrl) return false
  return !brokenImageIds.value.includes(book.id)
}

function markImageError(id) {
  if (!brokenImageIds.value.includes(id)) brokenImageIds.value.push(id)
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(0, 8)
}

onMounted(loadBooks)
</script>

<style scoped>
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

.toolbar-row {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.toolbar-select {
  max-width: 200px;
}

.content-split {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.table-card {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--dl-surface-variant);
  box-shadow: var(--dl-shadow-card);
}

.table-card-narrow {
  flex: 1.4;
}

.table-scroll {
  overflow-x: auto;
}

.row-active {
  background: rgba(38, 67, 97, 0.05);
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.book-cover {
  width: 44px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f5f9;
  flex: 0 0 auto;
}

.cover-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #94a3b8;
  background: #f8fafc;
}

.min-width-0 {
  min-width: 0;
}

/* Detail panel */
.detail-panel {
  width: 380px;
  flex: 0 0 380px;
  border: 1px solid var(--dl-surface-variant);
  box-shadow: var(--dl-shadow-card);
  position: sticky;
  top: 88px;
}

.detail-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--dl-border);
}

.detail-panel-header h3 {
  font-family: var(--dl-font-headline);
  font-size: 17px;
  color: var(--dl-primary-dark);
  margin: 0;
}

.detail-panel-body {
  padding: 18px;
}

.detail-top {
  display: flex;
  gap: 14px;
}

.detail-cover-sm {
  flex: 0 0 auto;
  border-radius: 10px;
  overflow: hidden;
}

.detail-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 16.5px;
  color: var(--dl-text-primary);
  line-height: 1.3;
}

.detail-author {
  font-size: 13px;
  color: var(--dl-text-muted);
  margin-top: 2px;
}

.detail-meta {
  font-size: 12px;
  color: var(--dl-text-muted);
  margin-top: 4px;
}

.detail-description {
  margin-top: 10px;
  font-size: 13px;
  color: var(--dl-text-muted);
  line-height: 1.6;
}

.detail-chips {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.detail-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 18px;
}

.detail-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px;
  border-radius: var(--dl-radius-md);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  color: var(--dl-text-primary);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.detail-action-btn:hover {
  background: var(--dl-surface-container-low);
  border-color: var(--dl-primary);
  color: var(--dl-primary);
}

.copies-header h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 10px;
}

.copies-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.copies-tab {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--dl-radius-full);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  cursor: pointer;
  color: var(--dl-text-muted);
}

.copies-tab-active {
  background: var(--dl-primary-dark);
  border-color: var(--dl-primary-dark);
  color: #fff;
}

.copies-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.copy-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-surface-container-low);
}

.copy-info {
  flex: 1;
  min-width: 0;
}

.copy-code {
  font-size: 13px;
  font-weight: 600;
  color: var(--dl-text-primary);
}

.copies-empty {
  text-align: center;
  font-size: 13px;
  color: var(--dl-text-muted);
  padding: 16px 0;
}

.copies-note {
  font-size: 11px;
  color: var(--dl-text-muted);
  margin-top: 12px;
  line-height: 1.5;
}

/* Bulk action bar */
.bulk-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  border-radius: var(--dl-radius-full);
  background: var(--dl-primary-dark);
  color: #fff;
  box-shadow: 0 16px 40px rgba(22, 38, 58, 0.35);
}

.bulk-count {
  font-size: 13.5px;
  white-space: nowrap;
}

.bulk-divider {
  height: 22px;
  border-color: rgba(255, 255, 255, 0.25) !important;
}

.bulk-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: var(--dl-radius-full);
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.bulk-btn-danger {
  background: rgba(220, 38, 38, 0.18);
  color: #fecaca;
}

.bulk-btn-danger:hover {
  background: var(--dl-error);
  color: #fff;
}

.bulk-btn-gold {
  background: rgba(240, 168, 94, 0.2);
  color: var(--dl-accent-gold);
}

.bulk-btn-gold:hover {
  background: var(--dl-accent-gold);
  color: #1a1300;
}

.bulk-btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
}

.bulk-btn-ghost:hover {
  color: #fff;
}

/* Barcode visual */
.barcode-visual {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 2px;
  height: 64px;
  margin: 0 auto 12px;
}

.barcode-visual span {
  background: #111;
  display: inline-block;
}

.barcode-isbn {
  font-family: monospace;
  font-size: 16px;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--dl-text-primary);
}

.barcode-title {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin-top: 4px;
}

/* History dialog */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

/* Preview cover (dialog tạo/sửa) */
.preview-cover {
  min-height: 260px;
  border-radius: 22px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.preview-fallback {
  width: 100%;
  height: 100%;
  min-height: 260px;
  display: grid;
  place-items: center;
  color: #64748b;
  background: #f8fafc;
  text-align: center;
}

.dl-fade-enter-active,
.dl-fade-leave-active,
.dl-slide-enter-active,
.dl-slide-leave-active {
  transition: all 0.2s ease;
}

.dl-fade-enter-from,
.dl-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.dl-slide-enter-from,
.dl-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (max-width: 1100px) {
  .content-split {
    flex-direction: column;
  }

  .detail-panel {
    width: 100%;
    flex: 1 1 auto;
    position: static;
  }
}
</style>
