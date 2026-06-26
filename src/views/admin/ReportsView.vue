<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Báo cáo &amp; thống kê</div>
        <div class="page-subtitle">Tạo, xem và xuất các chỉ số chi tiết của thư viện</div>
      </div>

      <v-spacer />

      <v-btn variant="outlined" color="primary" prepend-icon="mdi-file-excel-outline" :disabled="!rows.length" @click="exportCsv">
        Xuất Excel (CSV)
      </v-btn>
    </div>

    <v-alert type="info" variant="tonal" rounded="lg" class="mb-4" icon="mdi-information-outline">
      Báo cáo "Khối lượng mượn/trả" gọi <code>/api/identity/reports/borrow-return</code> đã có sẵn —
      tham số ngày (<code>from</code>/<code>to</code>) là giả định, cần xác nhận lại tên field thật với backend.
    </v-alert>

    <v-alert v-if="message" type="error" variant="tonal" rounded="lg" class="mb-4" closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <div class="reports-grid">
      <!-- Cấu hình báo cáo -->
      <v-card class="config-card" rounded="lg">
        <h3><v-icon icon="mdi-tune-variant" size="18" /> Cấu hình báo cáo</h3>

        <label class="field-label">Loại báo cáo</label>
        <v-select
          v-model="reportType"
          :items="reportTypeOptions"
          item-title="label"
          item-value="value"
          density="comfortable"
          variant="outlined"
        />

        <template v-if="reportType === 'borrow-volume'">
          <label class="field-label mt-2">Thời gian</label>
          <div class="date-row">
            <v-text-field v-model="fromDate" type="date" density="comfortable" variant="outlined" hide-details />
            <v-text-field v-model="toDate" type="date" density="comfortable" variant="outlined" hide-details />
          </div>

          <div class="preset-row">
            <button
              v-for="preset in presets"
              :key="preset.label"
              class="preset-chip"
              type="button"
              @click="applyPreset(preset.days)"
            >
              {{ preset.label }}
            </button>
          </div>
        </template>

        <template v-else>
          <label class="field-label mt-2">Số lượng hiển thị (Top N)</label>
          <v-text-field v-model.number="topN" type="number" density="comfortable" variant="outlined" hide-details />
        </template>

        <v-btn block color="primary" rounded="lg" class="mt-5" :loading="loading" @click="loadReport">
          Cập nhật dữ liệu
        </v-btn>

        <div v-if="rows.length" class="summary-box">
          <div class="summary-label">Tổng quan hiển thị</div>
          <div class="summary-value">{{ rows.length }}</div>
          <div class="summary-caption">dòng dữ liệu</div>
        </div>
      </v-card>

      <!-- Kết quả -->
      <v-card class="result-card" rounded="lg">
        <div class="result-header">
          <h3>{{ activeReportLabel }}</h3>
        </div>

        <div v-if="loading" class="loading-box">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <div v-else-if="!rows.length" class="empty-box">
          <v-icon icon="mdi-chart-line" size="36" color="var(--dl-text-muted)" />
          <p>Chưa có dữ liệu. Hãy chọn loại báo cáo và bấm "Cập nhật dữ liệu".</p>
        </div>

        <template v-else>
          <v-table class="report-table">
            <thead>
              <tr>
                <th v-for="col in columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="idx">
                <td v-for="col in columns" :key="col">{{ formatCell(row[col]) }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { reportApi } from '../../api/reportApi'

const reportType = ref('borrow-volume')
const topN = ref(10)
const loading = ref(false)
const message = ref('')
const rows = ref([])

const today = new Date()
const monthAgo = new Date()
monthAgo.setDate(monthAgo.getDate() - 30)

const fromDate = ref(monthAgo.toISOString().slice(0, 10))
const toDate = ref(today.toISOString().slice(0, 10))

const reportTypeOptions = [
  { label: 'Khối lượng mượn/trả', value: 'borrow-volume' },
  { label: 'Sách được mượn nhiều nhất', value: 'top-books' },
  { label: 'Độc giả hoạt động nhiều nhất', value: 'top-readers' }
]

const presets = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: 'Quý này', days: 90 },
  { label: 'Năm nay', days: 365 }
]

const activeReportLabel = computed(() =>
  reportTypeOptions.find(o => o.value === reportType.value)?.label || 'Dữ liệu chi tiết'
)

const columns = computed(() => {
  if (!rows.value.length) return []
  return Object.keys(rows.value[0])
})

function applyPreset(days) {
  const from = new Date()
  from.setDate(from.getDate() - days)
  fromDate.value = from.toISOString().slice(0, 10)
  toDate.value = new Date().toISOString().slice(0, 10)
}

function formatCell(value) {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') return value.toLocaleString('vi-VN')
  return value
}

async function loadReport() {
  loading.value = true
  message.value = ''
  rows.value = []

  try {
    let res

    if (reportType.value === 'borrow-volume') {
      res = await reportApi.borrowReturn({ from: fromDate.value, to: toDate.value })
    } else if (reportType.value === 'top-books') {
      res = await reportApi.topBooks(topN.value)
    } else {
      res = await reportApi.topReaders(topN.value)
    }

    const data = res.data
    rows.value = Array.isArray(data) ? data : (data?.items || [])
  } catch (err) {
    message.value = err.response?.data?.message || 'Không tải được dữ liệu báo cáo'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function exportCsv() {
  if (!rows.value.length) return

  const header = columns.value.join(',')
  const body = rows.value
    .map(row => columns.value.map(col => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const csv = `${header}\n${body}`
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `bao-cao-${reportType.value}-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 24px;
  color: var(--dl-primary-dark);
}

.page-subtitle {
  color: var(--dl-text-muted);
  font-size: 13.5px;
  margin-top: 2px;
}

.reports-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: flex-start;
}

.config-card,
.result-card {
  padding: 22px;
  border: 1px solid var(--dl-surface-variant) !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.config-card h3,
.result-header h3 {
  font-family: var(--dl-font-headline);
  font-size: 16px;
  color: var(--dl-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dl-text-muted);
  margin-bottom: 6px;
}

.date-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.preset-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--dl-radius-full);
  border: 1px solid var(--dl-border);
  background: var(--dl-surface);
  cursor: pointer;
}

.preset-chip:hover {
  border-color: var(--dl-primary);
  color: var(--dl-primary);
}

.summary-box {
  margin-top: 20px;
  padding: 16px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-primary-dark);
  color: #fff;
}

.summary-label {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
}

.summary-value {
  font-family: var(--dl-font-headline);
  font-size: 30px;
  font-weight: 700;
  margin-top: 4px;
}

.summary-caption {
  font-size: 12px;
  color: var(--dl-accent-gold);
}

.loading-box,
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--dl-text-muted);
  text-align: center;
}

.report-table th {
  font-size: 11.5px;
  text-transform: uppercase;
  color: var(--dl-text-muted);
}

@media (max-width: 960px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
