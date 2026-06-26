import api from "./axios";

export const userApi = {
  lockUser(id) {
    return api.put(`/api/identity/users/${id}/lock`);
  },

  unlockUser(id) {
    return api.put(`/api/identity/users/${id}/unlock`);
  },

  // ⚠️ Các hàm dưới đây giả định endpoint theo đúng convention REST của
  // /api/identity/users đã có (lock/unlock). Nhóm cần xác nhận lại với
  // backend (tuananh05) đường dẫn chính xác trước khi dùng thật.
  getAll(params) {
    return api.get("/api/identity/users", { params });
  },

  create(data) {
    return api.post("/api/identity/users", data);
  },

  updateRole(id, role) {
    return api.put(`/api/identity/users/${id}/role`, { role });
  },

  resetPassword(id) {
    return api.put(`/api/identity/users/${id}/reset-password`);
  },
};
