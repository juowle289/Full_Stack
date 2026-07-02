import { defineStore } from "pinia";
import { authApi } from "../api/authApi";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("accessToken") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || "",
    fullName: (state) => state.user?.fullName || "",
  },

  actions: {
    _applySession(result) {
      const accessToken =
        result?.accessToken || result?.token || result?.data?.accessToken;

      // Backend hiện trả phẳng { token, fullName, role } (không có object "user" riêng) -
      // tự dựng lại user object từ các field phẳng nếu chưa có sẵn result.user.
      const user =
        result?.user ||
        result?.authUser ||
        result?.data?.user ||
        (result?.fullName || result?.role
          ? { fullName: result.fullName, role: result.role, email: result.email }
          : null);

      if (!accessToken || !user) {
        throw new Error("Invalid login response format");
      }

      this.token = accessToken;
      this.user = user;

      localStorage.setItem("accessToken", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      return this.user;
    },

    async login(email, password) {
      const response = await authApi.login({ email, password });
      const result = response.data?.data ?? response.data;

      return this._applySession(result);
    },

    // Đăng nhập bằng Google - gửi ID Token (JWT do Google Identity Services cấp ở client)
    // lên backend để backend verify + đổi thành JWT nội bộ của hệ thống.
    // ⚠️ Cần backend triển khai POST /api/identity/auth/google-login trước khi dùng được.
    async loginWithGoogle(idToken) {
      const response = await authApi.googleLogin(idToken);
      const result = response.data?.data ?? response.data;

      return this._applySession(result);
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
  },
});
