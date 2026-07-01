<template>
  <div class="auth-page">
    <div class="auth-shell">
      <!-- Left: Form / Success -->
      <section class="auth-form-section">
        <div class="auth-form-wrapper">
          <!-- Trạng thái thành công -->
          <template v-if="success">
            <router-link to="/" class="auth-brand mb-10">
              <v-icon icon="mdi-bookshelf" size="22" />
              <span>Thư Viện Số</span>
            </router-link>

            <div class="success-state">
              <div class="success-icon">
                <v-icon icon="mdi-check" size="30" />
              </div>

              <h1>Đăng ký thành công!</h1>
              <p>Tài khoản độc giả của bạn đã sẵn sàng. Bạn có thể sử dụng tất cả dịch vụ của Thư Viện Số ngay bây giờ.</p>

              <v-btn color="primary" size="large" rounded="lg" block append-icon="mdi-arrow-right" @click="router.push('/login')">
                Đăng nhập ngay
              </v-btn>

              <router-link to="/" class="back-home-text">Trở về trang chủ</router-link>
            </div>
          </template>

          <!-- Form đăng ký -->
          <template v-else>
            <router-link to="/" class="auth-brand">
              <v-icon icon="mdi-bookshelf" size="22" />
              <span>Thư Viện Số</span>
            </router-link>

            <div class="auth-heading">
              <h1>Đăng ký thẻ thư viện</h1>
              <p>Vui lòng điền thông tin để tạo tài khoản mới.</p>
            </div>

            <div v-if="message" class="error-banner" :class="{ 'error-banner-success': success }">
              <v-icon :icon="success ? 'mdi-check-circle' : 'mdi-alert-circle'" size="20" />
              <div class="error-message">{{ message }}</div>
            </div>

            <form class="auth-form" @submit.prevent="handleRegister">
              <div class="field-group">
                <label>Họ và tên</label>
                <div class="input-wrap">
                  <input v-model="form.fullName" placeholder="Nhập họ và tên của bạn" autocomplete="name" :disabled="loading" />
                </div>
              </div>

              <div class="field-group">
                <label>Email</label>
                <div class="input-wrap">
                  <input v-model="form.email" type="email" placeholder="ví dụ: tenban@email.com" autocomplete="email" :disabled="loading" />
                </div>
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label>Mật khẩu</label>
                  <div class="input-wrap">
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Tạo mật khẩu"
                      autocomplete="new-password"
                      :disabled="loading"
                    />
                    <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                      <v-icon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
                    </button>
                  </div>
                </div>

                <div class="field-group">
                  <label>Xác nhận mật khẩu</label>
                  <div class="input-wrap">
                    <input
                      v-model="form.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="Nhập lại mật khẩu"
                      autocomplete="new-password"
                      :disabled="loading"
                    />
                    <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
                      <v-icon :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'" size="20" />
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="form.password" class="strength-row">
                <div class="strength-bar">
                  <span :class="{ active: strengthLevel >= 1, [strengthClass]: strengthLevel >= 1 }"></span>
                  <span :class="{ active: strengthLevel >= 2, [strengthClass]: strengthLevel >= 2 }"></span>
                  <span :class="{ active: strengthLevel >= 3, [strengthClass]: strengthLevel >= 3 }"></span>
                </div>
                <div class="strength-hint">
                  Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt.
                </div>
              </div>

              <div v-if="confirmError" class="field-error">{{ confirmError }}</div>

              <div class="field-row">
                <div class="field-group">
                  <label>Mã SV / Mã độc giả</label>
                  <div class="input-wrap">
                    <input v-model="form.studentCode" placeholder="Nhập mã (nếu có)" :disabled="loading" />
                  </div>
                </div>

                <div class="field-group">
                  <label>Số điện thoại</label>
                  <div class="input-wrap">
                    <input v-model="form.phone" placeholder="09xx xxx xxx" :disabled="loading" />
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label>Địa chỉ</label>
                <div class="input-wrap input-wrap-textarea">
                  <textarea v-model="form.address" placeholder="Nhập địa chỉ hiện tại của bạn" rows="2" :disabled="loading"></textarea>
                </div>
              </div>

              <label class="terms-row">
                <input v-model="agreeTerms" type="checkbox" />
                <span>
                  Tôi đồng ý với
                  <button type="button" class="link-btn" @click="showPolicyMessage">Điều khoản dịch vụ</button>
                  và
                  <button type="button" class="link-btn" @click="showPolicyMessage">Chính sách bảo mật</button>
                  của Thư Viện Số.
                </span>
              </label>

              <v-btn type="submit" color="primary" size="large" block rounded="lg" append-icon="mdi-arrow-right" :loading="loading">
                Đăng ký
              </v-btn>

              <div class="divider"><span>hoặc</span></div>

              <button type="button" class="google-btn" @click="showGoogleMessage">
                <svg viewBox="0 0 24 24" class="google-icon">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng ký với Google
              </button>
            </form>

            <p class="switch-text">
              Đã có tài khoản?
              <router-link to="/login">Đăng nhập</router-link>
            </p>
          </template>
        </div>
      </section>

      <!-- Right: Visual -->
      <section class="auth-visual-section">
        <div class="visual-grain"></div>

        <template v-if="success">
          <h2 class="visual-title">Đặc quyền hội viên</h2>

          <div class="benefit-list">
            <div class="benefit-item">
              <div class="benefit-icon"><v-icon icon="mdi-book-open-page-variant-outline" size="18" /></div>
              <div>
                <strong>Truy cập không giới hạn</strong>
                <p>Hàng ngàn đầu sách số, tài liệu nghiên cứu và bài báo khoa học.</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon"><v-icon icon="mdi-devices" size="18" /></div>
              <div>
                <strong>Đồng bộ đa thiết bị</strong>
                <p>Tiếp tục đọc trên điện thoại, máy tính bảng hoặc web mà không gián đoạn.</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon"><v-icon icon="mdi-bookmark-outline" size="18" /></div>
              <div>
                <strong>Cá nhân hóa trải nghiệm</strong>
                <p>Tạo danh sách đọc riêng, đánh dấu trang và lưu chú thích dễ dàng.</p>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="visual-icon-badge">
            <v-icon icon="mdi-account-school-outline" size="22" />
          </div>

          <h2 class="visual-title">Khám phá tri thức vô tận.</h2>
          <p class="visual-desc">
            Tham gia hệ thống thư viện hiện đại với hàng ngàn đầu sách số và tài liệu nghiên cứu chuyên sâu.
          </p>

          <div class="benefit-label">LỢI ÍCH KHI CÓ THẺ THƯ VIỆN</div>

          <div class="benefit-list">
            <div class="benefit-item">
              <v-icon icon="mdi-check-circle" size="18" color="var(--dl-success)" />
              <div>
                <strong>Mượn sách không giới hạn chi nhánh</strong>
                <p>Truy cập mượn trả tại bất kỳ điểm thư viện nào trong hệ thống.</p>
              </div>
            </div>

            <div class="benefit-item">
              <v-icon icon="mdi-check-circle" size="18" color="var(--dl-success)" />
              <div>
                <strong>Gia hạn online dễ dàng</strong>
                <p>Tự động gia hạn sách trực tuyến chỉ với một chạm từ thiết bị di động.</p>
              </div>
            </div>

            <div class="benefit-item">
              <v-icon icon="mdi-check-circle" size="18" color="var(--dl-success)" />
              <div>
                <strong>Nhận nhắc hạn trả tự động</strong>
                <p>Hệ thống thông minh gửi email và SMS nhắc nhở trước ngày đến hạn.</p>
              </div>
            </div>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

const strengthLevel = computed(() => {
  const pw = form.value.password
  if (!pw) return 0

  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) score++

  return Math.max(1, score)
})

const strengthClass = computed(() => {
  if (strengthLevel.value >= 3) return 'strength-strong'
  if (strengthLevel.value === 2) return 'strength-medium'
  return 'strength-weak'
})

const confirmError = computed(() => {
  if (!form.value.confirmPassword) return ''
  return form.value.confirmPassword !== form.value.password ? 'Mật khẩu xác nhận không khớp' : ''
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
    message.value = ''
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
  max-width: 480px;
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
  margin-bottom: 28px;
}

.auth-heading h1 {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: clamp(26px, 3.4vw, 32px);
  color: var(--dl-primary-dark);
  margin-bottom: 6px;
}

.auth-heading p {
  color: var(--dl-text-muted);
  font-size: 14.5px;
  margin-bottom: 24px;
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 15px;
  border-radius: var(--dl-radius-md);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  color: var(--dl-error);
  margin-bottom: 18px;
  font-size: 13px;
}

.error-banner-success {
  background: rgba(31, 157, 107, 0.08);
  border-color: rgba(31, 157, 107, 0.25);
  color: var(--dl-success);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-group label {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin-bottom: 6px;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: var(--dl-radius-md);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrap:focus-within {
  border-color: var(--dl-primary);
  box-shadow: 0 0 0 3px rgba(38, 67, 97, 0.1);
}

.input-wrap input,
.input-wrap textarea {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-family: var(--dl-font-body);
  color: var(--dl-text-primary);
  min-width: 0;
  resize: vertical;
}

.input-wrap-textarea {
  align-items: flex-start;
}

.eye-btn {
  border: none;
  background: none;
  padding: 0;
  display: flex;
  color: var(--dl-text-muted);
  cursor: pointer;
}

.strength-row {
  margin-top: -6px;
}

.strength-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 6px;
}

.strength-bar span {
  height: 5px;
  border-radius: 999px;
  background: var(--dl-surface-variant);
}

.strength-bar span.strength-weak.active {
  background: var(--dl-error);
}

.strength-bar span.strength-medium.active {
  background: var(--dl-warning);
}

.strength-bar span.strength-strong.active {
  background: var(--dl-success);
}

.strength-hint {
  font-size: 11.5px;
  color: var(--dl-text-muted);
}

.field-error {
  font-size: 12px;
  color: var(--dl-error);
  margin-top: -8px;
}

.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.terms-row input {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  accent-color: var(--dl-primary);
  flex: 0 0 auto;
}

.terms-row span {
  font-size: 13px;
  line-height: 1.6;
  color: var(--dl-text-muted);
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-weight: 700;
  color: var(--dl-primary);
  cursor: pointer;
  font-size: 13px;
}

.link-btn:hover {
  text-decoration: underline;
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
  margin-top: 24px;
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

/* Success state */
.success-state {
  text-align: center;
  max-width: 400px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(31, 157, 107, 0.12);
  color: var(--dl-success);
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
}

.success-state h1 {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 28px;
  color: var(--dl-primary-dark);
  margin-bottom: 10px;
}

.success-state p {
  font-size: 14.5px;
  color: var(--dl-text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}

.back-home-text {
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--dl-text-muted);
  text-decoration: none;
}

.back-home-text:hover {
  color: var(--dl-primary);
}

/* Visual panel */
.auth-visual-section {
  position: relative;
  background: linear-gradient(160deg, var(--dl-primary-dark) 0%, #0a1422 100%);
  display: flex;
  flex-direction: column;
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

.visual-icon-badge {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(240, 168, 94, 0.18);
  color: var(--dl-accent-gold);
  display: grid;
  place-items: center;
  margin-bottom: 20px;
}

.visual-title {
  position: relative;
  z-index: 1;
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: clamp(24px, 3vw, 30px);
  color: var(--dl-accent-gold);
  margin-bottom: 12px;
  max-width: 420px;
}

.visual-desc {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14.5px;
  line-height: 1.65;
  max-width: 420px;
  margin-bottom: 28px;
}

.benefit-label {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--dl-accent-gold);
  margin-bottom: 16px;
}

.benefit-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 420px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.benefit-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(240, 168, 94, 0.15);
  color: var(--dl-accent-gold);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.benefit-item strong {
  display: block;
  color: #fff;
  font-size: 14.5px;
  font-weight: 700;
  margin-bottom: 2px;
}

.benefit-item p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.55;
  margin: 0;
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

  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
