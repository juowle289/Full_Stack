import api from "./axios";

const CIRCULATION_BASE =
  import.meta.env.VITE_API_CIRCULATION || import.meta.env.VITE_API_BASE_URL;
const circulationUrl = (path) => `${CIRCULATION_BASE}${path}`;

// CirculationService expects direct paths like /api/borrows, /api/invoices, and /api/borrow-settings.
// If you route through a Gateway, set VITE_API_CIRCULATION to the gateway URL and keep paths direct.
export const borrowApi = {
  getAll(params) {
    return api.get(circulationUrl("/api/borrows"), { params });
  },

  getById(id) {
    return api.get(circulationUrl(`/api/borrows/${id}`));
  },

  getMyBorrows(params) {
    return api.get(circulationUrl("/api/borrows/me"), { params });
  },

  getStats() {
    return api.get(circulationUrl("/api/borrows/stats"));
  },

  getByBook(bookId) {
    return api.get(circulationUrl(`/api/borrows/book/${bookId}`));
  },

  getByReader(readerId) {
    return api.get(circulationUrl(`/api/borrows/reader/${readerId}`));
  },

  getOverdue(params) {
    return api.get(circulationUrl("/api/borrows/overdue"), { params });
  },

  getFines(params) {
    return api.get(circulationUrl("/api/borrows/fines"), { params });
  },

  getReaderFines(readerId) {
    return api.get(circulationUrl(`/api/borrows/reader/${readerId}/fines`));
  },

  // Librarian/Admin tạo phiếu mượn trực tiếp - cần đủ readerId + bookId + dueDate.
  create(data) {
    return api.post(circulationUrl("/api/borrows"), data);
  },

  // Reader TỰ đăng ký mượn - endpoint riêng, không cần readerId (BE tự lấy từ token).
  // Body: { bookId, requestedDays } (requestedDays mặc định 14 nếu bỏ trống).
  requestBorrow(data) {
    return api.post(circulationUrl("/api/borrows/request"), data);
  },

  // Duyệt yêu cầu mượn - body { dueDate } tùy chọn (null = dùng mặc định +14 ngày).
  approve(id, dueDate = null) {
    return api.put(circulationUrl(`/api/borrows/${id}/approve`), { dueDate });
  },

  // Từ chối yêu cầu mượn - không cần body.
  reject(id) {
    return api.put(circulationUrl(`/api/borrows/${id}/reject`));
  },

  // Trả sách - data: { returnDate } (returnDate có thể null = lấy thời gian hiện tại).
  returnBook(id, data) {
    return api.put(circulationUrl(`/api/borrows/${id}/return`), data);
  },

  // Trả về sẵn { qrImageUrl, fineAmount, readerName, bookTitle, ... } - FE chỉ cần hiển thị.
  getFinePaymentQr(id) {
    return api.get(circulationUrl(`/api/borrows/${id}/payment-qr`));
  },

  // Xác nhận đã thu phạt - không cần body.
  payFine(id) {
    return api.put(circulationUrl(`/api/borrows/${id}/pay-fine`));
  },
};

export const borrowSettingsApi = {
  // Chỉ có đúng 2 field: maxBorrowingBooks, finePerLateDay.
  get() {
    return api.get(circulationUrl("/api/borrow-settings"));
  },

  // Chỉ Admin gọi được.
  update(data) {
    return api.put(circulationUrl("/api/borrow-settings"), data);
  },
};

export const invoiceApi = {
  getAll(params) {
    return api.get(circulationUrl("/api/invoices"), { params });
  },

  getById(id) {
    return api.get(circulationUrl(`/api/invoices/${id}`));
  },

  getMyInvoices() {
    return api.get(circulationUrl("/api/invoices/me"));
  },

  getByReader(readerId) {
    return api.get(circulationUrl(`/api/invoices/reader/${readerId}`));
  },

  getByBorrow(borrowRecordId) {
    return api.get(circulationUrl(`/api/invoices/borrow/${borrowRecordId}`));
  },
};

export const proxyApi = {
  searchBooks(params) {
    return api.get(circulationUrl("/api/proxy/books"), { params });
  },

  searchReaders(params) {
    return api.get(circulationUrl("/api/proxy/readers"), { params });
  },
};
