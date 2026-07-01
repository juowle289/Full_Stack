<template>
  <div class="auth-page">
    <div class="auth-shell">
      <!-- Left: Form -->
      <section class="auth-form-section">
        <div class="auth-form-wrapper">
          <div class="auth-top-row">
            <router-link to="/" class="auth-brand">
              <v-icon icon="mdi-bookshelf" size="22" />
              <span>Thư Viện Số</span>
            </router-link>

            <router-link to="/" class="back-home-link">
              <v-icon icon="mdi-arrow-left" size="16" />
              Trang chủ
            </router-link>
          </div>

          <div class="auth-heading">
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập để tiếp tục hành trình tri thức của bạn.</p>
          </div>

          <div v-if="error" class="error-banner">
            <v-icon icon="mdi-alert-circle" size="20" />
            <div>
              <div class="error-title">Đăng nhập không thành công</div>
              <div class="error-message">{{ error }}</div>
            </div>
          </div>

          <form class="auth-form" @submit.prevent="handleLogin">
            <div class="field-group">
              <label>Email</label>
              <div class="input-wrap" :class="{ 'input-error': error }">
                <v-icon icon="mdi-email-outline" size="20" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Ví dụ: nva@gmail.com"
                  autocomplete="email"
                  :disabled="loading"
                  @keyup.enter="handleLogin"
                />
                <v-icon v-if="error" icon="mdi-alert" size="18" color="var(--dl-error)" />
              </div>
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label>Mật khẩu</label>
                <button type="button" class="link-btn" @click="showForgotMessage">Quên mật khẩu?</button>
              </div>

              <div class="input-wrap" :class="{ 'input-error': error }">
                <v-icon icon="mdi-lock-outline" size="20" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu"
                  autocomplete="current-password"
                  :disabled="loading"
                  @keyup.enter="handleLogin"
                />
                <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                  <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
                </button>
              </div>
            </div>

            <label class="remember-row">
              <input v-model="rememberMe" type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              rounded="lg"
              :loading="loading"
            >
              Đăng nhập
            </v-btn>

            <div class="divider"><span>hoặc</span></div>

            <button type="button" class="google-btn" @click="showGoogleMessage">
              <svg viewBox="0 0 24 24" class="google-icon">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Đăng nhập bằng Google
            </button>
          </form>

          <p class="switch-text">
            Chưa có tài khoản?
            <router-link to="/register">Đăng ký ngay</router-link>
          </p>
        </div>
      </section>

      <!-- Right: Visual -->
      <section class="auth-visual-section">
        <div class="visual-grain"></div>

        <div class="quote-card">
          <v-icon icon="mdi-format-quote-open" size="40" color="var(--dl-accent-gold)" />

          <blockquote>
            "Thư viện không chỉ là nơi lưu trữ sách, mà là cánh cửa mở ra những thế giới chưa từng được khám phá."
          </blockquote>

          <div class="quote-footer">
            <div class="quote-line"></div>
            <div>
              <div class="quote-name">TRI THỨC SỐ</div>
              <div class="quote-role">Kết nối quá khứ và tương lai</div>
            </div>
          </div>
        </div>

        <div class="visual-badges">
          <span class="visual-badge"><v-icon icon="mdi-book-open-page-variant-outline" size="16" /> +10.000 Đầu sách</span>
          <span class="visual-badge"><v-icon icon="mdi-school-outline" size="16" /> Tài liệu học thuật</span>
        </div>

        <div class="visual-caption">Nền tảng Thư viện Hiện đại</div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const router = useRouter()
const auth = useAuthStore()

function homeForRole(role) {
  if (['Admin', 'Librarian'].includes(role)) return '/app/dashboard'
  if (role === 'Reader') return '/app/browse'
  return '/'
}

async function handleLogin() {
  error.value = ''

  if (!email.value) {
    error.value = 'Vui lòng nhập email'
    return
  }

  if (!password.value) {
    error.value = 'Vui lòng nhập mật khẩu'
    return
  }

  loading.value = true

  try {
    const user = await auth.login(email.value, password.value)

    if (rememberMe.value) {
      localStorage.setItem('rememberEmail', email.value)
    } else {
      localStorage.removeItem('rememberEmail')
    }

    router.push(homeForRole(user.role))
  } catch (err) {
    error.value = err.response?.data?.message || 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin và thử lại.'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function showForgotMessage() {
  error.value = 'Chức năng quên mật khẩu chưa được triển khai trong phạm vi bài hiện tại.'
}

function showGoogleMessage() {
  error.value = 'Đăng nhập Google chỉ hiển thị theo giao diện mẫu. Backend hiện đang dùng Email/Mật khẩu bằng JWT.'
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-page {
  min-height: 100vh;
  background: var(--dl-background-paper);
  font-family: var(--dl-font-body);
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.auth-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 64px;
}

.auth-form-wrapper {
  width: 100%;
  max-width: 440px;
}

.auth-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 64px;
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 19px;
  color: var(--dl-primary-dark);
}

.back-home-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--dl-text-muted);
}

.back-home-link:hover {
  color: var(--dl-primary);
}

.auth-heading h1 {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: clamp(30px, 4vw, 38px);
  color: var(--dl-primary-dark);
  margin-bottom: 8px;
}

.auth-heading p {
  color: var(--dl-text-muted);
  font-size: 15px;
  margin-bottom: 28px;
}

.error-banner {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--dl-radius-md);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  color: var(--dl-error);
  margin-bottom: 22px;
}

.error-title {
  font-weight: 700;
  font-size: 13.5px;
}

.error-message {
  font-size: 12.5px;
  margin-top: 2px;
  opacity: 0.92;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group label {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin-bottom: 6px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.field-label-row label {
  margin-bottom: 0;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dl-secondary);
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--dl-radius-md);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  color: var(--dl-text-muted);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrap:focus-within {
  border-color: var(--dl-primary);
  box-shadow: 0 0 0 3px rgba(38, 67, 97, 0.1);
}

.input-wrap.input-error {
  border-color: var(--dl-error);
}

.input-wrap.input-error:focus-within {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14.5px;
  color: var(--dl-text-primary);
  min-width: 0;
}

.eye-btn {
  border: none;
  background: none;
  padding: 0;
  display: flex;
  color: var(--dl-text-muted);
  cursor: pointer;
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--dl-text-primary);
  cursor: pointer;
}

.remember-row input {
  width: 16px;
  height: 16px;
  accent-color: var(--dl-primary);
}

.divider {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 2px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  border-top: 1px solid var(--dl-border);
}

.divider span {
  position: relative;
  background: var(--dl-background-paper);
  padding: 0 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dl-text-muted);
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 13px;
  border-radius: var(--dl-radius-md);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  font-size: 14px;
  font-weight: 600;
  color: var(--dl-text-primary);
  cursor: pointer;
}

.google-btn:hover {
  background: var(--dl-surface-container-low);
}

.google-icon {
  width: 18px;
  height: 18px;
}

.switch-text {
  margin-top: 28px;
  text-align: center;
  font-size: 13.5px;
  color: var(--dl-text-muted);
}

.switch-text a {
  color: var(--dl-primary);
  font-weight: 700;
  text-decoration: none;
}

.switch-text a:hover {
  text-decoration: underline;
}

/* Visual panel */
.auth-visual-section {
  position: relative;
  background: linear-gradient(160deg, var(--dl-primary-dark) 0%, #0a1422 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  overflow: hidden;
}

.visual-grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.quote-card {
  position: relative;
  z-index: 1;
  max-width: 480px;
  padding: 36px;
  border-radius: var(--dl-radius-lg);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.quote-card blockquote {
  font-family: var(--dl-font-headline);
  color: #fff;
  font-size: clamp(20px, 2.4vw, 25px);
  line-height: 1.5;
  font-weight: 700;
  margin: 18px 0 24px;
}

.quote-footer {
  display: flex;
  align-items: center;
  gap: 14px;
}

.quote-line {
  width: 36px;
  height: 3px;
  background: var(--dl-accent-gold);
  border-radius: 999px;
}

.quote-name {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--dl-accent-gold);
}

.quote-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.visual-badges {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.visual-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 7px 14px;
  border-radius: var(--dl-radius-full);
}

.visual-caption {
  position: absolute;
  bottom: 28px;
  right: 40px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-visual-section {
    display: none;
  }

  .auth-form-section {
    padding: 36px 22px;
  }

  .auth-top-row {
    margin-bottom: 40px;
  }
}
</style>
