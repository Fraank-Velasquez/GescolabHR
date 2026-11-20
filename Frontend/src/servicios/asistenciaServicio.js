import api from './api'

// Consultas de asistencia para admin y para el propio colaborador
export async function listarAsistencias({ fecha, fechaDesde, fechaHasta, departamento, estado, buscar, pagina = 0, tamano = 10 } = {}) {
  const respuesta = await api.get('/asistencia', {
    params: { fecha, fechaDesde, fechaHasta, departamento, estado, buscar, pagina, tamano },
  })
  return respuesta.data
}

export async function obtenerResumenAsistenciaGlobal(fecha, fechaDesde, fechaHasta) {
  const respuesta = await api.get('/asistencia/resumen', { params: { fecha, fechaDesde, fechaHasta } })
  return respuesta.data
}

export async function listarMisMarcaciones({ anio, mes, estado } = {}) {
  const respuesta = await api.get('/asistencia/mias', { params: { anio, mes, estado } })
  return respuesta.data
}

export async function obtenerMiResumen() {
  const respuesta = await api.get('/asistencia/mi-resumen')
  return respuesta.data
}

export async function obtenerJornadaActual() {
  const respuesta = await api.get('/asistencia/jornada-actual')
  return respuesta.data
}

export async function marcarEntrada() {
  const respuesta = await api.post('/asistencia/entrada')
  return respuesta.data
}

export async function marcarSalida() {
  const respuesta = await api.post('/asistencia/salida')
  return respuesta.data
}

export async function registrarRefrigerio() {
  const respuesta = await api.post('/asistencia/refrigerio')
  return respuesta.data
}

export async function justificarAsistencia(id, motivo) {
  const respuesta = await api.put(`/asistencia/${id}/justificar`, { motivo })
  return respuesta.data
}

export async function justificarMiAsistencia(id, motivo) {
  const respuesta = await api.put(`/asistencia/mias/${id}/justificar`, { motivo })
  return respuesta.data
}

export async function auditarAsistencia(id) {
  const respuesta = await api.put(`/asistencia/${id}/auditar`)
  return respuesta.data
}

export async function registrarFalta(id) {
  const respuesta = await api.put(`/asistencia/${id}/falta`)
  return respuesta.data
}

export async function registrarMarcacionManual(datos) {
  const respuesta = await api.post('/asistencia/manual', datos)
  return respuesta.data
}
