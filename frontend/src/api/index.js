import api from './axios'

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  me: () => api.get('/auth/me/'),
}

export const barberApi = {
  getMyServices: () => api.get('/barber/my-services/'),
  createAppointment: (data) => api.post('/barber/appointments/', data),
  getMyAppointments: () => api.get('/barber/appointments/'),

  // Управление своими услугами
  createService: (data) => api.post('/services/', data),
  updateService: (id, data) => api.patch(`/services/${id}/`, data),
  deleteService: (id) => api.delete(`/services/${id}/`),
}

export const ownerApi = {
  // Филиалы
  getBranches: () => api.get('/branches/'),
  createBranch: (data) => api.post('/branches/', data),
  updateBranch: (id, data) => api.patch(`/branches/${id}/`, data),
  deleteBranch: (id) => api.delete(`/branches/${id}/`),

  // Барберы
  getBarbers: () => api.get('/barbers/'),
  createBarber: (data) => api.post('/barbers/', data),
  updateBarber: (id, data) => api.patch(`/barbers/${id}/`, data),
  deleteBarber: (id) => api.delete(`/barbers/${id}/`),

  // Услуги
  getServices: (barberId) =>
    api.get('/services/', { params: barberId ? { barber: barberId } : {} }),
  createService: (data) => api.post('/services/', data),
  updateService: (id, data) => api.patch(`/services/${id}/`, data),
  deleteService: (id) => api.delete(`/services/${id}/`),

  // Аналитика
  getSummary: (params) => api.get('/analytics/summary/', { params }),
  getByBranch: (params) => api.get('/analytics/by-branch/', { params }),
  getByBarber: (params) => api.get('/analytics/by-barber/', { params }),
  getByDay: (params) => api.get('/analytics/by-day/', { params }),
  getByMonth: (params) => api.get('/analytics/by-month/', { params }),
}

export const adminApi = {
  getBarbershops: () => api.get('/admin/barbershops/'),
  createBarbershop: (data) => api.post('/admin/barbershops/', data),
  toggleActive: (id) => api.post(`/admin/barbershops/${id}/toggle_active/`),
}

export const shopAdminApi = {
  getBarbers: () => api.get('/barbers/'),
  getServices: (barberId) => api.get('/services/', { params: barberId ? { barber: barberId } : {} }),
  getAppointments: () => api.get('/shop-admin/appointments/'),
  createAppointment: (data) => api.post('/shop-admin/appointments/', data),
}
