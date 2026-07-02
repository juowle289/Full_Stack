<template>
  <PublicLayout>
    <div class="public-container guide-shell">
      <div class="guide-header" v-reveal="{ variant: 'scale' }">
        <h1 class="dl-headline-lg">Hướng dẫn &amp; Quy định</h1>
        <p class="dl-body-lg">
          Thông tin chi tiết về cách thức tham gia và nội quy sử dụng tài nguyên tại
          Thư Viện Số, đảm bảo trải nghiệm tốt nhất cho mọi độc giả.
        </p>
      </div>

      <!-- Cách đăng ký thẻ -->
      <section class="guide-section">
        <h2 class="dl-headline-md section-title">Cách đăng ký thẻ thư viện</h2>

        <div class="steps-grid" v-reveal="{ stagger: true, variant: 'up' }">
          <div v-for="step in steps" :key="step.title" class="step-card">
            <div class="step-icon">
              <v-icon :icon="step.icon" size="24" />
            </div>
            <div class="step-number">BƯỚC {{ step.number }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </div>

        <div class="step-cta">
          <v-btn color="primary" rounded="pill" size="large" append-icon="mdi-arrow-right" @click="router.push('/register')">
            Bắt đầu đăng ký
          </v-btn>
        </div>
      </section>

      <!-- Quy định mượn trả -->
      <section class="guide-section">
        <h2 class="dl-headline-md section-title">Quy định mượn - trả</h2>

        <div class="rules-table" v-reveal="{ variant: 'left' }">
          <div class="rules-row rules-row-head">
            <div>Hạng mục</div>
            <div>Quy định chi tiết</div>
          </div>

          <div class="rules-row">
            <div class="rule-label"><v-icon icon="mdi-book-multiple-outline" size="18" color="var(--dl-accent-gold)" /> Số sách mượn tối đa</div>
            <div>5 cuốn / lần</div>
          </div>

          <div class="rules-row">
            <div class="rule-label"><v-icon icon="mdi-calendar-clock-outline" size="18" color="var(--dl-accent-gold)" /> Thời hạn mượn</div>
            <div>14 ngày</div>
          </div>

          <div class="rules-row">
            <div class="rule-label"><v-icon icon="mdi-cash-multiple" size="18" color="var(--dl-error)" /> Phí quá hạn</div>
            <div>
              <span class="fine-badge">5.000đ / ngày / cuốn</span>
            </div>
          </div>
        </div>

        <p class="rules-note">
          * Độc giả có thể gia hạn mượn sách 1 lần duy nhất thêm 7 ngày trực tuyến trước khi hết hạn.
        </p>
      </section>

      <!-- FAQ -->
      <section class="guide-section">
        <h2 class="dl-headline-md section-title">Câu hỏi thường gặp</h2>

        <v-expansion-panels variant="accordion" class="faq-panels" v-reveal="{ variant: 'right' }">
          <v-expansion-panel v-for="faq in faqs" :key="faq.question" rounded="lg">
            <v-expansion-panel-title>{{ faq.question }}</v-expansion-panel-title>
            <v-expansion-panel-text>{{ faq.answer }}</v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>
    </div>
  </PublicLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PublicLayout from '../../layouts/PublicLayout.vue'

const router = useRouter()

const steps = [
  {
    number: 1,
    icon: 'mdi-form-select',
    title: 'Đăng ký online',
    description: 'Điền thông tin cá nhân vào biểu mẫu đăng ký trực tuyến trên hệ thống Thư Viện Số. Bạn sẽ cần cung cấp CMND/CCCD hoặc thẻ sinh viên hợp lệ.'
  },
  {
    number: 2,
    icon: 'mdi-shield-check-outline',
    title: 'Xác thực tại quầy',
    description: 'Mang theo giấy tờ tùy thân bản gốc đến quầy lễ tân thư viện trong vòng 7 ngày làm việc để nhân viên đối chiếu và xác thực thông tin tài khoản.'
  },
  {
    number: 3,
    icon: 'mdi-qrcode',
    title: 'Nhận thẻ QR',
    description: 'Sau khi xác thực thành công, mã QR thẻ thư viện số sẽ được kích hoạt ngay lập tức trên ứng dụng, sẵn sàng để bạn mượn sách.'
  }
]

const faqs = [
  {
    question: 'Tôi có thể làm mất thẻ thư viện không?',
    answer: 'Nếu làm mất thẻ, bạn cần báo ngay cho quầy lễ tân để khóa thẻ cũ và đăng ký cấp lại thẻ mới với mã QR mới. Việc này giúp tránh người khác sử dụng thẻ của bạn để mượn sách.'
  },
  {
    question: 'Làm sao để gia hạn sách trực tuyến?',
    answer: 'Đăng nhập vào hệ thống, vào mục "Lịch sử mượn sách", chọn sách muốn gia hạn và bấm nút "Gia hạn". Mỗi cuốn sách chỉ được gia hạn 1 lần, thêm 7 ngày so với hạn ban đầu.'
  },
  {
    question: 'Tôi làm hỏng hoặc mất sách thì sao?',
    answer: 'Bạn cần thông báo cho thủ thư tại chi nhánh đã mượn sách. Tùy theo mức độ hư hỏng, thư viện sẽ áp dụng mức phí bồi thường tương ứng với giá trị cuốn sách.'
  }
]
</script>

<style scoped>
.public-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

.guide-shell {
  padding: 3rem 2rem 4rem;
}

.guide-header {
  text-align: center;
  margin-bottom: 3rem;
}

.guide-header p {
  max-width: 640px;
  margin: 0.75rem auto 0;
}

.guide-section {
  margin-bottom: 3.5rem;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
}

/* Steps */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.step-card {
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  padding: 1.75rem;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--dl-radius-full);
  background: var(--dl-surface-container-low);
  color: var(--dl-primary);
  display: grid;
  place-items: center;
  margin-bottom: 1rem;
}

.step-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--dl-accent-gold);
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.step-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 0.5rem;
}

.step-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--dl-text-muted);
  margin: 0;
}

.step-cta {
  text-align: center;
  margin-top: 2rem;
}

/* Rules table */
.rules-table {
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  overflow: hidden;
  background: var(--dl-surface);
}

.rules-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--dl-border);
  font-size: 14.5px;
}

.rules-row:last-child {
  border-bottom: none;
}

.rules-row-head {
  background: var(--dl-surface-container-low);
  font-weight: 700;
  color: var(--dl-text-muted);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.rule-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--dl-text-primary);
}

.fine-badge {
  display: inline-block;
  background: rgba(220, 38, 38, 0.1);
  color: var(--dl-error);
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--dl-radius-sm);
}

.rules-note {
  font-size: 13px;
  color: var(--dl-text-muted);
  text-align: center;
  margin-top: 1rem;
}

/* FAQ */
.faq-panels {
  border-radius: var(--dl-radius-lg) !important;
}

@media (max-width: 960px) {
  .guide-shell {
    padding: 2.5rem 1rem 3rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .rules-row {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
}
</style>
