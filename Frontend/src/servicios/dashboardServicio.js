import api from './api'

// Indicadores y gráficos del panel ejecutivo
export async function obtenerResumenDashboard() {
  const respuesta = await api.get('/dashboard/resumen')
  return respuesta.data
}

export async function obtenerTendenciaSemanal() {
  const respuesta = await api.get('/dashboard/tendencia-semanal')
  return respuesta.data
}

export async function obtenerDistribucionDepartamentos() {
  const respuesta = await api.get('/dashboard/distribucion-departamentos')
  return respuesta.data
}

export async function obtenerUltimasMarcaciones() {
  const respuesta = await api.get('/dashboard/ultimas-marcaciones')
  return respuesta.data
}
