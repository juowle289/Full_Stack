<template>
  <v-app>
    <v-main>
      <div class="register-page">
        <main class="register-shell">
          <!-- Left: Register Form -->
          <section class="register-form-section">
            <div class="register-form-wrapper">
              <router-link to="/" class="register-brand">
                <div class="register-brand-icon">
                  <v-icon icon="mdi-library" size="30" />
                </div>
                <span>Thư viện Số</span>
              </router-link>

              <div class="register-heading">
                <h1>Tạo tài khoản mới</h1>
                <p>Tham gia hệ thống thư viện số và bắt đầu quản lý quá trình mượn sách của bạn.</p>
              </div>

              <v-alert
                v-if="message"
                :type="success ? 'success' : 'error'"
                variant="tonal"
                rounded="lg"
                class="mb-5"
              >
                {{ message }}
              </v-alert>

              <form class="register-form" @submit.prevent="handleRegister">
                <v-text-field
                  v-model="form.fullName"
                  label="Họ và tên"
                  prepend-inner-icon="mdi-account-outline"
                  placeholder="Nhập họ và tên của bạn"
                  autocomplete="name"
                  :disabled="loading"
                />

                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  placeholder="name@example.com"
                  autocomplete="email"
                  :disabled="loading"
                />

                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.password"
                      label="Mật khẩu"
                      :type="showPassword ? 'text' : 'password'"
                      prepend-inner-icon="mdi-lock-outline"
                      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      placeholder="Nhập mật khẩu"
                      autocomplete="new-password"
                      :disabled="loading"
                      @click:append-inner="showPassword = !showPassword"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.confirmPassword"
                      label="Xác nhận mật khẩu"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      prepend-inner-icon="mdi-lock-check-outline"
                      :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      placeholder="Nhập lại mật khẩu"
                      autocomplete="new-password"
                      :disabled="loading"
                      @click:append-inner="showConfirmPassword = !showConfirmPassword"
                    />
                  </v-col>
                </v-row>

                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.studentCode"
                      label="Mã sinh viên / Mã độc giả"
                      prepend-inner-icon="mdi-card-account-details-outline"
                      placeholder="VD: SV001"
                      :disabled="loading"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.phone"
                      label="Số điện thoại"
                      prepend-inner-icon="mdi-phone-outline"
                      placeholder="Nhập số điện thoại"
                      :disabled="loading"
                    />
                  </v-col>
                </v-row>

                <v-textarea
                  v-model="form.address"
                  label="Địa chỉ"
                  prepend-inner-icon="mdi-map-marker-outline"
                  placeholder="Nhập địa chỉ liên hệ"
                  rows="2"
                  auto-grow
                  :disabled="loading"
                />

                <div class="terms-row">
                  <v-checkbox
                    v-model="agreeTerms"
                    density="compact"
                    hide-details
                    color="secondary"
                  />

                  <div class="terms-text">
                    Tôi đồng ý với các
                    <button type="button" @click="showPolicyMessage">Điều khoản</button>
                    và
                    <button type="button" @click="showPolicyMessage">Chính sách</button>
                    của hệ thống thư viện số.
                  </div>
                </div>

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  rounded="lg"
                  prepend-icon="mdi-account-plus"
                  :loading="loading"
                >
                  Đăng ký
                </v-btn>

                <div class="divider">
                  <span>hoặc</span>
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
                  Đăng ký với Google
                </v-btn>
              </form>

              <p class="login-text">
                Đã có tài khoản?
                <router-link to="/login">Đăng nhập ngay</router-link>
              </p>

              <div class="back-home">
                <router-link to="/">
                  <v-icon icon="mdi-arrow-left" size="18" />
                  Quay về trang chủ
                </router-link>
              </div>
            </div>
          </section>

          <!-- Right: Visual Panel -->
          <section class="register-visual-section">
            <div class="visual-pattern"></div>
            <div class="visual-gradient"></div>
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>

            <div class="quote-card">
              <v-icon icon="mdi-format-quote-open" size="56" color="secondary" />

              <blockquote>
                “Tri thức là sức mạnh, và chia sẻ tri thức là nhân lên sức mạnh đó.”
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
import { authApi } from '../../api/authApi'

const router = useRouter()

const loading = ref(false)
const message = ref('')
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  studentCode: '',
  phone: '',
  address: ''
})

async function handleRegister() {
  message.value = ''

  const error = validateForm()

  if (error) {
    success.value = false
    message.value = error
    return
  }

  loading.value = true

  try {
    await authApi.register({
      fullName: form.value.fullName.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      studentCode: form.value.studentCode.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim()
    })

    success.value = true
    message.value = 'Đăng ký thành công. Hệ thống đã tạo tài khoản độc giả và thẻ thư viện cho bạn.'

    setTimeout(() => {
      router.push('/login')
    }, 900)
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function validateForm() {
  if (!form.value.fullName.trim()) return 'Vui lòng nhập họ và tên'
  if (!form.value.email.trim()) return 'Vui lòng nhập email'
  if (!form.value.password) return 'Vui lòng nhập mật khẩu'
  if (form.value.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
  if (!form.value.confirmPassword) return 'Vui lòng xác nhận mật khẩu'
  if (form.value.password !== form.value.confirmPassword) return 'Mật khẩu xác nhận không khớp'
  if (!form.value.studentCode.trim()) return 'Vui lòng nhập mã sinh viên hoặc mã độc giả'
  if (!agreeTerms.value) return 'Vui lòng đồng ý với điều khoản và chính sách'

  return ''
}

function showGoogleMessage() {
  success.value = false
  message.value = 'Đăng ký Google chỉ hiển thị theo giao diện mẫu. Backend hiện đang dùng đăng ký Email/Mật khẩu.'
}

function showPolicyMessage() {
  success.value = false
  message.value = 'Điều khoản và chính sách đang được mô phỏng trong phạm vi bài hiện tại.'
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f8f9ff;
  color: #0b1c30;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.register-shell {
  min-height: 100vh;
  display: flex;
}

.register-form-section {
  width: 50%;
  min-height: 100vh;
  background: #f8f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 72px;
}

.register-form-wrapper {
  width: 100%;
  max-width: 520px;
}

.register-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #0f172a;
  text-decoration: none;
  font-size: 24px;
  font-weight: 950;
  margin-bottom: 42px;
}

.register-brand-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #00687a;
  background: #acedff;
}

.register-heading {
  margin-bottom: 28px;
}

.register-heading h1 {
  color: #0f172a;
  font-size: clamp(34px, 4vw, 46px);
  line-height: 1.08;
  letter-spacing: -0.05em;
  font-weight: 1000;
  margin-bottom: 12px;
}

.register-heading p {
  color: #45464d;
  font-size: 16px;
  line-height: 1.65;
}

.register-form {
  display: grid;
  gap: 16px;
}

.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.terms-text {
  color: #45464d;
  font-size: 14px;
  line-height: 1.6;
  padding-top: 9px;
}

.terms-text button {
  border: none;
  background: transparent;
  color: #00687a;
  font-weight: 900;
  cursor: pointer;
  padding: 0;
}

.terms-text button:hover {
  color: #0f172a;
  text-decoration: underline;
}

.divider {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 4px 0;
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
  background: #f8f9ff;
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

.login-text {
  margin-top: 26px;
  text-align: center;
  color: #45464d;
  font-weight: 600;
}

.login-text a {
  color: #00687a;
  font-weight: 950;
  text-decoration: none;
}

.login-text a:hover {
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

.register-visual-section {
  width: 50%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px;
}

.visual-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
  background-size: 24px 24px;
}

.visual-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 25%, rgba(6, 182, 212, 0.2), transparent 30%),
    linear-gradient(135deg, rgba(19, 27, 46, 0.9), rgba(15, 23, 42, 0.2));
}

.quote-card {
  position: relative;
  z-index: 2;
  max-width: 560px;
  padding: 42px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.58);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.24);
}

.quote-card blockquote {
  color: #ffffff;
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
  background: #57dffe;
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
  filter: blur(82px);
  pointer-events: none;
}

.orb-1 {
  top: 18%;
  right: -110px;
  width: 380px;
  height: 380px;
  background: rgba(87, 223, 254, 0.34);
}

.orb-2 {
  bottom: -90px;
  left: 20%;
  width: 340px;
  height: 340px;
  background: rgba(190, 198, 224, 0.28);
}

@media (max-width: 1100px) {
  .register-form-section {
    padding: 40px 36px;
  }

  .register-visual-section {
    padding: 48px;
  }
}

@media (max-width: 960px) {
  .register-shell {
    display: block;
  }

  .register-form-section {
    width: 100%;
    min-height: 100vh;
    padding: 40px 22px;
  }

  .register-brand {
    margin-bottom: 32px;
  }

  .register-visual-section {
    display: none;
  }
}
</style>