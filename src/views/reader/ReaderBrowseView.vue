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
      <button
        class="category-pill"
        :class="{ 'category-pill-active': !activeCategory }"
        @click="activeCategory = null"
      >
        Tất cả
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        class="category-pill"
        :class="{ 'category-pill-active': activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
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
              <img v-if="book.coverImageUrl" :src="book.coverImageUrl" :alt="book.title" />
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
              <img v-if="book.coverImageUrl" :src="book.coverImageUrl" :alt="book.title" />
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
          <img v-if="detailBook.coverImageUrl" :src="detailBook.coverImageUrl" :alt="detailBook.title" />
          <div v-else class="book-cover-fallback detail-cover-fallback"><v-icon icon="mdi-book-open-page-variant" size="36" /></div>
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

          <v-btn
            block
            color="primary"
            rounded="pill"
            size="large"
            class="mt-3"
            :disabled="!isAvailable(detailBook)"
            @click="reserveInfoDialog = true"
          >
            Đặt giữ sách
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog thông báo đặt giữ -->
    <v-dialog v-model="reserveInfoDialog" max-width="380">
      <v-card rounded="lg" class="pa-5 text-center">
        <v-icon icon="mdi-clock-outline" size="34" color="var(--dl-accent-gold)" class="mb-2" />
        <h3 class="mb-2">Đặt giữ sách tại quầy</h3>
        <p class="text-medium-emphasis mb-4">
          Tính năng đặt giữ trực tuyến đang được phát triển. Hiện tại, vui lòng đến quầy lưu
          thông tại chi nhánh gần nhất và xuất trình thẻ thư viện để mượn sách này.
        </p>
        <v-btn block variant="tonal" color="primary" @click="reserveInfoDialog = false">Đã hiểu</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { bookApi } from '../../api/bookApi'

const route = useRoute()

const books = ref([])
const loading = ref(true)
const keyword = ref(route.query.keyword || '')
const activeCategory = ref(route.query.category || null)
const detailDialog = ref(false)
const detailBook = ref(null)
const reserveInfoDialog = ref(false)

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
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
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
  background: rgba(5, 150, 105, 0.92);
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
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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
  background: rgba(6, 78, 59, 0.08);
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
