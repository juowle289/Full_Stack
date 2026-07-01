import api from "./axios";

const CATALOG_BASE =
  import.meta.env.VITE_API_CATALOG || import.meta.env.VITE_API_BASE_URL;

export const bookApi = {
  getAll(params) {
    return api.get(`${CATALOG_BASE}/api/catalog/books`, { params });
  },

  getById(id) {
    return api.get(`${CATALOG_BASE}/api/catalog/books/${id}`);
  },

  getCategoryMap() {
    return api.get(`${CATALOG_BASE}/api/catalog/books/category-map`);
  },

  create(data) {
    return api.post(`${CATALOG_BASE}/api/catalog/books`, data);
  },

  update(id, data) {
    return api.put(`${CATALOG_BASE}/api/catalog/books/${id}`, data);
  },

  remove(id) {
    return api.delete(`${CATALOG_BASE}/api/catalog/books/${id}`);
  },

  // Nhập hàng loạt từ file Excel (.xlsx) thật - backend tự đọc bằng MiniExcel.
  importExcel(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`${CATALOG_BASE}/api/catalog/books/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
