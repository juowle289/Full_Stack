<template>
  <div>
    <div class="page-title">Cấu hình hệ thống</div>
    <div class="page-subtitle">
      Quản lý các tham số vận hành cốt lõi của thư viện. Thay đổi tại đây sẽ ảnh hưởng trực tiếp
      đến quy trình mượn trả và tính phí của toàn bộ hệ thống.
    </div>

    <v-alert type="info" variant="tonal" rounded="lg" class="my-4" icon="mdi-information-outline">
      Backend hiện chưa có endpoint cấu hình hệ thống — các giá trị dưới đây được lưu tạm ở
      <code>localStorage</code> của trình duyệt để demo giao diện. Khi nhóm có endpoint thật
      (ví dụ <code>/api/identity/settings</code>), chỉ cần thay phần gọi API trong <code>loadSettings()</code>
      / <code>saveSection()</code>.
    </v-alert>

    <v-alert v-if="message" type="success" variant="tonal" rounded="lg" class="mb-4" closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <div class="settings-grid">
      <!-- Quy định mượn trả -->
      <v-card class="settings-card" rounded="lg">
        <div class="settings-card-header header-primary">
          <v-icon icon="mdi-book-open-page-variant-outline" size="20" />
          <h3>Quy định mượn trả</h3>
        </div>

        <div class="field-group">
          <label>Số lượng sách mượn tối đa (Cuốn)</label>
          <v-text-field v-model.number="loanSettings.maxBooks" type="number" variant="outlined" density="comfortable" />
        </div>

        <div class="field-group">
          <label>Thời gian mượn tiêu chuẩn (Ngày)</label>
          <v-text-field v-model.number="loanSettings.loanDays" type="number" variant="outlined" density="comfortable" />
        </div>

        <div class="field-group">
          <label>Số lần gia hạn tối đa</label>
          <v-text-field v-model.number="loanSettings.maxRenewals" type="number" variant="outlined" density="comfortable" />
        </div>

        <v-divider class="my-3" />

        <div class="d-flex justify-end">
          <v-btn color="primary" rounded="lg" :loading="savingLoan" @click="confirmDialog = 'loan'">
            Lưu thay đổi
          </v-btn>
        </div>
      </v-card>

      <!-- Quy định phí phạt -->
      <v-card class="settings-card" rounded="lg">
        <div class="settings-card-header header-warning">
          <v-icon icon="mdi-cash-multiple" size="20" />
          <h3>Quy định phí phạt</h3>
        </div>

        <div class="field-group">
          <label>Phí phạt quá hạn (VNĐ / ngày)</label>
          <v-text-field v-model.number="fineSettings.finePerDay" type="number" variant="outlined" density="comfortable" suffix="đ" />
        </div>

        <div class="field-group">
          <label>Mức phạt tối đa (VNĐ)</label>
          <v-text-field v-model.number="fineSettings.maxFine" type="number" variant="outlined" density="comfortable" suffix="đ" />
        </div>

        <div class="field-group">
          <label>Thời gian ân hạn (Ngày)</label>
          <v-text-field v-model.number="fineSettings.graceDays" type="number" variant="outlined" density="comfortable" />
          <p class="field-hint">Không tính phí nếu trả sách trong khoảng thời gian này sau hạn.</p>
        </div>

        <v-divider class="my-3" />

        <div class="d-flex justify-end">
          <v-btn color="warning" rounded="lg" :loading="savingFine" @click="confirmDialog = 'fine'">
            Lưu thay đổi
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Confirm dialog -->
    <v-dialog :model-value="!!confirmDialog" max-width="440" @update:model-value="confirmDialog = null">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Xác nhận thay đổi cấu hình</v-card-title>
        <v-card-text>
          Thay đổi này sẽ áp dụng cho <strong>toàn bộ hệ thống</strong> ngay lập tức, ảnh hưởng đến
          tất cả phiếu mượn và tính phí phạt mới được tạo sau thời điểm này. Bạn chắc chắn muốn lưu?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = null">Hủy</v-btn>
          <v-btn color="primary" @click="saveSection(confirmDialog)">Xác nhận lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const message = ref('')
const confirmDialog = ref(null)
const savingLoan = ref(false)
const savingFine = ref(false)

const loanSettings = ref({ maxBooks: 5, loanDays: 14, maxRenewals: 2 })
const fineSettings = ref({ finePerDay: 5000, maxFine: 100000, graceDays: 1 })

function loadSettings() {
  try {
    const savedLoan = JSON.parse(localStorage.getItem('settings:loan') || 'null')
    const savedFine = JSON.parse(localStorage.getItem('settings:fine') || 'null')

    if (savedLoan) loanSettings.value = savedLoan
    if (savedFine) fineSettings.value = savedFine
  } catch (err) {
    console.error(err)
  }
}

async function saveSection(section) {
  if (section === 'loan') savingLoan.value = true
  if (section === 'fine') savingFine.value = true

  try {
    // TODO: thay bằng API thật khi backend có endpoint, ví dụ:
    // await settingsApi.update(section, section === 'loan' ? loanSettings.value : fineSettings.value)
    await new Promise(resolve => setTimeout(resolve, 400))

    if (section === 'loan') {
      localStorage.setItem('settings:loan', JSON.stringify(loanSettings.value))
      message.value = 'Đã lưu quy định mượn trả'
    } else {
      localStorage.setItem('settings:fine', JSON.stringify(fineSettings.value))
      message.value = 'Đã lưu quy định phí phạt'
    }
  } finally {
    savingLoan.value = false
    savingFine.value = false
    confirmDialog.value = null
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.page-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 24px;
  color: var(--dl-primary-dark);
}

.page-subtitle {
  color: var(--dl-text-muted);
  font-size: 13.5px;
  margin-top: 6px;
  max-width: 720px;
  line-height: 1.6;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.settings-card {
  padding: 22px;
  border: 1px solid var(--dl-surface-variant) !important;
  border-top: 3px solid transparent !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.settings-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.settings-card-header h3 {
  font-family: var(--dl-font-headline);
  font-size: 17px;
  color: var(--dl-text-primary);
  margin: 0;
}

.header-primary {
  color: var(--dl-primary);
}

.header-warning {
  color: var(--dl-warning);
}

.field-group {
  margin-bottom: 14px;
}

.field-group label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dl-text-muted);
  margin-bottom: 6px;
}

.field-hint {
  font-size: 11.5px;
  color: var(--dl-text-muted);
  margin-top: -4px;
}

.dialog-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
}

@media (max-width: 960px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
