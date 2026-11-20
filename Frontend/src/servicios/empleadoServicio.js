import api from './api'

// Directorio de colaboradores con búsqueda, filtros y paginación
export async function listarEmpleados({ buscar, departamento, estado, pagina = 0, tamano = 10 } = {}) {
  const respuesta = await api.get('/empleados', {
    params: { buscar, departamento, estado, pagina, tamano },
  })
  return respuesta.data
}

export async function obtenerResumenEmpleados() {
  const respuesta = await api.get('/empleados/resumen')
  return respuesta.data
}

export async function crearEmpleado(datos) {
  const respuesta = await api.post('/empleados', datos)
  return respuesta.data
}

export async function obtenerEmpleado(id) {
  const respuesta = await api.get(`/empleados/${id}`)
  return respuesta.data
}

export async function actualizarEmpleado(id, datos) {
  const respuesta = await api.put(`/empleados/${id}`, datos)
  return respuesta.data
}

export async function darDeBajaEmpleado(id) {
  await api.delete(`/empleados/${id}`)
}
