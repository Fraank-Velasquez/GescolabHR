import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import BarraLateral from '../../componentes/BarraLateral'
import ChipEstado from '../../componentes/ChipEstado'
import Encabezado from '../../componentes/Encabezado'
import Paginacion from '../../componentes/Paginacion'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import ModalConfirmacion from '../../componentes/ModalConfirmacion'
import { useToast } from '../../componentes/Toast'
import BuscadorEmpleado from '../../componentes/BuscadorEmpleado'
import { listarDepartamentos } from '../../servicios/departamentoServicio'
import {
  aprobarSolicitud,
  crearSolicitud,
  listarSolicitudes,
  obtenerContadoresSolicitudes,
  obtenerResumenSolicitudes,
  rechazarSolicitud,
} from '../../servicios/solicitudServicio'

const PESTANAS = [
  { valor: 'PENDIENTE', texto: 'Pendientes de Aprobación' },
  { valor: 'APROBADA', texto: 'Aprobadas' },
  { valor: 'RECHAZADA', texto: 'Rechazadas' },
  { valor: '', texto: 'Historial Completo' },
]

const TIPOS = [
  { valor: 'VACACIONES', texto: 'Vacaciones', icono: 'beach-access' },
  { valor: 'DESCANSO_MEDICO', texto: 'Descanso Médico', icono: 'medical-services' },
  { valor: 'PERMISO_PERSONAL', texto: 'Permiso Personal', icono: 'person' },
  { valor: 'CAPACITACION', texto: 'Capacitación', icono: 'school' },
]

function obtenerFechaActual() {
  const fecha = new Date()
  const ano = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// Supervisión y aprobación de solicitudes de ausencia del personal
export default function GestionVacaciones() {
  const { mostrarToast } = useToast()
  const [solicitudes, setSolicitudes] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [contadores, setContadores] = useState(null)
  const [resumen, setResumen] = useState(null)
  const [departamentos, setDepartamentos] = useState([])
  const [pestana, setPestana] = useState('PENDIENTE')
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [pagina, setPagina] = useState(0)
  const [errorAccion, setErrorAccion] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)
  const [detalleSolicitud, setDetalleSolicitud] = useState(null)
  const [modalNueva, setModalNueva] = useState(false)
  const [nombreEmpleadoSolicitud, setNombreEmpleadoSolicitud] = useState('')
  const [cargandoAccion, setCargandoAccion] = useState(false)
  const [observacion, setObservacion] = useState('')
  const [formNueva, setFormNueva] = useState({
    idEmpleado: '',
    tipo: 'VACACIONES',
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
  })

  async function cargar(pag = 0) {
    try {
      const [paginaDatos, contadoresDatos, resumenDatos, listaDepartamentos] = await Promise.all([
        listarSolicitudes({
          estado: pestana || undefined,
          tipo: filtroTipo || undefined,
          departamento: filtroDepartamento || undefined,
          buscar: buscar || undefined,
          pagina: pag,
        }),
        obtenerContadoresSolicitudes(),
        obtenerResumenSolicitudes(),
        listarDepartamentos(),
      ])
      setSolicitudes(paginaDatos)
      setContadores(contadoresDatos)
      setResumen(resumenDatos)
      setDepartamentos(listaDepartamentos)
    } catch (error) {
      console.error('Error al cargar solicitudes', error)
    }
  }

  useEffect(() => {
    cargar(pagina)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, pestana, filtroTipo, filtroDepartamento, buscar])

  function solicitarAccion(solicitud, accion) {
    setObservacion('')
    setConfirmacion({
      tipo: accion,
      solicitud,
      titulo: accion === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud',
      mensaje: accion === 'aprobar'
        ? `¿Desea aprobar la solicitud de "${solicitud.nombreColaborador}"?`
        : `¿Desea rechazar la solicitud de "${solicitud.nombreColaborador}"?`,
      peligroso: accion === 'rechazar',
    })
  }

  async function ejecutarConfirmacion() {
    if (!confirmacion) return
    setCargandoAccion(true)
    setErrorAccion('')
    try {
      if (confirmacion.tipo === 'aprobar') {
        await aprobarSolicitud(confirmacion.solicitud.id, observacion.trim() || 'Aprobado por RR.HH.')
        mostrarToast('Solicitud aprobada correctamente')
      } else if (confirmacion.tipo === 'rechazar') {
        await rechazarSolicitud(confirmacion.solicitud.id, observacion.trim() || 'Rechazado por RR.HH.')
        mostrarToast('Solicitud rechazada correctamente')
      }
      setConfirmacion(null)
      await cargar(pagina)
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo procesar la solicitud'
      setErrorAccion(mensaje)
      setConfirmacion(null)
      mostrarToast(mensaje, 'error')
    } finally {
      setCargandoAccion(false)
    }
  }

  async function abrirNuevaSolicitud() {
    setFormNueva({ idEmpleado: '', tipo: 'VACACIONES', fechaInicio: '', fechaFin: '', motivo: '' })
    setNombreEmpleadoSolicitud('')
    setErrorAccion('')
    setModalNueva(true)
  }

  async function guardarNuevaSolicitud(evento) {
    evento.preventDefault()
    if (!formNueva.idEmpleado || !formNueva.fechaInicio || !formNueva.fechaFin || formNueva.motivo.trim().length < 5) {
      setErrorAccion('Complete colaborador, periodo y motivo (mínimo 5 caracteres)')
      return
    }
    if (formNueva.fechaInicio < obtenerFechaActual()) {
      setErrorAccion('La fecha de inicio no puede ser anterior a la fecha actual')
      mostrarToast('La fecha de inicio no puede ser anterior a la fecha actual', 'error')
      return
    }
    setCargandoAccion(true)
    try {
      await crearSolicitud({
        ...formNueva,
        idEmpleado: Number(formNueva.idEmpleado),
      })
      setModalNueva(false)
      setErrorAccion('')
      await cargar(0)
      setPagina(0)
      mostrarToast('Solicitud registrada correctamente')
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo registrar la solicitud'
      setErrorAccion(mensaje)
      mostrarToast(mensaje, 'error')
    } finally {
      setCargandoAccion(false)
    }
  }

  const totalPaginas = solicitudes.totalPages || 1
  const inicio = solicitudes.totalElements === 0 ? 0 : pagina * 10 + 1
  const fin = Math.min((pagina + 1) * 10, solicitudes.totalElements)

  const contadoresPorPestana = {
    PENDIENTE: contadores?.pendientes ?? 0,
    APROBADA: contadores?.aprobadas ?? 0,
    RECHAZADA: contadores?.rechazadas ?? 0,
    '': contadores?.historial ?? 0,
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BarraLateral />
      <div className="lg:pl-64">
        <Encabezado migas={['Vacaciones y Permisos']} />

        <main className="space-y-6 p-4 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                Solicitudes de Vacaciones y Permisos
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                Supervisa, aprueba o rechaza solicitudes de ausencia laboral, licencias médicas y
                periodos vacacionales del personal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={abrirNuevaSolicitud}
                className="inline-flex items-center gap-2 rounded-lg bg-[#148D82] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#157069]"
              >
                <Icon icon="material-symbols:add" className="text-lg" />
                Nueva Solicitud
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TarjetaMetrica
              etiqueta="Pendientes de Aprobación"
              valor={resumen?.pendientes ?? '—'}
              icono="pending_actions"
              color="ambar"
              pie="solicitudes activas"
            />
            <TarjetaMetrica
              etiqueta="Colaboradores Fuera Hoy"
              valor={resumen?.fueraHoy ?? '—'}
              icono="group_off"
              color="gris"
              pie="en ausencia temporal"
            />
          </div>

          {/* Pestañas con contadores */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            {PESTANAS.map((p) => (
              <button
                key={p.texto}
                type="button"
                onClick={() => { setPestana(p.valor); setPagina(0) }}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  pestana === p.valor
                    ? 'border-[#148D82] text-[#148D82]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.texto}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    pestana === p.valor
                      ? 'bg-[#CFF8EF] text-[#157069]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {contadoresPorPestana[p.valor]}
                </span>
              </button>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
              <input
                type="text"
                value={buscar}
                onChange={(e) => { setBuscar(e.target.value); setPagina(0) }}
                placeholder="Buscar colaborador..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
              />
            </div>
            <select
              value={filtroDepartamento}
              onChange={(e) => { setFiltroDepartamento(e.target.value); setPagina(0) }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
            >
              <option value="">Todos los Departamentos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
            <select
              value={filtroTipo}
              onChange={(e) => { setFiltroTipo(e.target.value); setPagina(0) }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
            >
              <option value="">Tipo de Permiso</option>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.texto}</option>
              ))}
            </select>
          </div>

          {errorAccion && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorAccion}
            </div>
          )}

          {/* Tabla de solicitudes */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Colaborador</th>
                    <th className="px-5 py-3">Tipo de Solicitud</th>
                    <th className="px-5 py-3">Periodo / Rango</th>
                    <th className="px-5 py-3 text-right">Días</th>
                    <th className="px-5 py-3">Motivo y Justificación</th>
                    <th className="px-5 py-3 text-center">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.content.map((s) => {
                    const tipoInfo = TIPOS.find((t) => t.valor === s.tipo)
                    return (
                      <tr key={s.id} className="border-b border-slate-100 transition-colors hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900">{s.nombreColaborador}</p>
                          <p className="text-xs text-slate-500">{s.cargo} • {s.departamento}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <Icon icon={`material-symbols:${tipoInfo?.icono}`} className="text-sm" />
                            {tipoInfo?.texto || s.tipo}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-700">{s.periodo}</td>
                        <td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-900">
                          {s.dias}
                        </td>
                        <td className="max-w-xs px-5 py-3.5">
                          <p className="truncate text-slate-600" title={s.motivo}>{s.motivo}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <ChipEstado estado={s.estado} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {s.estado === 'PENDIENTE' && (
                              <>
                                <button
                                  type="button"
                                  title="Aprobar solicitud"
                                  onClick={() => solicitarAccion(s, 'aprobar')}
                                  className="rounded-md p-1.5 text-[#148D82] transition-colors hover:bg-[#F1FCF9]"
                                >
                                  <Icon icon="material-symbols:check" className="text-lg" />
                                </button>
                                <button
                                  type="button"
                                  title="Rechazar solicitud"
                                  onClick={() => solicitarAccion(s, 'rechazar')}
                                  className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                                >
                                  <Icon icon="material-symbols:close" className="text-lg" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              title="Ver detalles"
                              onClick={() => setDetalleSolicitud(s)}
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Icon icon="material-symbols:more-vert" className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {solicitudes.content.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">
                        No hay solicitudes para esta pestaña
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalElementos={solicitudes.totalElements}
              etiqueta={`Mostrando ${inicio} - ${fin} de ${solicitudes.totalElements} solicitudes`}
              onCambiar={setPagina}
            />
          </div>

        </main>
      </div>

      {detalleSolicitud && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDetalleSolicitud(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Detalle de la solicitud</h2>
                <p className="mt-1 text-sm text-slate-500">{detalleSolicitud.nombreColaborador}</p>
              </div>
              <button type="button" onClick={() => setDetalleSolicitud(null)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
                <Icon icon="material-symbols:close" className="text-xl" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Tipo</p><p className="mt-1 text-sm font-medium">{TIPOS.find((tipo) => tipo.valor === detalleSolicitud.tipo)?.texto || detalleSolicitud.tipo}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Estado</p><div className="mt-1"><ChipEstado estado={detalleSolicitud.estado} /></div></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Periodo</p><p className="mt-1 text-sm font-medium">{detalleSolicitud.periodo}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Días solicitados</p><p className="mt-1 text-sm font-medium">{detalleSolicitud.dias}</p></div>
              <div className="rounded-lg border border-slate-200 p-3 sm:col-span-2"><p className="text-xs text-slate-500">Motivo</p><p className="mt-1 text-sm text-slate-700">{detalleSolicitud.motivo}</p></div>
              {detalleSolicitud.observacionResolucion && (
                <div className="rounded-lg border border-slate-200 p-3 sm:col-span-2"><p className="text-xs text-slate-500">Resolución</p><p className="mt-1 text-sm text-slate-700">{detalleSolicitud.observacionResolucion}</p></div>
              )}
            </div>
            <div className="mt-6 flex justify-end"><button type="button" onClick={() => setDetalleSolicitud(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cerrar</button></div>
          </div>
        </div>
      )}

      {modalNueva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalNueva(false)} />
          <form onSubmit={guardarNuevaSolicitud} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" noValidate>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Nueva solicitud</h2>
                <p className="mt-1 text-sm text-slate-500">Registre una ausencia para un colaborador.</p>
              </div>
              <button type="button" onClick={() => setModalNueva(false)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Cerrar"><Icon icon="material-symbols:close" className="text-xl" /></button>
            </div>
            {errorAccion && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorAccion}</div>}
            <div className="space-y-4">
              <div>
                <BuscadorEmpleado
                  id="empleadoSolicitud"
                  valorSeleccionado={formNueva.idEmpleado}
                  nombreSeleccionado={nombreEmpleadoSolicitud}
                  onSeleccionar={(empleado) => {
                    setNombreEmpleadoSolicitud(empleado?.nombreCompleto || '')
                    setFormNueva({ ...formNueva, idEmpleado: empleado?.id ? String(empleado.id) : '' })
                  }}
                  error={errorAccion.includes('Complete colaborador') ? 'Seleccione un colaborador' : ''}
                />
              </div>
              <div><label htmlFor="tipoSolicitud" className="mb-1.5 block text-sm font-medium">Tipo *</label><select id="tipoSolicitud" value={formNueva.tipo} onChange={(e) => setFormNueva({ ...formNueva, tipo: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm">{TIPOS.map((tipo) => <option key={tipo.valor} value={tipo.valor}>{tipo.texto}</option>)}</select></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="inicioSolicitud" className="mb-1.5 block text-sm font-medium">Fecha inicio *</label><input id="inicioSolicitud" type="date" min={obtenerFechaActual()} value={formNueva.fechaInicio} onChange={(e) => setFormNueva({ ...formNueva, fechaInicio: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></div><div><label htmlFor="finSolicitud" className="mb-1.5 block text-sm font-medium">Fecha fin *</label><input id="finSolicitud" type="date" value={formNueva.fechaFin} onChange={(e) => setFormNueva({ ...formNueva, fechaFin: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></div></div>
              <div><label htmlFor="motivoSolicitud" className="mb-1.5 block text-sm font-medium">Motivo *</label><textarea id="motivoSolicitud" rows="4" value={formNueva.motivo} onChange={(e) => setFormNueva({ ...formNueva, motivo: e.target.value })} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModalNueva(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cancelar</button><button type="submit" disabled={cargandoAccion} className="rounded-lg bg-[#148D82] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{cargandoAccion ? 'Guardando...' : 'Registrar Solicitud'}</button></div>
          </form>
        </div>
      )}

      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={confirmacion?.tipo === 'rechazar' ? 'Rechazar' : 'Aprobar'}
        peligroso={confirmacion?.peligroso}
        cargando={cargandoAccion}
        alCancelar={() => setConfirmacion(null)}
        alConfirmar={ejecutarConfirmacion}
        etiquetaObservacion={confirmacion?.tipo === 'rechazar' ? 'Motivo del rechazo' : 'Observación de aprobación'}
        valorObservacion={observacion}
        alCambiarObservacion={setObservacion}
      />
    </div>
  )
}
