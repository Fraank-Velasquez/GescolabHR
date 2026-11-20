import { createContext, useContext, useEffect, useState } from 'react'
import { iniciarSesion } from '../servicios/autenticacionServicio'

// Estado global de la sesión con token, rol y datos del colaborador
const ContextoAutenticacion = createContext(null)

const CLAVE_SESION = 'sesionGescolab'

export function AutenticacionProvider({ children }) {
  const [sesion, setSesion] = useState(() => {
    const guardada = localStorage.getItem(CLAVE_SESION)
    return guardada ? JSON.parse(guardada) : null
  })

  useEffect(() => {
    if (sesion) {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
    } else {
      localStorage.removeItem(CLAVE_SESION)
    }
  }, [sesion])

  // Invoca el login del backend y persiste la sesión
  async function entrar(correo, contrasena) {
    const datos = await iniciarSesion(correo, contrasena)
    setSesion(datos)
    return datos
  }

  function salir() {
    setSesion(null)
  }

  const esAdmin = sesion?.rol === 'ROLE_ADMIN_RRHH'

  return (
    <ContextoAutenticacion.Provider value={{ sesion, esAdmin, entrar, salir }}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}

export function useAutenticacion() {
  return useContext(ContextoAutenticacion)
}
