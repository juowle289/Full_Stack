<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Công nợ phí phạt</div>
        <div class="page-subtitle">Theo dõi và thu các khoản phí phạt trả sách muộn</div>
      </div>

      <v-spacer />

      <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadFines">
        Tải lại
      </v-btn>
    </div>

    <v-alert v-if="message" :type="success ? 'success' : 'error'" variant="tonal" rounded="lg" class="mb-4">
      {{ message }}
    </v-alert>

    <v-row class="mb-5">
      <v-col cols="12" md="4">
        <v-card class="stat-card pa-5">
          <div class="stat-label">Phiếu chưa thu phạt</div>
          <div class="stat-value">{{ unpaidFines.length }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="stat-card pa-5">
          <div class="stat-label">Tổng tiền chưa thu</div>
          <div class="stat-value text-error">{{ formatMoney(totalUnpaidFine) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <div class="toolbar-row">
      <div class="search-box">
        <v-icon icon="mdi-magnify" size="20" />
        <input v-model="keyword" placeholder="Tìm độc giả, tên sách..." />
      </div>

      <v-btn-toggle v-model="statusFilter" color="primary" variant="outlined" divided mandatory>
        <v-btn value="all" size="small">Tất cả</v-btn>
        <v-btn value="unpaid" size="small">Chưa thu</v-btn>
        <v-btn value="paid" size="small">Đã thu</v-btn>
      </v-btn-toggle>
    </div>

    <v-card class="table-card">
      <div class="table-scroll">
        <v-table>
          <thead>
            <tr>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Mượn / Trả</th>
              <th>Tiền phạt</th>
              <th>Trạng thái</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredFines" :key="item.id">
              <td class="font-weight-bold">{{ item.readerName }}</td>

              <td class="text-truncate-cell">{{ item.bookTitle }}</td>

              <td>
                <div class="text-caption">Mượn: {{ formatDate(item.borrowDate) }}</div>
                <div class="text-caption text-grey-darken-1">Trả: {{ formatDate(item.returnDate) }}</div>
              </td>

              <td class="font-weight-bold">{{ formatMoney(item.fineAmount) }}</td>

              <td>
                <v-chip :color="item.isFinePaid ? 'success' : 'error'" size="small" variant="tonal">
                  <v-icon start :icon="item.isFinePaid ? 'mdi-check-circle' : 'mdi-clock-alert-outline'" />
                  {{ item.isFinePaid ? 'Đã thu' : 'Chưa thu' }}
                </v-chip>
              </td>

              <td class="text-center">
                <v-btn
                  v-if="!item.isFinePaid"
                  color="success"
                  size="small"
                  variant="tonal"
                  @click="openConfirm(item)"
                >
                  Thu phạt
                </v-btn>
              </td>
            </tr>

            <tr v-if="!filteredFines.length">
              <td colspan="6" class="text-center pa-8">
                <v-icon icon="mdi-cash-check" size="40" color="grey" />
                <div class="text-subtitle-1 font-weight-bold mt-2">Không có công nợ phù hợp</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <!-- Confirm thu phạt -->
    <v-dialog v-model="confirmDialog" max-width="420">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Xác nhận thu phạt</v-card-title>
        <v-card-text>
          Xác nhận thu <strong>{{ formatMoney(targetFine?.fineAmount) }}</strong> từ
          <strong>{{ targetFine?.readerName }}</strong> — không thể hoàn tác sau khi xác nhận.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Hủy</v-btn>
          <v-btn color="success" :loading="loadingId === targetFine?.id" @click="payFine">Xác nhận thu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { borrowApi } from '../../api/borrowApi'

const fines = ref([])
const loading = ref(false)
const message = ref('')
const success = ref(true)
const loadingId = ref('')
const keyword = ref('')
const statusFilter = ref('all')

const confirmDialog = ref(false)
const targetFine = ref(null)

const unpaidFines = computed(() => fines.value.filter(f => !f.isFinePaid))

const totalUnpaidFine = computed(() =>
  unpaidFines.value.reduce((sum, item) => sum + Number(item.fineAmount || 0), 0)
)

const filteredFines = computed(() => {
  return fines.value.filter(item => {
    if (statusFilter.value === 'unpaid' && item.isFinePaid) return false
    if (statusFilter.value === 'paid' && !item.isFinePaid) return false

    if (keyword.value) {
      const k = keyword.value.toLowerCase().trim()
      const matches = String(item.readerName || '').toLowerCase().includes(k) ||
        String(item.bookTitle || '').toLowerCase().includes(k)
      if (!matches) return false
    }

    return true
  })
})

async function loadFines() {
  loading.value = true
  message.value = ''

  try {
    const res = await borrowApi.getFines()
    fines.value = res.data
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được danh sách công nợ phí phạt'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function openConfirm(item) {
  targetFine.value = item
  confirmDialog.value = true
}

async function payFine() {
  const id = targetFine.value.id
  loadingId.value = id
  message.value = ''

  try {
    const res = await borrowApi.payFine(id)

    success.value = true
    message.value = res.data.message || 'Thanh toán phí phạt thành công'
    confirmDialog.value = false

    await loadFines()
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Thanh toán phí phạt thất bại'
    console.error(err.response || err)
  } finally {
    loadingId.value = ''
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

onMounted(loadFines)
</script>

<style scoped>
.text-truncate-cell {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
