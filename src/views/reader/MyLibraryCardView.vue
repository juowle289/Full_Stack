<template>
  <div class="card-page">
    <div class="card-page-header">
      <h1>Thẻ Thư Viện Của Tôi</h1>
      <p>Xuất trình thẻ này khi mượn sách hoặc sử dụng dịch vụ tại thư viện.</p>
    </div>

    <v-alert v-if="message" :type="success ? 'success' : 'error'" variant="tonal" rounded="lg" class="mb-5 mx-auto" max-width="560">
      {{ message }}
    </v-alert>

    <template v-if="card">
      <div class="library-card">
        <div class="card-shine"></div>

        <div class="card-top">
          <div>
            <div class="card-issuer">THƯ VIỆN SỐ QUỐC GIA</div>
            <div class="card-type">Thẻ Độc Giả</div>
          </div>

          <span class="status-pill" :class="card.status === 'Active' ? 'status-active' : 'status-inactive'">
            <span class="status-dot"></span>
            {{ getCardStatusText(card.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="card-fields">
            <div class="card-field-label">Họ và Tên</div>
            <div class="card-holder-name">{{ card.fullName }}</div>

            <div class="card-field-row">
              <div>
                <div class="card-field-label">Mã Thẻ (ID)</div>
                <div class="card-field-value">{{ card.cardNumber }}</div>
              </div>

              <div>
                <div class="card-field-label">Ngày Hết Hạn</div>
                <div class="card-field-value">{{ formatShortDate(card.expiredDate) }}</div>
              </div>
            </div>
          </div>

          <div class="card-qr">
            <img :src="qrImageUrl" alt="Mã QR thẻ thư viện" width="120" height="120" />
          </div>
        </div>
      </div>

      <div class="card-actions">
        <v-btn color="primary" size="large" rounded="lg" prepend-icon="mdi-refresh" :loading="refreshing" @click="refreshQr">
          Làm Mới Mã QR
        </v-btn>

        <v-btn variant="outlined" color="primary" size="large" rounded="lg" prepend-icon="mdi-download-outline" @click="saveCardImage">
          Lưu Ảnh Thẻ
        </v-btn>
      </div>

      <div class="usage-guide">
        <div class="usage-guide-title">
          <v-icon icon="mdi-information-outline" color="var(--dl-accent-gold)" size="20" />
          Hướng Dẫn Sử Dụng Thẻ
        </div>

        <ul>
          <li>
            <v-icon icon="mdi-check-circle-outline" size="17" />
            Mã QR trên thẻ tự động làm mới sau mỗi 5 phút để đảm bảo bảo mật. Vui lòng không chụp ảnh màn hình để sử dụng lâu dài.
          </li>
          <li>
            <v-icon icon="mdi-check-circle-outline" size="17" />
            Sử dụng thẻ này để quét tại các cổng ra vào thư viện và máy mượn trả sách tự động.
          </li>
          <li>
            <v-icon icon="mdi-check-circle-outline" size="17" />
            Trong trường hợp nghi ngờ lộ thông tin thẻ, vui lòng nhấn "Làm Mới Mã QR" hoặc liên hệ ngay với thủ thư.
          </li>
        </ul>
      </div>

      <!-- Thời hạn còn lại -->
      <div class="validity-box">
        <div class="validity-row">
          <span>Thời hạn còn lại</span>
          <strong :class="isExpired ? 'text-error' : 'text-success'">{{ daysLeftText }}</strong>
        </div>
        <v-progress-linear :model-value="validityProgress" :color="isExpired ? 'error' : 'primary'" height="8" rounded />
      </div>
    </template>

    <v-card v-else-if="!loading" class="empty-card">
      <v-icon icon="mdi-card-account-details-outline" size="48" color="var(--dl-text-muted)" />
      <h3>Không tìm thấy thông tin thẻ thư viện</h3>
      <p>Vui lòng tải lại hoặc liên hệ thủ thư để kiểm tra tài khoản.</p>
      <v-btn color="primary" variant="tonal" rounded="lg" prepend-icon="mdi-refresh" :loading="loading" @click="loadMyCard">
        Tải lại
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { libraryCardApi } from '../../api/libraryCardApi'

const card = ref(null)
const loading = ref(false)
const refreshing = ref(false)
const message = ref('')
const success = ref(true)
const qrNonce = ref(Date.now())

// Dùng dịch vụ QR public để tạo ảnh QR từ mã thẻ - không cần thêm thư viện QR riêng.
const qrImageUrl = computed(() => {
  const payload = encodeURIComponent(`${card.value?.cardNumber || ''}-${qrNonce.value}`)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${payload}`
})

const isExpired = computed(() => {
  if (!card.value?.expiredDate) return false
  return new Date(card.value.expiredDate).getTime() < new Date().getTime()
})

const daysLeft = computed(() => {
  if (!card.value?.expiredDate) return 0

  const expired = new Date(card.value.expiredDate).getTime()
  const now = new Date().getTime()

  return Math.ceil((expired - now) / (1000 * 60 * 60 * 24))
})

const daysLeftText = computed(() => {
  if (daysLeft.value < 0) return `Đã hết hạn ${Math.abs(daysLeft.value)} ngày`
  if (daysLeft.value === 0) return 'Hết hạn hôm nay'
  return `Còn ${daysLeft.value} ngày`
})

const validityProgress = computed(() => {
  if (!card.value?.issuedDate || !card.value?.expiredDate) return 0

  const issued = new Date(card.value.issuedDate).getTime()
  const expired = new Date(card.value.expiredDate).getTime()
  const now = new Date().getTime()

  if (now >= expired) return 100
  if (now <= issued) return 5

  return Math.min(100, Math.max(5, ((now - issued) / (expired - issued)) * 100))
})

async function loadMyCard() {
  loading.value = true
  message.value = ''

  try {
    const res = await libraryCardApi.getMyCard()
    card.value = res.data
    success.value = true
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được thẻ thư viện'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

async function refreshQr() {
  refreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  qrNonce.value = Date.now()
  refreshing.value = false
  success.value = true
  message.value = 'Đã làm mới mã QR'
}

function saveCardImage() {
  const link = document.createElement('a')
  link.href = qrImageUrl.value
  link.download = `the-thu-vien-${card.value?.cardNumber || 'qr'}.png`
  link.target = '_blank'
  link.click()
}

function getCardStatusText(status) {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Locked') return 'Đã khóa'
  if (status === 'Expired') return 'Hết hạn'
  return status || '-'
}

function formatShortDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
}

onMounted(loadMyCard)
</script>

<style scoped>
.card-page {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.card-page-header h1 {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: clamp(26px, 3.4vw, 34px);
  color: var(--dl-primary-dark);
  margin-bottom: 8px;
}

.card-page-header p {
  color: var(--dl-text-muted);
  font-size: 14.5px;
  margin-bottom: 32px;
}

/* Thẻ thư viện */
.library-card {
  position: relative;
  border-radius: var(--dl-radius-lg);
  padding: 28px 30px;
  background: linear-gradient(135deg, var(--dl-primary) 0%, var(--dl-primary-dark) 100%);
  box-shadow: 0 24px 60px rgba(2, 44, 34, 0.3);
  text-align: left;
  overflow: hidden;
}

.library-card::after {
  content: '';
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

/* Hiệu ứng ánh sáng quét chéo \ từ trên-phải xuống dưới-trái */
.card-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
  border-radius: inherit;
}

.card-shine::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -60%;
  width: 55%;
  height: 220%;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.28) 45%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0.28) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(20deg);
  animation: card-shine-sweep 4.5s ease-in-out infinite;
}

@keyframes card-shine-sweep {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  45%, 100% {
    transform: translate(-170%, 170%) rotate(20deg);
  }
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.card-issuer {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.65);
}

.card-type {
  font-family: var(--dl-font-headline);
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-top: 2px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: var(--dl-radius-full);
  white-space: nowrap;
}

.status-active {
  background: rgba(5, 150, 105, 0.25);
  color: #d1fae5;
}

.status-inactive {
  background: rgba(220, 38, 38, 0.25);
  color: #fecaca;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.card-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.card-field-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.card-holder-name {
  font-family: var(--dl-font-headline);
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
}

.card-field-row {
  display: flex;
  gap: 36px;
}

.card-field-value {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}

.card-qr {
  flex: 0 0 auto;
  background: #fff;
  border-radius: var(--dl-radius-md);
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.card-qr img {
  display: block;
  border-radius: 4px;
}

/* Actions */
.card-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

/* Hướng dẫn sử dụng */
.usage-guide {
  text-align: left;
  margin-top: 32px;
  padding: 22px 24px;
  border-radius: var(--dl-radius-lg);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
}

.usage-guide-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 17px;
  color: var(--dl-text-primary);
  margin-bottom: 14px;
}

.usage-guide ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.usage-guide li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--dl-text-muted);
}

.usage-guide li .v-icon {
  color: var(--dl-success);
  margin-top: 2px;
  flex: 0 0 auto;
}

/* Validity */
.validity-box {
  text-align: left;
  margin-top: 20px;
  padding: 18px 22px;
  border-radius: var(--dl-radius-lg);
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
}

.validity-row {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  color: var(--dl-text-muted);
  margin-bottom: 10px;
}

.empty-card {
  padding: 56px 24px;
  text-align: center;
}

.empty-card h3 {
  font-family: var(--dl-font-headline);
  color: var(--dl-text-primary);
  margin: 14px 0 4px;
}

.empty-card p {
  color: var(--dl-text-muted);
  font-size: 14px;
  margin-bottom: 18px;
}

@media (max-width: 560px) {
  .card-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-qr {
    align-self: center;
  }
}
</style>
