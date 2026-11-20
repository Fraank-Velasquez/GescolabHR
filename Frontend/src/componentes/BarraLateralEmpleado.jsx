import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAutenticacion } from '../contexto/AutenticacionContexto'

const ITEMS_EMPLEADO = [
  { ruta: '/mi-asistencia', texto: 'Mi Asistencia', icono: 'schedule' },
]

// Menú lateral del portal del colaborador con cierre en móvil
export default function BarraLateralEmpleado() {
  const { sesion, salir } = useAutenticacion()
  const navegar = useNavigate()
  const [abierto, setAbierto] = useState(false)

  function cerrarSesion() {
    salir()
    navegar('/login')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[#13403D] p-2 text-white lg:hidden"
        aria-label="Abrir menú"
      >
        <Icon icon="material-symbols:menu" className="text-2xl" />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setAbierto(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#13403D] transition-transform lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#148D82]">
            <Icon icon="material-symbols:vital-signs" className="text-2xl text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Gescolab HR</p>
            <p className="text-xs text-[#36CBB8]">Portal del Colaborador</p>
          </div>
        </div>

        <p className="px-6 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Navegación
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {ITEMS_EMPLEADO.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              onClick={() => setAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#148D82] text-white'
                    : 'text-[#B7D4D1] hover:bg-[#0D3331] hover:text-white'
                }`
              }
            >
              <Icon icon={`material-symbols:${item.icono.replace(/_/g, '-')}`} className="text-base" />
              {item.texto}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-4 rounded-lg bg-[#0D3331] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{sesion?.nombreCompleto}</p>
              <p className="text-xs text-[#94A3B8]">ID: EMP-{sesion?.idEmpleado}</p>
              <span className="mt-1 inline-block rounded-full bg-[#CFF8EF] px-2 py-0.5 text-xs font-medium text-[#157069]">
                Colaborador
              </span>
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              title="Cerrar sesión"
              className="rounded p-1 text-[#94A3B8] transition-colors hover:text-white"
            >
              <Icon icon="material-symbols:logout" className="text-xl" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
