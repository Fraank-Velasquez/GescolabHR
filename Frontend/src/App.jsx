import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from './componentes/RutaProtegida'
import { useAutenticacion } from './contexto/AutenticacionContexto'
import PanelEjecutivo from './paginas/dashboard/PanelEjecutivo'
import GestionDepartamentos from './paginas/departamentos/GestionDepartamentos'
import DirectorioEmpleados from './paginas/empleados/DirectorioEmpleados'
import IniciarSesion from './paginas/login/IniciarSesion'
import ControlAsistenciaGlobal from './paginas/asistencia/ControlAsistenciaGlobal'
import MiAsistencia from './paginas/asistencia/MiAsistencia'
import GestionVacaciones from './paginas/vacaciones/GestionVacaciones'

// Define las rutas protegidas según rol de cada pantalla
export default function App() {
  const { sesion } = useAutenticacion()

  return (
    <Routes>
      <Route path="/login" element={<IniciarSesion />} />

      <Route
        path="/"
        element={
          <RutaProtegida>
            {sesion?.rol === 'ROLE_ADMIN_RRHH' ? <PanelEjecutivo /> : <Navigate to="/mi-asistencia" replace />}
          </RutaProtegida>
        }
      />

      <Route
        path="/departamentos"
        element={
          <RutaProtegida rolesPermitidos={['ROLE_ADMIN_RRHH']}>
            <GestionDepartamentos />
          </RutaProtegida>
        }
      />

      <Route
        path="/empleados"
        element={
          <RutaProtegida rolesPermitidos={['ROLE_ADMIN_RRHH']}>
            <DirectorioEmpleados />
          </RutaProtegida>
        }
      />

      <Route
        path="/asistencia"
        element={
          <RutaProtegida rolesPermitidos={['ROLE_ADMIN_RRHH']}>
            <ControlAsistenciaGlobal />
          </RutaProtegida>
        }
      />

      <Route
        path="/vacaciones"
        element={
          <RutaProtegida rolesPermitidos={['ROLE_ADMIN_RRHH']}>
            <GestionVacaciones />
          </RutaProtegida>
        }
      />

      <Route
        path="/mi-asistencia"
        element={
          <RutaProtegida rolesPermitidos={['ROLE_EMPLEADO', 'ROLE_ADMIN_RRHH']}>
            <MiAsistencia />
          </RutaProtegida>
        }
      />

      <Route path="*" element={<Navigate to={sesion ? '/' : '/login'} replace />} />
    </Routes>
  )
}
