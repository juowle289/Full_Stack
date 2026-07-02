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

  // ⚠️ CẦN BACKEND BỔ SUNG - endpoint này CHƯA có trong tài liệu Identity hiện tại.
  // Backend cần: nhận { idToken } (Google ID Token dạng JWT do Google cấp ở phía client),
  // verify chữ ký + audience (Google Client ID) qua Google tokeninfo hoặc Google.Apis.Auth,
  // rồi trả về CÙNG FORMAT với /api/identity/auth/login: { token, fullName, role }.
  // Nếu email Google chưa có tài khoản trong hệ thống, backend nên tự tạo user mới (role mặc định Reader).
  googleLogin(idToken) {
    return api.post(identityUrl("/api/identity/auth/google-login"), { idToken });
  },

  // ⚠️ Giả định endpoint - cần xác nhận với backend trước khi dùng thật.
  changePassword(data) {
    return api.put(identityUrl("/api/identity/auth/change-password"), data);
  },

  updateProfile(data) {
    return api.put(identityUrl("/api/identity/auth/me"), data);
  },
};
