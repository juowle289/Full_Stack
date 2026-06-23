<template>
  <div>
    <div class="action-bar">
      <v-btn
        variant="tonal"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Quay lại
      </v-btn>

      <div>
        <div class="page-title">Thẻ thư viện của tôi</div>
        <div class="page-subtitle">
          Xem trạng thái thẻ, ngày cấp, hạn sử dụng và thông tin tài khoản độc giả
        </div>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadMyCard"
      >
        Tải lại
      </v-btn>
    </div>

    <v-alert
      v-if="message"
      :type="success ? 'success' : 'error'"
      variant="tonal"
      class="mb-5"
      rounded="lg"
    >
      {{ message }}
    </v-alert>

    <v-row v-if="card">
      <v-col cols="12" lg="5">
        <v-card class="library-card pa-6">
          <div class="d-flex align-center justify-space-between mb-8">
            <div>
              <div class="text-caption text-white opacity-80">
                DIGITAL LIBRARY CARD
              </div>
              <div class="text-h5 font-weight-black text-white mt-1">
                Library System
              </div>
            </div>

            <v-avatar color="white" size="52">
              <v-icon icon="mdi-library" color="primary" size="30" />
            </v-avatar>
          </div>

          <div class="text-caption text-white opacity-80">
            SỐ THẺ THƯ VIỆN
          </div>

          <div class="card-number mt-2">
            {{ card.cardNumber }}
          </div>

          <v-row class="mt-7">
            <v-col cols="7">
              <div class="text-caption text-white opacity-80">
                CHỦ THẺ
              </div>
              <div class="text-white font-weight-bold mt-1">
                {{ card.fullName }}
              </div>
            </v-col>

            <v-col cols="5">
              <div class="text-caption text-white opacity-80">
                TRẠNG THÁI
              </div>
              <v-chip
                class="mt-1"
                :color="card.status === 'Active' ? 'success' : 'error'"
                size="small"
                variant="flat"
              >
                {{ getCardStatusText(card.status) }}
              </v-chip>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="6">
              <div class="text-caption text-white opacity-80">
                NGÀY CẤP
              </div>
              <div class="text-white font-weight-bold mt-1">
                {{ formatShortDate(card.issuedDate) }}
              </div>
            </v-col>

            <v-col cols="6">
              <div class="text-caption text-white opacity-80">
                HẾT HẠN
              </div>
              <div class="text-white font-weight-bold mt-1">
                {{ formatShortDate(card.expiredDate) }}
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-card class="soft-card pa-5 mt-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-2 text-grey-darken-1">
                Thời hạn còn lại
              </div>

              <div class="text-h5 font-weight-black text-secondary mt-1">
                {{ daysLeftText }}
              </div>
            </div>

            <v-avatar
              :color="isExpired ? 'error' : 'success'"
              variant="tonal"
              size="54"
            >
              <v-icon
                :icon="isExpired ? 'mdi-calendar-alert' : 'mdi-calendar-check'"
                size="28"
              />
            </v-avatar>
          </div>

          <v-progress-linear
            class="mt-5"
            :model-value="validityProgress"
            :color="isExpired ? 'error' : 'primary'"
            height="10"
            rounded
          />

          <div class="text-caption text-grey-darken-1 mt-3">
            Thẻ còn hiệu lực khi trạng thái là <b>Hoạt động</b> và chưa quá ngày hết hạn.
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="soft-card pa-6 mb-5">
          <div class="d-flex align-center mb-5">
            <v-avatar color="primary" variant="tonal" size="56" class="mr-4">
              <v-icon icon="mdi-account-circle" size="34" />
            </v-avatar>

            <div>
              <div class="text-h6 font-weight-black text-secondary">
                {{ card.fullName }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                {{ card.email }}
              </div>
            </div>
          </div>

          <v-divider class="mb-5" />

          <v-row>
            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Họ tên</div>
                <div class="info-value">{{ card.fullName }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Email</div>
                <div class="info-value">{{ card.email }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Số thẻ</div>
                <div class="info-value">{{ card.cardNumber }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Trạng thái thẻ</div>
                <v-chip
                  :color="card.status === 'Active' ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  {{ getCardStatusText(card.status) }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Ngày cấp</div>
                <div class="info-value">{{ formatDate(card.issuedDate) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="info-box">
                <div class="info-label">Ngày hết hạn</div>
                <div class="info-value">{{ formatDate(card.expiredDate) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-card class="soft-card pa-6">
          <div class="d-flex align-center mb-4">
            <v-avatar color="info" variant="tonal" size="48" class="mr-3">
              <v-icon icon="mdi-information-outline" />
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Quy định sử dụng thẻ
              </div>
              <div class="text-body-2 text-grey-darken-1">
                Một số lưu ý khi sử dụng thẻ thư viện
              </div>
            </div>
          </div>

          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Thẻ hoạt động mới được phép mượn sách"
            />

            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Thẻ hết hạn hoặc bị khóa sẽ không tạo được phiếu mượn"
            />

            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Sách trả quá hạn có thể phát sinh phí phạt"
            />

            <v-list-item
              prepend-icon="mdi-check-circle-outline"
              title="Liên hệ thủ thư để gia hạn hoặc mở khóa thẻ"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else class="soft-card pa-8 text-center">
      <v-icon icon="mdi-card-account-details-outline" size="54" color="grey" />
      <div class="text-h6 font-weight-bold mt-3">
        Không tìm thấy thông tin thẻ thư viện
      </div>
      <div class="text-body-2 text-grey-darken-1 mt-1">
        Vui lòng tải lại hoặc liên hệ thủ thư để kiểm tra tài khoản.
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { libraryCardApi } from '../../api/libraryCardApi'

const router = useRouter()

const card = ref(null)
const loading = ref(false)
const message = ref('')
const success = ref(true)

const isExpired = computed(() => {
  if (!card.value?.expiredDate) return false
  return new Date(card.value.expiredDate).getTime() < new Date().getTime()
})

const daysLeft = computed(() => {
  if (!card.value?.expiredDate) return 0

  const expired = new Date(card.value.expiredDate).getTime()
  const now = new Date().getTime()
  const diff = expired - now

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const daysLeftText = computed(() => {
  if (daysLeft.value < 0) return `Đã hết hạn ${Math.abs(daysLeft.value)} ngày`
  if (daysLeft.value === 0) return 'Hết hạn hôm nay'
  return `${daysLeft.value} ngày`
})

const validityProgress = computed(() => {
  if (!card.value?.issuedDate || !card.value?.expiredDate) return 0

  const issued = new Date(card.value.issuedDate).getTime()
  const expired = new Date(card.value.expiredDate).getTime()
  const now = new Date().getTime()

  if (now >= expired) return 100
  if (now <= issued) return 5

  const total = expired - issued
  const used = now - issued

  return Math.min(100, Math.max(5, (used / total) * 100))
})

function goBack() {
  router.push('/app/books')
}

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

function getCardStatusText(status) {
  if (status === 'Active') return 'Hoạt động'
  if (status === 'Locked') return 'Đã khóa'
  if (status === 'Expired') return 'Hết hạn'
  return status || '-'
}

function formatDate(value) {
  if (!value) return '-'

  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatShortDate(value) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(loadMyCard)
</script>

<style scoped>
.library-card {
  min-height: 340px;
  border-radius: 28px !important;
  color: white;
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.28), transparent 28%),
    radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.35), transparent 32%),
    linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%) !important;
  box-shadow: 0 28px 70px rgba(30, 64, 175, 0.32) !important;
}

.library-card::before {
  content: '';
  position: absolute;
  right: -60px;
  bottom: -60px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.library-card::after {
  content: '';
  position: absolute;
  left: -40px;
  top: 120px;
  width: 140px;
  height: 140px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.library-card > * {
  position: relative;
  z-index: 2;
}

.card-number {
  color: white;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.info-box {
  min-height: 88px;
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.info-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.info-value {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  word-break: break-word;
}
</style>