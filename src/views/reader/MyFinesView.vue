<template>
  <div class="fines-page">
    <div class="page-title">Công nợ của tôi</div>
    <div class="page-subtitle">Theo dõi các khoản phí phạt phát sinh từ việc trả sách muộn</div>

    <div v-if="unpaidFines.length" class="unpaid-banner">
      <v-icon icon="mdi-information-outline" size="20" />
      <span>
        Bạn có <strong>{{ unpaidFines.length }}</strong> khoản phí phạt chưa thanh toán
        (tổng <strong>{{ formatMoney(totalUnpaid) }}</strong>). Vui lòng thanh toán tại quầy thư viện.
      </span>
    </div>

    <div v-if="loading" class="fine-list">
      <div v-for="n in 3" :key="n" class="fine-skeleton"></div>
    </div>

    <div v-else-if="!fines.length" class="empty-state">
      <v-icon icon="mdi-emoticon-happy-outline" size="44" color="var(--dl-success)" />
      <h3>Bạn không có khoản phí phạt nào</h3>
      <p>Hãy tiếp tục giữ thói quen trả sách đúng hạn nhé!</p>
    </div>

    <div v-else class="fine-list">
      <div v-for="item in fines" :key="item.id" class="fine-card">
        <div class="fine-card-main">
          <v-icon icon="mdi-book-open-page-variant-outline" size="22" color="var(--dl-primary)" />

          <div class="fine-card-info">
            <div class="fine-card-title">{{ item.bookTitle }}</div>
            <div class="fine-card-meta">
              <template v-if="item.returnDate">
                Trả muộn so với hạn ({{ formatDate(item.dueDate) }} → {{ formatDate(item.returnDate) }})
              </template>
              <template v-else>
                Đang quá hạn, chưa trả (hạn {{ formatDate(item.dueDate) }})
              </template>
            </div>
          </div>

          <div class="fine-card-right">
            <div class="fine-amount">{{ formatMoney(item.fineAmount) }}</div>
            <v-chip size="small" :color="item.isFinePaid ? 'success' : 'warning'" variant="tonal">
              {{ item.isFinePaid ? 'Đã thanh toán' : 'Chưa thanh toán' }}
            </v-chip>
          </div>
        </div>

        <v-btn
          v-if="item.isFinePaid"
          variant="text"
          size="small"
          color="primary"
          class="receipt-btn"
          @click="openReceipt(item)"
        >
          Xem biên lai
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="receiptDialog" max-width="380">
      <v-card rounded="lg" class="receipt-card">
        <div class="receipt-icon">
          <v-icon icon="mdi-check" size="26" />
        </div>
        <h3>Biên lai thanh toán</h3>

        <div class="receipt-row"><span>Sách</span><strong>{{ receiptItem?.bookTitle }}</strong></div>
        <div class="receipt-row"><span>Số tiền</span><strong>{{ formatMoney(receiptItem?.fineAmount) }}</strong></div>
        <div class="receipt-row"><span>Ngày trả</span><strong>{{ formatDate(receiptItem?.returnDate) }}</strong></div>

        <v-btn block variant="tonal" color="primary" class="mt-4" @click="receiptDialog = false">Đóng</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { borrowApi } from '../../api/borrowApi'

const fines = ref([])
const loading = ref(true)
const receiptDialog = ref(false)
const receiptItem = ref(null)

const unpaidFines = computed(() => fines.value.filter(f => !f.isFinePaid))
const totalUnpaid = computed(() => unpaidFines.value.reduce((sum, f) => sum + Number(f.fineAmount || 0), 0))

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

function openReceipt(item) {
  receiptItem.value = item
  receiptDialog.value = true
}

async function loadFines() {
  loading.value = true

  try {
    const res = await borrowApi.getMyBorrows()
    fines.value = (res.data || []).filter(b => Number(b.fineAmount || 0) > 0)
  } catch (err) {
    fines.value = []
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

onMounted(loadFines)
</script>

<style scoped>
.fines-page {
  max-width: 760px;
}

.page-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 26px;
  color: var(--dl-primary-dark);
}

.page-subtitle {
  color: var(--dl-text-muted);
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 20px;
}

.unpaid-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--dl-radius-md);
  background: rgba(217, 119, 6, 0.1);
  color: #92660a;
  font-size: 13.5px;
  margin-bottom: 20px;
}

.fine-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fine-card {
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  padding: 16px 18px;
}

.fine-card-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.fine-card-info {
  flex: 1;
  min-width: 0;
}

.fine-card-title {
  font-weight: 700;
  font-size: 14.5px;
  color: var(--dl-text-primary);
}

.fine-card-meta {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin-top: 2px;
}

.fine-card-right {
  text-align: right;
}

.fine-amount {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 17px;
  color: var(--dl-text-primary);
  margin-bottom: 4px;
}

.receipt-btn {
  margin-top: 6px;
  padding-left: 0 !important;
}

.fine-skeleton {
  height: 78px;
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
  margin: 1rem 0 0.4rem;
}

.receipt-card {
  padding: 28px;
  text-align: center;
}

.receipt-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(5, 150, 105, 0.12);
  color: var(--dl-success);
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
}

.receipt-card h3 {
  font-family: var(--dl-font-headline);
  margin-bottom: 16px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  padding: 8px 0;
  border-bottom: 1px solid var(--dl-border);
  color: var(--dl-text-muted);
}

.receipt-row strong {
  color: var(--dl-text-primary);
}
</style>
