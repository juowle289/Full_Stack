<template>
  <div>
    <div class="action-bar">
      <div>
        <div class="page-title">Báo cáo &amp; thống kê</div>
        <div class="page-subtitle">Xem các chỉ số chi tiết của thư viện theo năm</div>
      </div>

      <v-spacer />

      <v-btn variant="outlined" color="primary" prepend-icon="mdi-file-excel-outline" :disabled="!rows.length" @click="exportCsv">
        Xuất Excel (CSV)
      </v-btn>
    </div>

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

        <label class="field-label mt-2">Năm</label>
        <v-select
          v-model="year"
          :items="yearOptions"
          density="comfortable"
          variant="outlined"
        />

        <v-btn block color="primary" rounded="lg" class="mt-3" :loading="loading" @click="loadReport">
          Cập nhật dữ liệu
        </v-btn>

        <div v-if="rows.length" class="summary-box">
          <div class="summary-label">{{ summaryLabel }}</div>
          <div class="summary-value">{{ summaryValue }}</div>
          <div class="summary-caption">{{ summaryCaption }}</div>
        </div>
      </v-card>

      <!-- Kết quả -->
      <v-card class="result-card" rounded="lg">
        <div class="result-header">
          <h3>{{ activeReportLabel }} - Năm {{ year }}</h3>
        </div>

        <div v-if="loading" class="loading-box">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <div v-else-if="!rows.length" class="empty-box">
          <v-icon icon="mdi-chart-line" size="36" color="var(--dl-text-muted)" />
          <p>Chưa có dữ liệu. Hãy chọn loại báo cáo và bấm "Cập nhật dữ liệu".</p>
        </div>

        <!-- Mượn/trả theo tháng -->
        <template v-else-if="reportType === 'borrowReturn'">
          <div class="month-bars">
            <div v-for="m in rows" :key="m.month" class="month-bar-row">
              <span class="month-name">{{ m.monthName }}</span>
              <div class="month-bar-track">
                <div class="month-bar-fill borrow" :style="{ width: barWidth(m.borrowCount) + '%' }"></div>
              </div>
              <span class="month-value">{{ m.borrowCount }} mượn</span>
              <div class="month-bar-track">
                <div class="month-bar-fill return" :style="{ width: barWidth(m.returnCount) + '%' }"></div>
              </div>
              <span class="month-value">{{ m.returnCount }} trả</span>
            </div>
          </div>
        </template>

        <!-- Thể loại -->
        <template v-else-if="reportType === 'categoryStats'">
          <div class="category-list">
            <div v-for="c in rows" :key="c.category" class="category-row">
              <div class="category-head">
                <span>{{ c.category }}</span>
                <strong>{{ c.percent }}% ({{ c.borrowCount }} lượt)</strong>
              </div>
              <div class="month-bar-track">
                <div class="month-bar-fill borrow" :style="{ width: c.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Doanh thu phạt -->
        <template v-else>
          <div class="month-bars">
            <div v-for="m in rows" :key="m.month" class="month-bar-row">
              <span class="month-name">{{ m.monthName }}</span>
              <div class="month-bar-track">
                <div class="month-bar-fill fine" :style="{ width: barWidth(m.totalFine) + '%' }"></div>
              </div>
              <span class="month-value">{{ formatMoney(m.totalFine) }}</span>
            </div>
          </div>
        </template>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { reportApi } from '../../api/reportApi'

const reportType = ref('borrowReturn')
const year = ref(new Date().getFullYear())
const loading = ref(false)
const message = ref('')
const rows = ref([])

const currentYear = new Date().getFullYear()
const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

const reportTypeOptions = [
  { label: 'Mượn/trả theo tháng', value: 'borrowReturn' },
  { label: 'Tỉ lệ mượn theo thể loại', value: 'categoryStats' },
  { label: 'Doanh thu tiền phạt', value: 'fineRevenue' }
]

const activeReportLabel = computed(() =>
  reportTypeOptions.find(o => o.value === reportType.value)?.label || 'Dữ liệu chi tiết'
)

const maxValue = computed(() => {
  if (reportType.value === 'borrowReturn') {
    return Math.max(...rows.value.map(r => Math.max(r.borrowCount, r.returnCount)), 1)
  }
  if (reportType.value === 'fineRevenue') {
    return Math.max(...rows.value.map(r => r.totalFine), 1)
  }
  return 100
})

function barWidth(value) {
  return Math.max(4, Math.round((value / maxValue.value) * 100))
}

const summaryLabel = computed(() => {
  if (reportType.value === 'borrowReturn') return 'Tổng lượt mượn trong năm'
  if (reportType.value === 'categoryStats') return 'Số thể loại có dữ liệu'
  return 'Tổng tiền phạt trong năm'
})

const summaryValue = computed(() => {
  if (reportType.value === 'borrowReturn') {
    return rows.value.reduce((s, r) => s + r.borrowCount, 0).toLocaleString('vi-VN')
  }
  if (reportType.value === 'categoryStats') {
    return rows.value.length
  }
  return formatMoney(rows.value.reduce((s, r) => s + r.totalFine, 0))
})

const summaryCaption = computed(() => {
  if (reportType.value === 'borrowReturn') return 'lượt mượn'
  if (reportType.value === 'categoryStats') return 'thể loại'
  return 'tổng doanh thu phạt'
})

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

async function loadReport() {
  loading.value = true
  message.value = ''
  rows.value = []

  try {
    let res

    if (reportType.value === 'borrowReturn') {
      res = await reportApi.borrowReturn(year.value)
    } else if (reportType.value === 'categoryStats') {
      res = await reportApi.categoryStats(year.value)
    } else {
      res = await reportApi.fineRevenue(year.value)
    }

    rows.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    message.value = err.response?.data?.message || 'Không tải được dữ liệu báo cáo'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function exportCsv() {
  if (!rows.value.length) return

  const columns = Object.keys(rows.value[0])
  const header = columns.join(',')
  const body = rows.value
    .map(row => columns.map(col => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const csv = `${header}\n${body}`
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `bao-cao-${reportType.value}-${year.value}.csv`
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
  grid-template-columns: 300px 1fr;
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
  font-size: 26px;
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

/* Biểu đồ cột ngang theo tháng */
.month-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.month-bar-row {
  display: grid;
  grid-template-columns: 70px 1fr 70px 1fr 70px;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}

.month-name {
  font-weight: 700;
  color: var(--dl-text-primary);
}

.month-bar-track {
  height: 10px;
  border-radius: 999px;
  background: var(--dl-surface-container-low);
  overflow: hidden;
}

.month-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.month-bar-fill.borrow {
  background: var(--dl-accent-gold);
}

.month-bar-fill.return {
  background: var(--dl-primary);
}

.month-bar-fill.fine {
  background: var(--dl-error);
}

.month-value {
  color: var(--dl-text-muted);
  white-space: nowrap;
}

/* Thể loại */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.category-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
  color: var(--dl-text-primary);
}

@media (max-width: 960px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .month-bar-row {
    grid-template-columns: 60px 1fr 50px;
    grid-template-areas:
      "name borrowbar borrowval"
      "name returnbar returnval";
  }
}
</style>
