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
        <div class="page-title">Lịch sử mượn của tôi</div>
        <div class="page-subtitle">
          Theo dõi sách đang mượn, lịch sử trả sách và phí phạt phát sinh
        </div>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadMyBorrows"
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

    <v-row class="mb-5">
      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Tổng phiếu mượn</div>
              <div class="stat-value">{{ borrows.length }}</div>
            </div>

            <v-avatar color="primary" variant="tonal" size="54">
              <v-icon icon="mdi-clipboard-text-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Đang mượn</div>
              <div class="stat-value">{{ borrowingCount }}</div>
            </div>

            <v-avatar color="warning" variant="tonal" size="54">
              <v-icon icon="mdi-book-clock-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Đã trả</div>
              <div class="stat-value">{{ returnedCount }}</div>
            </div>

            <v-avatar color="success" variant="tonal" size="54">
              <v-icon icon="mdi-check-circle-outline" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="stat-label">Tổng phí phạt</div>
              <div class="stat-value fine-value">
                {{ formatMoneyNumber(totalFine) }}
              </div>
            </div>

            <v-avatar color="error" variant="tonal" size="54">
              <v-icon icon="mdi-cash-alert" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="soft-card pa-5 mb-5">
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="keyword"
            label="Tìm theo tên sách"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            label="Trạng thái"
            :items="statusOptions"
            clearable
            hide-details
          />
        </v-col>

        <v-col cols="12" md="4">
          <div class="text-body-2 text-grey-darken-1">
            Hiển thị <b>{{ filteredBorrows.length }}</b> / {{ borrows.length }} phiếu mượn
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="table-card">
      <v-table>
        <thead>
          <tr>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <th>Hạn trả</th>
            <th>Ngày trả</th>
            <th>Trạng thái</th>
            <th>Quá hạn</th>
            <th>Tiền phạt</th>
            <th>Trạng thái phạt</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredBorrows" :key="item.id">
            <td>
              <div class="d-flex align-center">
                <v-avatar color="primary" variant="tonal" size="38" class="mr-3">
                  <v-icon icon="mdi-book-open-page-variant" />
                </v-avatar>

                <div>
                  <div class="font-weight-bold">
                    {{ item.bookTitle }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    Mã phiếu: {{ shortId(item.id) }}
                  </div>
                </div>
              </div>
            </td>

            <td>{{ formatDate(item.borrowDate) }}</td>
            <td>{{ formatDate(item.dueDate) }}</td>
            <td>{{ item.returnDate ? formatDate(item.returnDate) : '-' }}</td>

            <td>
              <v-chip
                :color="item.status === 'Borrowed' ? 'warning' : 'success'"
                size="small"
                variant="tonal"
              >
                <v-icon
                  start
                  :icon="item.status === 'Borrowed' ? 'mdi-book-clock' : 'mdi-check-circle'"
                />
                {{ getBorrowStatusText(item.status) }}
              </v-chip>
            </td>

            <td>
              <v-chip
                :color="isItemOverdue(item) ? 'error' : 'success'"
                size="small"
                variant="tonal"
              >
                {{ isItemOverdue(item) ? 'Quá hạn' : 'Không' }}
              </v-chip>
            </td>

            <td>
              <span :class="Number(item.fineAmount || 0) > 0 ? 'text-error font-weight-bold' : ''">
                {{ formatMoney(item.fineAmount) }}
              </span>
            </td>

            <td>
              <v-chip
                :color="getFineStatusColor(item)"
                size="small"
                variant="tonal"
              >
                {{ getFineStatusText(item) }}
              </v-chip>
            </td>
          </tr>

          <tr v-if="filteredBorrows.length === 0">
            <td colspan="8" class="text-center pa-8">
              <v-icon icon="mdi-database-search-outline" size="42" color="grey" />
              <div class="text-subtitle-1 font-weight-bold mt-2">
                Không có dữ liệu phù hợp
              </div>
              <div class="text-body-2 text-grey-darken-1">
                Bạn chưa có lịch sử mượn sách hoặc bộ lọc chưa phù hợp.
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { borrowApi } from '../../api/borrowApi'

const router = useRouter()

const borrows = ref([])
const keyword = ref('')
const statusFilter = ref(null)
const loading = ref(false)
const message = ref('')
const success = ref(true)

const statusOptions = [
  { title: 'Đang mượn', value: 'Borrowed' },
  { title: 'Đã trả', value: 'Returned' }
]

const borrowingCount = computed(() =>
  borrows.value.filter(x => x.status === 'Borrowed').length
)

const returnedCount = computed(() =>
  borrows.value.filter(x => x.status === 'Returned').length
)

const totalFine = computed(() =>
  borrows.value.reduce((sum, item) => sum + Number(item.fineAmount || 0), 0)
)

const filteredBorrows = computed(() => {
  let data = [...borrows.value]

  if (keyword.value) {
    const search = keyword.value.toLowerCase()
    data = data.filter(x =>
      String(x.bookTitle || '').toLowerCase().includes(search)
    )
  }

  if (statusFilter.value) {
    data = data.filter(x => x.status === statusFilter.value)
  }

  return data
})

function goBack() {
  router.push('/app/books')
}

async function loadMyBorrows() {
  loading.value = true
  message.value = ''

  try {
    const res = await borrowApi.getMyBorrows()
    borrows.value = res.data
    success.value = true
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được lịch sử mượn'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function getBorrowStatusText(status) {
  if (status === 'Borrowed') return 'Đang mượn'
  if (status === 'Returned') return 'Đã trả'
  return status || '-'
}

function isItemOverdue(item) {
  if (item.isOverdue) return true
  if (item.status !== 'Borrowed') return false
  if (!item.dueDate) return false

  return new Date(item.dueDate).getTime() < new Date().getTime()
}

function getFineStatusText(item) {
  const fine = Number(item.fineAmount || 0)

  if (fine <= 0) return 'Không phát sinh'
  if (item.isFinePaid) return 'Đã thanh toán'
  return 'Chưa thanh toán'
}

function getFineStatusColor(item) {
  const fine = Number(item.fineAmount || 0)

  if (fine <= 0) return 'success'
  if (item.isFinePaid) return 'success'
  return 'error'
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

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

function formatMoneyNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(0, 8)
}

onMounted(loadMyBorrows)
</script>

<style scoped>
.fine-value {
  font-size: 28px;
}
</style>