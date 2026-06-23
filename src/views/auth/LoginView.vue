<template>
  <v-app>
    <v-main>
      <div class="login-page">
        <main class="login-shell">
          <!-- Left: Form -->
          <section class="login-form-section">
            <div class="login-form-wrapper">
              <router-link to="/" class="login-brand">
                <div class="login-brand-icon">
                  <v-icon icon="mdi-library" size="30" />
                </div>
                <span>Thư viện Số</span>
              </router-link>

              <div class="login-heading">
                <h1>Chào mừng trở lại</h1>
                <p>Vui lòng đăng nhập để truy cập hệ thống quản lý thư viện số.</p>
              </div>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mb-5"
              >
                {{ error }}
              </v-alert>

              <form class="login-form" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="email"
                  label="Email"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  placeholder="Nhập email đăng nhập"
                  autocomplete="email"
                  :disabled="loading"
                />

                <v-text-field
                  v-model="password"
                  label="Mật khẩu"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  placeholder="Nhập mật khẩu"
                  autocomplete="current-password"
                  :disabled="loading"
                  @click:append-inner="showPassword = !showPassword"
                  @keyup.enter="handleLogin"
                />

                <div class="login-options">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Ghi nhớ đăng nhập"
                    density="compact"
                    hide-details
                    color="secondary"
                  />

                  <button
                    type="button"
                    class="forgot-link"
                    @click="showForgotMessage"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  rounded="lg"
                  prepend-icon="mdi-login"
                  :loading="loading"
                >
                  Đăng nhập
                </v-btn>

                <div class="divider">
                  <span>Hoặc tiếp tục với</span>
                </div>

                <v-btn
                  type="button"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  block
                  rounded="lg"
                  class="google-btn"
                  @click="showGoogleMessage"
                >
                  <span class="google-icon">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </span>
                  Đăng nhập với Google
                </v-btn>
              </form>

              <p class="register-text">
                Chưa có tài khoản?
                <router-link to="/register">Đăng ký ngay</router-link>
              </p>

              <div class="back-home">
                <router-link to="/">
                  <v-icon icon="mdi-arrow-left" size="18" />
                  Quay về trang chủ
                </router-link>
              </div>
            </div>
          </section>

          <!-- Right: Visual -->
          <section class="login-visual-section">
            <div class="visual-pattern"></div>
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>

            <div class="quote-card">
              <v-icon icon="mdi-format-quote-open" size="58" color="secondary" />

              <blockquote>
                “Thư viện không chỉ là nơi lưu trữ sách, mà là cánh cổng mở ra những khả năng vô tận của tri thức.”
              </blockquote>

              <div class="quote-footer">
                <div class="quote-line"></div>
                <span>Hệ thống thư viện số</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </v-main>
  </v-app>
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

    if (['Admin', 'Librarian'].includes(user.role)) {
      router.push('/app/dashboard')
    } else if (user.role === 'Reader') {
      router.push('/app/books')
    } else {
      router.push('/app/books')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng nhập thất bại'
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
.login-page {
  min-height: 100vh;
  background: #f8f9ff;
  color: #0b1c30;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-shell {
  min-height: 100vh;
  display: flex;
}

.login-form-section {
  width: 50%;
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 72px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 480px;
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #0f172a;
  text-decoration: none;
  font-size: 24px;
  font-weight: 950;
  margin-bottom: 54px;
}

.login-brand-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #00687a;
  background: #acedff;
}

.login-heading {
  margin-bottom: 32px;
}

.login-heading h1 {
  color: #0f172a;
  font-size: clamp(38px, 4vw, 54px);
  line-height: 1.05;
  letter-spacing: -0.06em;
  font-weight: 1000;
  margin-bottom: 16px;
}

.login-heading p {
  color: #45464d;
  font-size: 18px;
  line-height: 1.65;
}

.login-form {
  display: grid;
  gap: 18px;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: -4px;
}

.forgot-link {
  border: none;
  background: transparent;
  color: #00687a;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
}

.forgot-link:hover {
  color: #0f172a;
  text-decoration: underline;
}

.divider {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  border-top: 1px solid #d7deeb;
}

.divider span {
  position: relative;
  z-index: 2;
  background: #ffffff;
  padding: 0 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.google-btn {
  text-transform: none;
}

.google-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  margin-right: 8px;
}

.google-icon svg {
  width: 20px;
  height: 20px;
}

.register-text {
  margin-top: 26px;
  text-align: center;
  color: #45464d;
  font-weight: 600;
}

.register-text a {
  color: #00687a;
  font-weight: 950;
  text-decoration: none;
}

.register-text a:hover {
  color: #0f172a;
  text-decoration: underline;
}

.back-home {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.back-home a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  text-decoration: none;
  font-weight: 800;
}

.back-home a:hover {
  color: #00687a;
}

.login-visual-section {
  width: 50%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(0, 104, 122, 0.22), transparent 42%),
    linear-gradient(135deg, #131b2e 0%, #0f172a 52%, #111827 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px;
}

.visual-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: radial-gradient(circle, rgba(172, 237, 255, 0.85) 1px, transparent 1px);
  background-size: 40px 40px;
}

.quote-card {
  position: relative;
  z-index: 2;
  max-width: 560px;
  padding: 48px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.24);
}

.quote-card blockquote {
  color: #131b2e;
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.35;
  font-weight: 850;
  letter-spacing: -0.03em;
  margin: 22px 0 28px;
}

.quote-footer {
  display: flex;
  align-items: center;
  gap: 18px;
}

.quote-line {
  width: 52px;
  height: 4px;
  background: #00687a;
  border-radius: 999px;
}

.quote-footer span {
  color: #45464d;
  font-size: 13px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  pointer-events: none;
}

.orb-1 {
  top: 22%;
  right: -110px;
  width: 380px;
  height: 380px;
  background: rgba(87, 223, 254, 0.34);
}

.orb-2 {
  bottom: -90px;
  left: 22%;
  width: 340px;
  height: 340px;
  background: rgba(190, 198, 224, 0.28);
}

@media (max-width: 960px) {
  .login-shell {
    display: block;
  }

  .login-form-section {
    width: 100%;
    min-height: 100vh;
    padding: 40px 22px;
  }

  .login-brand {
    margin-bottom: 36px;
  }

  .login-visual-section {
    display: none;
  }

  .login-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>