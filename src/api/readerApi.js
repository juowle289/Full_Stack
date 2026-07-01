import api from "./axios";

const IDENTITY_BASE =
  import.meta.env.VITE_API_IDENTITY || import.meta.env.VITE_API_BASE_URL;
const identityUrl = (path) => `${IDENTITY_BASE}${path}`;

export const readerApi = {
  getAll(params) {
    return api.get(identityUrl("/api/identity/readers"), { params });
  },

  getMe() {
    return api.get(identityUrl("/api/identity/readers/me"));
  },

  getById(id) {
    return api.get(identityUrl(`/api/identity/readers/${id}`));
  },
};
