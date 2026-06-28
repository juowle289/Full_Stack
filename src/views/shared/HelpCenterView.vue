<template>
  <div class="help-page">
    <div class="page-title">Trợ giúp &amp; Hỗ trợ</div>
    <div class="page-subtitle">Câu hỏi thường gặp và thông tin liên hệ khi cần hỗ trợ</div>

    <v-card class="help-card" rounded="lg">
      <h3>Câu hỏi thường gặp</h3>

      <v-expansion-panels variant="accordion" class="mt-3">
        <v-expansion-panel v-for="faq in faqs[auth.role] || faqs.default" :key="faq.q">
          <v-expansion-panel-title>{{ faq.q }}</v-expansion-panel-title>
          <v-expansion-panel-text>{{ faq.a }}</v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <v-card class="help-card" rounded="lg">
      <h3>Liên hệ hỗ trợ</h3>
      <p class="help-caption">Không tìm thấy câu trả lời? Liên hệ trực tiếp với chúng tôi.</p>

      <div class="contact-grid">
        <div class="contact-item">
          <v-icon icon="mdi-email-outline" size="20" color="var(--dl-primary)" />
          <div>
            <div class="contact-label">Email hỗ trợ</div>
            <div class="contact-value">support@thuviendigital.vn</div>
          </div>
        </div>

        <div class="contact-item">
          <v-icon icon="mdi-phone-outline" size="20" color="var(--dl-primary)" />
          <div>
            <div class="contact-label">Hotline</div>
            <div class="contact-value">1900 1234 (8:00 - 21:00)</div>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()

const faqs = {
  Admin: [
    { q: 'Làm sao để tạo tài khoản Thủ thư mới?', a: 'Vào "Quản lý tài khoản" → bấm "Tạo tài khoản mới" → chọn vai trò Librarian và điền thông tin.' },
    { q: 'Tôi có thể nhập nhiều sách cùng lúc không?', a: 'Có, vào "Quản lý sách" → bấm "Nhập Excel" → tải mẫu CSV, điền dữ liệu rồi tải lên.' },
    { q: 'Cấu hình phí phạt ở đâu?', a: 'Vào "Cấu hình hệ thống" để chỉnh số ngày mượn, mức phí phạt/ngày và mức phạt tối đa.' }
  ],
  Librarian: [
    { q: 'Làm sao để thực hiện mượn/trả sách cho độc giả?', a: 'Vào "Quầy lưu thông", tìm độc giả và sách cần mượn hoặc quét mã phiếu để xử lý trả sách.' },
    { q: 'Tôi có thể khóa thẻ độc giả không?', a: 'Có, vào "Quản lý độc giả", chọn độc giả và bấm "Khóa thẻ" trong menu hành động.' }
  ],
  Reader: [
    { q: 'Làm sao để gia hạn sách đang mượn?', a: 'Vào "Lịch sử mượn sách", tìm sách cần gia hạn và làm theo hướng dẫn (nếu sách chưa quá hạn).' },
    { q: 'Tôi quên mật khẩu thì làm sao?', a: 'Bấm "Quên mật khẩu?" tại trang đăng nhập, hoặc liên hệ thủ thư tại quầy để được hỗ trợ đặt lại.' },
    { q: 'Phí phạt được tính như thế nào?', a: 'Phí phạt áp dụng khi trả sách muộn so với hạn, mức phí xem chi tiết tại trang "Hướng dẫn & Quy định".' }
  ],
  default: [
    { q: 'Làm sao để liên hệ hỗ trợ?', a: 'Bạn có thể gửi email hoặc gọi hotline ở mục Liên hệ hỗ trợ bên dưới.' }
  ]
}
</script>

<style scoped>
.help-page {
  max-width: 760px;
}

.page-title {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 26px;
  color: var(--dl-primary-dark);
}

.page-subtitle {
  color: var(--dl-text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.help-card {
  padding: 22px;
  margin-top: 20px;
  border: 1px solid var(--dl-surface-variant) !important;
  box-shadow: var(--dl-shadow-card) !important;
}

.help-card h3 {
  font-family: var(--dl-font-headline);
  font-size: 17px;
  color: var(--dl-text-primary);
  margin: 0;
}

.help-caption {
  font-size: 12.5px;
  color: var(--dl-text-muted);
  margin: 2px 0 14px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.contact-label {
  font-size: 12px;
  color: var(--dl-text-muted);
}

.contact-value {
  font-weight: 700;
  font-size: 14px;
  color: var(--dl-text-primary);
}

@media (max-width: 600px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
