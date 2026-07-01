import api from "./axios";

const IDENTITY_BASE =
  import.meta.env.VITE_API_IDENTITY || import.meta.env.VITE_API_BASE_URL;
const identityUrl = (path) => `${IDENTITY_BASE}${path}`;

export const notificationApi = {
  getAll(isRead) {
    return api.get(identityUrl("/api/identity/notifications"), {
      params: { isRead },
    });
  },

  markAsRead(id) {
    return api.patch(identityUrl(`/api/identity/notifications/${id}/read`));
  },

  markAllAsRead() {
    return api.patch(identityUrl("/api/identity/notifications/read-all"));
  },
};
