import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import BarraLateral from '../../componentes/BarraLateral'
import Encabezado from '../../componentes/Encabezado'
import Paginacion from '../../componentes/Paginacion'
import ModalConfirmacion from '../../componentes/ModalConfirmacion'
import { useToast } from '../../componentes/Toast'
import {
  actualizarCargo,
  actualizarDepartamento,
  crearCargo,
  crearDepartamento,
  eliminarCargo,
  eliminarDepartamento,
  listarCargos,
  listarDepartamentos,
  obtenerDetalleDepartamento,
} from '../../servicios/departamentoServicio'

const CARGO_VACIO = {
  nombre: '',
  nivel: 'JUNIOR',
  sueldoBase: '',
  plazasTotales: '',
  plazasOcupadas: '0',
}

const DEPARTAMENTO_VACIO = {
  codigo: '',
  nombre: '',
  descripcion: '',
  responsable: '',
  estado: true,
}

export default function GestionDepartamentos() {
  const { mostrarToast } = useToast()
  const [departamentos, setDepartamentos] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [cargos, setCargos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(0)
  const [modalCargo, setModalCargo] = useState(false)
  const [modalDepartamento, setModalDepartamento] = useState(false)
  const [modoEdicionCargo, setModoEdicionCargo] = useState(false)
  const [modoEdicionDepartamento, setModoEdicionDepartamento] = useState(false)
  const [cargoEditando, setCargoEditando] = useState(null)
  const [formCargo, setFormCargo] = useState(CARGO_VACIO)
  const [formDepartamento, setFormDepartamento] = useState(DEPARTAMENTO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [cargando, setCargando] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)

  async function seleccionarDepartamento(departamento) {
    setSeleccionado(departamento)
    setPagina(0)
    try {
      const [detalleDatos, cargosDatos] = await Promise.all([
        obtenerDetalleDepartamento(departamento.id),
        listarCargos(departamento.id),
      ])
      setDetalle(detalleDatos)
      setCargos(cargosDatos)
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudo cargar el detalle', 'error')
    }
  }

  async function cargar() {
    try {
      const datos = await listarDepartamentos({ buscar: buscar || undefined })
      setDepartamentos(datos)
      if (seleccionado) {
        const actualizado = datos.find((item) => item.id === seleccionado.id)
        if (actualizado) await seleccionarDepartamento(actualizado)
        else {
          setSeleccionado(null)
          setDetalle(null)
          setCargos([])
        }
      } else if (datos.length > 0) {
        await seleccionarDepartamento(datos[0])
      } else {
        setDetalle(null)
        setCargos([])
      }
    } catch (error) {
      mostrarToast(error.response?.data?.mensaje || 'No se pudieron cargar los departamentos', 'error')
    }
  }

  useEffect(() => {
    cargar()
  }, [buscar])

  function abrirNuevoDepartamento() {
    setFormDepartamento(DEPARTAMENTO_VACIO)
    setModoEdicionDepartamento(false)
    setErrores({})
    setErrorServidor('')
    setModalDepartamento(true)
  }

  function abrirEditarDepartamento() {
    setFormDepartamento({
      codigo: detalle?.codigo || '',
      nombre: detalle?.nombre || '',
      descripcion: detalle?.descripcion || '',
      responsable: detalle?.responsable || '',
      estado: true,
    })
    setModoEdicionDepartamento(true)
    setErrores({})
    setErrorServidor('')
    setModalDepartamento(true)
  }

  function abrirNuevoCargo() {
    setFormCargo(CARGO_VACIO)
    setCargoEditando(null)
    setModoEdicionCargo(false)
    setErrores({})
    setErrorServidor('')
    setModalCargo(true)
  }

  function abrirEditarCargo(cargo) {
    setCargoEditando(cargo)
    setFormCargo({
      nombre: cargo.nombre,
      nivel: cargo.nivel,
      sueldoBase: cargo.sueldoBase,
      plazasTotales: cargo.plazasTotales,
      plazasOcupadas: cargo.plazasOcupadas,
    })
    setModoEdicionCargo(true)
    setErrores({})
    setErrorServidor('')
    setModalCargo(true)
  }

  function validarDepartamento() {
    const nuevos = {}
    const codigo = formDepartamento.codigo.trim().toUpperCase()
    const nombre = formDepartamento.nombre.trim().toLowerCase()
    if (!codigo) nuevos.codigo = 'El código es obligatorio'
    else if (codigo.length > 7) nuevos.codigo = 'El código no puede superar los 7 caracteres'
    else if (!/^[A-Z0-9]+$/.test(codigo)) nuevos.codigo = 'El código solo puede contener letras y números'
    if (!nombre) nuevos.nombre = 'El nombre es obligatorio'
    else if (nombre.length < 3 || nombre.length > 100) nuevos.nombre = 'El nombre debe tener entre 3 y 100 caracteres'
    else if (!/^[\p{L}]+(?: +[\p{L}]+)*$/u.test(formDepartamento.nombre.trim())) {
      nuevos.nombre = 'El nombre solo puede contener letras y espacios'
    }
    if (formDepartamento.descripcion.length > 500) nuevos.descripcion = 'La descripción no puede superar los 500 caracteres'
    if (formDepartamento.responsable.length > 100) nuevos.responsable = 'El responsable no puede superar los 100 caracteres'
    else if (formDepartamento.responsable.trim() && !/^[\p{L} .()'-]+$/u.test(formDepartamento.responsable.trim())) {
      nuevos.responsable = 'El responsable solo puede contener texto'
    }
    if (departamentos.some((item) =>
      item.codigo.trim().toUpperCase() === codigo
      && (!modoEdicionDepartamento || item.id !== seleccionado?.id))) {
      nuevos.codigo = 'Ya existe un departamento con este código'
    }
    if (departamentos.some((item) =>
      item.nombre.trim().toLowerCase() === nombre
      && (!modoEdicionDepartamento || item.id !== seleccionado?.id))) {
      nuevos.nombre = 'Ya existe un departamento con este nombre'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function solicitarGuardarDepartamento(evento) {
    evento.preventDefault()
    setErrorServidor('')
    if (!validarDepartamento()) return
    setConfirmacion({
      tipo: 'guardar-departamento',
      titulo: modoEdicionDepartamento ? 'Confirmar modificación' : 'Confirmar nuevo departamento',
      mensaje: modoEdicionDepartamento
        ? `¿Desea guardar los cambios de "${formDepartamento.nombre.trim()}"?`
        : `¿Desea crear el departamento "${formDepartamento.nombre.trim()}"?`,
      peligroso: false,
    })
  }

  function validarCargo() {
    const nuevos = {}
    const nombre = formCargo.nombre.trim().toLowerCase()
    if (!nombre) nuevos.nombre = 'El nombre del cargo es obligatorio'
    if (cargos.some((item) =>
      item.nombre.trim().toLowerCase() === nombre
      && (!modoEdicionCargo || item.id !== cargoEditando?.id))) {
      nuevos.nombre = 'Ya existe un cargo con este nombre en el departamento'
    }
    if (!formCargo.sueldoBase || Number(formCargo.sueldoBase) <= 0) {
      nuevos.sueldoBase = 'El sueldo base debe ser un monto positivo'
    }
    if (!formCargo.plazasTotales || Number(formCargo.plazasTotales) <= 0) {
      nuevos.plazasTotales = 'Debe indicar al menos una plaza'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function solicitarGuardarCargo(evento) {
    evento.preventDefault()
    setErrorServidor('')
    if (!validarCargo()) return
    setConfirmacion({
      tipo: 'guardar-cargo',
      titulo: modoEdicionCargo ? 'Confirmar modificación del cargo' : 'Confirmar nuevo cargo',
      mensaje: modoEdicionCargo
        ? `¿Desea guardar los cambios de "${formCargo.nombre.trim()}"?`
        : `¿Desea agregar el cargo "${formCargo.nombre.trim()}" a ${seleccionado.nombre}?`,
      peligroso: false,
    })
  }

  async function ejecutarConfirmacion() {
    if (!confirmacion) return
    setCargando(true)
    try {
      if (confirmacion.tipo === 'guardar-departamento') {
        const datos = {
          ...formDepartamento,
          codigo: formDepartamento.codigo.trim().toUpperCase(),
          nombre: formDepartamento.nombre.trim(),
        }
        if (modoEdicionDepartamento) await actualizarDepartamento(seleccionado.id, datos)
        else await crearDepartamento(datos)
        setModalDepartamento(false)
        setSeleccionado(null)
        setDetalle(null)
        setCargos([])
        await cargar()
        mostrarToast(modoEdicionDepartamento ? 'Departamento actualizado correctamente' : 'Departamento creado correctamente')
      } else if (confirmacion.tipo === 'guardar-cargo') {
        const datos = {
          ...formCargo,
          nombre: formCargo.nombre.trim(),
          sueldoBase: Number(formCargo.sueldoBase),
          plazasTotales: Number(formCargo.plazasTotales),
          plazasOcupadas: Number(formCargo.plazasOcupadas || 0),
          idDepartamento: seleccionado.id,
        }
        if (modoEdicionCargo) await actualizarCargo(cargoEditando.id, datos)
        else await crearCargo(seleccionado.id, datos)
        setModalCargo(false)
        await seleccionarDepartamento(seleccionado)
        await cargar()
        mostrarToast(modoEdicionCargo ? 'Cargo actualizado correctamente' : 'Cargo agregado correctamente')
      } else if (confirmacion.tipo === 'eliminar-cargo') {
        await eliminarCargo(confirmacion.cargo.id)
        await seleccionarDepartamento(seleccionado)
        await cargar()
        mostrarToast(`Cargo "${confirmacion.cargo.nombre}" eliminado correctamente`)
      } else if (confirmacion.tipo === 'eliminar-departamento') {
        await eliminarDepartamento(confirmacion.id)
        setSeleccionado(null)
        setDetalle(null)
        setCargos([])
        await cargar()
        mostrarToast(`Departamento "${confirmacion.nombre}" pasó a estado inactivo correctamente`)
      }
      setConfirmacion(null)
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo completar la operación'
      setErrorServidor(mensaje)
      setConfirmacion(null)
      mostrarToast(mensaje, 'error')
    } finally {
      setCargando(false)
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(cargos.length / 7))
  const cargosVisibles = cargos.slice(pagina * 7, pagina * 7 + 7)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BarraLateral />
      <div className="lg:pl-64">
        <Encabezado migas={['Departamentos y cargos']} />
        <main className="space-y-6 p-4 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Departamentos y Cargos</h1>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={abrirNuevoDepartamento} className="inline-flex items-center gap-2 rounded-lg bg-[#148D82] px-4 py-2.5 text-sm font-semibold text-white"><Icon icon="material-symbols:add" className="text-lg" />Nuevo Departamento</button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-5">
              <div className="relative">
                <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                <input type="text" value={buscar} onChange={(evento) => setBuscar(evento.target.value)} placeholder="Buscar departamento o código..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none" />
              </div>
              <div className="space-y-3">
                {departamentos.map((departamento) => {
                  const activo = seleccionado?.id === departamento.id
                  return (
                    <button key={departamento.id} type="button" onClick={() => seleccionarDepartamento(departamento)} className={`w-full rounded-xl border bg-white p-4 text-left ${activo ? 'border-[#148D82] shadow-md ring-1 ring-[#148D82]' : 'border-slate-200'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${activo ? 'bg-[#148D82] text-white' : 'bg-[#CFF8EF] text-[#157069]'}`}><Icon icon="material-symbols:corporate-fare" className="text-xl" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-900">{departamento.nombre}</p><span className="rounded-full bg-[#CFF8EF] px-2 py-0.5 text-[10px] font-semibold text-[#157069]">{departamento.codigo}</span></div>
                          <p className="mt-0.5 text-xs text-slate-500">{departamento.responsable}</p>
                          <div className="mt-2 flex gap-3 text-xs text-slate-500"><span>{departamento.totalColaboradores} colaboradores</span><span>{departamento.totalCargos} cargos activos</span></div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="xl:col-span-7">
              {detalle ? (
                <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><div className="flex items-center gap-3"><h2 className="text-lg font-bold text-slate-900">{detalle.nombre}</h2><span className="rounded-full bg-[#CFF8EF] px-2.5 py-0.5 text-xs font-semibold text-[#157069]">{detalle.codigo}</span></div><p className="mt-2 text-sm text-slate-500">{detalle.descripcion}</p></div>
                    <div className="flex gap-2">
                      <button type="button" onClick={abrirEditarDepartamento} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"><Icon icon="material-symbols:edit" className="text-lg" />Editar</button>
                      <button type="button" title="Dar de baja departamento" onClick={() => setConfirmacion({ tipo: 'eliminar-departamento', id: detalle.id, nombre: detalle.nombre, titulo: 'Dar de baja departamento', mensaje: `¿Desea cambiar "${detalle.nombre}" a estado INACTIVO? Se conservarán los cargos y el historial asociados.`, peligroso: true })} className="rounded-lg border border-slate-200 p-2 text-red-500"><Icon icon="material-symbols:delete" className="text-lg" /></button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"><p className="text-xs uppercase text-slate-500">Total Colaboradores</p><p className="mt-1 text-2xl font-bold text-slate-900">{detalle.totalColaboradores}</p></div>
                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"><p className="text-xs uppercase text-slate-500">Cargos</p><p className="mt-1 text-2xl font-bold text-slate-900">{detalle.totalCargos}</p></div>
                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"><p className="text-xs uppercase text-slate-500">Masa Salarial Aprox.</p><p className="mt-1 text-2xl font-bold text-slate-900">S/ {Math.round(Number(detalle.masaSalarial)).toLocaleString('es-PE')}</p></div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-4 py-3"><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-800">Cargos y Posiciones Asignadas</h3><span className="rounded-full bg-[#148D82] px-2 py-0.5 text-xs text-white">{cargos.length}</span></div><button type="button" onClick={abrirNuevoCargo} className="inline-flex items-center gap-1.5 rounded-lg bg-[#148D82] px-3 py-1.5 text-xs font-semibold text-white"><Icon icon="material-symbols:add" className="text-sm" />Agregar Cargo</button></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Nivel</th><th className="px-4 py-3 text-right">Sueldo</th><th className="px-4 py-3 text-center">Plazas</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
                        <tbody>
                          {cargosVisibles.map((cargo) => (
                            <tr key={cargo.id} className="border-b border-slate-100">
                              <td className="px-4 py-3.5 font-medium text-slate-900">{cargo.nombre}</td>
                              <td className="px-4 py-3.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{traducirNivel(cargo.nivel)}</span></td>
                              <td className="px-4 py-3.5 text-right">S/ {Number(cargo.sueldoBase).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3.5 text-center">{cargo.plazasOcupadas} / {cargo.plazasTotales}</td>
                              <td className="px-4 py-3.5"><div className="flex justify-end gap-1"><button type="button" title="Editar cargo" onClick={() => abrirEditarCargo(cargo)} className="rounded p-1.5 text-slate-400 hover:text-[#148D82]"><Icon icon="material-symbols:edit" className="text-lg" /></button><button type="button" title="Eliminar cargo" onClick={() => setConfirmacion({ tipo: 'eliminar-cargo', cargo, titulo: 'Eliminar cargo', mensaje: `¿Desea eliminar el cargo "${cargo.nombre}"? Esta acción no se puede deshacer.`, peligroso: true })} className="rounded p-1.5 text-slate-400 hover:text-red-600"><Icon icon="material-symbols:delete" className="text-lg" /></button></div></td>
                            </tr>
                          ))}
                          {cargosVisibles.length === 0 && <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-500">Este departamento aún no tiene cargos registrados</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <Paginacion pagina={pagina} totalPaginas={totalPaginas} etiqueta={`Mostrando ${cargosVisibles.length} de ${cargos.length} cargos`} onCambiar={setPagina} />
                  </div>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white"><p className="text-sm text-slate-500">Seleccione un departamento para ver su detalle</p></div>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalCargo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalCargo(false)} />
          <form onSubmit={solicitarGuardarCargo} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" noValidate>
            <div className="mb-4 flex justify-between"><div><h2 className="text-lg font-bold">{modoEdicionCargo ? 'Editar Cargo' : 'Agregar Cargo'}</h2><p className="text-sm text-slate-500">{detalle?.nombre}</p></div><button type="button" onClick={() => setModalCargo(false)}><Icon icon="material-symbols:close" className="text-xl" /></button></div>
            {errorServidor && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorServidor}</div>}
            <div className="space-y-4">
              <div><label htmlFor="nombreCargo" className="mb-1.5 block text-sm font-medium">Nombre del Cargo *</label><input id="nombreCargo" value={formCargo.nombre} onChange={(e) => setFormCargo({ ...formCargo, nombre: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.nombre ? 'border-red-500' : 'border-slate-200'}`} />{errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}</div>
              <div><label htmlFor="nivelCargo" className="mb-1.5 block text-sm font-medium">Nivel *</label><select id="nivelCargo" value={formCargo.nivel} onChange={(e) => setFormCargo({ ...formCargo, nivel: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="JUNIOR">Junior</option><option value="MID">Mid</option><option value="SEMI_SENIOR">Semi-Senior</option><option value="SENIOR">Senior</option><option value="LEAD">Lead / Jefatura</option></select></div>
              <div className="grid grid-cols-2 gap-4"><div><label htmlFor="sueldoCargo" className="mb-1.5 block text-sm font-medium">Sueldo Base *</label><input id="sueldoCargo" type="number" min="0" step="0.01" value={formCargo.sueldoBase} onChange={(e) => setFormCargo({ ...formCargo, sueldoBase: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.sueldoBase ? 'border-red-500' : 'border-slate-200'}`} />{errores.sueldoBase && <p className="mt-1 text-xs text-red-600">{errores.sueldoBase}</p>}</div><div><label htmlFor="plazasCargo" className="mb-1.5 block text-sm font-medium">Plazas *</label><input id="plazasCargo" type="number" min="1" value={formCargo.plazasTotales} onChange={(e) => setFormCargo({ ...formCargo, plazasTotales: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.plazasTotales ? 'border-red-500' : 'border-slate-200'}`} />{errores.plazasTotales && <p className="mt-1 text-xs text-red-600">{errores.plazasTotales}</p>}</div></div>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModalCargo(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cancelar</button><button type="submit" className="rounded-lg bg-[#148D82] px-5 py-2.5 text-sm font-semibold text-white">Guardar Cargo</button></div>
          </form>
        </div>
      )}

      {modalDepartamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setModalDepartamento(false)} />
          <form onSubmit={solicitarGuardarDepartamento} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" noValidate>
            <div className="mb-4 flex justify-between"><div><h2 className="text-lg font-bold">{modoEdicionDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}</h2><p className="mt-1 text-sm text-slate-500">Datos organizativos del área</p></div><button type="button" onClick={() => setModalDepartamento(false)}><Icon icon="material-symbols:close" className="text-xl" /></button></div>
            {errorServidor && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorServidor}</div>}
            <div className="grid gap-4 sm:grid-cols-2">            <div><label htmlFor="codigoDepartamento" className="mb-1.5 block text-sm font-medium">Código *</label><input id="codigoDepartamento" maxLength="7" value={formDepartamento.codigo} onChange={(e) => setFormDepartamento({ ...formDepartamento, codigo: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.codigo ? 'border-red-500' : 'border-slate-200'}`} />{errores.codigo && <p className="mt-1 text-xs text-red-600">{errores.codigo}</p>}</div><div><label htmlFor="nombreDepartamento" className="mb-1.5 block text-sm font-medium">Nombre *</label><input id="nombreDepartamento" maxLength="100" value={formDepartamento.nombre} onChange={(e) => setFormDepartamento({ ...formDepartamento, nombre: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.nombre ? 'border-red-500' : 'border-slate-200'}`} />{errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}</div></div>
            <div className="mt-4"><label htmlFor="responsableDepartamento" className="mb-1.5 block text-sm font-medium">Responsable</label><input id="responsableDepartamento" maxLength="100" value={formDepartamento.responsable} onChange={(e) => setFormDepartamento({ ...formDepartamento, responsable: e.target.value })} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errores.responsable ? 'border-red-500' : 'border-slate-200'}`} />{errores.responsable && <p className="mt-1 text-xs text-red-600">{errores.responsable}</p>}</div>
            <div className="mt-4"><label htmlFor="descripcionDepartamento" className="mb-1.5 block text-sm font-medium">Descripción</label><textarea id="descripcionDepartamento" rows="3" maxLength="500" value={formDepartamento.descripcion} onChange={(e) => setFormDepartamento({ ...formDepartamento, descripcion: e.target.value })} className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm ${errores.descripcion ? 'border-red-500' : 'border-slate-200'}`} />{errores.descripcion && <p className="mt-1 text-xs text-red-600">{errores.descripcion}</p>}</div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModalDepartamento(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cancelar</button><button type="submit" className="rounded-lg bg-[#148D82] px-5 py-2.5 text-sm font-semibold text-white">{modoEdicionDepartamento ? 'Guardar Cambios' : 'Crear Departamento'}</button></div>
          </form>
        </div>
      )}

      <ModalConfirmacion abierto={Boolean(confirmacion)} titulo={confirmacion?.titulo} mensaje={confirmacion?.mensaje} textoConfirmar={confirmacion?.tipo === 'eliminar-departamento' ? 'Dar de baja' : (confirmacion?.peligroso ? 'Eliminar' : 'Guardar')} peligroso={confirmacion?.peligroso} cargando={cargando} alCancelar={() => setConfirmacion(null)} alConfirmar={ejecutarConfirmacion} />
    </div>
  )
}

function traducirNivel(nivel) {
  const mapa = { JUNIOR: 'Junior', MID: 'Mid', SEMI_SENIOR: 'Semi-Senior', SENIOR: 'Senior', LEAD: 'Lead / Jefatura' }
  return mapa[nivel] || nivel
}
