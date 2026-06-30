<template>
  <div class="circulation-page">
    <div class="page-title">Quầy lưu thông</div>
    <div class="page-subtitle">Thực hiện giao dịch mượn và trả sách cho độc giả</div>

    <v-alert
      v-if="message"
      :type="success ? 'success' : 'error'"
      variant="tonal"
      class="mb-5 mt-4"
      rounded="lg"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <div class="desk-grid">
      <!-- ───────── Giao dịch mượn ───────── -->
      <v-card class="desk-card" rounded="lg">
        <div class="desk-card-header">
          <v-icon icon="mdi-book-arrow-right-outline" color="primary" size="22" />
          <div>
            <h2>Giao dịch mượn</h2>
            <p>Tìm bạn đọc và sách để thực hiện mượn.</p>
          </div>
        </div>

        <label class="field-label">Bạn đọc</label>
        <v-autocomplete
          v-model="selectedReaderId"
          :items="readers"
          item-title="fullName"
          item-value="userId"
          placeholder="Tìm theo tên, email hoặc mã độc giả..."
          prepend-inner-icon="mdi-account-search-outline"
          density="comfortable"
          clearable
          no-data-text="Không tìm thấy độc giả"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.raw.fullName"
              :subtitle="item.raw.email"
            />
          </template>
        </v-autocomplete>

        <transition name="dl-fade">
          <div v-if="selectedReader" class="reader-summary">
            <v-avatar color="primary" variant="tonal" size="46">
              <v-icon icon="mdi-account" size="24" />
            </v-avatar>

            <div class="reader-summary-info">
              <div class="reader-summary-name">{{ selectedReader.fullName }}</div>
              <div class="reader-summary-meta">{{ selectedReader.email }}</div>
            </div>

            <div class="reader-summary-right">
              <v-chip
                size="small"
                :color="selectedReader.cardStatus === 'Active' ? 'success' : 'error'"
                variant="tonal"
              >
                {{ selectedReader.cardStatus === 'Active' ? 'Hợp lệ' : 'Thẻ bị khóa' }}
              </v-chip>
              <div class="reader-quota">
                Hạn mức: {{ readerCurrentBorrowCount }}/5
              </div>
            </div>
          </div>
        </transition>

        <label class="field-label mt-5">Thêm sách vào phiếu mượn</label>
        <v-autocomplete
          v-model="bookToAdd"
          :items="borrowableBooks"
          item-title="title"
          item-value="id"
          placeholder="Tìm theo tên sách hoặc ISBN..."
          prepend-inner-icon="mdi-barcode-scan"
          density="comfortable"
          clearable
          no-data-text="Không tìm thấy sách còn trống"
          @update:model-value="addBookToCart"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.raw.title"
              :subtitle="`${item.raw.author || ''} · ISBN: ${item.raw.isbn || '-'}`"
            />
          </template>
        </v-autocomplete>

        <div class="cart-list">
          <div v-if="!cart.length" class="cart-empty">Chưa có sách nào trong phiếu mượn.</div>

          <div v-for="book in cart" :key="book.id" class="cart-item">
            <v-icon icon="mdi-book-open-page-variant-outline" size="20" color="var(--dl-primary)" />
            <div class="cart-item-info">
              <div class="cart-item-title">{{ book.title }}</div>
              <div class="cart-item-isbn">ISBN: {{ book.isbn || '-' }}</div>
            </div>
            <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeFromCart(book.id)" />
          </div>
        </div>

        <div class="due-date-row">
          <span>Ngày đến hạn:</span>
          <strong>{{ formatDate(dueDatePreview) }}</strong>
        </div>

        <v-btn
          block
          size="large"
          color="primary"
          rounded="lg"
          class="mt-4"
          prepend-icon="mdi-check-circle-outline"
          :disabled="!selectedReaderId || !cart.length"
          @click="confirmBorrowDialog = true"
        >
          Xác nhận mượn
        </v-btn>
      </v-card>

      <!-- ───────── Giao dịch trả ───────── -->
      <v-card class="desk-card" rounded="lg">
        <div class="desk-card-header">
          <v-icon icon="mdi-book-arrow-left-outline" color="warning" size="22" />
          <div>
            <h2>Giao dịch trả</h2>
            <p>Tìm phiếu mượn để xử lý trả sách.</p>
          </div>
        </div>

        <label class="field-label">Phiếu mượn đang hoạt động</label>
        <v-autocomplete
          v-model="selectedReturnId"
          :items="activeBorrows"
          item-title="bookTitle"
          item-value="id"
          placeholder="Tìm theo tên sách hoặc tên độc giả..."
          prepend-inner-icon="mdi-barcode-scan"
          density="comfortable"
          clearable
          no-data-text="Không có phiếu mượn đang hoạt động"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.raw.bookTitle"
              :subtitle="`${item.raw.readerName} · Mượn ${formatDate(item.raw.borrowDate)}`"
            />
          </template>
        </v-autocomplete>

        <transition name="dl-fade">
          <div v-if="selectedReturn" class="return-summary" :class="{ 'return-summary-overdue': overdueDays(selectedReturn) > 0 }">
            <v-icon icon="mdi-book-open-page-variant" size="28" color="var(--dl-primary)" />

            <div class="return-summary-info">
              <div class="return-summary-title">{{ selectedReturn.bookTitle }}</div>
              <div class="return-summary-meta">{{ selectedReturn.readerName }}</div>
              <div class="return-summary-meta">Ngày mượn: {{ formatDate(selectedReturn.borrowDate) }}</div>

              <div v-if="overdueDays(selectedReturn) > 0" class="overdue-tag">
                <v-icon icon="mdi-alert-circle" size="14" />
                Quá hạn {{ overdueDays(selectedReturn) }} ngày
              </div>
            </div>
          </div>
        </transition>

        <template v-if="selectedReturn">
          <label class="field-label mt-5">Đánh giá tình trạng</label>
          <div class="condition-options">
            <button
              type="button"
              class="condition-btn"
              :class="{ 'condition-btn-active': condition === 'Normal' }"
              @click="condition = 'Normal'"
            >
              <v-icon icon="mdi-check" size="16" /> Bình thường
            </button>
            <button
              type="button"
              class="condition-btn"
              :class="{ 'condition-btn-active': condition === 'Damaged' }"
              @click="condition = 'Damaged'"
            >
              <v-icon icon="mdi-alert-outline" size="16" /> Hư hỏng/Mất mát
            </button>
          </div>

          <div v-if="estimatedFine > 0" class="fine-preview">
            <v-icon icon="mdi-cash-multiple" size="18" />
            <span>Phạt quá hạn (tạm tính):</span>
            <strong>{{ formatMoney(estimatedFine) }}</strong>
          </div>
        </template>

        <v-spacer />

        <v-btn
          block
          size="large"
          color="warning"
          rounded="lg"
          class="mt-4"
          prepend-icon="mdi-check-circle-outline"
          :disabled="!selectedReturnId"
          @click="confirmReturnDialog = true"
        >
          Xác nhận trả
        </v-btn>
      </v-card>
    </div>

    <!-- Dialog xác nhận mượn -->
    <v-dialog v-model="confirmBorrowDialog" max-width="440">
      <v-card rounded="lg" class="confirm-dialog">
        <v-card-title class="confirm-title">Xác nhận giao dịch mượn</v-card-title>
        <v-card-text>
          <p>
            Bạn đọc <strong>{{ selectedReader?.fullName }}</strong> sẽ mượn
            <strong>{{ cart.length }}</strong> cuốn sách, hạn trả ngày
            <strong>{{ formatDate(dueDatePreview) }}</strong>.
          </p>
          <ul class="confirm-book-list">
            <li v-for="book in cart" :key="book.id">{{ book.title }}</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmBorrowDialog = false">Hủy</v-btn>
          <v-btn color="primary" :loading="borrowing" @click="submitBorrow">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xác nhận trả -->
    <v-dialog v-model="confirmReturnDialog" max-width="440">
      <v-card rounded="lg" class="confirm-dialog">
        <v-card-title class="confirm-title">Xác nhận giao dịch trả</v-card-title>
        <v-card-text>
          <p>
            Xác nhận trả sách <strong>{{ selectedReturn?.bookTitle }}</strong> của
            <strong>{{ selectedReturn?.readerName }}</strong>.
          </p>
          <p v-if="estimatedFine > 0" class="confirm-fine-line">
            Khoản phạt quá hạn tạm tính: <strong>{{ formatMoney(estimatedFine) }}</strong>
            — không thể hoàn tác sau khi xác nhận.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmReturnDialog = false">Hủy</v-btn>
          <v-btn color="warning" :loading="returning" @click="submitReturn">Xác nhận trả</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog QR thanh toán phạt - tự mở sau khi trả sách có phát sinh phạt -->
    <v-dialog v-model="fineQrDialog" max-width="380">
      <v-card rounded="lg" class="pa-5 text-center">
        <h3 class="mb-3">Thanh toán phí phạt</h3>

        <div v-if="fineQrLoading" class="py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="fineQrData">
          <img :src="fineQrData.qrImageUrl" alt="QR VietQR" width="200" height="200" class="mb-3" style="border-radius: 8px;" />
          <p class="mb-1"><strong>{{ formatMoney(fineQrData.fineAmount) }}</strong></p>
          <p class="text-caption text-medium-emphasis mb-4">
            {{ fineQrData.bookTitle }} · {{ fineQrData.readerName }}<br>
            Quét mã để chuyển khoản, hoặc thu tiền mặt rồi xác nhận bên dưới.
          </p>
        </template>

        <v-alert v-else type="info" variant="tonal" density="compact" rounded="lg" class="mb-4">
          Không lấy được mã QR — vẫn có thể thu tiền mặt và xác nhận trực tiếp.
        </v-alert>

        <div class="d-flex ga-2">
          <v-btn variant="text" class="flex-grow-1" @click="fineQrDialog = false">Đóng</v-btn>
          <v-btn color="success" class="flex-grow-1" :loading="fineQrPaying" @click="confirmFinePaid">
            Xác nhận đã thu
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { readerApi } from '../../api/readerApi'
import { bookApi } from '../../api/bookApi'
import { borrowApi, borrowSettingsApi } from '../../api/borrowApi'

const readers = ref([])
const books = ref([])
const borrows = ref([])

const message = ref('')
const success = ref(true)

// Mượn
const selectedReaderId = ref(null)
const bookToAdd = ref(null)
const cart = ref([])
const borrowing = ref(false)
const confirmBorrowDialog = ref(false)

// Trả
const selectedReturnId = ref(null)
const condition = ref('Normal')
const returning = ref(false)
const confirmReturnDialog = ref(false)

// Giá trị mặc định - sẽ được nạp đè bằng dữ liệu thật từ borrowSettingsApi khi mount.
// LOAN_DAYS giữ cứng 14 vì backend không có field này trong BorrowSettings (chỉ có
// maxBorrowingBooks + finePerLateDay) - ngày hẹn trả cụ thể do Librarian/Admin quyết định
// khi duyệt phiếu (approve), 14 ngày chỉ là gợi ý hiển thị ở Quầy lưu thông.
const FINE_PER_DAY = ref(5000)
const LOAN_DAYS = 14
const MAX_BOOKS_PER_READER = ref(5)

const selectedReader = computed(() =>
  readers.value.find(r => r.userId === selectedReaderId.value) || null
)

const readerCurrentBorrowCount = computed(() => {
  if (!selectedReaderId.value) return 0
  return borrows.value.filter(b => b.readerId === selectedReaderId.value && !b.returnDate).length
})

const borrowableBooks = computed(() =>
  books.value.filter(b => (b.isAvailable || Number(b.availableCopies || 0) > 0) && !cart.value.some(c => c.id === b.id))
)

const dueDatePreview = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + LOAN_DAYS)
  return d
})

const activeBorrows = computed(() =>
  borrows.value.filter(b => !b.returnDate)
)

const selectedReturn = computed(() =>
  activeBorrows.value.find(b => b.id === selectedReturnId.value) || null
)

function overdueDays(record) {
  if (!record?.dueDate) return 0
  const diff = Math.floor((Date.now() - new Date(record.dueDate).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

const estimatedFine = computed(() => {
  if (!selectedReturn.value) return 0
  return overdueDays(selectedReturn.value) * FINE_PER_DAY.value
})

function addBookToCart(bookId) {
  if (!bookId) return

  const book = books.value.find(b => b.id === bookId)

  if (book && !cart.value.some(c => c.id === bookId)) {
    cart.value.push(book)
  }

  bookToAdd.value = null
}

function removeFromCart(bookId) {
  cart.value = cart.value.filter(b => b.id !== bookId)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

async function loadData() {
  try {
    const [readerRes, bookRes, borrowRes] = await Promise.all([
      readerApi.getAll(),
      bookApi.getAll(),
      borrowApi.getAll()
    ])

    readers.value = readerRes.data || []
    books.value = bookRes.data || []
    borrows.value = borrowRes.data || []
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được dữ liệu quầy lưu thông'
    console.error(err.response || err)
  }
}

async function submitBorrow() {
  if (readerCurrentBorrowCount.value + cart.value.length > MAX_BOOKS_PER_READER.value) {
    success.value = false
    message.value = `Độc giả chỉ được mượn tối đa ${MAX_BOOKS_PER_READER.value} cuốn cùng lúc.`
    confirmBorrowDialog.value = false
    return
  }

  borrowing.value = true

  try {
    const borrowDate = new Date().toISOString()
    const dueDate = dueDatePreview.value.toISOString()

    for (const book of cart.value) {
      await borrowApi.create({
        readerId: selectedReaderId.value,
        bookId: book.id,
        borrowDate,
        dueDate
      })
    }

    success.value = true
    message.value = `Đã tạo phiếu mượn cho ${cart.value.length} cuốn sách.`

    cart.value = []
    selectedReaderId.value = null
    confirmBorrowDialog.value = false

    await loadData()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Tạo phiếu mượn thất bại'
    console.error(err.response || err)
  } finally {
    borrowing.value = false
  }
}

async function submitReturn() {
  returning.value = true
  const returnedId = selectedReturnId.value
  const returnedBookInfo = selectedReturn.value

  try {
    const res = await borrowApi.returnBook(returnedId, {
      returnDate: new Date().toISOString(),
      condition: condition.value
    })

    success.value = true
    message.value = res.data?.message || 'Trả sách thành công'

    selectedReturnId.value = null
    condition.value = 'Normal'
    confirmReturnDialog.value = false

    await loadData()

    // Nếu phiếu này phát sinh phạt, mở luôn dialog QR thanh toán cho librarian thu tiền ngay.
    const lateDays = returnedBookInfo ? overdueDays(returnedBookInfo) : 0
    if (lateDays > 0) {
      await openPostReturnFineDialog(returnedId)
    }
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Xử lý trả sách thất bại'
    console.error(err.response || err)
  } finally {
    returning.value = false
  }
}

const fineQrDialog = ref(false)
const fineQrLoading = ref(false)
const fineQrData = ref(null)
const fineQrBorrowId = ref(null)
const fineQrPaying = ref(false)

async function openPostReturnFineDialog(borrowId) {
  fineQrBorrowId.value = borrowId
  fineQrDialog.value = true
  fineQrLoading.value = true
  fineQrData.value = null

  try {
    const res = await borrowApi.getFinePaymentQr(borrowId)
    fineQrData.value = res.data
  } catch (err) {
    console.error(err.response || err)
  } finally {
    fineQrLoading.value = false
  }
}

async function confirmFinePaid() {
  fineQrPaying.value = true

  try {
    await borrowApi.payFine(fineQrBorrowId.value)
    success.value = true
    message.value = 'Đã xác nhận thu phạt thành công'
    fineQrDialog.value = false
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Xác nhận thu phạt thất bại'
    console.error(err.response || err)
  } finally {
    fineQrPaying.value = false
  }
}

async function loadSettings() {
  try {
    const res = await borrowSettingsApi.get()
    MAX_BOOKS_PER_READER.value = res.data?.maxBorrowingBooks || 5
    FINE_PER_DAY.value = res.data?.finePerLateDay || 5000
  } catch (err) {
    // Giữ giá trị mặc định nếu chưa lấy được cấu hình thật.
    console.error(err.response || err)
  }
}

onMounted(() => {
  loadData()
  loadSettings()
})
</script>

<style scoped>
.circulation-page {
  padding-bottom: 12px;
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

.desk-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: stretch;
}

.desk-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dl-surface-variant) !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.desk-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.desk-card-header h2 {
  font-family: var(--dl-font-headline);
  font-size: 19px;
  color: var(--dl-text-primary);
  margin: 0;
}

.desk-card-header p {
  font-size: 13px;
  color: var(--dl-text-muted);
  margin: 2px 0 0;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin-bottom: 6px;
}

.reader-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-surface-container-low);
}

.reader-summary-info {
  flex: 1;
  min-width: 0;
}

.reader-summary-name {
  font-weight: 700;
  font-size: 14.5px;
  color: var(--dl-text-primary);
}

.reader-summary-meta {
  font-size: 12.5px;
  color: var(--dl-text-muted);
}

.reader-summary-right {
  text-align: right;
}

.reader-quota {
  font-size: 11.5px;
  color: var(--dl-text-muted);
  margin-top: 4px;
}

.cart-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 50px;
}

.cart-empty {
  font-size: 13px;
  color: var(--dl-text-muted);
  padding: 10px 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-surface-container-low);
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dl-text-primary);
}

.cart-item-isbn {
  font-size: 11.5px;
  color: var(--dl-text-muted);
}

.due-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  font-size: 13.5px;
  color: var(--dl-text-muted);
}

.due-date-row strong {
  color: var(--dl-text-primary);
}

/* Trả sách */
.return-summary {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-surface-container-low);
  border-left: 3px solid transparent;
}

.return-summary-overdue {
  border-left-color: var(--dl-error);
  background: rgba(220, 38, 38, 0.05);
}

.return-summary-title {
  font-weight: 700;
  font-size: 14.5px;
  color: var(--dl-text-primary);
}

.return-summary-meta {
  font-size: 12.5px;
  color: var(--dl-text-muted);
}

.overdue-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--dl-error);
}

.condition-options {
  display: flex;
  gap: 10px;
}

.condition-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: var(--dl-radius-md);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--dl-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.condition-btn-active {
  border-color: var(--dl-primary);
  color: var(--dl-primary);
  background: rgba(6, 78, 59, 0.06);
}

.fine-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: var(--dl-radius-md);
  background: rgba(220, 38, 38, 0.08);
  color: var(--dl-error);
  font-size: 13.5px;
}

.fine-preview strong {
  margin-left: auto;
  font-size: 15px;
}

.confirm-dialog .confirm-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
}

.confirm-book-list {
  margin-top: 8px;
  padding-left: 18px;
  font-size: 13.5px;
  color: var(--dl-text-muted);
}

.confirm-fine-line {
  margin-top: 10px;
  color: var(--dl-error);
  font-size: 13.5px;
}

.dl-fade-enter-active,
.dl-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dl-fade-enter-from,
.dl-fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .desk-grid {
    grid-template-columns: 1fr;
  }
}
</style>
