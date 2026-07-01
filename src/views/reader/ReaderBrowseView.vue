<template>
  <div class="browse-page">
    <!-- Hero -->
    <div class="browse-hero">
      <h1>Khám phá kho tàng tri thức vô tận</h1>
      <p>Hàng ngàn đầu sách chọn lọc đang chờ bạn. Tìm kiếm theo tên sách, tác giả hoặc chủ đề.</p>

      <div class="browse-search">
        <v-icon icon="mdi-magnify" size="20" color="#707974" />
        <input v-model="keyword" placeholder="Nhập tên sách, tác giả..." />
      </div>
    </div>

    <!-- Category pills -->
    <div class="category-row">
      <div class="category-pills">
        <button class="category-pill" :class="{ 'category-pill-active': !activeCategory }"
          @click="activeCategory = null">
          Tất cả
        </button>
        <button v-for="cat in categories" :key="cat" class="category-pill"
          :class="{ 'category-pill-active': activeCategory === cat }" @click="activeCategory = cat">
          {{ cat }}
        </button>
      </div>

      <v-btn class="category-cart-btn" variant="tonal" color="primary" density="comfortable" rounded="full"
        @click="router.push('/app/my-cart')">
        <v-icon icon="mdi-cart" size="18" />
        <span>Giỏ giữ sách</span>
        <span v-if="cartStore.count" class="cart-count-badge">{{ cartStore.count }}</span>
      </v-btn>
    </div>

    <div v-if="loading" class="book-grid">
      <div v-for="n in 8" :key="n" class="book-skeleton"></div>
    </div>

    <template v-else>
      <!-- Dành cho bạn -->
      <section class="browse-section">
        <div class="section-row">
          <h2>Dành cho bạn</h2>
        </div>

        <div class="book-grid">
          <div v-for="book in recommended" :key="book.id" class="book-card" @click="openDetail(book)">
            <div class="book-cover">
              <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
              <div v-else class="book-cover-fallback"><v-icon icon="mdi-book-open-page-variant" size="26" /></div>

              <span class="book-badge" :class="isAvailable(book) ? 'badge-available' : 'badge-unavailable'">
                {{ isAvailable(book) ? 'Còn sách' : 'Hết sách' }}
              </span>
            </div>
            <h4>{{ book.title }}</h4>
            <p>{{ book.author }}</p>
          </div>
        </div>
      </section>

      <!-- Mới thêm gần đây -->
      <section class="browse-section">
        <div class="section-row">
          <h2>Mới thêm gần đây</h2>
        </div>

        <div v-if="!filteredBooks.length" class="empty-state">
          <v-icon icon="mdi-book-search-outline" size="40" color="#707974" />
          <p>Không tìm thấy sách phù hợp với tìm kiếm của bạn.</p>
        </div>

        <div v-else class="book-grid">
          <div v-for="book in filteredBooks" :key="book.id" class="book-card" @click="openDetail(book)">
            <div class="book-cover">
              <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
              <div v-else class="book-cover-fallback"><v-icon icon="mdi-book-open-page-variant" size="26" /></div>

              <span class="book-badge" :class="isAvailable(book) ? 'badge-available' : 'badge-unavailable'">
                {{ isAvailable(book) ? 'Còn sách' : 'Hết sách' }}
              </span>
            </div>
            <h4>{{ book.title }}</h4>
            <p>{{ book.author }}</p>
          </div>
        </div>
      </section>
    </template>

    <!-- Dialog chi tiết sách -->
    <v-dialog v-model="detailDialog" max-width="480">
      <v-card v-if="detailBook" rounded="lg" class="detail-card">
        <div class="detail-cover">
          <img v-if="detailBook.coverUrl" :src="detailBook.coverUrl" :alt="detailBook.title" />
          <div v-else class="book-cover-fallback detail-cover-fallback"><v-icon icon="mdi-book-open-page-variant"
              size="36" /></div>
        </div>

        <div class="detail-body">
          <span class="book-category-chip">{{ detailBook.category || 'Khác' }}</span>
          <h3>{{ detailBook.title }}</h3>
          <p class="detail-author">{{ detailBook.author }}</p>

          <p class="detail-meta">
            <v-icon icon="mdi-domain" size="15" /> {{ detailBook.publisher || 'Chưa rõ NXB' }}
            <span class="dot">•</span>
            {{ detailBook.publishingYear || '—' }}
          </p>

          <p class="detail-availability" :class="isAvailable(detailBook) ? 'text-success' : 'text-error'">
            <v-icon :icon="isAvailable(detailBook) ? 'mdi-check-circle' : 'mdi-close-circle'" size="16" />
            {{ isAvailable(detailBook) ? `Còn ${detailBook.availableCopies} bản` : 'Hiện đã hết sách' }}
          </p>

          <v-btn block color="primary" rounded="pill" size="large" class="mt-3" :disabled="!isAvailable(detailBook)"
            @click="confirmReserveDialog = true">
            Đặt giữ sách
          </v-btn>
          <v-btn block variant="outlined" color="primary" rounded="pill" size="large" class="mt-2"
            :disabled="!isAvailable(detailBook)" @click="addToCart(detailBook); detailDialog = false">
            Thêm vào giỏ
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Xác nhận gửi yêu cầu mượn -->
    <v-dialog v-model="confirmReserveDialog" max-width="400">
      <v-card rounded="lg" class="pa-5">
        <h3 class="mb-2">Xác nhận gửi yêu cầu mượn</h3>
        <p class="text-medium-emphasis mb-4">
          Yêu cầu mượn sách <strong>{{ detailBook?.title }}</strong> sẽ được gửi tới thủ thư để
          phê duyệt. Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
        </p>
        <div class="d-flex ga-2">
          <v-btn variant="text" class="flex-grow-1" @click="confirmReserveDialog = false">Hủy</v-btn>
          <v-btn color="primary" class="flex-grow-1" :loading="reserving" @click="submitReserve">
            Gửi yêu cầu
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Thông báo kết quả -->
    <v-dialog v-model="reserveInfoDialog" max-width="380">
      <v-card rounded="lg" class="pa-5 text-center">
        <v-icon :icon="reserveSuccess ? 'mdi-clock-check-outline' : 'mdi-alert-circle-outline'" size="34"
          :color="reserveSuccess ? 'var(--dl-success)' : 'var(--dl-error)'" class="mb-2" />
        <h3 class="mb-2">{{ reserveSuccess ? 'Đã gửi yêu cầu mượn' : 'Không thể gửi yêu cầu' }}</h3>
        <p class="text-medium-emphasis mb-4">{{ reserveMessage }}</p>
        <v-btn block variant="tonal" color="primary" @click="reserveInfoDialog = false">Đã hiểu</v-btn>
      </v-card>
    </v-dialog>

    <!-- Cart floating action -->
    <div v-if="cartStore.count" class="cart-fab">
      <v-btn color="primary" rounded="full" @click="cartDialog = true">
        <v-icon icon="mdi-cart" />
        <span class="cart-count">{{ cartStore.count }}</span>
      </v-btn>
    </div>

    <!-- Cart dialog -->
    <v-dialog v-model="cartDialog" max-width="520">
      <v-card rounded="lg">
        <v-card-title>Giỏ giữ sách ({{ cartStore.count }})</v-card-title>
        <v-card-text>
          <div v-if="!cartStore.count">Giỏ trống</div>
          <div v-else>
            <div v-for="b in cartStore.items" :key="b.id"
              class="cart-item d-flex align-center justify-space-between pa-2">
              <div>
                <div class="font-weight-bold">{{ b.title }}</div>
                <div class="text-caption">{{ b.author }}</div>
              </div>
              <div>
                <v-btn variant="text" size="small" color="error" @click="removeFromCart(b.id)">Xóa</v-btn>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cartDialog = false">Đóng</v-btn>
          <v-btn color="primary" :loading="cartSubmitting" @click="submitReserveCart">Gửi yêu cầu</v-btn>
          <v-btn variant="text" color="secondary" @click="router.push('/app/my-cart')">Xem giỏ của tôi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bookApi } from '../../api/bookApi'
import { borrowApi } from '../../api/borrowApi'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'

const route = useRoute()

const books = ref([])
const loading = ref(true)
const keyword = ref(route.query.keyword || '')
const activeCategory = ref(route.query.category || null)
const detailDialog = ref(false)
const detailBook = ref(null)
const reserveInfoDialog = ref(false)
const confirmReserveDialog = ref(false)
const reserving = ref(false)
const reserveSuccess = ref(true)
const reserveMessage = ref('')

// Cart for reader: allow adding multiple books and sending 1 request per book
const cartDialog = ref(false)
const cartSubmitting = ref(false)

// Policy: fixed max books per reader and must-return-all behaviour
const MAX_BOOKS = 3
const MUST_RETURN_ALL = true

const router = useRouter()
const auth = useAuthStore()
const cartStore = useCartStore()

async function submitReserve() {
  reserving.value = true

  try {
    await borrowApi.requestBorrow({
      bookId: detailBook.value.id,
      requestedDays: 14
    })

    reserveSuccess.value = true
    reserveMessage.value = 'Yêu cầu mượn đã được gửi tới thủ thư. Bạn có thể theo dõi trạng thái tại "Lịch sử mượn sách".'
    confirmReserveDialog.value = false
    detailDialog.value = false
  } catch (err) {
    reserveSuccess.value = false
    reserveMessage.value = err.response?.data?.message || 'Gửi yêu cầu mượn thất bại. Vui lòng thử lại sau.'
    console.error(err.response || err)
  } finally {
    reserving.value = false
    reserveInfoDialog.value = true
  }
}

const categories = computed(() => {
  const set = new Set(books.value.map(b => b.category).filter(Boolean))
  return Array.from(set).slice(0, 6)
})

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    if (activeCategory.value && book.category !== activeCategory.value) return false

    if (keyword.value) {
      const k = keyword.value.toLowerCase().trim()
      const matches = String(book.title || '').toLowerCase().includes(k) ||
        String(book.author || '').toLowerCase().includes(k)
      if (!matches) return false
    }

    return true
  })
})

const recommended = computed(() => books.value.slice(0, 4))

function isAvailable(book) {
  return Number(book.availableCopies || 0) > 0
}

function openDetail(book) {
  detailBook.value = book
  detailDialog.value = true
}

function addToCart(book) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!book || cartStore.hasBook(book.id)) return

  if (cartStore.count >= MAX_BOOKS) {
    reserveSuccess.value = false
    reserveMessage.value = `Giỏ đã đạt tối đa ${MAX_BOOKS} cuốn`
    return
  }

  cartStore.add(book)
}

function removeFromCart(bookId) {
  cartStore.remove(bookId)
}

async function submitReserveCart() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  cartSubmitting.value = true
  reserveSuccess.value = true
  reserveMessage.value = ''

  try {
    // Check existing borrows of current reader
    const myRes = await borrowApi.getMyBorrows()
    const myBorrows = Array.isArray(myRes.data) ? myRes.data : []
    const activeCount = myBorrows.filter(b => !b.returnDate).length

    if (MUST_RETURN_ALL && activeCount > 0) {
      throw new Error('Bạn phải trả hết sách đang mượn trước khi gửi yêu cầu mới.')
    }

    if (activeCount + cartStore.count > MAX_BOOKS) {
      throw new Error(`Không thể mượn quá ${MAX_BOOKS} cuốn cùng lúc.`)
    }

    for (const book of cartStore.items) {
      await borrowApi.requestBorrow({ bookId: book.id, requestedDays: 14 })
    }

    reserveSuccess.value = true
    reserveMessage.value = `Đã gửi yêu cầu mượn ${cartStore.count} cuốn. Vui lòng chờ thủ thư phê duyệt.`
    cartStore.clear()
    cartDialog.value = false
  } catch (err) {
    reserveSuccess.value = false
    reserveMessage.value = err.response?.data?.message || err.message || 'Gửi yêu cầu mượn thất bại'
    console.error(err.response || err)
  } finally {
    cartSubmitting.value = false
    reserveInfoDialog.value = true
  }
}

async function loadBooks() {
  loading.value = true

  try {
    const res = await bookApi.getAll({})
    books.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    books.value = []
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

onMounted(loadBooks)
</script>

<style scoped>
.browse-page {
  max-width: 1180px;
}

.browse-hero {
  text-align: center;
  padding: 32px 16px 28px;
  border-radius: var(--dl-radius-lg);
  background: var(--dl-surface-paper);
  border: 1px solid var(--dl-surface-variant);
  margin-bottom: 24px;
}

.browse-hero h1 {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: clamp(22px, 3vw, 30px);
  color: var(--dl-primary-dark);
  margin: 0 0 8px;
}

.browse-hero p {
  color: var(--dl-text-muted);
  font-size: 14.5px;
  max-width: 520px;
  margin: 0 auto 18px;
}

.browse-search {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--dl-radius-full);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
}

.browse-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.category-pill {
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: var(--dl-radius-full);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  color: var(--dl-text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-cart-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.cart-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--dl-error);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.category-pill-active {
  background: var(--dl-primary-dark);
  border-color: var(--dl-primary-dark);
  color: #fff;
}

.browse-section {
  margin-bottom: 32px;
}

.section-row h2 {
  font-family: var(--dl-font-headline);
  font-size: 19px;
  color: var(--dl-text-primary);
  margin-bottom: 14px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.book-card {
  cursor: pointer;
}

.book-cover {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: var(--dl-radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--dl-primary-dark), var(--dl-primary));
  margin-bottom: 8px;
  transition: transform 0.2s ease;
}

.book-card:hover .book-cover {
  transform: translateY(-3px);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-cover-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.7);
}

.book-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--dl-radius-full);
}

.badge-available {
  background: rgba(31, 157, 107, 0.92);
  color: #fff;
}

.badge-unavailable {
  background: rgba(220, 38, 38, 0.92);
  color: #fff;
}

.book-card h4 {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 2px;
  line-height: 1.3;
}

.book-card p {
  font-size: 12px;
  color: var(--dl-text-muted);
  margin: 0;
}

.book-skeleton {
  aspect-ratio: 2 / 3;
  border-radius: var(--dl-radius-md);
  background: linear-gradient(90deg, var(--dl-surface-variant) 25%, var(--dl-surface-container-low) 50%, var(--dl-surface-variant) 75%);
  background-size: 200% 100%;
  animation: dl-shimmer 1.4s infinite;
}

@keyframes dl-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--dl-text-muted);
}

/* Detail dialog */
.detail-cover {
  height: 200px;
  background: linear-gradient(135deg, var(--dl-primary-dark), var(--dl-primary));
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-cover-fallback {
  color: rgba(255, 255, 255, 0.7);
}

.detail-body {
  padding: 20px;
}

.detail-body h3 {
  font-family: var(--dl-font-headline);
  font-size: 19px;
  color: var(--dl-text-primary);
  margin: 8px 0 2px;
}

.detail-author {
  color: var(--dl-text-muted);
  font-size: 13.5px;
  margin-bottom: 8px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin-bottom: 8px;
}

.dot {
  opacity: 0.5;
}

.detail-availability {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.book-category-chip {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--dl-primary);
  background: rgba(38, 67, 97, 0.08);
  border-radius: var(--dl-radius-full);
  padding: 3px 9px;
}

@media (max-width: 960px) {
  .book-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
