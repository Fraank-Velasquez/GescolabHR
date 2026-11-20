import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import BarraLateralEmpleado from '../../componentes/BarraLateralEmpleado'
import ChipEstado from '../../componentes/ChipEstado'
import Encabezado from '../../componentes/Encabezado'
import Paginacion from '../../componentes/Paginacion'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import ModalConfirmacion from '../../componentes/ModalConfirmacion'
import { useToast } from '../../componentes/Toast'
import { useAutenticacion } from '../../contexto/AutenticacionContexto'
import '../../estilos/dashboard.css'
import {
  listarMisMarcaciones,
  marcarEntrada,
  marcarSalida,
  obtenerJornadaActual,
  obtenerMiResumen,
  justificarMiAsistencia,
  registrarRefrigerio,
} from '../../servicios/asistenciaServicio'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Vista personal del colaborador: KPIs, tarjeta de marcación y registro mensual
export default function MiAsistencia() {
  const { sesion } = useAutenticacion()
  const { mostrarToast } = useToast()
  const [resumen, setResumen] = useState(null)
  const [jornada, setJornada] = useState(null)
  const [horaActual, setHoraActual] = useState(new Date())
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(0)
  const [cargandoAccion, setCargandoAccion] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [detalleMarcacion, setDetalleMarcacion] = useState(null)
  const [modalReglamento, setModalReglamento] = useState(false)
  const [modalProblemas, setModalProblemas] = useState(false)
  const [confirmacionJustificacion, setConfirmacionJustificacion] = useState(null)
  const [motivoJustificacion, setMotivoJustificacion] = useState('')

  // Reloj en vivo de la tarjeta hero
  useEffect(() => {
    const intervalo = setInterval(() => setHoraActual(new Date()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  const cargar = useCallback(async () => {
    try {
      const [resumenDatos, jornadaDatos] = await Promise.all([
        obtenerMiResumen(),
        obtenerJornadaActual(),
      ])
      setResumen(resumenDatos)
      setJornada(jornadaDatos)
    } catch (error) {
      console.error('Error al cargar la asistencia', error)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function manejarAccion(tipo) {
    setCargandoAccion(true)
    setMensaje('')
    setErrorAccion('')
    try {
      if (tipo === 'entrada') await marcarEntrada()
      if (tipo === 'salida') await marcarSalida()
      if (tipo === 'refrigerio') await registrarRefrigerio()
      setMensaje(
        tipo === 'entrada'
          ? 'Entrada registrada correctamente'
          : tipo === 'salida'
            ? 'Salida registrada correctamente'
            : 'Refrigerio registrado',
      )
      mostrarToast(
        tipo === 'entrada'
          ? 'Entrada registrada correctamente'
          : tipo === 'salida'
            ? 'Salida registrada correctamente'
            : 'Refrigerio registrado',
      )
      await cargar()
    } catch (error) {
      setErrorAccion(error.response?.data?.mensaje || 'No se pudo completar la marcación')
      mostrarToast(error.response?.data?.mensaje || 'No se pudo completar la marcación', 'error')
    } finally {
      setCargandoAccion(false)
    }
  }

  function solicitarJustificacion(marcacion) {
    setMotivoJustificacion('')
    setConfirmacionJustificacion(marcacion)
  }

  async function confirmarJustificacion() {
    if (motivoJustificacion.trim().length < 5) {
      mostrarToast('El motivo debe tener al menos 5 caracteres', 'error')
      return
    }
    setCargandoAccion(true)
    try {
      await justificarMiAsistencia(confirmacionJustificacion.id, motivoJustificacion.trim())
      setConfirmacionJustificacion(null)
      setMotivoJustificacion('')
      await cargar()
      const datos = await listarMisMarcaciones({
        anio: anioActual,
        mes: mesSeleccionado,
        estado: filtroEstado || undefined,
      })
      setMarcaciones(datos)
      mostrarToast('Incidencia enviada para justificación')
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudo justificar la incidencia', 'error')
    } finally {
      setCargandoAccion(false)
    }
  }

  const fechaLarga = `${DIAS[horaActual.getDay()]}, ${horaActual.getDate()} de ${MESES[horaActual.getMonth()]}, ${horaActual.getFullYear()}`
  const horaTexto = horaActual.toLocaleTimeString('es-PE', { hour12: true })

  const estadoJornada = jornada?.estadoMarcacion
  const puedeMarcarEntrada = estadoJornada === 'SIN_MARCACION' || estadoJornada === undefined
  const puedeMarcarSalida = estadoJornada === 'ENTRADA_REGISTRADA'

  // Filtrado local de la tabla mensual
  const mesActual = new Date().getMonth() + 1
  const anioActual = new Date().getFullYear()
  const mesSeleccionado = filtroMes ? Number(filtroMes) : mesActual

  const [marcaciones, setMarcaciones] = useState([])
  useEffect(() => {
    async function cargarMarcaciones() {
      try {
        const datos = await listarMisMarcaciones({
          anio: anioActual,
          mes: mesSeleccionado,
          estado: filtroEstado || undefined,
        })
        setMarcaciones(datos)
      } catch (error) {
        console.error('Error al cargar marcaciones', error)
      }
    }
    cargarMarcaciones()
  }, [mesSeleccionado, filtroEstado, anioActual])

  const porPagina = 6
  const totalPaginas = Math.max(1, Math.ceil(marcaciones.length / porPagina))
  const visibles = marcaciones.slice(pagina * porPagina, pagina * porPagina + porPagina)
  const inicio = marcaciones.length === 0 ? 0 : pagina * porPagina + 1
  const fin = Math.min((pagina + 1) * porPagina, marcaciones.length)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BarraLateralEmpleado />
      <div className="lg:pl-64">
        <Encabezado migas={['Mi Asistencia']} />

        <main className="space-y-6 p-4 pt-20 lg:p-8 lg:pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Mi Control de Asistencia</h1>
              <p className="mt-1 text-sm text-slate-500">
                Monitoreo de asistencia en tiempo real, puntualidad del periodo y marcaciones biométricas.
              </p>
            </div>
            {detalleMarcacion && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDetalleMarcacion(null)} />
                <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-start justify-between">
                    <div><h2 className="text-lg font-bold text-slate-900">Detalle de marcación</h2><p className="mt-1 text-sm text-slate-500">{formatearFechaLarga(detalleMarcacion.fecha)}</p></div>
                    <button type="button" onClick={() => setDetalleMarcacion(null)} aria-label="Cerrar"><Icon icon="material-symbols:close" className="text-xl" /></button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Entrada</p><p className="mt-1 font-medium">{detalleMarcacion.horaEntrada ? formatearHora(detalleMarcacion.horaEntrada) : '--:--'}</p></div>
                    <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Salida</p><p className="mt-1 font-medium">{detalleMarcacion.horaSalida ? formatearHora(detalleMarcacion.horaSalida) : 'En curso'}</p></div>
                    <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Estado</p><div className="mt-1"><ChipEstado estado={detalleMarcacion.estado} /></div></div>
                    <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Método</p><p className="mt-1 font-medium">{traducirMetodo(detalleMarcacion.metodo)}</p></div>
                    {detalleMarcacion.motivoJustificacion && <div className="rounded-lg border border-slate-200 p-3 sm:col-span-2"><p className="text-xs text-slate-500">Motivo de justificación</p><p className="mt-1 text-sm">{detalleMarcacion.motivoJustificacion}</p></div>}
                  </div>
                  <div className="mt-6 flex justify-end"><button type="button" onClick={() => setDetalleMarcacion(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cerrar</button></div>
                </div>
              </div>
            )}

            {modalReglamento && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalReglamento(false)} />
                <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <h2 className="text-lg font-bold text-slate-900">Reglamento de Asistencia</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">Registre su entrada al iniciar la jornada, su refrigerio según el turno y cierre la jornada con su salida. Las tardanzas pueden justificarse desde su registro diario.</p>
                  <div className="mt-6 flex justify-end"><button type="button" onClick={() => setModalReglamento(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cerrar</button></div>
                </div>
              </div>
            )}

            {modalProblemas && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalProblemas(false)} />
                <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <h2 className="text-lg font-bold text-slate-900">Problemas con el marcado</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">Verifique su conexión y que sea el horario de su turno. Si el problema continúa, contacte a Recursos Humanos para registrar una marcación manual.</p>
                  <div className="mt-6 flex justify-end"><button type="button" onClick={() => setModalProblemas(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cerrar</button></div>
                </div>
              </div>
            )}

            {confirmacionJustificacion && (
              <ModalConfirmacion
                abierto
                titulo="Justificar tardanza"
                mensaje={`Ingrese el motivo de la incidencia del ${formatearFechaLarga(confirmacionJustificacion.fecha)}.`}
                textoConfirmar="Enviar justificación"
                cargando={cargandoAccion}
                alCancelar={() => setConfirmacionJustificacion(null)}
                alConfirmar={confirmarJustificacion}
                etiquetaObservacion="Motivo"
                valorObservacion={motivoJustificacion}
                alCambiarObservacion={setMotivoJustificacion}
              />
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setFiltroMes('')
                  setPagina(0)
                  document.getElementById('mis-marcaciones')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon icon="material-symbols:calendar-today" className="text-lg" />
                Periodo Actual
              </button>
              <button
                type="button"
                onClick={() => setModalReglamento(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon icon="material-symbols:info" className="text-lg" />
                Reglamento Interno
              </button>
            </div>
          </div>

          {(mensaje || errorAccion) && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                mensaje
                  ? 'border-[#148D82]/20 bg-[#CFF8EF] text-[#157069]'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {mensaje || errorAccion}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TarjetaMetrica
              etiqueta="Días Asistidos"
              valor={resumen?.diasAsistidos ?? '—'}
              icono="event_available"
              color="teal"
              pie={`${resumen?.porcentajeDias ?? 0}% del periodo`}
            />
            <TarjetaMetrica
              etiqueta="Horas Acumuladas"
              valor={resumen?.horasAcumuladas ?? '—'}
              icono="hourglass_top"
              color="azul"
            />
            <TarjetaMetrica
              etiqueta="Puntualidad"
              valor={`${resumen?.porcentajePuntualidad ?? 0}%`}
              icono="verified"
              color="teal"
              pie="Excelente"
            />
            <TarjetaMetrica
              etiqueta="Tardanzas del Mes"
              valor={resumen?.tardanzas ?? '—'}
              icono="alarm_on"
              color="ambar"
            />
          </div>

          {/* Tarjeta hero de marcación */}
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                ¡Buenos días, {sesion?.nombreCompleto?.split(' ')[0] || 'Colaborador'}!
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Jornada asignada:{' '}
                <span className="font-medium text-slate-700">
                  {jornada?.nombreTurno} ({formatearHora(String(jornada?.horaEntrada || '08:00:00'))} -{' '}
                  {formatearHora(String(jornada?.horaSalida || '17:00:00'))})
                </span>{' '}
                • {jornada?.modalidad || 'Presencial'}
              </p>

              <div className="mt-5 rounded-xl bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Progreso de la Jornada Hoy</span>
                  <span className="font-semibold tabular-nums text-slate-900">{jornada?.progreso}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full bg-[#148D82] transition-all ancho-${redondear(jornada?.porcentajeProgreso || 0)}`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{formatearHora(String(jornada?.horaEntrada || '08:00:00'))} Entrada</span>
                  <span>Refrigerio ({formatearHora(String(jornada?.horaRefrigerio || '13:00:00'))})</span>
                  <span>{formatearHora(String(jornada?.horaSalida || '17:00:00'))} Salida</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#13403D] bg-[#062D2C] p-6 text-white shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#36CBB8]">
                <span className="h-2 w-2 rounded-full bg-[#36CBB8] parpadeo" />
                Hora actual
              </div>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-wide text-[#36CBB8] reloj-vivo">
                {horaTexto}
              </p>
              <p className="mt-1 text-sm text-[#B7D4D1]">{fechaLarga}</p>

              <div className="mt-5 rounded-xl border border-[#13403D] bg-[#0D3331] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#7FB3AD]">Estado de marcación</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {estadoJornada === 'ENTRADA_REGISTRADA' && 'Entrada Registrada'}
                      {estadoJornada === 'JORNADA_CERRADA' && 'Jornada Cerrada'}
                      {estadoJornada === 'SIN_MARCACION' && 'Sin marcación hoy'}
                      {!estadoJornada && 'Cargando...'}
                    </p>
                  </div>
                  {jornada?.horaMarcada && (
                    <div className="text-right">
                      <p className="text-xs text-[#7FB3AD]">Hora</p>
                      <p className="text-lg font-bold tabular-nums text-[#36CBB8]">
                        {formatearHora(String(jornada.horaMarcada))}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => manejarAccion('salida')}
                  disabled={!puedeMarcarSalida || cargandoAccion}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#148D82] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1DAF9F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon icon="material-symbols:logout" className="text-lg" />
                  {cargandoAccion ? 'Procesando...' : 'Registrar Salida'}
                  <span className="text-xs font-normal opacity-80">
                    (Finalizar turno actual ({formatearHora(String(jornada?.horaSalida || '17:00:00'))}))
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => manejarAccion('entrada')}
                    disabled={!puedeMarcarEntrada || cargandoAccion}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[#13403D] bg-[#0D3331] px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#13403D] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon icon="material-symbols:login" className="text-sm" />
                    Registrar Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => manejarAccion('refrigerio')}
                    disabled={!puedeMarcarSalida || cargandoAccion}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-[#13403D] bg-[#0D3331] px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#13403D] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon icon="material-symbols:coffee" className="text-sm" />
                    Refrigerio / Pausa
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalProblemas(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#13403D] px-4 py-2.5 text-xs font-medium text-[#B7D4D1] transition-colors hover:bg-[#0D3331] hover:text-white"
                >
                  <Icon icon="material-symbols:help" className="text-sm" />
                  ¿Problemas con el marcado?
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de marcaciones del mes */}
          <div id="mis-marcaciones" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Mis Marcaciones del Mes</h2>
                <p className="text-xs text-slate-500">
                  Registro auditado de lecturas biométricas, accesos y descansos laborales.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filtroMes}
                  onChange={(e) => { setFiltroMes(e.target.value); setPagina(0) }}
                  aria-label="Seleccionar mes"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
                >
                  <option value="">{MESES[mesActual - 1]} {anioActual}</option>
                  <option value={mesActual - 1 > 0 ? mesActual - 1 : 12}>
                    {MESES[(mesActual - 2 + 12) % 12]} {mesActual - 1 > 0 ? anioActual : anioActual - 1}
                  </option>
                  <option value={mesActual + 1 <= 12 ? mesActual + 1 : 1}>
                    {MESES[mesActual % 12]} {mesActual + 1 <= 12 ? anioActual : anioActual + 1}
                  </option>
                </select>
                <select
                  value={filtroEstado}
                  onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0) }}
                  aria-label="Filtrar por estado"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
                >
                  <option value="">Todos los estados</option>
                  <option value="PUNTUAL">Puntual</option>
                  <option value="TARDANZA">Tardanza</option>
                  <option value="JUSTIFICADA">Justificada / Permiso</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3 text-right">Hora Entrada</th>
                    <th className="px-5 py-3 text-right">Hora Salida</th>
                    <th className="px-5 py-3 text-right">Horas Efectivas</th>
                    <th className="px-5 py-3">Método / Dispositivo</th>
                    <th className="px-5 py-3 text-center">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((m) => (
                    <tr
                      key={m.id}
                      className={`border-b border-slate-100 transition-colors ${
                        m.estado === 'TARDANZA' ? 'bg-red-50/40' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{formatearFechaLarga(m.fecha)}</span>
                          {esHoy(m.fecha) && (
                            <span className="rounded-full bg-[#CFF8EF] px-2 py-0.5 text-[10px] font-semibold text-[#157069]">
                              Hoy
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-medium tabular-nums ${
                        m.estado === 'TARDANZA' ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {m.horaEntrada ? formatearHora(m.horaEntrada) : '--:--'}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                        {m.horaSalida ? formatearHora(m.horaSalida) : 'En curso'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-700">
                        {m.horasEfectivas}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{traducirMetodo(m.metodo)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <ChipEstado estado={m.estado} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" title="Ver detalles de lectura" onClick={() => setDetalleMarcacion(m)} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#148D82]">
                            <Icon icon="material-symbols:visibility" className="text-lg" />
                          </button>
                          {m.estado === 'TARDANZA' && (
                            <button type="button" title="Justificar incidencia" onClick={() => solicitarJustificacion(m)} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#148D82]">
                              <Icon icon="material-symbols:edit-note" className="text-lg" />
                            </button>
                          )}
                          {m.estado === 'JUSTIFICADA' && (
                            <button type="button" title="Ver resolución de permiso" onClick={() => setDetalleMarcacion(m)} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#148D82]">
                              <Icon icon="material-symbols:assignment" className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">
                        No hay marcaciones registradas en este periodo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalElementos={marcaciones.length}
              etiqueta={`Mostrando ${inicio} - ${fin} de ${marcaciones.length} registros de ${MESES[mesSeleccionado - 1]}`}
              onCambiar={setPagina}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function redondear(valor) {
  return Math.min(100, Math.max(0, Math.round(valor / 5) * 5))
}

function formatearHora(hora) {
  const partes = String(hora).split(':')
  const horaNum = parseInt(partes[0], 10)
  if (Number.isNaN(horaNum)) return hora
  const sufijo = horaNum >= 12 ? 'PM' : 'AM'
  const hora12 = horaNum % 12 || 12
  return `${String(hora12).padStart(2, '0')}:${partes[1]} ${sufijo}`
}

function formatearFechaLarga(iso) {
  if (!iso) return '—'
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
  const fecha = new Date(`${iso}T00:00:00`)
  return `${dias[fecha.getDay()]}, ${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`
}

function esHoy(iso) {
  return iso === new Date().toISOString().slice(0, 10)
}

function traducirMetodo(metodo) {
  return 'Portal Web'
}
