<template>
  <PublicLayout>
    <div class="public-container catalog-shell">
      <div class="catalog-header">
        <h1 class="dl-headline-lg">Danh mục sách</h1>
        <p class="dl-body-lg">Khám phá toàn bộ kho tài liệu của Thư Viện Số</p>
      </div>

      <div class="catalog-layout">
        <!-- Bộ lọc -->
        <aside class="filter-panel">
          <h3>Bộ lọc</h3>

          <div class="filter-group">
            <div class="filter-group-title">Danh mục</div>

            <label v-for="cat in categoryOptions" :key="cat.name" class="filter-checkbox">
              <input
                type="checkbox"
                :checked="selectedCategories.includes(cat.name)"
                @change="toggleCategory(cat.name)"
              />
              <span>{{ cat.name }} ({{ cat.count }})</span>
            </label>

            <p v-if="!categoryOptions.length" class="filter-empty">Chưa có dữ liệu danh mục.</p>
          </div>

          <div class="filter-group">
            <div class="filter-group-title">Trạng thái</div>

            <label class="filter-checkbox">
              <input v-model="onlyAvailable" type="checkbox" />
              <span>Còn sách</span>
            </label>
          </div>

          <v-btn
            v-if="selectedCategories.length || onlyAvailable || keyword"
            variant="text"
            color="secondary"
            size="small"
            class="reset-filter-btn"
            @click="resetFilters"
          >
            Xóa bộ lọc
          </v-btn>
        </aside>

        <!-- Danh sách sách -->
        <section class="catalog-results">
          <div class="search-row">
            <div class="search-box">
              <v-icon icon="mdi-magnify" size="20" color="#707974" />
              <input v-model="keyword" placeholder="Tìm kiếm tựa sách, tác giả..." />
            </div>

            <div class="result-count">
              <template v-if="!loading">
                Hiển thị <strong>{{ pageStart }}-{{ pageEnd }}</strong> trong số {{ filteredBooks.length }} kết quả
              </template>
            </div>
          </div>

          <div v-if="loading" class="catalog-grid">
            <div v-for="n in 9" :key="n" class="book-card-skeleton"></div>
          </div>

          <div v-else-if="!filteredBooks.length" class="empty-state">
            <v-icon icon="mdi-book-search-outline" size="44" color="#707974" />
            <h3>Không tìm thấy sách phù hợp</h3>
            <p>Hãy thử từ khóa khác hoặc bỏ một vài bộ lọc đang chọn.</p>
            <v-btn color="primary" rounded="pill" variant="tonal" @click="resetFilters">
              Xóa bộ lọc
            </v-btn>
          </div>

          <template v-else>
            <div class="catalog-grid">
              <div v-for="book in pagedBooks" :key="book.id" class="catalog-book-card">
                <div class="book-cover">
                  <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
                  <div v-else class="book-cover-fallback">
                    <v-icon icon="mdi-book-open-page-variant" size="30" />
                  </div>

                  <span
                    class="book-badge"
                    :class="isAvailable(book) ? 'badge-available' : 'badge-unavailable'"
                  >
                    {{ isAvailable(book) ? 'Còn sách' : 'Đã mượn' }}
                  </span>
                </div>

                <div class="book-info">
                  <h4>{{ book.title }}</h4>
                  <p class="book-author">{{ book.author }}</p>

                  <div class="book-footer-row">
                    <span class="book-category-chip">{{ book.category || 'Khác' }}</span>

                    <button
                      class="reserve-btn"
                      type="button"
                      :title="isAvailable(book) ? 'Đăng nhập để đặt giữ sách' : 'Hiện đã hết sách'"
                      @click="handleReserve(book)"
                    >
                      <v-icon icon="mdi-bookmark-plus-outline" size="18" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="totalPages > 1" class="pagination-row">
              <button class="page-btn" :disabled="page === 1" @click="page--">
                <v-icon icon="mdi-chevron-left" size="18" />
              </button>

              <button
                v-for="p in totalPages"
                :key="p"
                class="page-btn"
                :class="{ 'page-btn-active': p === page }"
                @click="page = p"
              >
                {{ p }}
              </button>

              <button class="page-btn" :disabled="page === totalPages" @click="page++">
                <v-icon icon="mdi-chevron-right" size="18" />
              </button>
            </div>
          </template>
        </section>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { useAuthStore } from '../../stores/authStore'
import { bookApi } from '../../api/bookApi'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const books = ref([])
const loading = ref(true)
const keyword = ref(route.query.keyword || '')
const selectedCategories = ref(route.query.category ? [route.query.category] : [])
const onlyAvailable = ref(false)
const page = ref(1)
const pageSize = 9

const categoryOptions = computed(() => {
  const counts = {}

  books.value.forEach(book => {
    const name = book.category || 'Khác'
    counts[name] = (counts[name] || 0) + 1
  })

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    if (keyword.value) {
      const k = keyword.value.toLowerCase().trim()
      const matches = String(book.title || '').toLowerCase().includes(k) ||
        String(book.author || '').toLowerCase().includes(k)

      if (!matches) return false
    }

    if (selectedCategories.value.length) {
      const cat = book.category || 'Khác'
      if (!selectedCategories.value.includes(cat)) return false
    }

    if (onlyAvailable.value && !isAvailable(book)) return false

    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBooks.value.length / pageSize)))

const pagedBooks = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredBooks.value.slice(start, start + pageSize)
})

const pageStart = computed(() => filteredBooks.value.length ? (page.value - 1) * pageSize + 1 : 0)
const pageEnd = computed(() => Math.min(page.value * pageSize, filteredBooks.value.length))

function isAvailable(book) {
  return Number(book.availableCopies || 0) > 0
}

function toggleCategory(name) {
  if (selectedCategories.value.includes(name)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== name)
  } else {
    selectedCategories.value = [...selectedCategories.value, name]
  }
}

function resetFilters() {
  keyword.value = ''
  selectedCategories.value = []
  onlyAvailable.value = false
}

function handleReserve(book) {
  if (!isAvailable(book)) return

  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  router.push('/app/books')
}

watch([keyword, selectedCategories, onlyAvailable], () => {
  page.value = 1
})

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
.public-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.catalog-shell {
  padding: 2.5rem 2rem 4rem;
}

.catalog-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: flex-start;
}

/* Filter panel */
.filter-panel {
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  padding: 1.5rem;
  position: sticky;
  top: 96px;
}

.filter-panel h3 {
  font-family: var(--dl-font-headline);
  font-size: 18px;
  margin: 0 0 1rem;
  color: var(--dl-primary-dark);
}

.filter-group {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--dl-border);
}

.filter-group:last-of-type {
  border-bottom: none;
}

.filter-group-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--dl-text-muted);
  margin-bottom: 0.6rem;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--dl-text-primary);
  padding: 0.3rem 0;
  cursor: pointer;
}

.filter-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: var(--dl-primary);
}

.filter-empty {
  font-size: 13px;
  color: var(--dl-text-muted);
}

.reset-filter-btn {
  margin-top: 0.5rem;
  padding-left: 0 !important;
}

/* Search */
.search-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-md);
  padding: 0.6rem 1rem;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.result-count {
  font-size: 13px;
  color: var(--dl-text-muted);
  white-space: nowrap;
}

/* Grid */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.catalog-book-card {
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  overflow: hidden;
  box-shadow: var(--dl-shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.catalog-book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(22, 38, 58, 0.12);
}

.book-cover {
  position: relative;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, var(--dl-primary-dark), var(--dl-primary));
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
  top: 10px;
  right: 10px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
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

.book-info {
  padding: 1rem;
}

.book-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 2px;
  line-height: 1.35;
}

.book-author {
  font-size: 13px;
  color: var(--dl-text-muted);
  margin: 0 0 0.75rem;
}

.book-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.book-category-chip {
  font-size: 11px;
  font-weight: 700;
  color: var(--dl-primary);
  background: rgba(38, 67, 97, 0.08);
  border-radius: var(--dl-radius-full);
  padding: 3px 9px;
}

.reserve-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--dl-radius-full);
  border: 1px solid var(--dl-surface-variant);
  background: var(--dl-surface);
  color: var(--dl-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reserve-btn:hover {
  background: rgba(38, 67, 97, 0.08);
}

.book-card-skeleton {
  aspect-ratio: 3 / 4;
  border-radius: var(--dl-radius-lg);
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
  padding: 4rem 1rem;
  color: var(--dl-text-muted);
}

.empty-state h3 {
  font-family: var(--dl-font-headline);
  color: var(--dl-text-primary);
  margin: 1rem 0 0.5rem;
}

/* Pagination */
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 2rem;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: var(--dl-radius-sm);
  border: 1px solid var(--dl-surface-variant);
  background: var(--dl-surface);
  color: var(--dl-text-primary);
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn-active {
  background: var(--dl-primary-dark);
  border-color: var(--dl-primary-dark);
  color: #fff;
}

@media (max-width: 960px) {
  .catalog-shell {
    padding: 2rem 1rem 3rem;
  }

  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }

  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
