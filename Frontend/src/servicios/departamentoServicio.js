import api from './api'

// Maestro y detalle de departamentos con sus cargos
export async function listarDepartamentos({ buscar } = {}) {
  const respuesta = await api.get('/departamentos', { params: { buscar } })
  return respuesta.data
}

export async function obtenerDetalleDepartamento(id) {
  const respuesta = await api.get(`/departamentos/${id}/detalle`)
  return respuesta.data
}

export async function crearDepartamento(datos) {
  const respuesta = await api.post('/departamentos', datos)
  return respuesta.data
}

export async function actualizarDepartamento(id, datos) {
  const respuesta = await api.put(`/departamentos/${id}`, datos)
  return respuesta.data
}

export async function listarCargos(idDepartamento) {
  const respuesta = await api.get(`/departamentos/${idDepartamento}/cargos`)
  return respuesta.data
}

export async function crearCargo(idDepartamento, datos) {
  const respuesta = await api.post(`/departamentos/${idDepartamento}/cargos`, datos)
  return respuesta.data
}

export async function actualizarCargo(id, datos) {
  const respuesta = await api.put(`/cargos/${id}`, datos)
  return respuesta.data
}

export async function eliminarDepartamento(id) {
  await api.delete(`/departamentos/${id}`)
}

export async function eliminarCargo(id) {
  await api.delete(`/cargos/${id}`)
}
