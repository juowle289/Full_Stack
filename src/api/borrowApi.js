import api from "./axios";

const CIRCULATION_BASE =
  import.meta.env.VITE_API_CIRCULATION || import.meta.env.VITE_API_BASE_URL;
const circulationUrl = (path) => `${CIRCULATION_BASE}${path}`;

// Bản thân CirculationService chạy standalone có path /api/borrows, /api/invoices, /api/borrow-settings
// (không tiền tố). Nhưng Gateway (ocelot.json) định nghĩa Upstream là "/api/circulation/{everything}"
// nên khi đi qua Gateway (VITE_API_CIRCULATION không set, dùng chung VITE_API_BASE_URL), FE bắt buộc
// phải thêm tiền tố "/circulation" vào path, Gateway sẽ tự strip trước khi forward xuống Circulation.
export const borrowApi = {
  getAll(params) {
    return api.get(circulationUrl("/api/circulation/borrows"), { params });
  },

  getById(id) {
    return api.get(circulationUrl(`/api/circulation/borrows/${id}`));
  },

  getMyBorrows(params) {
    return api.get(circulationUrl("/api/circulation/borrows/me"), { params });
  },

  getStats() {
    return api.get(circulationUrl("/api/circulation/borrows/stats"));
  },

  getByBook(bookId) {
    return api.get(circulationUrl(`/api/circulation/borrows/book/${bookId}`));
  },

  getByReader(readerId) {
    return api.get(circulationUrl(`/api/circulation/borrows/reader/${readerId}`));
  },

  getOverdue(params) {
    return api.get(circulationUrl("/api/circulation/borrows/overdue"), { params });
  },

  getFines(params) {
    return api.get(circulationUrl("/api/circulation/borrows/fines"), { params });
  },

  getReaderFines(readerId) {
    return api.get(circulationUrl(`/api/circulation/borrows/reader/${readerId}/fines`));
  },

  // Librarian/Admin tạo phiếu mượn trực tiếp - cần đủ readerId + bookId + dueDate.
  create(data) {
    return api.post(circulationUrl("/api/circulation/borrows"), data);
  },

  // Reader TỰ đăng ký mượn - endpoint riêng, không cần readerId (BE tự lấy từ token).
  // Body: { bookId, requestedDays } (requestedDays mặc định 14 nếu bỏ trống).
  requestBorrow(data) {
    return api.post(circulationUrl("/api/circulation/borrows/request"), data);
  },

  // Duyệt yêu cầu mượn - body { dueDate } tùy chọn (null = dùng mặc định +14 ngày).
  approve(id, dueDate = null) {
    return api.put(circulationUrl(`/api/circulation/borrows/${id}/approve`), { dueDate });
  },

  // Từ chối yêu cầu mượn - không cần body.
  reject(id) {
    return api.put(circulationUrl(`/api/circulation/borrows/${id}/reject`));
  },

  // Trả sách - data: { returnDate } (returnDate có thể null = lấy thời gian hiện tại).
  returnBook(id, data) {
    return api.put(circulationUrl(`/api/circulation/borrows/${id}/return`), data);
  },

  // Trả về sẵn { qrImageUrl, fineAmount, readerName, bookTitle, ... } - FE chỉ cần hiển thị.
  getFinePaymentQr(id) {
    return api.get(circulationUrl(`/api/circulation/borrows/${id}/payment-qr`));
  },

  // Xác nhận đã thu phạt - không cần body.
  payFine(id) {
    return api.put(circulationUrl(`/api/circulation/borrows/${id}/pay-fine`));
  },
};

export const borrowSettingsApi = {
  // Chỉ có đúng 2 field: maxBorrowingBooks, finePerLateDay.
  get() {
    return api.get(circulationUrl("/api/circulation/borrow-settings"));
  },

  // Chỉ Admin gọi được.
  update(data) {
    return api.put(circulationUrl("/api/circulation/borrow-settings"), data);
  },
};

export const invoiceApi = {
  getAll(params) {
    return api.get(circulationUrl("/api/circulation/invoices"), { params });
  },

  getById(id) {
    return api.get(circulationUrl(`/api/circulation/invoices/${id}`));
  },

  getMyInvoices() {
    return api.get(circulationUrl("/api/circulation/invoices/me"));
  },

  getByReader(readerId) {
    return api.get(circulationUrl(`/api/circulation/invoices/reader/${readerId}`));
  },

  getByBorrow(borrowRecordId) {
    return api.get(circulationUrl(`/api/circulation/invoices/borrow/${borrowRecordId}`));
  },
};

export const proxyApi = {
  searchBooks(params) {
    return api.get(circulationUrl("/api/circulation/proxy/books"), { params });
  },

  searchReaders(params) {
    return api.get(circulationUrl("/api/circulation/proxy/readers"), { params });
  },
};
