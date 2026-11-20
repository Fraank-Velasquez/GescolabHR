import { Navigate } from 'react-router-dom'
import { useAutenticacion } from '../contexto/AutenticacionContexto'

// Bloquea el acceso si no hay sesión o el rol no está permitido
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { sesion } = useAutenticacion()

  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(sesion.rol)) {
    return <Navigate to={sesion.rol === 'ROLE_ADMIN_RRHH' ? '/' : '/mi-asistencia'} replace />
  }

  return children
}
