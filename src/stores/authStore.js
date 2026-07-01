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
    async login(email, password) {
      const response = await authApi.login({ email, password });
      const result = response.data?.data ?? response.data;

      const accessToken =
        result?.accessToken || result?.token || result?.data?.accessToken;
      const user = result?.user || result?.authUser || result?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Invalid login response format");
      }

      this.token = accessToken;
      this.user = user;

      localStorage.setItem("accessToken", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      return this.user;
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
  },
});
