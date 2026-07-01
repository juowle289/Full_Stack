<template>
  <v-dialog :model-value="modelValue" max-width="720" @update:model-value="$emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <div class="import-header">
        <div>
          <h3>Nhập {{ entityLabel }} từ Excel</h3>
          <p>Tải lên file CSV theo mẫu để thêm nhiều {{ entityLabel }} cùng lúc</p>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </div>

      <v-divider />

      <!-- Bước 1: Upload -->
      <div v-if="step === 1" class="import-body">
        <div class="template-row">
          <div>
            <div class="template-title">Chưa có file mẫu?</div>
            <div class="template-caption">
              {{ uploadFn ? 'Mẫu CSV (mở bằng Excel, lưu lại dạng .xlsx rồi tải lên)' : 'Tải mẫu CSV đúng cấu trúc để điền dữ liệu' }}
            </div>
          </div>
          <v-btn variant="outlined" color="primary" prepend-icon="mdi-download-outline" @click="downloadTemplate">
            Tải mẫu
          </v-btn>
        </div>

        <label class="dropzone" :class="{ 'dropzone-active': dragOver }" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="handleDrop">
          <input type="file" :accept="uploadFn ? '.xlsx,.xls' : '.csv'" class="d-none" @change="handleFileSelect" />
          <v-icon icon="mdi-cloud-upload-outline" size="36" color="var(--dl-primary)" />
          <div class="dropzone-text">
            {{ uploadFn ? 'Kéo thả file Excel (.xlsx) vào đây, hoặc bấm để chọn file' : 'Kéo thả file CSV vào đây, hoặc bấm để chọn file' }}
          </div>
          <div class="dropzone-hint">{{ uploadFn ? 'Hỗ trợ định dạng .xlsx, .xls' : 'Hỗ trợ định dạng .csv (mở được bằng Excel)' }}</div>
        </label>

        <v-alert v-if="parseError" type="error" variant="tonal" rounded="lg" class="mt-3">
          {{ parseError }}
        </v-alert>
      </div>

      <!-- Bước trung gian: đang upload trực tiếp (chế độ uploadFn, không qua bước preview) -->
      <div v-else-if="step === 'uploading'" class="import-body text-center py-8">
        <v-progress-circular indeterminate color="primary" size="36" />
        <p class="mt-3 text-medium-emphasis">Đang gửi file lên hệ thống...</p>
      </div>

      <!-- Bước 2: Xem trước + validate -->
      <div v-else-if="step === 2" class="import-body">
        <div class="validation-summary">
          <div class="summary-chip summary-chip-ok">
            <v-icon icon="mdi-check-circle" size="16" /> {{ validRows.length }} dòng hợp lệ
          </div>
          <div v-if="invalidRows.length" class="summary-chip summary-chip-error">
            <v-icon icon="mdi-alert-circle" size="16" /> {{ invalidRows.length }} dòng lỗi
          </div>
        </div>

        <div class="preview-scroll">
          <table class="preview-table">
            <thead>
              <tr>
                <th style="width: 36px;"></th>
                <th v-for="col in templateColumns" :key="col.key">{{ col.label }}</th>
                <th>Lỗi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in parsedRows" :key="idx" :class="{ 'row-error': row.__errors.length }">
                <td>
                  <v-icon v-if="row.__errors.length" icon="mdi-alert-circle" size="16" color="var(--dl-error)" />
                  <v-icon v-else icon="mdi-check" size="16" color="var(--dl-success)" />
                </td>
                <td v-for="col in templateColumns" :key="col.key">{{ row[col.key] }}</td>
                <td class="text-error text-caption">{{ row.__errors.join('; ') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bước 3: Hoàn tất -->
      <div v-else class="import-body text-center py-8">
        <div class="success-icon">
          <v-icon icon="mdi-check" size="30" />
        </div>
        <h4>Đã nhập {{ importedCount }} {{ entityLabel }} thành công</h4>
        <p v-if="failedCount" class="text-error">{{ failedCount }} dòng thất bại, xem chi tiết trong thông báo phía trang danh sách.</p>
      </div>

      <v-divider />

      <v-card-actions>
        <v-btn v-if="step === 2" variant="text" @click="step = 1">Quay lại</v-btn>
        <v-spacer />
        <v-btn v-if="step !== 3" variant="text" @click="close">Hủy</v-btn>
        <v-btn v-if="step === 2" color="primary" :loading="importing" :disabled="!validRows.length" @click="confirmImport">
          Xác nhận nhập {{ validRows.length }} {{ entityLabel }}
        </v-btn>
        <v-btn v-if="step === 3" color="primary" @click="close">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  entityLabel: { type: String, default: 'dữ liệu' },
  // [{ key: 'title', label: 'Tựa sách', required: true }, ...]
  templateColumns: { type: Array, required: true },
  // async (row) => Promise  - dùng khi KHÔNG có uploadFn (parse CSV client-side, tạo từng dòng)
  createFn: { type: Function, default: null },
  // async (file) => Promise<{data}>  - dùng khi backend có endpoint nhận file Excel thật
  // (ví dụ Books: POST /api/catalog/books/import) - bỏ qua hoàn toàn bước parse/preview.
  uploadFn: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'imported'])

const step = ref(1)
const dragOver = ref(false)
const parseError = ref('')
const parsedRows = ref([])
const importing = ref(false)
const importedCount = ref(0)
const failedCount = ref(0)

const validRows = computed(() => parsedRows.value.filter(r => !r.__errors.length))
const invalidRows = computed(() => parsedRows.value.filter(r => r.__errors.length))

watch(() => props.modelValue, (val) => {
  if (val) {
    step.value = 1
    parseError.value = ''
    parsedRows.value = []
    importedCount.value = 0
    failedCount.value = 0
  }
})

function close() {
  emit('update:modelValue', false)
}

function downloadTemplate() {
  const header = props.templateColumns.map(c => c.label).join(',')
  const blob = new Blob(['\uFEFF' + header + '\n'], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `mau-nhap-${props.entityLabel}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) handleFile(file)
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) handleFile(file)
}

function handleFile(file) {
  if (props.uploadFn) {
    uploadDirectly(file)
  } else {
    readFile(file)
  }
}

async function uploadDirectly(file) {
  parseError.value = ''

  const validExt = /\.(xlsx|xls)$/i.test(file.name)
  if (!validExt) {
    parseError.value = 'Chỉ hỗ trợ file .xlsx hoặc .xls.'
    return
  }

  step.value = 'uploading'
  importing.value = true

  try {
    const res = await props.uploadFn(file)

    importedCount.value = res.data?.importedCount ?? res.data?.successCount ?? 0
    failedCount.value = res.data?.failedCount ?? res.data?.errorCount ?? 0
    step.value = 3

    emit('imported', { success: importedCount.value, failed: failedCount.value, response: res.data })
  } catch (err) {
    parseError.value = err.response?.data?.message || 'Nhập file thất bại. Vui lòng kiểm tra đúng mẫu cột.'
    step.value = 1
    console.error(err.response || err)
  } finally {
    importing.value = false
  }
}

function readFile(file) {
  parseError.value = ''

  if (!file.name.toLowerCase().endsWith('.csv')) {
    parseError.value = 'Chỉ hỗ trợ file .csv (mở/lưu bằng Excel đều được).'
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      parseCsv(e.target.result)
      step.value = 2
    } catch (err) {
      parseError.value = 'Không đọc được file. Vui lòng kiểm tra đúng định dạng CSV.'
      console.error(err)
    }
  }

  reader.readAsText(file, 'UTF-8')
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) throw new Error('File trống')

  // Bỏ dòng header, map theo thứ tự cột đã khai báo trong templateColumns
  const dataLines = lines.slice(1)

  parsedRows.value = dataLines.map(line => {
    const cells = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
    const row = { __errors: [] }

    props.templateColumns.forEach((col, idx) => {
      row[col.key] = cells[idx] || ''
    })

    props.templateColumns.forEach(col => {
      if (col.required && !row[col.key]) {
        row.__errors.push(`Thiếu ${col.label}`)
      }
    })

    return row
  })
}

async function confirmImport() {
  importing.value = true
  let success = 0
  let failed = 0

  for (const row of validRows.value) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await props.createFn(row)
      success++
    } catch (err) {
      failed++
      console.error(err.response || err)
    }
  }

  importedCount.value = success
  failedCount.value = failed
  importing.value = false
  step.value = 3

  emit('imported', { success, failed })
}
</script>

<style scoped>
.import-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
}

.import-header h3 {
  font-family: var(--dl-font-headline);
  font-size: 19px;
  color: var(--dl-text-primary);
  margin: 0;
}

.import-header p {
  font-size: 13px;
  color: var(--dl-text-muted);
  margin: 2px 0 0;
}

.import-body {
  padding: 20px 24px;
}

.template-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--dl-radius-md);
  background: var(--dl-surface-container-low);
  margin-bottom: 18px;
}

.template-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--dl-text-primary);
}

.template-caption {
  font-size: 12px;
  color: var(--dl-text-muted);
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  border: 2px dashed var(--dl-border);
  border-radius: var(--dl-radius-lg);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.dropzone-active {
  border-color: var(--dl-primary);
  background: rgba(38, 67, 97, 0.04);
}

.dropzone-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--dl-text-primary);
}

.dropzone-hint {
  font-size: 12px;
  color: var(--dl-text-muted);
}

.validation-summary {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: var(--dl-radius-full);
}

.summary-chip-ok {
  background: rgba(31, 157, 107, 0.12);
  color: var(--dl-success);
}

.summary-chip-error {
  background: rgba(220, 38, 38, 0.1);
  color: var(--dl-error);
}

.preview-scroll {
  max-height: 320px;
  overflow: auto;
  border: 1px solid var(--dl-border);
  border-radius: var(--dl-radius-md);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.preview-table th {
  position: sticky;
  top: 0;
  background: var(--dl-surface-container-low);
  text-align: left;
  padding: 8px 10px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--dl-text-muted);
}

.preview-table td {
  padding: 7px 10px;
  border-top: 1px solid var(--dl-border);
}

.row-error {
  background: rgba(220, 38, 38, 0.04);
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(31, 157, 107, 0.12);
  color: var(--dl-success);
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}

.import-body h4 {
  font-family: var(--dl-font-headline);
  font-size: 18px;
  color: var(--dl-text-primary);
}
</style>
