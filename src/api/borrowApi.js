import api from './axios'

export const borrowApi = {
  getAll(params) {
    return api.get('/api/circulation/borrows', { params })
  },

  getMyBorrows(params) {
    return api.get('/api/circulation/borrows/me', { params })
  },

  create(data) {
    return api.post('/api/circulation/borrows', data)
  },

  returnBook(id, data) {
    return api.put(`/api/circulation/borrows/${id}/return`, data)
  },

  getOverdue(params) {
    return api.get('/api/circulation/borrows/overdue', { params })
  },

  getFines(params) {
    return api.get('/api/circulation/borrows/fines', { params })
  },

  getReaderFines(readerId) {
    return api.get(`/api/circulation/borrows/reader/${readerId}/fines`)
  },

  payFine(id) {
    return api.put(`/api/circulation/borrows/${id}/pay-fine`)
  }
}