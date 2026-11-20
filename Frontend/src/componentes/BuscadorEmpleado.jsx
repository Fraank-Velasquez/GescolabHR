import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { listarEmpleados } from '../servicios/empleadoServicio'

export default function BuscadorEmpleado({
  id = 'buscador-empleado',
  etiqueta = 'Colaborador',
  valorSeleccionado,
  nombreSeleccionado = '',
  onSeleccionar,
  error,
}) {
  const [texto, setTexto] = useState(nombreSeleccionado)
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    setTexto(nombreSeleccionado)
  }, [nombreSeleccionado])

  useEffect(() => {
    const consulta = texto.trim()
    if (valorSeleccionado && texto === nombreSeleccionado) {
      setResultados([])
      setAbierto(false)
      return undefined
    }
    if (consulta.length < 2) {
      setResultados([])
      setAbierto(false)
      return undefined
    }

    const temporizador = window.setTimeout(async () => {
      setBuscando(true)
      try {
        const pagina = await listarEmpleados({
          buscar: consulta,
          estado: 'ACTIVO',
          pagina: 0,
          tamano: 3,
        })
        setResultados(pagina.content || [])
        setAbierto(true)
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 250)

    return () => window.clearTimeout(temporizador)
  }, [texto, valorSeleccionado, nombreSeleccionado])

  function seleccionar(empleado) {
    setTexto(empleado.nombreCompleto)
    setResultados([])
    setAbierto(false)
    onSeleccionar(empleado)
  }

  function limpiar() {
    setTexto('')
    setResultados([])
    setAbierto(false)
    onSeleccionar(null)
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{etiqueta} *</label>
      <div className="relative">
        <Icon icon="material-symbols:search" className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xl text-slate-400" />
        <input
          id={id}
          type="text"
          value={texto}
          onFocus={() => resultados.length > 0 && setAbierto(true)}
          onChange={(evento) => {
            setTexto(evento.target.value)
            if (valorSeleccionado) onSeleccionar(null)
          }}
          placeholder="Buscar por nombre, apellido o DNI..."
          autoComplete="off"
          className={`w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm outline-none ${
            error
              ? 'border-red-500'
              : 'border-slate-200 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15'
          }`}
        />
        {texto && (
          <button
            type="button"
            onClick={limpiar}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Limpiar colaborador"
          >
            <Icon icon="material-symbols:close" className="text-lg" />
          </button>
        )}
        {abierto && (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {buscando ? (
              <p className="px-3 py-3 text-sm text-slate-500">Buscando...</p>
            ) : resultados.length > 0 ? (
              resultados.map((empleado) => (
                <button
                  key={empleado.id}
                  type="button"
                  onClick={() => seleccionar(empleado)}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-[#F1FCF9]"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{empleado.nombreCompleto}</p>
                    <p className="text-xs text-slate-500">{empleado.departamento} - DNI {empleado.dni}</p>
                  </div>
                  <Icon icon="material-symbols:chevron-right" className="text-lg text-slate-400" />
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm text-slate-500">No se encontraron colaboradores</p>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
