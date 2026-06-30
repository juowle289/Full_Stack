// Backend (CirculationService) định nghĩa BorrowRecord.Status có 4 giá trị:
// Requested (chờ duyệt) - Borrowed (đang mượn) - Returned (đã trả) - Rejected (bị từ chối)
// Dùng chung các hàm này ở mọi nơi hiển thị trạng thái phiếu mượn để đồng bộ.

export function getBorrowStatusText(status) {
  if (status === 'Requested') return 'Chờ duyệt'
  if (status === 'Borrowed') return 'Đang mượn'
  if (status === 'Returned') return 'Đã trả'
  if (status === 'Rejected') return 'Đã từ chối'
  return status || '-'
}

export function getBorrowStatusColor(status) {
  if (status === 'Requested') return 'info'
  if (status === 'Borrowed') return 'warning'
  if (status === 'Returned') return 'success'
  if (status === 'Rejected') return 'error'
  return 'grey'
}

export function getBorrowStatusIcon(status) {
  if (status === 'Requested') return 'mdi-clock-outline'
  if (status === 'Borrowed') return 'mdi-book-clock'
  if (status === 'Returned') return 'mdi-check-circle'
  if (status === 'Rejected') return 'mdi-close-circle'
  return 'mdi-help-circle-outline'
}
