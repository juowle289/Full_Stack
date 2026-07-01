<template>
  <PublicLayout>
    <!-- Sứ mệnh -->
    <section class="mission-section">
      <div class="public-container mission-inner">
        <h1 class="dl-headline-lg">Sứ mệnh của chúng tôi</h1>
        <p class="dl-body-lg">
          Xây dựng cầu nối tri thức vững chắc giữa di sản học thuật truyền thống và
          kỷ nguyên số, mang đến trải nghiệm nghiên cứu đẳng cấp cho cộng đồng học thuật.
        </p>
      </div>
    </section>

    <!-- Câu chuyện -->
    <section class="public-container section-block">
      <div class="story-grid">
        <div class="story-card">
          <div class="story-label">Câu chuyện của chúng tôi</div>
          <h2 class="dl-headline-md">Nền tảng số cho hệ thống đại học</h2>
          <p>
            Khởi nguồn từ khát vọng số hóa hệ sinh thái tri thức đồ sộ của hệ thống đại học,
            Thư Viện Số không chỉ là một hệ lưu trữ tài liệu. Chúng tôi là một hệ sinh thái
            học thuật sống động, nơi hàng triệu trang sách, luận văn và nghiên cứu được bảo
            tồn, phân tích và chia sẻ dễ dàng.
          </p>
          <p>
            Bằng việc áp dụng công nghệ tìm kiếm ngữ nghĩa tiên tiến và giao diện tối giản
            mang đậm chất editorial, chúng tôi tái hiện không gian tĩnh lặng, tập trung của
            một thư viện truyền thống ngay trên màn hình thiết bị của bạn.
          </p>
        </div>

        <div class="story-stats">
          <div class="stat-card-dark">
            <v-icon icon="mdi-file-document-multiple-outline" size="26" color="var(--dl-accent-gold)" />
            <div class="stat-card-value">45.000+</div>
            <div class="stat-card-label">Đầu sách số hóa</div>
          </div>

          <div class="stat-card-light">
            <v-icon icon="mdi-bank-outline" size="26" color="var(--dl-primary)" />
            <div class="stat-card-value-light">3</div>
            <div class="stat-card-label-light">Chi nhánh liên kết</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Giá trị cốt lõi -->
    <section class="public-container section-block">
      <div class="section-heading">
        <h2 class="dl-headline-lg">Giá trị cốt lõi</h2>
        <div class="heading-underline"></div>
      </div>

      <div class="values-grid">
        <div v-for="value in coreValues" :key="value.title" class="value-card">
          <div class="value-icon">
            <v-icon :icon="value.icon" size="26" />
          </div>
          <h3>{{ value.title }}</h3>
          <p>{{ value.description }}</p>
        </div>
      </div>
    </section>

    <!-- Hành trình phát triển -->
    <section class="public-container section-block">
      <div class="section-heading">
        <h2 class="dl-headline-lg">Hành trình phát triển</h2>
      </div>

      <div class="timeline">
        <div v-for="(item, idx) in timeline" :key="item.year" class="timeline-item">
          <div class="timeline-marker">
            <div class="timeline-dot" :class="{ 'timeline-dot-active': idx === timeline.length - 1 }"></div>
            <div v-if="idx < timeline.length - 1" class="timeline-line"></div>
          </div>

          <div class="timeline-content">
            <div class="timeline-year" :class="{ 'timeline-year-active': idx === timeline.length - 1 }">
              {{ item.year }}
            </div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup>
import PublicLayout from '../../layouts/PublicLayout.vue'

const coreValues = [
  {
    icon: 'mdi-school-outline',
    title: 'Học thuật xuất sắc',
    description: 'Đảm bảo nguồn tài liệu phong phú, chính xác và được kiểm duyệt nghiêm ngặt, phục vụ tối đa cho nghiên cứu chuyên sâu.'
  },
  {
    icon: 'mdi-human-handsup',
    title: 'Tiếp cận không giới hạn',
    description: 'Phá vỡ rào cản không gian và thời gian, mang thư viện đến mọi thiết bị với giao diện tối ưu cho mọi người dùng.'
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Cộng đồng bền vững',
    description: 'Xây dựng không gian tương tác, chia sẻ tri thức, kết nối sinh viên, giảng viên và các nhà nghiên cứu.'
  }
]

const timeline = [
  {
    year: '2020',
    title: 'Khởi tạo dự án',
    description: 'Dự án số hóa thư viện đại học chính thức được phê duyệt với mục tiêu tạo ra kho lưu trữ dùng chung đầu tiên.'
  },
  {
    year: '2022',
    title: 'Mở rộng liên kết',
    description: 'Thành công kết nối 3 cơ sở chính, đồng bộ hóa hơn 20.000 đầu sách học thuật chuyên sâu.'
  },
  {
    year: 'Hiện tại',
    title: 'Hệ sinh thái thông minh',
    description: 'Ra mắt giao diện hoàn toàn mới với công nghệ tìm kiếm AI, hướng tới cá nhân hóa trải nghiệm đọc và nghiên cứu.'
  }
]
</script>

<style scoped>
.public-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.mission-section {
  background: var(--dl-surface-paper);
  border-bottom: 1px solid var(--dl-surface-variant);
  padding: 4rem 1rem;
}

.mission-inner {
  max-width: 760px;
  text-align: center;
}

.mission-inner p {
  margin-top: 1rem;
}

.section-block {
  padding: 4rem 2rem;
}

.section-heading {
  text-align: center;
  margin-bottom: 2.5rem;
}

.heading-underline {
  width: 48px;
  height: 3px;
  background: var(--dl-accent-gold);
  margin: 0.75rem auto 0;
  border-radius: var(--dl-radius-full);
}

/* Story */
.story-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.story-card {
  background: var(--dl-surface);
  border: 1px solid var(--dl-surface-variant);
  border-radius: var(--dl-radius-lg);
  padding: 2rem;
}

.story-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dl-secondary);
  margin-bottom: 0.75rem;
}

.story-card h2 {
  margin-bottom: 1rem;
}

.story-card p {
  font-size: 14.5px;
  line-height: 1.75;
  color: var(--dl-text-muted);
  margin-bottom: 1rem;
}

.story-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card-dark {
  flex: 1;
  background: var(--dl-primary-dark);
  border-radius: var(--dl-radius-lg);
  padding: 1.5rem;
  color: #fff;
}

.stat-card-value {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 30px;
  color: var(--dl-accent-gold);
  margin: 0.6rem 0 0.2rem;
}

.stat-card-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}

.stat-card-light {
  flex: 1;
  background: var(--dl-surface-container-low);
  border-radius: var(--dl-radius-lg);
  padding: 1.5rem;
}

.stat-card-value-light {
  font-family: var(--dl-font-headline);
  font-weight: 700;
  font-size: 30px;
  color: var(--dl-primary-dark);
  margin: 0.6rem 0 0.2rem;
}

.stat-card-label-light {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dl-text-muted);
}

/* Values */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.value-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--dl-radius-full);
  background: var(--dl-surface-container-low);
  color: var(--dl-primary);
  display: grid;
  place-items: center;
  margin: 0 auto 1rem;
}

.value-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 0.5rem;
}

.value-card p {
  font-size: 14px;
  line-height: 1.65;
  color: var(--dl-text-muted);
  max-width: 280px;
  margin: 0 auto;
}

/* Timeline */
.timeline {
  max-width: 640px;
  margin: 0 auto;
}

.timeline-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 1.25rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--dl-outline-variant);
  margin-top: 4px;
}

.timeline-dot-active {
  background: var(--dl-primary);
  box-shadow: 0 0 0 4px rgba(38, 67, 97, 0.15);
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: var(--dl-border);
  margin-top: 4px;
}

.timeline-content {
  padding-bottom: 2.25rem;
}

.timeline-year {
  font-size: 13px;
  font-weight: 700;
  color: var(--dl-text-muted);
  margin-bottom: 0.25rem;
}

.timeline-year-active {
  color: var(--dl-secondary);
}

.timeline-content h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--dl-text-primary);
  margin: 0 0 0.4rem;
}

.timeline-content p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--dl-text-muted);
  margin: 0;
}

@media (max-width: 960px) {
  .section-block {
    padding: 3rem 1rem;
  }

  .story-grid {
    grid-template-columns: 1fr;
  }

  .story-stats {
    flex-direction: row;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>
