<template>
  <div>
    <div class="page-title">Cấu hình hệ thống</div>
    <div class="page-subtitle">
      Quản lý các tham số vận hành cốt lõi của thư viện. Thay đổi tại đây sẽ ảnh hưởng trực tiếp
      đến quy trình mượn trả và tính phí của toàn bộ hệ thống.
    </div>

    <v-alert v-if="message" :type="success ? 'success' : 'error'" variant="tonal" rounded="lg" class="my-4" closable @click:close="message = ''">
      {{ message }}
    </v-alert>

    <v-card class="settings-card" rounded="lg" :loading="loading">
      <div class="settings-card-header">
        <v-icon icon="mdi-tune-variant" size="20" color="var(--dl-primary)" />
        <h3>Quy định mượn &amp; phạt</h3>
      </div>

      <div class="field-group">
        <label>Số lượng sách tối đa được mượn cùng lúc</label>
        <v-text-field
          v-model.number="form.maxBorrowingBooks"
          type="number"
          variant="outlined"
          density="comfortable"
          min="1"
          max="20"
          suffix="cuốn"
        />
        <p class="field-hint">Cho phép từ 1 đến 20 cuốn / độc giả.</p>
      </div>

      <div class="field-group">
        <label>Phí phạt quá hạn mỗi ngày</label>
        <v-text-field
          v-model.number="form.finePerLateDay"
          type="number"
          variant="outlined"
          density="comfortable"
          min="0"
          max="500000"
          suffix="đ / ngày"
        />
        <p class="field-hint">Cho phép từ 0 đến 500.000đ / ngày trễ hạn.</p>
      </div>

      <v-divider class="my-3" />

      <div class="d-flex justify-end">
        <v-btn color="primary" rounded="lg" :loading="saving" @click="confirmDialog = true">
          Lưu thay đổi
        </v-btn>
      </div>
    </v-card>

    <!-- Confirm dialog -->
    <v-dialog v-model="confirmDialog" max-width="440">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="dialog-title">Xác nhận thay đổi cấu hình</v-card-title>
        <v-card-text>
          Thay đổi này sẽ áp dụng cho <strong>toàn bộ hệ thống</strong> ngay lập tức, ảnh hưởng đến
          tất cả phiếu mượn và tính phí phạt mới được tạo sau thời điểm này. Bạn chắc chắn muốn lưu?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Hủy</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveSettings">Xác nhận lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { borrowSettingsApi } from '../../api/borrowApi'

const message = ref('')
const success = ref(true)
const confirmDialog = ref(false)
const loading = ref(false)
const saving = ref(false)

// Backend (CirculationService) chỉ có đúng 2 field này trong BorrowSettings.
const form = ref({ maxBorrowingBooks: 5, finePerLateDay: 5000 })

async function loadSettings() {
  loading.value = true

  try {
    const res = await borrowSettingsApi.get()
    form.value = {
      maxBorrowingBooks: res.data?.maxBorrowingBooks ?? 5,
      finePerLateDay: res.data?.finePerLateDay ?? 5000
    }
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Không tải được cấu hình mượn/phạt'
    console.error(err.response || err)
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true

  try {
    await borrowSettingsApi.update(form.value)
    success.value = true
    message.value = 'Đã lưu cấu hình mượn/phạt'
    confirmDialog.value = false
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.message || 'Lưu cấu hình thất bại'
    console.error(err.response || err)
  } finally {
    saving.value = false
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

.settings-card {
  max-width: 480px;
  padding: 22px;
  border: 1px solid var(--dl-surface-variant) !important;
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

.field-group {
  margin-bottom: 16px;
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
</style>
