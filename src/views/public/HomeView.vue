<template>
  <PublicLayout>
    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>

      <div class="public-container hero-content">
        <h1 class="dl-headline-xl">Khám phá tri thức, mọi lúc mọi nơi</h1>

        <p class="dl-body-lg hero-subtitle">
          Trải nghiệm không gian đọc hiện đại và kho tàng sách đa dạng với Thư Viện Số.
          Đăng ký ngay để bắt đầu hành trình.
        </p>

        <form class="hero-search" @submit.prevent="goSearch">
          <v-icon icon="mdi-magnify" color="#707974" size="22" />

          <input
            v-model="searchKeyword"
            placeholder="Tìm kiếm sách, tác giả, chuyên mục..."
          />

          <v-btn color="primary" rounded="pill" size="large" type="submit">
            Tìm kiếm
          </v-btn>
        </form>

        <div class="hero-topics">
          <span class="hero-topics-label">Chủ đề phổ biến:</span>
          <button
            v-for="topic in popularTopics"
            :key="topic"
            class="topic-pill"
            type="button"
            @click="goToCategory(topic)"
          >
            {{ topic }}
          </button>
        </div>

        <router-link to="/register" class="hero-cta-link">
          Đăng ký thẻ miễn phí
          <v-icon icon="mdi-arrow-right" size="16" />
        </router-link>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="public-container stats-grid" v-reveal="{ stagger: true, variant: 'scale' }">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Sách mới -->
    <section class="public-container section-block">
      <div class="section-title-row" v-reveal>
        <div>
          <h2 class="dl-headline-lg">Sách mới &amp; nổi bật</h2>
          <p class="section-subtitle">Những đầu sách vừa được bổ sung vào kho thư viện</p>
        </div>

        <router-link to="/catalog" class="see-all-link">
          Xem tất cả
          <v-icon icon="mdi-arrow-right" size="16" />
        </router-link>
      </div>

      <div v-if="loadingBooks" class="books-row">
        <div v-for="n in 6" :key="n" class="book-card-skeleton"></div>
      </div>

      <div v-else-if="newBooks.length" class="books-row" v-reveal="{ stagger: true, staggerStep: 70, variant: 'up' }">
        <router-link
          v-for="book in newBooks"
          :key="book.id"
          to="/catalog"
          class="book-card"
        >
          <div class="book-cover">
            <img
              v-if="book.coverUrl"
              :src="book.coverUrl"
              :alt="book.title"
            />
            <div v-else class="book-cover-fallback">
              <v-icon icon="mdi-book-open-page-variant" size="28" />
            </div>

            <span
              class="book-badge"
              :class="isAvailable(book) ? 'badge-available' : 'badge-unavailable'"
            >
              {{ isAvailable(book) ? 'Còn sách' : 'Đã mượn' }}
            </span>
          </div>

          <div class="book-category">{{ book.category || 'Chưa phân loại' }}</div>
          <h4>{{ book.title }}</h4>
          <p>{{ book.author }}</p>
        </router-link>
      </div>

      <div v-else class="empty-state">
        <v-icon icon="mdi-book-search-outline" size="40" color="#707974" />
        <p>Chưa kết nối được đến hệ thống quản lý sách. Vui lòng thử lại sau.</p>
      </div>
    </section>

    <!-- Vì sao chọn chúng tôi -->
    <section class="public-container section-block">
      <div class="section-heading" v-reveal>
        <h2 class="dl-headline-lg">Vì sao chọn Thư Viện Số</h2>
      </div>

      <div class="features-grid" v-reveal="{ stagger: true, variant: 'scale' }">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">
            <v-icon :icon="feature.icon" size="26" />
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Trích dẫn -->
    <section class="quote-section">
      <div class="public-container quote-inner" v-reveal="{ variant: 'scale' }">
        <v-icon icon="mdi-format-quote-open" size="40" color="var(--dl-accent-gold)" />
        <p class="quote-text">
          “Thư viện không chỉ là nơi lưu trữ sách, mà là cánh cổng mở ra những khả năng vô tận của tri thức.”
        </p>
        <div class="quote-footer">Hệ thống Thư Viện Số</div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { bookApi } from '../../api/bookApi'

const router = useRouter()

const searchKeyword = ref('')
const newBooks = ref([])
const loadingBooks = ref(true)
const totalBooksLabel = ref('45.000+')

const popularTopics = ['Văn học', 'Khoa học', 'Nghệ thuật', 'Công nghệ thông tin']

const stats = ref([
  { value: '45.000+', label: 'Đầu sách' },
  { value: '12.000+', label: 'Độc giả' },
  { value: '3', label: 'Chi nhánh' },
  { value: '98%', label: 'Hài lòng' }
])

const features = [
  {
    icon: 'mdi-qrcode-scan',
    title: 'Mượn - trả nhanh bằng QR',
    description: 'Thẻ thư viện số hóa, quét mã để mượn và trả sách chỉ trong vài giây tại quầy lưu thông.'
  },
  {
    icon: 'mdi-magnify-expand',
    title: 'Tra cứu mọi lúc',
    description: 'Tìm kiếm theo tên sách, tác giả, ISBN hoặc chuyên mục ngay trên web, không cần đến tận quầy.'
  },
  {
    icon: 'mdi-bell-ring-outline',
    title: 'Nhắc hạn trả tự động',
    description: 'Hệ thống tự động nhắc lịch trả sách và phí phạt qua email, tránh quá hạn ngoài ý muốn.'
  },
  {
    icon: 'mdi-sofa-outline',
    title: 'Không gian đọc hiện đại',
    description: 'Mạng lưới chi nhánh với không gian đọc thoáng đãng, tiện nghi cho học tập và nghiên cứu.'
  }
]

function isAvailable(book) {
  return Number(book.availableCopies || 0) > 0
}

function goSearch() {
  router.push({ path: '/catalog', query: searchKeyword.value ? { keyword: searchKeyword.value } : {} })
}

function goToCategory(topic) {
  router.push({ path: '/catalog', query: { category: topic } })
}

async function loadNewBooks() {
  loadingBooks.value = true

  try {
    const res = await bookApi.getAll({})
    const all = Array.isArray(res.data) ? res.data : []

    newBooks.value = all.slice(0, 6)

    if (all.length) {
      stats.value[0].value = `${all.length.toLocaleString('vi-VN')}+`
    }
  } catch (err) {
    newBooks.value = []
    console.error(err.response || err)
  } finally {
    loadingBooks.value = false
  }
}

onMounted(loadNewBooks)
</script>

<style scoped>
.public-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero */
.hero-section {
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--dl-surface-paper);
  padding: 3rem 1rem;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  opacity: 0.22;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--dl-surface-paper), transparent 65%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
}

.hero-subtitle {
  max-width: 640px;
}

.hero-search {
  width: 100%;
  max-width: 640px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  border-radius: var(--dl-radius-full);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  box-shadow: var(--dl-shadow-soft);
}

.hero-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--dl-font-body);
  font-size: 16px;
  color: var(--dl-text-primary);
  min-width: 0;
}

.hero-topics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hero-topics-label {
  font-size: 14px;
  color: var(--dl-text-muted);
  margin-right: 0.25rem;
}

.topic-pill {
  font-family: var(--dl-font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--dl-text-primary);
  background: var(--dl-surface);
  border: 1px solid var(--dl-border);
  border-radius: var(--dl-radius-full);
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.topic-pill:hover {
  border-color: var(--dl-primary);
  color: var(--dl-primary);
}

.hero-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 14px;
  color: var(--dl-accent-gold);
  text-decoration: none;
}

.hero-cta-link:hover {
  color: var(--dl-warning);
}

/* Stats */
.stats-section {
  background: var(--dl-surface);
  border-top: 1px solid var(--dl-surface-variant);
  border-bottom: 1px solid var(--dl-surface-variant);
  padding: 2.5rem 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.stat-number {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: clamp(28px, 3vw, 36px);
  color: var(--dl-primary);
}

.stat-label {
  margin-top: 0.4rem;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dl-text-muted);
}

/* Section chung */
.section-block {
  padding: 4rem 2rem;
}

.section-heading {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-subtitle {
  color: var(--dl-text-muted);
  margin-top: 0.35rem;
}

.see-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
  font-size: 14px;
  color: var(--dl-secondary);
  text-decoration: none;
  white-space: nowrap;
}

/* Sách mới */
.books-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.25rem;
}

.book-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.book-cover {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: var(--dl-radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--dl-primary-dark), var(--dl-primary));
  margin-bottom: 0.75rem;
  box-shadow: var(--dl-shadow-card);
  transition: transform 0.2s ease;
}

.book-card:hover .book-cover {
  transform: translateY(-4px);
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
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
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

.book-category {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--dl-primary);
  background: rgba(38, 67, 97, 0.08);
  border-radius: var(--dl-radius-full);
  padding: 2px 8px;
  margin-bottom: 6px;
}

.book-card h4 {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--dl-text-primary);
  margin: 0 0 2px;
}

.book-card p {
  font-size: 12px;
  color: var(--dl-text-muted);
  margin: 0;
}

.book-card-skeleton {
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
  padding: 3rem 1rem;
  color: var(--dl-text-muted);
}

/* Feature cards */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.feature-card {
  padding: 1.75rem;
  border-radius: var(--dl-radius-lg);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  box-shadow: var(--dl-shadow-card);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: var(--dl-radius-md);
  background: rgba(38, 67, 97, 0.08);
  color: var(--dl-primary);
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 0.5rem;
}

.feature-card p {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dl-text-muted);
  margin: 0;
}

/* Quote */
.quote-section {
  background: var(--dl-surface-paper);
  border-top: 1px solid var(--dl-surface-variant);
  padding: 4rem 1rem;
}

.quote-inner {
  max-width: 760px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.quote-text {
  font-family: var(--dl-font-headline);
  font-size: clamp(20px, 2.4vw, 26px);
  line-height: 1.5;
  color: var(--dl-primary-dark);
}

.quote-footer {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dl-text-muted);
}

@media (max-width: 960px) {
  .public-container {
    padding: 0 1rem;
  }

  .section-block {
    padding: 3rem 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .books-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .books-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
