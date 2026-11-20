import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import BarraLateral from '../../componentes/BarraLateral'
import ChipEstado from '../../componentes/ChipEstado'
import Encabezado from '../../componentes/Encabezado'
import Paginacion from '../../componentes/Paginacion'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import ModalConfirmacion from '../../componentes/ModalConfirmacion'
import { useToast } from '../../componentes/Toast'
import { listarCargos, listarDepartamentos } from '../../servicios/departamentoServicio'
import {
  actualizarEmpleado,
  crearEmpleado,
  darDeBajaEmpleado,
  listarEmpleados,
  obtenerEmpleado,
  obtenerResumenEmpleados,
} from '../../servicios/empleadoServicio'

const FORMULARIO_VACIO = {
  dni: '',
  nombres: '',
  apellidos: '',
  correo: '',
  idCargo: '',
  fechaIngreso: '',
  estado: 'ACTIVO',
  idDepartamento: '',
}

export default function DirectorioEmpleados() {
  const { mostrarToast } = useToast()
  const [empleados, setEmpleados] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [resumen, setResumen] = useState(null)
  const [departamentos, setDepartamentos] = useState([])
  const [cargos, setCargos] = useState([])
  const [pagina, setPagina] = useState(0)
  const [buscar, setBuscar] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [perfilEmpleado, setPerfilEmpleado] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] = useState(null)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)
  const [dniVerificado, setDniVerificado] = useState(false)

  async function cargar(pag = 0) {
    try {
      const [pagEmpleados, resumenDatos, listaDepartamentos] = await Promise.all([
        listarEmpleados({
          buscar: buscar || undefined,
          departamento: filtroDepartamento || undefined,
          estado: filtroEstado || undefined,
          pagina: pag,
        }),
        obtenerResumenEmpleados(),
        listarDepartamentos(),
      ])
      setEmpleados(pagEmpleados)
      setResumen(resumenDatos)
      setDepartamentos(listaDepartamentos)
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudo cargar el directorio', 'error')
    }
  }

  useEffect(() => {
    cargar(pagina)
  }, [pagina, buscar, filtroDepartamento, filtroEstado])

  async function manejarDepartamento(idDepartamento) {
    setFormulario({ ...formulario, idDepartamento, idCargo: '' })
    setCargos([])
    if (!idDepartamento) return
    try {
      setCargos(await listarCargos(idDepartamento))
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudieron cargar los cargos', 'error')
    }
  }

  function validar() {
    const nuevos = {}
    if (!/^\d{8}$/.test(formulario.dni)) nuevos.dni = 'El DNI debe tener exactamente 8 dígitos numéricos'
    if (!formulario.nombres.trim()) nuevos.nombres = 'Los nombres son obligatorios'
    if (!formulario.apellidos.trim()) nuevos.apellidos = 'Los apellidos son obligatorios'
    if (!formulario.correo.trim()) nuevos.correo = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo.includes('@') ? formulario.correo : `${formulario.correo}@gescolab.corp`)) {
      nuevos.correo = 'Ingrese un correo válido'
    }
    if (!formulario.idDepartamento) nuevos.idDepartamento = 'Seleccione un departamento'
    if (!formulario.idCargo) nuevos.idCargo = 'Seleccione un cargo'
    if (!formulario.fechaIngreso) nuevos.fechaIngreso = 'La fecha de ingreso es obligatoria'

    const dniDuplicado = empleados.content.some((empleado) =>
      empleado.dni === formulario.dni && (!modoEdicion || empleado.id !== empleadoEditando?.id))
    const correoCompleto = formulario.correo.includes('@') ? formulario.correo : `${formulario.correo}@gescolab.corp`
    const correoDuplicado = empleados.content.some((empleado) =>
      empleado.correo.toLowerCase() === correoCompleto.toLowerCase()
      && (!modoEdicion || empleado.id !== empleadoEditando?.id))
    if (dniDuplicado) nuevos.dni = 'Ya existe un colaborador registrado con este DNI'
    if (correoDuplicado) nuevos.correo = 'Ya existe un colaborador con este correo corporativo'

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function solicitarGuardar(evento) {
    evento?.preventDefault()
    setErrorServidor('')
    if (!validar()) return
    const nombreCompleto = `${formulario.nombres.trim()} ${formulario.apellidos.trim()}`
    setConfirmacion({
      tipo: 'guardar-empleado',
      titulo: modoEdicion ? 'Confirmar modificación del colaborador' : 'Confirmar nuevo colaborador',
      mensaje: modoEdicion
        ? `¿Desea guardar los cambios de "${nombreCompleto}"?`
        : `¿Desea registrar a "${nombreCompleto}" como colaborador?`,
      peligroso: false,
    })
  }

  async function guardarConfirmado() {
    setCargando(true)
    setErrorServidor('')
    try {
      const datos = {
        ...formulario,
        correo: formulario.correo.includes('@') ? formulario.correo : `${formulario.correo}@gescolab.corp`,
        idCargo: Number(formulario.idCargo),
      }
      if (modoEdicion) await actualizarEmpleado(empleadoEditando.id, datos)
      else await crearEmpleado(datos)
      setDrawerAbierto(false)
      setFormulario(FORMULARIO_VACIO)
      setModoEdicion(false)
      setEmpleadoEditando(null)
      setDniVerificado(false)
      setConfirmacion(null)
      setPagina(0)
      await cargar(0)
      mostrarToast(modoEdicion ? 'Colaborador actualizado correctamente' : 'Colaborador registrado correctamente')
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo guardar el colaborador'
      setErrorServidor(mensaje)
      setConfirmacion(null)
      mostrarToast(mensaje, 'error')
    } finally {
      setCargando(false)
    }
  }

  async function abrirEditar(emp) {
    try {
      const empleado = await obtenerEmpleado(emp.id)
      const departamento = departamentos.find((item) =>
        item.nombre.toLowerCase() === empleado.departamento.toLowerCase())
      const cargosDepartamento = departamento ? await listarCargos(departamento.id) : []
      const cargo = cargosDepartamento.find((item) =>
        item.nombre.toLowerCase() === empleado.cargo.toLowerCase())
      const correo = empleado.correo.endsWith('@gescolab.corp')
        ? empleado.correo.slice(0, -'@gescolab.corp'.length)
        : empleado.correo
      setEmpleadoEditando(empleado)
      setModoEdicion(true)
      setCargos(cargosDepartamento)
      setFormulario({
        dni: empleado.dni,
        nombres: empleado.nombres,
        apellidos: empleado.apellidos,
        correo,
        idDepartamento: departamento ? String(departamento.id) : '',
        idCargo: cargo ? String(cargo.id) : '',
        fechaIngreso: empleado.fechaIngreso,
        estado: empleado.estado,
      })
      setDniVerificado(true)
      setErrores({})
      setErrorServidor('')
      setDrawerAbierto(true)
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudo cargar el colaborador', 'error')
    }
  }

  async function abrirPerfil(emp) {
    try {
      setPerfilEmpleado(await obtenerEmpleado(emp.id))
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudo cargar el perfil', 'error')
    }
  }

  async function ejecutarConfirmacion() {
    if (!confirmacion) return
    if (confirmacion.tipo === 'guardar-empleado') {
      await guardarConfirmado()
      return
    }
    setCargando(true)
    try {
      await darDeBajaEmpleado(confirmacion.empleado.id)
      setConfirmacion(null)
      await cargar(pagina)
      mostrarToast(`Colaborador "${confirmacion.empleado.nombreCompleto}" dado de baja correctamente`)
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo dar de baja al colaborador'
      setConfirmacion(null)
      mostrarToast(mensaje, 'error')
    } finally {
      setCargando(false)
    }
  }

  function abrirRegistro() {
    setFormulario(FORMULARIO_VACIO)
    setModoEdicion(false)
    setEmpleadoEditando(null)
    setCargos([])
    setErrores({})
    setErrorServidor('')
    setDniVerificado(false)
    setDrawerAbierto(true)
  }

  const totalPaginas = empleados.totalPages || 1
  const inicio = empleados.totalElements === 0 ? 0 : pagina * 10 + 1
  const fin = Math.min((pagina + 1) * 10, empleados.totalElements)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BarraLateral />
      <div className="lg:pl-64">
        <Encabezado migas={['Empleados', 'Directorio']} />
        <main className="space-y-6 p-4 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Directorio de colaboradores</h1>
                <span className="rounded-full bg-[#CFF8EF] px-3 py-1 text-xs font-medium text-[#157069]">
                  {empleados.totalElements} colaboradores registrados
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Administración centralizada de nómina, cargos, accesos y legajo digital.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={abrirRegistro} className="inline-flex items-center gap-2 rounded-lg bg-[#148D82] px-4 py-2.5 text-sm font-semibold text-white"><Icon icon="material-symbols:person-add" className="text-lg" />Registrar Empleado</button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TarjetaMetrica etiqueta="Colaboradores Activos" valor={resumen?.totalActivos ?? '—'} icono="verified_user" color="teal" />
            <TarjetaMetrica etiqueta="Inactivos / Bajas" valor={resumen?.totalInactivos ?? '—'} icono="person_off" color="gris" sufijo={resumen?.porcentajeInactivos} />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
              <input type="text" value={buscar} onChange={(e) => { setBuscar(e.target.value); setPagina(0) }} placeholder="Buscar por DNI, nombres o correo..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none" />
            </div>
            <select value={filtroDepartamento} onChange={(e) => { setFiltroDepartamento(e.target.value); setPagina(0) }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">Todos los Departamentos</option>
              {departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.nombre}</option>)}
            </select>
            <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0) }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">Estado: Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="EN_LICENCIA">En Licencia</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase text-slate-500"><th className="px-5 py-3">Colaborador</th><th className="px-5 py-3">DNI / Doc</th><th className="px-5 py-3">Departamento</th><th className="px-5 py-3">Cargo</th><th className="px-5 py-3">Fecha Ingreso</th><th className="px-5 py-3 text-center">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead>
                <tbody>
                  {empleados.content.map((empleado) => (
                    <tr key={empleado.id} className="border-b border-slate-100 hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CFF8EF] text-xs font-bold text-[#157069]">{empleado.nombres[0]}{empleado.apellidos[0]}</span><div><p className="font-medium text-slate-900">{empleado.nombreCompleto}</p><p className="text-xs text-slate-500">{empleado.correo}</p></div></div></td>
                      <td className="px-5 py-3.5 text-slate-700">{empleado.dni}</td>
                      <td className="px-5 py-3.5 text-slate-700">{empleado.departamento}</td>
                      <td className="px-5 py-3.5 text-slate-700">{empleado.cargo}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatearFecha(empleado.fechaIngreso)}</td>
                      <td className="px-5 py-3.5 text-center"><ChipEstado estado={empleado.estado} /></td>
                      <td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button type="button" title="Ver perfil" onClick={() => abrirPerfil(empleado)} className="rounded p-1.5 text-slate-400 hover:text-[#148D82]"><Icon icon="material-symbols:visibility" className="text-lg" /></button><button type="button" title="Editar" onClick={() => abrirEditar(empleado)} className="rounded p-1.5 text-slate-400 hover:text-[#148D82]"><Icon icon="material-symbols:edit" className="text-lg" /></button><button type="button" title="Dar de baja" onClick={() => setConfirmacion({ tipo: 'dar-baja', empleado, titulo: 'Dar de baja al colaborador', mensaje: `¿Desea cambiar el estado de "${empleado.nombreCompleto}" a INACTIVO? Se conservará su historial.`, peligroso: true })} className="rounded p-1.5 text-slate-400 hover:text-red-600"><Icon icon="material-symbols:person-remove" className="text-lg" /></button></div></td>
                    </tr>
                  ))}
                  {empleados.content.length === 0 && <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">No se encontraron colaboradores</td></tr>}
                </tbody>
              </table>
            </div>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} etiqueta={`Mostrando ${inicio}-${fin} de ${empleados.totalElements} colaboradores`} onCambiar={setPagina} />
          </div>
        </main>
      </div>

      {drawerAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawerAbierto(false)} />
          <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
            <div className="flex justify-between border-b border-slate-200 px-6 py-5">
              <div><h2 className="text-lg font-bold text-slate-900">{modoEdicion ? 'Editar Colaborador' : 'Registrar Nuevo Colaborador'}</h2><p className="mt-1 text-sm text-slate-500">Datos de identidad y asignación corporativa.</p></div>
              <button type="button" onClick={() => setDrawerAbierto(false)} aria-label="Cerrar"><Icon icon="material-symbols:close" className="text-xl" /></button>
            </div>
            <form onSubmit={solicitarGuardar} className="flex-1 overflow-y-auto px-6 py-5" noValidate>
              {errorServidor && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorServidor}</div>}
              <div className="space-y-4">
                <div><div className="mb-1.5 flex justify-between"><label htmlFor="dni" className="text-sm font-medium">Documento DNI *</label>{dniVerificado && <span className="text-xs text-[#157069]">DNI verificado</span>}</div><div className="flex gap-2"><input id="dni" maxLength="8" value={formulario.dni} onChange={(e) => { setFormulario({ ...formulario, dni: e.target.value.replace(/\D/g, '') }); setDniVerificado(false) }} className={`flex-1 rounded-lg border px-3 py-2.5 text-sm ${errores.dni ? 'border-red-500' : 'border-slate-200'}`} /><button type="button" onClick={() => setDniVerificado(/^\d{8}$/.test(formulario.dni))} className="rounded-lg border border-slate-200 px-3 text-sm">Verificar</button></div>{errores.dni && <p className="mt-1 text-xs text-red-600">{errores.dni}</p>}</div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="nombres" className="mb-1.5 block text-sm font-medium">Nombres *</label><input id="nombres" value={formulario.nombres} onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.nombres ? 'border-red-500' : 'border-slate-200'}`} />{errores.nombres && <p className="mt-1 text-xs text-red-600">{errores.nombres}</p>}</div><div><label htmlFor="apellidos" className="mb-1.5 block text-sm font-medium">Apellidos *</label><input id="apellidos" value={formulario.apellidos} onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.apellidos ? 'border-red-500' : 'border-slate-200'}`} />{errores.apellidos && <p className="mt-1 text-xs text-red-600">{errores.apellidos}</p>}</div></div>
                <div><label htmlFor="correo" className="mb-1.5 block text-sm font-medium">Correo Corporativo *</label><div className="flex rounded-lg border border-slate-200"><input id="correo" value={formulario.correo} onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })} className="flex-1 border-0 px-3 py-2.5 text-sm outline-none" /><span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">@gescolab.corp</span></div>{errores.correo && <p className="mt-1 text-xs text-red-600">{errores.correo}</p>}</div>
                <div><label htmlFor="departamento" className="mb-1.5 block text-sm font-medium">Departamento *</label><select id="departamento" value={formulario.idDepartamento} onChange={(e) => manejarDepartamento(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.idDepartamento ? 'border-red-500' : 'border-slate-200'}`}><option value="">Seleccione un departamento</option>{departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.nombre}</option>)}</select>{errores.idDepartamento && <p className="mt-1 text-xs text-red-600">{errores.idDepartamento}</p>}</div>
                <div><label htmlFor="cargo" className="mb-1.5 block text-sm font-medium">Cargo *</label><select id="cargo" value={formulario.idCargo} onChange={(e) => setFormulario({ ...formulario, idCargo: e.target.value })} disabled={!formulario.idDepartamento} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.idCargo ? 'border-red-500' : 'border-slate-200'}`}><option value="">Seleccione un cargo</option>{cargos.map((cargo) => <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>)}</select>{errores.idCargo && <p className="mt-1 text-xs text-red-600">{errores.idCargo}</p>}</div>
                <div><label htmlFor="fechaIngreso" className="mb-1.5 block text-sm font-medium">Fecha de ingreso *</label><input id="fechaIngreso" type="date" value={formulario.fechaIngreso} onChange={(e) => setFormulario({ ...formulario, fechaIngreso: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.fechaIngreso ? 'border-red-500' : 'border-slate-200'}`} />{errores.fechaIngreso && <p className="mt-1 text-xs text-red-600">{errores.fechaIngreso}</p>}</div>
              </div>
            </form>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" onClick={() => setDrawerAbierto(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cancelar</button><button type="button" onClick={solicitarGuardar} disabled={cargando} className="inline-flex items-center gap-2 rounded-lg bg-[#148D82] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Icon icon="material-symbols:check" className="text-lg" />{cargando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Guardar y Continuar'}</button></div>
          </aside>
        </div>
      )}

      {perfilEmpleado && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setPerfilEmpleado(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex justify-between"><div><h2 className="text-lg font-bold">{perfilEmpleado.nombreCompleto}</h2><p className="text-sm text-slate-500">DNI {perfilEmpleado.dni}</p></div><button type="button" onClick={() => setPerfilEmpleado(null)}><Icon icon="material-symbols:close" className="text-xl" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Correo</p><p className="mt-1 text-sm font-medium">{perfilEmpleado.correo}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Departamento</p><p className="mt-1 text-sm font-medium">{perfilEmpleado.departamento}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Cargo</p><p className="mt-1 text-sm font-medium">{perfilEmpleado.cargo}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Fecha de ingreso</p><p className="mt-1 text-sm font-medium">{formatearFecha(perfilEmpleado.fechaIngreso)}</p></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Estado</p><div className="mt-1"><ChipEstado estado={perfilEmpleado.estado} /></div></div>
              <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Rol</p><p className="mt-1 text-sm font-medium">{perfilEmpleado.rol}</p></div>
            </div>
            <div className="mt-6 flex justify-end"><button type="button" onClick={() => setPerfilEmpleado(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cerrar</button></div>
          </div>
        </div>
      )}

      <ModalConfirmacion abierto={Boolean(confirmacion)} titulo={confirmacion?.titulo} mensaje={confirmacion?.mensaje} textoConfirmar={confirmacion?.peligroso ? 'Confirmar baja' : 'Guardar'} peligroso={confirmacion?.peligroso} cargando={cargando} alCancelar={() => setConfirmacion(null)} alConfirmar={ejecutarConfirmacion} />
    </div>
  )
}

function formatearFecha(iso) {
  if (!iso) return '—'
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
  const [a, m, d] = iso.split('-')
  return `${d} ${meses[parseInt(m, 10) - 1]} ${a}`
}
