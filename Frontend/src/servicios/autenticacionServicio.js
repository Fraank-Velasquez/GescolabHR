import api from './api'

// Autentica al colaborador y guarda el token de sesión
export async function iniciarSesion(correo, contrasena) {
  const respuesta = await api.post('/autenticacion/login', { correo, contrasena })
  return respuesta.data
}
