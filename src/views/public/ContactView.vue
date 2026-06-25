<template>
  <PublicLayout>
    <div class="public-container contact-shell">
      <div class="contact-header">
        <h1 class="dl-headline-lg">Liên hệ</h1>
        <p class="dl-body-lg">
          Chúng tôi luôn sẵn sàng hỗ trợ. Vui lòng để lại lời nhắn hoặc ghé thăm các
          chi nhánh của Thư Viện Số.
        </p>
      </div>

      <div class="contact-layout">
        <!-- Form -->
        <div class="contact-card form-card">
          <template v-if="!submitted">
            <h2 class="dl-headline-md">Gửi lời nhắn cho chúng tôi</h2>

            <form class="contact-form" @submit.prevent="handleSubmit">
              <div class="form-row">
                <div class="form-field">
                  <label>Họ và tên</label>
                  <input v-model="form.name" placeholder="Nguyễn Văn A" required />
                </div>

                <div class="form-field">
                  <label>Email</label>
                  <input v-model="form.email" type="email" placeholder="email@example.com" required />
                </div>
              </div>

              <div class="form-field">
                <label>Chủ đề</label>
                <input v-model="form.subject" placeholder="Nhập chủ đề cần hỗ trợ" required />
              </div>

              <div class="form-field">
                <label>Nội dung</label>
                <textarea v-model="form.message" rows="5" placeholder="Viết lời nhắn của bạn..." required></textarea>
              </div>

              <v-btn type="submit" color="primary" rounded="pill" size="large" :loading="sending">
                Gửi tin nhắn
              </v-btn>
            </form>
          </template>

          <div v-else class="success-state">
            <div class="success-icon">
              <v-icon icon="mdi-check" size="32" />
            </div>
            <h3>Đã gửi thành công!</h3>
            <p>Cảm ơn bạn đã liên hệ. Đội ngũ Thư Viện Số sẽ phản hồi trong vòng 24 giờ làm việc.</p>
            <v-btn variant="text" color="primary" @click="submitted = false">Gửi lời nhắn khác</v-btn>
          </div>
        </div>

        <!-- Chi nhánh -->
        <div class="contact-side">
          <div class="contact-card">
            <h2 class="dl-headline-md">Hệ thống chi nhánh</h2>

            <div v-for="(branch, idx) in branches" :key="branch.name" class="branch-item">
              <div class="branch-name">
                <v-icon icon="mdi-map-marker-outline" size="18" color="var(--dl-primary)" />
                {{ branch.name }}
              </div>
              <p class="branch-address">{{ branch.address }}</p>
              <div class="branch-meta">
                <span><v-icon icon="mdi-clock-outline" size="15" /> {{ branch.hours }}</span>
                <span><v-icon icon="mdi-phone-outline" size="15" /> {{ branch.phone }}</span>
              </div>
              <hr v-if="idx < branches.length - 1" class="branch-divider" />
            </div>
          </div>

          <div class="map-placeholder">
            <v-icon icon="mdi-map-outline" size="28" color="#707974" />
            <span>Bản đồ đang tải...</span>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PublicLayout from '../../layouts/PublicLayout.vue'

const sending = ref(false)
const submitted = ref(false)

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const branches = [
  {
    name: 'Chi nhánh 1 - Quận 1',
    address: '123 Đường Sách, Phường Bến Nghé, Quận 1, TP.HCM',
    hours: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    phone: '1900 1234'
  },
  {
    name: 'Chi nhánh 2 - Quận 7',
    address: '456 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM',
    hours: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    phone: '1900 5678'
  }
]

async function handleSubmit() {
  sending.value = true

  // TODO: nối với API contact thật của backend khi có endpoint tương ứng
  await new Promise(resolve => setTimeout(resolve, 700))

  sending.value = false
  submitted.value = true
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
}
</script>

<style scoped>
.public-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-shell {
  padding: 3rem 2rem 4rem;
}

.contact-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.contact-header p {
  max-width: 560px;
  margin: 0.75rem auto 0;
}

.contact-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.5rem;
}

.contact-card {
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  padding: 2rem;
}

.form-card h2,
.contact-side h2 {
  margin-bottom: 1.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: var(--dl-text-primary);
}

.form-field input,
.form-field textarea {
  font-family: var(--dl-font-body);
  font-size: 14px;
  padding: 0.7rem 0.9rem;
  border-radius: var(--dl-radius-md);
  border: 1px solid var(--dl-border);
  background: var(--dl-background);
  outline: none;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--dl-primary);
  box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.12);
}

/* Success */
.success-state {
  text-align: center;
  padding: 1.5rem 0;
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(5, 150, 105, 0.12);
  color: var(--dl-success);
  display: grid;
  place-items: center;
  margin: 0 auto 1rem;
}

.success-state h3 {
  font-family: var(--dl-font-headline);
  font-size: 20px;
  color: var(--dl-text-primary);
  margin-bottom: 0.5rem;
}

.success-state p {
  font-size: 14px;
  color: var(--dl-text-muted);
  max-width: 320px;
  margin: 0 auto 0.75rem;
}

/* Branches */
.contact-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.branch-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 14.5px;
  color: var(--dl-text-primary);
}

.branch-address {
  font-size: 13.5px;
  color: var(--dl-text-muted);
  margin: 0.4rem 0 0.5rem;
  padding-left: 1.6rem;
}

.branch-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 13px;
  color: var(--dl-text-muted);
  padding-left: 1.6rem;
}

.branch-meta span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.branch-divider {
  border: none;
  border-top: 1px solid var(--dl-border);
  margin: 1rem 0;
}

.map-placeholder {
  flex: 1;
  min-height: 220px;
  border-radius: var(--dl-radius-lg);
  background: var(--dl-surface-variant);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--dl-text-muted);
  font-size: 14px;
}

@media (max-width: 960px) {
  .contact-shell {
    padding: 2.5rem 1rem 3rem;
  }

  .contact-layout {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
