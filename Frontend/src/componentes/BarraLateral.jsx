import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAutenticacion } from '../contexto/AutenticacionContexto'

const ITEMS_ADMIN = [
  { ruta: '/', texto: 'Dashboard', icono: 'dashboard' },
  { ruta: '/departamentos', texto: 'Departamentos y Cargos', icono: 'corporate-fare' },
  { ruta: '/empleados', texto: 'Colaboradores', icono: 'badge' },
  { ruta: '/asistencia', texto: 'Control de Asistencia', icono: 'schedule' },
  { ruta: '/vacaciones', texto: 'Vacaciones y Permisos', icono: 'event-available' },
]

// Menú lateral fijo del panel administrativo
export default function BarraLateral() {
  const { sesion, salir } = useAutenticacion()
  const navegar = useNavigate()

  function cerrarSesion() {
    salir()
    navegar('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#13403D] lg:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#148D82]">
          <Icon icon="material-symbols:groups" className="text-2xl text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Gescolab HR</p>
        </div>
      </div>

      <p className="px-6 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-[#7FB3AD]">
        Menú Principal
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {ITEMS_ADMIN.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            end={item.ruta === '/'}
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
            <p className="text-sm font-semibold text-white">
              {sesion?.nombreCompleto || 'Admin RR.HH.'}
            </p>
            <p className="text-xs text-[#36CBB8]">{sesion?.rol}</p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            title="Cerrar sesión"
            className="rounded p-1 text-[#B7D4D1] transition-colors hover:text-white"
          >
            <Icon icon="material-symbols:logout" className="text-xl" />
          </button>
        </div>
      </div>
    </aside>
  )
}
