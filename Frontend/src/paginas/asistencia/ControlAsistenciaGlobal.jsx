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
  justificarAsistencia,
  listarAsistencias,
  obtenerResumenAsistenciaGlobal,
  registrarMarcacionManual,
  registrarFalta,
} from '../../servicios/asistenciaServicio'

// Supervisión global de marcaciones con filtros y acciones de auditoría
export default function ControlAsistenciaGlobal() {
  const { mostrarToast } = useToast()
  const [marcaciones, setMarcaciones] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [resumen, setResumen] = useState(null)
  const [departamentos, setDepartamentos] = useState([])
  const [pagina, setPagina] = useState(0)
  const [buscar, setBuscar] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [rango, setRango] = useState('hoy')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const fecha = new Date()
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
  })
  const [modalJustificar, setModalJustificar] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [errorJustificacion, setErrorJustificacion] = useState('')
  const [cargandoAccion, setCargandoAccion] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)
  const [modalManual, setModalManual] = useState(false)
  const [nombreEmpleadoManual, setNombreEmpleadoManual] = useState('')
  const [formManual, setFormManual] = useState({
    idEmpleado: '',
    fecha: '',
    horaEntrada: '',
    horaSalida: '',
  })
  const [errorManual, setErrorManual] = useState('')

  function formatearFechaIso(fecha) {
    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    return `${anio}-${mes}-${dia}`
  }

  const hoy = new Date()
  const fechaHoy = formatearFechaIso(hoy)

  function obtenerInicioSemana() {
    const diaSemana = hoy.getDay() || 7
    const inicio = new Date(hoy)
    inicio.setDate(hoy.getDate() - diaSemana + 1)
    return formatearFechaIso(inicio)
  }

  function obtenerFinSemana() {
    const inicio = new Date(`${obtenerInicioSemana()}T00:00:00`)
    inicio.setDate(inicio.getDate() + 6)
    return formatearFechaIso(inicio)
  }

  async function cargar(pag = 0) {
    const fechaDesde = rango === 'semana' ? obtenerInicioSemana() : undefined
    const fechaHasta = rango === 'semana' ? obtenerFinSemana() : undefined
    const fechaDia = rango === 'dia' ? fechaSeleccionada : undefined
    try {
      const [paginaDatos, resumenDatos, listaDepartamentos] = await Promise.all([
        listarAsistencias({
          fecha: rango === 'hoy' ? fechaHoy : fechaDia,
          fechaDesde,
          fechaHasta,
          estado: filtroEstado || undefined,
          departamento: filtroDepartamento || undefined,
          buscar: buscar || undefined,
          pagina: pag,
          tamano: 10,
        }),
        obtenerResumenAsistenciaGlobal(
          rango === 'hoy' ? fechaHoy : fechaDia,
          fechaDesde,
          fechaHasta,
        ),
        listarDepartamentos(),
      ])
      setMarcaciones(paginaDatos)
      setResumen(resumenDatos)
      setDepartamentos(listaDepartamentos)
    } catch (error) {
      console.error('Error al cargar asistencias', error)
    }
  }

  useEffect(() => {
    cargar(pagina)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, buscar, filtroEstado, filtroDepartamento, rango, fechaSeleccionada])

  async function aplicarAccion(id, accion) {
    if (accion === 'justificar') {
      setModalJustificar(id)
      setMotivo('')
      setErrorJustificacion('')
      return
    }
    if (accion === 'falta') {
      const marcacion = marcaciones.content.find((item) => item.id === id)
      setConfirmacion({
        tipo: 'falta',
        id,
        titulo: 'Registrar falta',
        mensaje: `¿Desea registrar la falta de "${marcacion?.nombreColaborador || 'este colaborador'}" para hoy?`,
        peligroso: true,
      })
    }
  }

  async function abrirManual() {
    setErrorManual('')
    setNombreEmpleadoManual('')
    setFormManual({
      idEmpleado: '',
      fecha: fechaHoy,
      horaEntrada: '',
      horaSalida: '',
    })
    setModalManual(true)
  }

  function solicitarMarcacionManual(evento) {
    evento.preventDefault()
    if (!formManual.idEmpleado) {
      setErrorManual('Seleccione un colaborador')
      return
    }
    if (!formManual.fecha) {
      setErrorManual('Seleccione la fecha')
      return
    }
    if (!formManual.horaEntrada) {
      setErrorManual('Ingrese la hora de entrada')
      return
    }
    setErrorManual('')
    setConfirmacion({
      tipo: 'manual',
      titulo: 'Confirmar marcación manual',
      mensaje: '¿Desea registrar esta marcación manual?',
      peligroso: false,
    })
  }

  function confirmarJustificacion() {
    if (motivo.trim().length < 5) {
      setErrorJustificacion('El motivo debe tener al menos 5 caracteres')
      return
    }
    setConfirmacion({
      tipo: 'justificacion',
      titulo: 'Confirmar justificación',
      mensaje: '¿Desea guardar la justificación y cambiar esta tardanza a JUSTIFICADA?',
      peligroso: false,
    })
  }

  async function ejecutarConfirmacion() {
    if (!confirmacion) return
    setCargandoAccion(true)
    try {
      if (confirmacion.tipo === 'justificacion') {
        await justificarAsistencia(modalJustificar, motivo.trim())
        setModalJustificar(null)
        mostrarToast('Tardanza justificada correctamente')
      } else {
        if (confirmacion.tipo === 'manual') {
          await registrarMarcacionManual({
            idEmpleado: Number(formManual.idEmpleado),
            fecha: formManual.fecha,
            horaEntrada: formManual.horaEntrada,
            horaSalida: formManual.horaSalida || null,
          })
          setModalManual(false)
          mostrarToast('Marcación manual registrada correctamente')
        } else {
        await registrarFalta(confirmacion.id)
        mostrarToast('Falta registrada correctamente')
        }
      }
      setConfirmacion(null)
      await cargar(pagina)
    } catch (error) {
      const mensaje = error.response?.data?.mensaje
        || (confirmacion.tipo === 'justificacion'
          ? 'No se pudo justificar la marcación'
          : confirmacion.tipo === 'manual'
            ? 'No se pudo registrar la marcación manual'
            : 'No se pudo registrar la falta')
      setConfirmacion(null)
      if (confirmacion.tipo === 'justificacion') setErrorJustificacion(mensaje)
      mostrarToast(mensaje, 'error')
    } finally {
      setCargandoAccion(false)
    }
  }

  const totalPaginas = marcaciones.totalPages || 1
  const inicio = marcaciones.totalElements === 0 ? 0 : pagina * 10 + 1
  const fin = Math.min((pagina + 1) * 10, marcaciones.totalElements)

  const fechaLarga = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const pilulas = [
    { valor: '', texto: `Todos (${(resumen?.puntuales ?? 0) + (resumen?.tardanzas ?? 0) + (resumen?.ausentes ?? 0)})` },
    { valor: 'PUNTUAL', texto: `Puntuales (${resumen?.puntuales ?? 0})` },
    { valor: 'TARDANZA', texto: `Tardanzas (${resumen?.tardanzas ?? 0})` },
    { valor: 'AUSENTE', texto: `Ausentes (${resumen?.ausentes ?? 0})` },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BarraLateral />
      <div className="lg:pl-64">
        <Encabezado migas={['Control de Asistencia']} />

        <main className="space-y-6 p-4 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Control de Asistencia </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                Supervisión de ingresos, salidas, puntualidad y auditoría de justificaciones
                para toda la organización.
              </p>
            </div>
            <button
              type="button"
              onClick={abrirManual}
              className="inline-flex items-center gap-2 self-start rounded-lg bg-[#148D82] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#157069]"
            >
              <Icon icon="material-symbols:add-circle" className="text-lg" />
              Registrar Marcación Manual
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TarjetaMetrica
              etiqueta="Puntuales Hoy"
              valor={resumen?.puntuales ?? '—'}
              icono="check_circle"
              color="teal"
              pie={`${resumen?.porcentajePuntuales ?? 0}% de colaboradores presentes a tiempo`}
            />
            <TarjetaMetrica
              etiqueta="Tardanzas"
              valor={resumen?.tardanzas ?? '—'}
              icono="schedule"
              color="ambar"
              pie={`${resumen?.tardanzasSinJustificar ?? 0} sin justificar`}
            />
            <TarjetaMetrica
              etiqueta="Ausentes"
              valor={resumen?.ausentes ?? '—'}
              icono="person_off"
              color="rojo"
            />
          </div>

          {/* Barra de filtros y píldoras de estado */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                <input
                  type="text"
                  value={buscar}
                  onChange={(e) => { setBuscar(e.target.value); setPagina(0) }}
                  placeholder="Buscar por colaborador, documento o cargo..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
                />
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Icon icon="material-symbols:calendar-today" className="text-xl text-slate-400" />
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(evento) => {
                    setFechaSeleccionada(evento.target.value)
                    setRango('dia')
                    setPagina(0)
                  }}
                  className="border-0 bg-transparent text-sm font-medium text-slate-700 outline-none"
                  aria-label="Buscar asistencia por fecha"
                />
              </label>

              <div className="flex overflow-hidden rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setRango('hoy'); setFechaSeleccionada(fechaHoy); setPagina(0) }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    rango === 'hoy' ? 'bg-[#148D82] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => { setRango('semana'); setPagina(0) }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    rango === 'semana' ? 'bg-[#148D82] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Semana
                </button>
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
            </div>

            <div className="flex flex-wrap gap-2">
              {pilulas.map((pilula) => (
                <button
                  key={pilula.texto}
                  type="button"
                  onClick={() => { setFiltroEstado(pilula.valor); setPagina(0) }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    filtroEstado === pilula.valor
                      ? 'border-[#148D82] bg-[#F1FCF9] text-[#148D82]'
                      : 'border-slate-200 bg-[#F8FAFC] text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {pilula.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de marcaciones diarias */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Registro de Marcaciones Diarias</h2>
                <p className="text-xs text-slate-500">
                  Filtro aplicado: {rango === 'hoy'
                    ? `Jornada ${fechaHoy.split('-').reverse().join('/')}`
                    : rango === 'semana'
                      ? `Semana ${obtenerInicioSemana().split('-').reverse().join('/')} - ${obtenerFinSemana().split('-').reverse().join('/')}`
                      : `Jornada ${fechaSeleccionada.split('-').reverse().join('/')}`}
                </p>
              </div>
              <button type="button" onClick={() => cargar(pagina)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100" aria-label="Actualizar">
                <Icon icon="material-symbols:refresh" className="text-xl" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Colaborador</th>
                    <th className="px-5 py-3">Área</th>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3 text-right">Entrada</th>
                    <th className="px-5 py-3 text-right">Salida</th>
                    <th className="px-5 py-3 text-right">Horas Efectivas</th>
                    <th className="px-5 py-3">Método / Dispositivo</th>
                    <th className="px-5 py-3 text-center">Estado</th>
                    <th className="px-5 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {marcaciones.content.map((m) => (
                    <tr
                      key={m.id}
                      className={`border-b border-slate-100 transition-colors ${
                        m.estado === 'AUSENTE'
                          ? 'bg-red-50/50'
                          : m.estado === 'TARDANZA'
                            ? 'bg-amber-50/40'
                            : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{m.nombreColaborador}</p>
                        <p className="text-xs text-slate-500">{m.cargo} • DNI {m.dni}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{m.departamento}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatearFecha(m.fecha)}</td>
                      <td className={`px-5 py-3.5 text-right font-medium tabular-nums ${
                        m.estado === 'TARDANZA' ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {m.horaEntrada ? formatearHora(m.horaEntrada) : '--:--'}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                        {m.horaSalida ? formatearHora(m.horaSalida) : m.horaEntrada ? 'En curso' : '--:--'}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-medium tabular-nums ${
                        m.horasEfectivas === '0h 00m' ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {m.horasEfectivas}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {m.horaEntrada ? traducirMetodo(m.metodo) : 'Sin registro de marcación'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <ChipEstado estado={m.estado} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          {(m.estado === 'PUNTUAL' || m.estado === 'TARDANZA' || m.estado === 'JUSTIFICADA' || m.estado === 'EN_CURSO') && (
                            <button
                              type="button"
                              onClick={m.estado === 'TARDANZA' ? () => aplicarAccion(m.id, 'justificar') : undefined}
                              disabled={m.estado !== 'TARDANZA'}
                              title={m.estado === 'TARDANZA' ? 'Justificar tardanza' : 'Solo las tardanzas pueden justificarse'}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#148D82] transition-colors hover:bg-[#F1FCF9] disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                            >
                              <Icon icon="material-symbols:edit-note" className="text-sm" />
                              Justificar
                            </button>
                          )}
                          {m.estado === 'AUSENTE' && (
                            <button
                              type="button"
                              onClick={() => aplicarAccion(m.id, 'falta')}
                              title="Registrar Falta"
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Icon icon="material-symbols:warning" className="text-sm" />
                              Registrar Falta
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {marcaciones.content.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-5 py-12 text-center text-sm text-slate-500">
                        No hay marcaciones para los filtros seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalElementos={marcaciones.totalElements}
              etiqueta={`Mostrando ${inicio} - ${fin} de ${marcaciones.totalElements} registros auditados`}
              onCambiar={setPagina}
            />
          </div>
        </main>
      </div>

      {/* Modal de justificación de tardanza */}
      {modalJustificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalJustificar(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-slate-900">Justificar marcación</h2>
              <button
                type="button"
                onClick={() => setModalJustificar(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <Icon icon="material-symbols:close" className="text-xl" />
              </button>
            </div>

            <label htmlFor="motivo" className="mb-1.5 block text-sm font-medium text-slate-700">
              Motivo de la justificación *
            </label>
            <textarea
              id="motivo"
              rows="4"
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); setErrorJustificacion('') }}
              placeholder="Describa el motivo de la tardanza o incidencia..."
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-slate-400 ${
                errorJustificacion
                  ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15'
              }`}
            />
            {errorJustificacion && <p className="mt-1 text-xs text-red-600">{errorJustificacion}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalJustificar(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarJustificacion}
                disabled={cargandoAccion}
                className="rounded-lg bg-[#148D82] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#157069] disabled:opacity-60"
              >
                {cargandoAccion ? 'Guardando...' : 'Confirmar Justificación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalManual(false)} />
          <form onSubmit={solicitarMarcacionManual} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" noValidate>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registrar Marcación Manual</h2>
                <p className="mt-1 text-sm text-slate-500">Complete los datos de la marcación.</p>
              </div>
              <button type="button" onClick={() => setModalManual(false)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
                <Icon icon="material-symbols:close" className="text-xl" />
              </button>
            </div>
            {errorManual && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorManual}</div>}
            <div className="space-y-4">
              <div>
                <BuscadorEmpleado
                  id="empleadoManual"
                  valorSeleccionado={formManual.idEmpleado}
                  nombreSeleccionado={nombreEmpleadoManual}
                  onSeleccionar={(empleado) => {
                    setNombreEmpleadoManual(empleado?.nombreCompleto || '')
                    setFormManual({ ...formManual, idEmpleado: empleado?.id ? String(empleado.id) : '' })
                  }}
                  error={errorManual === 'Seleccione un colaborador' ? errorManual : ''}
                />
              </div>
              <div>
                <label htmlFor="fechaManual" className="mb-1.5 block text-sm font-medium text-slate-700">Fecha *</label>
                <input id="fechaManual" type="date" value={formManual.fecha} onChange={(e) => setFormManual({ ...formManual, fecha: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="entradaManual" className="mb-1.5 block text-sm font-medium text-slate-700">Hora entrada *</label>
                  <input id="entradaManual" type="time" value={formManual.horaEntrada} onChange={(e) => setFormManual({ ...formManual, horaEntrada: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="salidaManual" className="mb-1.5 block text-sm font-medium text-slate-700">Hora salida</label>
                  <input id="salidaManual" type="time" value={formManual.horaSalida} onChange={(e) => setFormManual({ ...formManual, horaSalida: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalManual(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Cancelar</button>
              <button type="submit" className="rounded-lg bg-[#148D82] px-5 py-2.5 text-sm font-semibold text-white">Continuar</button>
            </div>
          </form>
        </div>
      )}

      <ModalConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={
          confirmacion?.tipo === 'falta'
            ? 'Registrar Falta'
            : confirmacion?.tipo === 'manual'
              ? 'Registrar'
              : 'Confirmar'
        }
        peligroso={confirmacion?.peligroso}
        cargando={cargandoAccion}
        alCancelar={() => setConfirmacion(null)}
        alConfirmar={ejecutarConfirmacion}
      />
    </div>
  )
}

function formatearFecha(iso) {
  if (!iso) return '—'
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
  const [a, m, d] = iso.split('-')
  return `${d} ${meses[parseInt(m, 10) - 1]} ${a}`
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
