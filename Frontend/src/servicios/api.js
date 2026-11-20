import axios from 'axios'

// Instancia base apuntando al backend de Spring Boot
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// Adjunta el token JWT en cada petición saliente
api.interceptors.request.use((config) => {
  const sesion = JSON.parse(localStorage.getItem('sesionGescolab') || 'null')
  if (sesion?.token) {
    config.headers.Authorization = `Bearer ${sesion.token}`
  }
  return config
})

// Cierra sesión automáticamente si el servidor responde 401 o 403
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status
    if (estado === 401 || estado === 403) {
      localStorage.removeItem('sesionGescolab')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
