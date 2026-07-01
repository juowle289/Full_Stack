import api from "./axios";

const IDENTITY_BASE =
  import.meta.env.VITE_API_IDENTITY || import.meta.env.VITE_API_BASE_URL;
const identityUrl = (path) => `${IDENTITY_BASE}${path}`;

export const cardApi = {
  // Tra cứu thông tin độc giả + thẻ thư viện theo cardNumber.
  // Trả về canBorrow/reason - dùng cho quầy lưu thông quét thẻ.
  lookup(cardNumber) {
    return api.get(identityUrl(`/api/identity/card/${cardNumber}`));
  },
};
