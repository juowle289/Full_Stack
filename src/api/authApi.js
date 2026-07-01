import api from "./axios";

const IDENTITY_BASE =
  import.meta.env.VITE_API_IDENTITY || import.meta.env.VITE_API_BASE_URL;
const identityUrl = (path) => `${IDENTITY_BASE}${path}`;

export const authApi = {
  login(data) {
    return api.post(identityUrl("/api/identity/auth/login"), data);
  },

  register(data) {
    return api.post(identityUrl("/api/identity/auth/register"), data);
  },

  me() {
    return api.get(identityUrl("/api/identity/auth/me"));
  },

  // ⚠️ Giả định endpoint - cần xác nhận với backend trước khi dùng thật.
  changePassword(data) {
    return api.put(identityUrl("/api/identity/auth/change-password"), data);
  },

  // ⚠️ Giả định endpoint - cần xác nhận với backend trước khi dùng thật.
  updateProfile(data) {
    return api.put(identityUrl("/api/identity/auth/me"), data);
  },
};
