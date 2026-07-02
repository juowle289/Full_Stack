// Directive v-reveal: cho hiệu ứng "xuất hiện mượt mà khi cuộn tới" dùng chung
// cho toàn bộ trang public (Home/Guide/Catalog/About/Contact).
//
// Cách dùng cơ bản:
//   <section v-reveal>...</section>                     -> fade + trượt lên (mặc định)
//   <section v-reveal="{ variant: 'scale' }">...</section>   -> fade + phóng to nhẹ
//   <section v-reveal="{ variant: 'left' }">...</section>    -> trượt từ trái vào
//   <section v-reveal="{ variant: 'right' }">...</section>   -> trượt từ phải vào
//   <div v-reveal="{ delay: 120 }">...</div>             -> trễ 120ms (dùng để so le hàng loạt thẻ)
//   <div v-reveal="{ stagger: true }">                    -> tự động so le các phần tử con trực tiếp
//     <div class="card">...</div>
//     <div class="card">...</div>
//   </div>
//
// Chỉ chạy hiệu ứng 1 LẦN khi phần tử lần đầu lọt vào khung nhìn (không lặp lại khi cuộn qua lại,
// tránh gây rối mắt / giật khi người dùng cuộn lên xuống nhiều lần).

const observedEls = new WeakMap()

function applyVariantClass(el, variant) {
  el.classList.add('reveal-init')
  el.classList.add(`reveal-${variant || 'up'}`)
}

function mounted(el, binding) {
  const options = binding.value || {}
  const { variant, delay = 0, stagger = false, staggerStep = 90 } = options

  if (stagger) {
    // So le các phần tử con trực tiếp thay vì cả khối cùng lúc
    Array.from(el.children).forEach((child, idx) => {
      applyVariantClass(child, variant)
      child.style.transitionDelay = `${idx * staggerStep}ms`
    })
  } else {
    applyVariantClass(el, variant)
    if (delay) el.style.transitionDelay = `${delay}ms`
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (stagger) {
            Array.from(el.children).forEach((child) => child.classList.add('reveal-visible'))
          } else {
            el.classList.add('reveal-visible')
          }
          observer.unobserve(el)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )

  observer.observe(el)
  observedEls.set(el, observer)
}

function unmounted(el) {
  const observer = observedEls.get(el)
  if (observer) {
    observer.disconnect()
    observedEls.delete(el)
  }
}

export default { mounted, unmounted }
