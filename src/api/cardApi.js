import api from './axios'

export const cardApi = {
  // Tra cứu thông tin độc giả + thẻ thư viện theo cardNumber.
  // Trả về canBorrow/reason - dùng cho quầy lưu thông quét thẻ.
  lookup(cardNumber) {
    return api.get(`/api/identity/card/${cardNumber}`)
  }
}
