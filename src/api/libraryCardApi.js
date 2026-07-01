import api from "./axios";

const IDENTITY_BASE =
  import.meta.env.VITE_API_IDENTITY || import.meta.env.VITE_API_BASE_URL;
const identityUrl = (path) => `${IDENTITY_BASE}${path}`;

export const libraryCardApi = {
  getMyCard() {
    return api.get(identityUrl("/api/identity/library-cards/me"));
  },

  getCard(userId) {
    return api.get(identityUrl(`/api/identity/library-cards/${userId}`));
  },

  renewCard(userId) {
    return api.put(`/api/identity/library-cards/${userId}/renew`);
  },

  lockCard(userId) {
    return api.put(`/api/identity/library-cards/${userId}/lock`);
  },

  unlockCard(userId) {
    return api.put(`/api/identity/library-cards/${userId}/unlock`);
  },
};
