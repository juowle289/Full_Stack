<template>
  <div class="home-page">
    <!-- Header -->
    <header class="home-header" :class="{ 'home-header-scrolled': isScrolled }">
      <div class="home-container header-inner">
        <router-link to="/" class="brand">
          <div class="brand-icon">
            <v-icon icon="mdi-library" size="26" />
          </div>
          <span>Thư viện Số</span>
        </router-link>

        <nav class="desktop-nav">
          <a href="#home" class="active">Trang chủ</a>
          <a href="#features">Tính năng</a>
          <a href="#books">Sách mới</a>
          <a href="#stats">Thống kê</a>
        </nav>

        <div class="desktop-actions">
          <template v-if="auth.isLoggedIn">
            <div class="user-mini">
              <div class="user-name">{{ auth.fullName || 'Người dùng' }}</div>
              <div class="user-role">{{ displayRole }}</div>
            </div>

            <v-btn
              color="primary"
              rounded="lg"
              prepend-icon="mdi-view-dashboard"
              @click="goToApp"
            >
              Vào hệ thống
            </v-btn>

            <v-btn
              color="error"
              variant="tonal"
              rounded="lg"
              icon="mdi-logout"
              @click="logout"
            />
          </template>

          <template v-else>
            <v-btn
              variant="outlined"
              color="secondary"
              rounded="lg"
              @click="router.push('/login')"
            >
              Đăng nhập
            </v-btn>

            <v-btn
              color="primary"
              rounded="lg"
              @click="router.push('/register')"
            >
              Đăng ký
            </v-btn>
          </template>
        </div>

        <v-btn
          class="mobile-menu-btn"
          icon="mdi-menu"
          variant="text"
          @click="mobileMenu = !mobileMenu"
        />
      </div>

      <div v-if="mobileMenu" class="mobile-menu home-container">
        <a href="#home" @click="mobileMenu = false">Trang chủ</a>
        <a href="#features" @click="mobileMenu = false">Tính năng</a>
        <a href="#books" @click="mobileMenu = false">Sách mới</a>
        <a href="#stats" @click="mobileMenu = false">Thống kê</a>

        <div class="mobile-menu-actions">
          <v-btn
            v-if="!auth.isLoggedIn"
            block
            color="primary"
            rounded="lg"
            @click="router.push('/login')"
          >
            Đăng nhập
          </v-btn>

          <v-btn
            v-if="!auth.isLoggedIn"
            block
            color="secondary"
            variant="tonal"
            rounded="lg"
            @click="router.push('/register')"
          >
            Đăng ký
          </v-btn>

          <v-btn
            v-if="auth.isLoggedIn"
            block
            color="primary"
            rounded="lg"
            @click="goToApp"
          >
            Vào hệ thống
          </v-btn>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section id="home" class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>

      <div class="home-container hero-content">
        <div class="hero-badge">
          <v-icon icon="mdi-cloud-check-outline" size="18" />
          Digital Library Microservices
        </div>

        <h1>Khám Phá Kho Tàng Tri Thức Số</h1>

        <p>
          Hệ thống quản lý thư viện hiện đại, hỗ trợ tra cứu sách, quản lý độc giả,
          mượn trả, thẻ thư viện, phí phạt và báo cáo thống kê trên nền tảng Microservices.
        </p>

        <div class="hero-search">
          <v-icon icon="mdi-magnify" color="secondary" size="28" />

          <input
            v-model="searchKeyword"
            placeholder="Tìm kiếm sách, tài liệu, tác giả..."
            @keyup.enter="goSearch"
          />

          <v-btn
            color="primary"
            rounded="lg"
            size="large"
            @click="goSearch"
          >
            Tìm kiếm
          </v-btn>
        </div>

        <div class="hero-actions">
          <v-btn
            v-if="auth.isLoggedIn"
            color="primary"
            size="large"
            rounded="lg"
            prepend-icon="mdi-view-dashboard"
            @click="goToApp"
          >
            Vào hệ thống
          </v-btn>
        </div>
      </div>
    </section>

    <main class="main-content">
      <!-- Features -->
      <section id="features" class="home-container section-block">
        <div class="section-heading">
          <h2>Tính Năng Nổi Bật</h2>
          <p>Giải pháp toàn diện cho thư viện hiện đại</p>
        </div>

        <v-row>
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            md="6"
            lg="3"
          >
            <v-card class="feature-card">
              <div class="feature-icon">
                <v-icon :icon="feature.icon" size="30" />
              </div>

              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- New books -->
      <section id="books" class="home-container section-block">
        <div class="section-title-row">
          <div>
            <h2>Sách Mới Cập Nhật</h2>
            <p>Những ấn phẩm mới nhất được bổ sung vào kho lưu trữ</p>
          </div>

          <v-btn
            color="secondary"
            variant="text"
            append-icon="mdi-arrow-right"
            @click="router.push('/app/books')"
          >
            Xem tất cả
          </v-btn>
        </div>

        <v-row>
          <v-col
            v-for="book in newBooks"
            :key="book.title"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <div class="book-card" @click="goSearch">
              <div class="book-cover">
                <img :src="book.cover" :alt="book.title" />

                <div class="book-hover">
                  <v-btn color="primary" rounded="lg" size="small">
                    Xem ngay
                  </v-btn>
                </div>
              </div>

              <div class="book-category">
                {{ book.category }}
              </div>

              <h4>{{ book.title }}</h4>
              <p>{{ book.author }}</p>
            </div>
          </v-col>
        </v-row>
      </section>

      <!-- Stats -->
      <section id="stats" class="stats-section">
        <div class="home-container">
          <v-row>
            <v-col
              v-for="stat in stats"
              :key="stat.label"
              cols="12"
              md="4"
            >
              <div class="stat-item">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </v-col>
          </v-row>
        </div>
      </section>

      <!-- Architecture -->
      <section class="home-container section-block">
        <div class="section-heading">
          <h2>Kiến Trúc Microservices</h2>
          <p>Hệ thống được chia thành các service độc lập, đúng yêu cầu bài Fullstack - Kiến trúc</p>
        </div>

        <v-row>
          <v-col
            v-for="service in services"
            :key="service.title"
            cols="12"
            md="6"
            lg="3"
          >
            <v-card class="service-card">
              <v-icon :icon="service.icon" size="34" color="secondary" />
              <h3>{{ service.title }}</h3>
              <p>{{ service.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </main>

    <!-- Footer -->
    <footer class="home-footer">
      <div class="home-container footer-grid">
        <div class="footer-brand">
          <div class="brand footer-brand-title">
            <div class="brand-icon">
              <v-icon icon="mdi-library" size="26" />
            </div>
            <span>Thư viện Số</span>
          </div>

          <p>
            Hệ thống thư viện số hiện đại, cung cấp nền tảng lưu trữ và quản lý tri thức
            thông minh, hỗ trợ học tập và nghiên cứu hiệu quả.
          </p>

          <div class="copyright">
            © 2026 Thư viện Số. Bài tập lớn Fullstack Microservices.
          </div>
        </div>

        <div>
          <h3>Liên kết hữu ích</h3>
          <a href="#home">Trang chủ</a>
          <a href="#features">Tính năng</a>
          <a href="#books">Sách mới</a>
          <a href="#stats">Thống kê</a>
        </div>

        <div>
          <h3>Hệ thống</h3>
          <router-link to="/login">Đăng nhập</router-link>
          <router-link to="/register">Đăng ký độc giả</router-link>
          <a href="#features">Tra cứu sách</a>
          <a href="#stats">Báo cáo</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const isScrolled = ref(false)
const mobileMenu = ref(false)
const searchKeyword = ref('')

const displayRole = computed(() => {
  if (auth.role === 'Admin') return 'Quản trị viên'
  if (auth.role === 'Librarian') return 'Thủ thư'
  if (auth.role === 'Reader') return 'Độc giả'
  return auth.role || 'Người dùng'
})

const features = [
  {
    icon: 'mdi-book-open-page-variant',
    title: 'Quản lý sách số',
    description: 'Quản lý mã sách, ảnh bìa, tác giả, nhà xuất bản, số lượng bản và trạng thái cho mượn.'
  },
  {
    icon: 'mdi-account-group',
    title: 'Quản lý độc giả',
    description: 'Theo dõi mã độc giả, tài khoản, thẻ thư viện, ngày hết hạn và trạng thái sử dụng.'
  },
  {
    icon: 'mdi-clipboard-text-clock',
    title: 'Mượn trả sách',
    description: 'Tạo phiếu mượn, trả sách, kiểm tra quá hạn, tự động tính phí phạt.'
  },
  {
    icon: 'mdi-chart-bar',
    title: 'Báo cáo thống kê',
    description: 'Cung cấp dashboard tổng quan, top sách được mượn nhiều và tình hình hoạt động thư viện.'
  }
]

const newBooks = [
  {
    title: 'Thiết Kế Đời Người',
    author: 'Bill Burnett',
    category: 'Khoa học',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Tư Duy Nhanh Và Chậm',
    author: 'Daniel Kahneman',
    category: 'Kinh tế',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Chuyển Đổi Số',
    author: 'Nhiều tác giả',
    category: 'Công nghệ',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Suối Nguồn',
    author: 'Ayn Rand',
    category: 'Văn học',
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Nguyên Lý Kế Toán',
    author: 'ĐH Kinh tế',
    category: 'Giáo trình',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'
  }
]

const stats = [
  { value: '10,000+', label: 'Đầu sách số' },
  { value: '50,000+', label: 'Người dùng tích cực' },
  { value: '2M+', label: 'Lượt mượn / đọc trực tuyến' }
]

const services = [
  {
    icon: 'mdi-bookshelf',
    title: 'Catalog Service',
    description: 'Quản lý sách, ảnh bìa, số lượng bản, tìm kiếm và trạng thái còn/hết.'
  },
  {
    icon: 'mdi-swap-horizontal-bold',
    title: 'Circulation Service',
    description: 'Quản lý phiếu mượn, trả sách, quá hạn, phí phạt và thanh toán.'
  },
  {
    icon: 'mdi-account-key',
    title: 'Identity & Report',
    description: 'Đăng nhập JWT, tài khoản, độc giả, thẻ thư viện và báo cáo thống kê.'
  },
  {
    icon: 'mdi-api',
    title: 'API Gateway',
    description: 'Điều phối request từ frontend đến các service độc lập trong hệ thống.'
  }
]

function goToApp() {
  if (['Admin', 'Librarian'].includes(auth.role)) {
    router.push('/app/dashboard')
    return
  }

  router.push('/app/books')
}

function logout() {
  auth.logout()
  router.push('/')
}

function goSearch() {
  if (auth.isLoggedIn) {
    router.push('/app/books')
    return
  }

  router.push('/login')
}

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f9ff;
  color: #0b1c30;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.home-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 32px;
  padding-right: 32px;
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(248, 249, 255, 0.72);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(198, 198, 205, 0.38);
  transition: all 0.25s ease;
}

.home-header-scrolled {
  background: rgba(248, 249, 255, 0.94);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

.header-inner {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  color: #0b1c30;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 900;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #00687a;
  background: #acedff;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 28px;
}

.desktop-nav a {
  color: #45464d;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.desktop-nav a:hover,
.desktop-nav a.active {
  color: #00687a;
}

.desktop-nav a.active {
  border-bottom: 2px solid #00687a;
  padding-bottom: 6px;
}

.desktop-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-mini {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  font-weight: 900;
  color: #0f172a;
}

.user-role {
  font-size: 12px;
  color: #00687a;
  font-weight: 800;
}

.mobile-menu-btn {
  display: none;
}

.mobile-menu {
  display: none;
}

.hero-section {
  min-height: 819px;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 80px 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.22), transparent 32%),
    radial-gradient(circle at 80% 30%, rgba(37, 99, 235, 0.24), transparent 34%),
    linear-gradient(135deg, #0f172a 0%, #172554 48%, #0b1120 100%);
  animation: heroMove 9s ease-in-out infinite alternate;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(248, 249, 255, 0.22);
  backdrop-filter: blur(2px);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #003c46;
  background: rgba(172, 237, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.72);
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 900;
  margin-bottom: 28px;
  box-shadow: 0 18px 48px rgba(6, 182, 212, 0.18);
}

.hero-content h1 {
  max-width: 900px;
  margin: 0 auto 24px;
  font-size: clamp(42px, 6vw, 76px);
  line-height: 1.04;
  letter-spacing: -0.06em;
  font-weight: 1000;
  color: #131b2e;
}

.hero-content p {
  max-width: 760px;
  margin: 0 auto 38px;
  color: #45464d;
  font-size: 19px;
  line-height: 1.7;
}

.hero-search {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 10px 10px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.86);
  box-shadow: 0 26px 70px rgba(15, 23, 42, 0.16);
}

.hero-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 17px;
  min-width: 0;
  padding: 14px 0;
}

.hero-search input::placeholder {
  color: #818486;
}

.hero-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.main-content {
  padding: 80px 0;
}

.section-block {
  margin-bottom: 92px;
}

.section-heading {
  text-align: center;
  margin-bottom: 48px;
}

.section-heading h2,
.section-title-row h2 {
  color: #131b2e;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.2;
  letter-spacing: -0.04em;
  font-weight: 1000;
  margin-bottom: 10px;
}

.section-heading p,
.section-title-row p {
  color: #45464d;
  font-size: 16px;
}

.feature-card {
  height: 100%;
  padding: 32px;
  border-radius: 24px !important;
  background: #ffffff !important;
  border: 1px solid rgba(198, 198, 205, 0.35);
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.055) !important;
  transition: all 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.1) !important;
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: #e5eeff;
  color: #00687a;
  margin-bottom: 24px;
  transition: all 0.25s ease;
}

.feature-card:hover .feature-icon {
  background: #acedff;
}

.feature-card h3 {
  color: #0b1c30;
  font-size: 21px;
  font-weight: 950;
  margin-bottom: 12px;
}

.feature-card p {
  color: #45464d;
  line-height: 1.7;
}

.section-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}

.book-card {
  cursor: pointer;
}

.book-cover {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 18px;
  overflow: hidden;
  background: #d3e4fe;
  border: 1px solid rgba(198, 198, 205, 0.28);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  margin-bottom: 15px;
  transition: all 0.25s ease;
}

.book-card:hover .book-cover {
  transform: translateY(-6px);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-hover {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 104, 122, 0.18);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.book-card:hover .book-hover {
  opacity: 1;
}

.book-category {
  display: inline-flex;
  color: #00687a;
  background: rgba(0, 104, 122, 0.1);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 8px;
}

.book-card h4 {
  color: #0b1c30;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 950;
  margin-bottom: 5px;
}

.book-card p {
  color: #45464d;
  font-size: 13px;
}

.stats-section {
  background: #eff4ff;
  border-top: 1px solid rgba(198, 198, 205, 0.36);
  border-bottom: 1px solid rgba(198, 198, 205, 0.36);
  padding: 68px 0;
  margin-bottom: 92px;
}

.stat-item {
  text-align: center;
  padding: 16px;
}

.stat-number {
  font-size: clamp(42px, 5vw, 64px);
  line-height: 1;
  font-weight: 1000;
  color: #00687a;
  letter-spacing: -0.05em;
  margin-bottom: 12px;
}

.stat-label {
  color: #45464d;
  font-size: 18px;
}

.service-card {
  height: 100%;
  padding: 28px;
  border-radius: 24px !important;
  background: #ffffff !important;
  border: 1px solid rgba(198, 198, 205, 0.32);
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.055) !important;
}

.service-card h3 {
  margin: 18px 0 10px;
  color: #0f172a;
  font-weight: 950;
  font-size: 19px;
}

.service-card p {
  color: #45464d;
  line-height: 1.65;
}

.home-footer {
  background: #ffffff;
  border-top: 1px solid rgba(198, 198, 205, 0.34);
  padding: 78px 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 42px;
}

.footer-brand-title {
  margin-bottom: 20px;
}

.footer-brand p {
  color: #45464d;
  max-width: 520px;
  line-height: 1.7;
  margin-bottom: 18px;
}

.copyright {
  color: #76777d;
  font-size: 13px;
}

.home-footer h3 {
  color: #0f172a;
  font-weight: 950;
  margin-bottom: 18px;
}

.home-footer a {
  display: block;
  color: #45464d;
  text-decoration: none;
  margin-bottom: 12px;
  transition: color 0.2s ease;
}

.home-footer a:hover {
  color: #00687a;
  text-decoration: underline;
}

@keyframes heroMove {
  0% {
    transform: scale(1);
    filter: hue-rotate(0deg);
  }

  100% {
    transform: scale(1.05);
    filter: hue-rotate(12deg);
  }
}

@media (max-width: 960px) {
  .home-container {
    padding-left: 20px;
    padding-right: 20px;
  }

  .desktop-nav,
  .desktop-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .mobile-menu {
    display: block;
    padding-bottom: 18px;
  }

  .mobile-menu a {
    display: block;
    color: #0f172a;
    text-decoration: none;
    font-weight: 800;
    padding: 12px 0;
    border-bottom: 1px solid rgba(198, 198, 205, 0.32);
  }

  .mobile-menu-actions {
    display: grid;
    gap: 10px;
    margin-top: 16px;
  }

  .hero-section {
    min-height: 720px;
  }

  .hero-search {
    flex-direction: column;
    align-items: stretch;
    padding: 18px;
  }

  .hero-search input {
    width: 100%;
  }

  .section-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>