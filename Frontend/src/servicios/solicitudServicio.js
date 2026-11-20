import api from './api'

// Solicitudes de vacaciones y permisos con contadores por pestaña
export async function listarSolicitudes({ estado, tipo, departamento, buscar, pagina = 0, tamano = 10 } = {}) {
  const respuesta = await api.get('/solicitudes', {
    params: { estado, tipo, departamento, buscar, pagina, tamano },
  })
  return respuesta.data
}

export async function obtenerContadoresSolicitudes() {
  const respuesta = await api.get('/solicitudes/contadores')
  return respuesta.data
}

export async function obtenerResumenSolicitudes() {
  const respuesta = await api.get('/solicitudes/resumen')
  return respuesta.data
}

export async function listarMisSolicitudes() {
  const respuesta = await api.get('/solicitudes/mias')
  return respuesta.data
}

export async function crearSolicitud(datos) {
  const respuesta = await api.post('/solicitudes', datos)
  return respuesta.data
}

export async function aprobarSolicitud(id, observacion) {
  const respuesta = await api.put(`/solicitudes/${id}/aprobar`, null, { params: { observacion } })
  return respuesta.data
}

export async function rechazarSolicitud(id, observacion) {
  const respuesta = await api.put(`/solicitudes/${id}/rechazar`, null, { params: { observacion } })
  return respuesta.data
}
