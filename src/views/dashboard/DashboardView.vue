<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <div class="breadcrumb">
          <span>Console</span>
          <v-icon icon="mdi-chevron-right" size="16" />
          <b>Dashboard</b>
        </div>

        <h1>Dashboard</h1>
        <p>Tổng quan hoạt động thư viện toàn hệ thống</p>
      </div>

      <v-btn
        color="primary"
        rounded="lg"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadDashboard"
      >
        Tải lại
      </v-btn>
    </div>

    <v-alert
      v-if="message"
      type="error"
      variant="tonal"
      rounded="lg"
      class="mb-5"
    >
      {{ message }}
    </v-alert>

    <!-- Stats -->
    <section class="stats-grid">
      <v-card
        v-for="card in summaryCards"
        :key="card.title"
        class="stat-card"
      >
        <div class="stat-icon" :class="card.iconClass">
          <v-icon :icon="card.icon" size="30" />
        </div>

        <div>
          <div class="stat-label">{{ card.title }}</div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-subtitle">{{ card.subtitle }}</div>
        </div>
      </v-card>
    </section>

    <!-- Analytics -->
    <section class="analytics-grid">
      <!-- Bar chart -->
      <v-card class="analytics-card">
        <div class="card-header">
          <div>
            <h2>Thống kê mượn/trả</h2>
            <p>Dữ liệu tổng hợp từ Report Service</p>
          </div>

          <v-chip color="secondary" variant="tonal" size="small">
            Năm 2026
          </v-chip>
        </div>

        <div class="bar-chart">
          <div
            v-for="bar in chartBars"
            :key="bar.label"
            class="bar-item"
          >
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ height: bar.height + '%' }"
              ></div>
            </div>

            <div class="bar-label">{{ bar.label }}</div>
            <div class="bar-value">{{ formatNumber(bar.value) }}</div>
          </div>
        </div>
      </v-card>

      <!-- Donut summary -->
      <v-card class="analytics-card">
        <div class="card-header">
          <div>
            <h2>Tỷ lệ mượn/trả</h2>
            <p>So sánh lượt mượn, lượt trả và sách đang mượn</p>
          </div>
        </div>

        <div class="donut-layout">
          <div class="donut-chart" :style="donutStyle">
            <div class="donut-inner">
              <strong>{{ returnedRate }}%</strong>
              <span>Đã trả</span>
            </div>
          </div>

          <div class="legend-list">
            <div class="legend-item">
              <span class="legend-dot dot-borrow"></span>
              <div>
                <b>{{ formatNumber(dashboard.totalBorrowed) }}</b>
                <p>Tổng lượt mượn</p>
              </div>
            </div>

            <div class="legend-item">
              <span class="legend-dot dot-return"></span>
              <div>
                <b>{{ formatNumber(dashboard.totalReturned) }}</b>
                <p>Tổng lượt trả</p>
              </div>
            </div>

            <div class="legend-item">
              <span class="legend-dot dot-current"></span>
              <div>
                <b>{{ formatNumber(dashboard.currentlyBorrowing) }}</b>
                <p>Đang mượn</p>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </section>

    <!-- Tables -->
    <section class="table-grid">
      <v-card class="table-card">
        <div class="table-card-header">
          <div>
            <h2>Top sách được mượn nhiều</h2>
            <p>Danh sách sách có số lượt mượn cao nhất</p>
          </div>

          <v-btn
            color="secondary"
            variant="text"
            append-icon="mdi-arrow-right"
            to="/app/books"
          >
            Xem sách
          </v-btn>
        </div>

        <div class="table-scroll">
          <v-table>
            <thead>
              <tr>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th class="text-right">Số lượt mượn</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="book in topBooks"
                :key="book.bookId"
              >
                <td>
                  <span class="code-text">{{ shortId(book.bookId) }}</span>
                </td>

                <td>
                  <div class="book-name">{{ book.bookTitle }}</div>
                </td>

                <td class="text-right">
                  <v-chip color="secondary" variant="tonal" size="small">
                    {{ formatNumber(book.borrowCount) }}
                  </v-chip>
                </td>
              </tr>

              <tr v-if="topBooks.length === 0 && !loading">
                <td colspan="3" class="text-center pa-8">
                  <v-icon icon="mdi-book-search-outline" size="44" color="grey" />
                  <div class="empty-title">Chưa có dữ liệu top sách</div>
                  <div class="empty-text">
                    Dữ liệu sẽ xuất hiện sau khi có phát sinh phiếu mượn.
                  </div>
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="3" class="text-center pa-8">
                  <v-progress-circular indeterminate color="primary" />
                  <div class="mt-3 text-grey-darken-1">Đang tải dữ liệu...</div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>

      <v-card class="table-card">
        <div class="table-card-header">
          <div>
            <h2>Tổng quan báo cáo</h2>
            <p>Các chỉ số được đồng bộ từ Identity & Report Service</p>
          </div>
        </div>

        <div class="report-list">
          <div class="report-item">
            <div class="report-icon bg-blue">
              <v-icon icon="mdi-account-group" />
            </div>

            <div>
              <b>{{ formatNumber(dashboard.totalReaders) }}</b>
              <p>Độc giả đang được quản lý trong hệ thống</p>
            </div>
          </div>

          <div class="report-item">
            <div class="report-icon bg-cyan">
              <v-icon icon="mdi-book-arrow-right" />
            </div>

            <div>
              <b>{{ formatNumber(dashboard.totalBorrowed) }}</b>
              <p>Tổng lượt mượn đã ghi nhận</p>
            </div>
          </div>

          <div class="report-item">
            <div class="report-icon bg-green">
              <v-icon icon="mdi-book-check" />
            </div>

            <div>
              <b>{{ formatNumber(dashboard.totalReturned) }}</b>
              <p>Tổng lượt trả sách đã hoàn tất</p>
            </div>
          </div>

          <div class="report-item">
            <div class="report-icon bg-red">
              <v-icon icon="mdi-cash-alert" />
            </div>

            <div>
              <b>{{ formatMoney(dashboard.totalFineAmount) }}</b>
              <p>Tổng số tiền phạt phát sinh</p>
            </div>
          </div>
        </div>
      </v-card>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { reportApi } from '../../api/reportApi'

const loading = ref(false)
const message = ref('')

const dashboard = ref({
  totalReaders: 0,
  totalBorrowed: 0,
  totalReturned: 0,
  currentlyBorrowing: 0,
  totalFineAmount: 0,
  topBooks: []
})

const topBooks = computed(() => dashboard.value.topBooks || [])

const summaryCards = computed(() => [
  {
    title: 'Tổng độc giả',
    value: formatNumber(dashboard.value.totalReaders),
    subtitle: 'Độc giả trong hệ thống',
    icon: 'mdi-account-group',
    iconClass: 'icon-cyan'
  },
  {
    title: 'Tổng lượt mượn',
    value: formatNumber(dashboard.value.totalBorrowed),
    subtitle: 'Phiếu mượn đã ghi nhận',
    icon: 'mdi-book-arrow-right',
    iconClass: 'icon-blue'
  },
  {
    title: 'Tổng lượt trả',
    value: formatNumber(dashboard.value.totalReturned),
    subtitle: 'Phiếu đã hoàn tất',
    icon: 'mdi-book-check',
    iconClass: 'icon-green'
  },
  {
    title: 'Đang mượn',
    value: formatNumber(dashboard.value.currentlyBorrowing),
    subtitle: 'Sách chưa trả',
    icon: 'mdi-book-clock',
    iconClass: 'icon-orange'
  },
  {
    title: 'Tổng tiền phạt',
    value: formatMoney(dashboard.value.totalFineAmount),
    subtitle: 'Phí phạt phát sinh',
    icon: 'mdi-cash-multiple',
    iconClass: 'icon-red'
  }
])

const chartBars = computed(() => {
  const values = [
    { label: 'Mượn', value: Number(dashboard.value.totalBorrowed || 0) },
    { label: 'Trả', value: Number(dashboard.value.totalReturned || 0) },
    { label: 'Đang mượn', value: Number(dashboard.value.currentlyBorrowing || 0) },
    { label: 'Độc giả', value: Number(dashboard.value.totalReaders || 0) },
    { label: 'Top sách', value: Number(topBooks.value.length || 0) }
  ]

  const max = Math.max(...values.map(item => item.value), 1)

  return values.map(item => ({
    ...item,
    height: Math.max(12, Math.round((item.value / max) * 100))
  }))
})

const returnedRate = computed(() => {
  const borrowed = Number(dashboard.value.totalBorrowed || 0)
  const returned = Number(dashboard.value.totalReturned || 0)

  if (borrowed <= 0) return 0

  return Math.min(100, Math.round((returned / borrowed) * 100))
})

const donutStyle = computed(() => {
  const returned = returnedRate.value
  const current = Math.max(0, 100 - returned)

  return {
    background: `conic-gradient(#00687a 0% ${returned}%, #57dffe ${returned}% ${returned + current}%, #dce9ff ${returned + current}% 100%)`
  }
})

async function loadDashboard() {
  loading.value = true
  message.value = ''

  try {
    const res = await reportApi.dashboard()

    dashboard.value = {
      ...dashboard.value,
      ...res.data,
      topBooks: res.data?.topBooks || []
    }
  } catch (err) {
    message.value = err.response?.data?.message || 'Không tải được dữ liệu dashboard'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ'
}

function shortId(value) {
  if (!value) return '-'
  return String(value).slice(0, 8).toUpperCase()
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page {
  color: #0b1c30;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.breadcrumb b {
  color: #0f172a;
}

.dashboard-header h1 {
  color: #0f172a;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.05;
  letter-spacing: -0.055em;
  font-weight: 1000;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #64748b;
  font-size: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  min-height: 180px;
  padding: 24px;
  border-radius: 24px !important;
  background: #ffffff !important;
  border: 1px solid rgba(198, 198, 205, 0.5);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.055) !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  transition: all 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.1) !important;
}

.stat-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 18px;
}

.icon-blue {
  color: #1d4ed8;
  background: #dbeafe;
}

.icon-cyan {
  color: #00687a;
  background: #acedff;
}

.icon-green {
  color: #15803d;
  background: #dcfce7;
}

.icon-orange {
  color: #c2410c;
  background: #ffedd5;
}

.icon-red {
  color: #ba1a1a;
  background: #ffdad6;
}

.stat-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.stat-value {
  color: #0f172a;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 1000;
  letter-spacing: -0.04em;
  word-break: break-word;
}

.stat-subtitle {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 700;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-bottom: 28px;
}

.analytics-card,
.table-card {
  border-radius: 28px !important;
  background: #ffffff !important;
  border: 1px solid rgba(198, 198, 205, 0.5);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.055) !important;
}

.analytics-card {
  padding: 28px;
}

.card-header,
.table-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 26px;
}

.card-header h2,
.table-card-header h2 {
  color: #0f172a;
  font-size: 22px;
  font-weight: 1000;
  margin-bottom: 4px;
}

.card-header p,
.table-card-header p {
  color: #64748b;
  font-size: 14px;
}

.bar-chart {
  height: 280px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e5eeff 100%);
}

.bar-item {
  height: 100%;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  min-height: 14px;
  border-radius: 12px 12px 4px 4px;
  background: linear-gradient(180deg, #57dffe, #00687a);
  transition: height 0.6s ease;
}

.bar-label {
  margin-top: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  text-align: center;
}

.bar-value {
  margin-top: 2px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 1000;
}

.donut-layout {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 34px;
}

.donut-chart {
  width: 190px;
  height: 190px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.donut-inner {
  width: 124px;
  height: 124px;
  border-radius: 999px;
  background: #ffffff;
  display: grid;
  place-items: center;
  text-align: center;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.donut-inner strong {
  color: #0f172a;
  font-size: 28px;
  font-weight: 1000;
}

.donut-inner span {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  margin-top: -16px;
}

.legend-list {
  display: grid;
  gap: 18px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-dot {
  width: 13px;
  height: 13px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.dot-borrow {
  background: #57dffe;
}

.dot-return {
  background: #00687a;
}

.dot-current {
  background: #dce9ff;
}

.legend-item b {
  color: #0f172a;
  font-size: 16px;
  font-weight: 1000;
}

.legend-item p {
  color: #64748b;
  font-size: 13px;
}

.table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.table-card {
  overflow: hidden;
}

.table-card-header {
  padding: 24px 26px;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(198, 198, 205, 0.45);
}

.table-scroll {
  overflow-x: auto;
}

.table-scroll table {
  min-width: 620px;
}

.table-card :deep(th) {
  background: #f8fafc;
  color: #64748b !important;
  font-size: 12px;
  font-weight: 1000 !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.table-card :deep(td) {
  color: #0f172a;
  font-weight: 650;
}

.code-text {
  color: #00687a;
  font-weight: 1000;
}

.book-name {
  font-weight: 900;
  color: #0f172a;
}

.empty-title {
  color: #0f172a;
  font-weight: 900;
  margin-top: 10px;
}

.empty-text {
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
}

.report-list {
  padding: 22px 26px 26px;
  display: grid;
  gap: 16px;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.bg-blue {
  color: #1d4ed8;
  background: #dbeafe;
}

.bg-cyan {
  color: #00687a;
  background: #acedff;
}

.bg-green {
  color: #15803d;
  background: #dcfce7;
}

.bg-red {
  color: #ba1a1a;
  background: #ffdad6;
}

.report-item b {
  color: #0f172a;
  font-size: 18px;
  font-weight: 1000;
}

.report-item p {
  color: #64748b;
  font-size: 13px;
  margin-top: 2px;
}

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .analytics-grid,
  .table-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .dashboard-header {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .analytics-card {
    padding: 20px;
  }

  .bar-chart {
    gap: 10px;
    padding: 16px;
  }

  .donut-layout {
    flex-direction: column;
  }
}
</style>