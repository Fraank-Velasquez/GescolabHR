import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import BarraLateral from '../../componentes/BarraLateral'
import ChipEstado from '../../componentes/ChipEstado'
import Encabezado from '../../componentes/Encabezado'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import Paginacion from '../../componentes/Paginacion'
import {
  obtenerDistribucionDepartamentos,
  obtenerResumenDashboard,
  obtenerUltimasMarcaciones,
} from '../../servicios/dashboardServicio'
import { claseAncho } from '../../servicios/utilidadesEstilo'
import '../../estilos/dashboard.css'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Panel ejecutivo con KPIs, gráfico semanal, distribución y últimas marcaciones
export default function PanelEjecutivo() {
  const navegar = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [distribucion, setDistribucion] = useState([])
  const [marcaciones, setMarcaciones] = useState([])
  const [pagina, setPagina] = useState(0)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [cargando, setCargando] = useState(false)

  async function cargarDatos() {
    setCargando(true)
    try {
      const [r, d, m] = await Promise.all([
        obtenerResumenDashboard(),
        obtenerDistribucionDepartamentos(),
        obtenerUltimasMarcaciones(),
      ])
      setResumen(r)
      setDistribucion(d)
      setMarcaciones(m)
    } catch (error) {
      console.error('Error al cargar el panel', error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const hoy = new Date()
  const fechaLarga = `${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}`

  const marcacionesFiltradas = marcaciones.filter((m) => {
    const coincideTexto = !filtroTexto
      || m.nombreColaborador.toLowerCase().includes(filtroTexto.toLowerCase())
    const coincideDepto = !filtroDepartamento || m.departamento === filtroDepartamento
    return coincideTexto && coincideDepto
  })

  const totalPaginas = Math.max(1, Math.ceil(marcacionesFiltradas.length / 6))
  const visibles = marcacionesFiltradas.slice(pagina * 6, pagina * 6 + 6)
  const departamentosUnicos = [...new Set(marcaciones.map((m) => m.departamento))]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BarraLateral />
      <div className="lg:pl-64">
        <Encabezado migas={['Dashboard']} />

        <main className="space-y-6 p-4 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Panel de Control Ejecutivo</h1>
              <p className="mt-1 text-sm text-slate-500">
                Resumen general de personal, asistencia en tiempo real y solicitudes activas para hoy, {fechaLarga}.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaMetrica
              etiqueta="Total Empleados Activos"
              valor={resumen?.totalEmpleadosActivos ?? '—'}
              icono="group"
              color="teal"
            />
            <TarjetaMetrica
              etiqueta="Asistencias Hoy"
              valor={resumen?.asistenciasHoy ?? '—'}
              icono="how_to_reg"
              color="azul"
            />
            <TarjetaMetrica
              etiqueta="Tardanzas del Día"
              valor={resumen?.tardanzasDelDia ?? '—'}
              icono="alarm_on"
              color="ambar"
            />
            <TarjetaMetrica
              etiqueta="Solicitudes Pendientes"
              valor={resumen?.solicitudesPendientes ?? '—'}
              icono="pending_actions"
              color="gris"
            />
          </div>

          <div className="grid gap-6">
            {/* Distribución por departamento */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Colaboradores por Departamento</h2>
              <p className="text-xs text-slate-500">
                {resumen?.totalEmpleadosActivos ?? 0} colaboradores
              </p>

              <div className="mt-5 space-y-4">
                {distribucion.map((depto) => (
                  <div key={depto.nombre}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-medium text-slate-700">{depto.nombre}</span>
                      <span className="ml-2 shrink-0 tabular-nums text-slate-500">
                        {depto.totalColaboradores} colab. ({depto.porcentaje}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-[#148D82] transition-all ${claseAncho(depto.porcentaje)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de últimas marcaciones */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-slate-900">Últimas Marcaciones del Día</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Icon icon="material-symbols:filter-list" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                  <input
                    type="text"
                    value={filtroTexto}
                    onChange={(e) => { setFiltroTexto(e.target.value); setPagina(0) }}
                    placeholder="Filtrar por empleado..."
                    className="w-52 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
                  />
                </div>
                <select
                  value={filtroDepartamento}
                  onChange={(e) => { setFiltroDepartamento(e.target.value); setPagina(0) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
                >
                  <option value="">Todos los departamentos</option>
                  {departamentosUnicos.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => navegar('/asistencia')}
                  className="text-sm font-medium text-[#148D82] hover:text-[#157069]"
                >
                  Ver todas
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Colaborador</th>
                    <th className="px-5 py-3">Departamento</th>
                    <th className="px-5 py-3 text-right">Hora Entrada</th>
                    <th className="px-5 py-3 text-right">Hora Salida</th>
                    <th className="px-5 py-3">Dispositivo / Método</th>
                    <th className="px-5 py-3 text-center">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 transition-colors hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#CFF8EF] text-xs font-bold text-[#157069]">
                            {m.nombreColaborador.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900">{m.nombreColaborador}</p>
                            <p className="text-xs text-slate-500">{m.cargo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{m.departamento}</td>
                      <td className={`px-5 py-3.5 text-right font-medium tabular-nums ${
                        m.estado === 'TARDANZA' ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {m.horaEntrada ? formatearHora(m.horaEntrada) : '--:--'}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                        {m.horaSalida ? formatearHora(m.horaSalida) : 'En curso'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Icon icon="material-symbols:badge" className="text-sm" />
                          {traducirMetodo(m.metodo)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <ChipEstado estado={m.estado} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          title="Ver registro en asistencia"
                          onClick={() => navegar('/asistencia')}
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Icon icon="material-symbols:more-vert" className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                        No hay marcaciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalElementos={marcacionesFiltradas.length}
              etiqueta={`Mostrando ${pagina * 6 + 1}-${Math.min((pagina + 1) * 6, marcacionesFiltradas.length)} de ${marcacionesFiltradas.length} registros`}
              onCambiar={setPagina}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function formatearHora(hora) {
  const [h, m] = hora.split(':')
  const horaNum = parseInt(h, 10)
  const sufijo = horaNum >= 12 ? 'PM' : 'AM'
  const hora12 = horaNum % 12 || 12
  return `${String(hora12).padStart(2, '0')}:${m} ${sufijo}`
}

function traducirMetodo(metodo) {
  return 'Portal Web'
}
