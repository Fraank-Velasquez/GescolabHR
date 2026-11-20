import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { useAutenticacion } from '../../contexto/AutenticacionContexto'
import ModalConfirmacion from '../../componentes/ModalConfirmacion'

// Portal de acceso corporativo con validación previa y errores del backend
export default function IniciarSesion() {
  const { entrar } = useAutenticacion()
  const navegar = useNavigate()

  const [correo, setCorreo] = useState('admin.rrhh@gescolab.corp')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [recordar, setRecordar] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [modalInfo, setModalInfo] = useState(null)

  // Valida campos antes de invocar el servicio de login
  function validar() {
    const nuevos = {}
    if (!correo.trim()) {
      nuevos.correo = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      nuevos.correo = 'Ingrese un correo válido'
    }
    if (!contrasena) {
      nuevos.contrasena = 'La contraseña es obligatoria'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setErrorServidor('')
    if (!validar()) return

    setCargando(true)
    try {
      const sesion = await entrar(correo, contrasena)
      navegar(sesion.rol === 'ROLE_ADMIN_RRHH' ? '/' : '/mi-asistencia')
    } catch (error) {
      setErrorServidor(error.response?.data?.mensaje || 'No se pudo iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Panel izquierdo de marca */}
      <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#13403D] via-[#0D3331] to-[#062D2C] p-8 md:w-1/2 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_#36CBB8_1px,_transparent_1px)] opacity-10 [background-size:28px_28px]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#148D82]">
            <Icon icon="material-symbols:groups" className="text-2xl text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              Gescolab <span className="text-[#36CBB8]">HR</span>
            </p>
          </div>
        </div>

        <div className="relative mt-10 hidden md:block">
          <h1 className="max-w-md text-3xl font-bold leading-tight text-white lg:text-4xl">
            Gestión integral del talento humano, asistencia y operaciones en un solo lugar.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#B7D4D1] lg:text-base">
            Optimiza asistencias, supervisión de  por departamento, control de
            licencias y flujos de trabajo corporativos con seguridad y precisión.
          </p>
        </div>

        <p className="relative mt-10 text-xs text-[#7FB3AD]">© 2026 Gescolab HR.</p>
      </div>

      {/* Panel derecho del formulario */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
              <Icon icon="material-symbols:language" className="text-sm" />
              Español (América Latina)
            </span>
            <button
              type="button"
              onClick={() => setModalInfo({
                titulo: 'Soporte TI',
                mensaje: 'Si presenta inconvenientes para acceder al sistema, fallas de conexión o problemas con su cuenta, comuníquese con el área de Soporte TI o envíe su incidencia al correo interno de tecnología.',
              })}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#148D82] hover:text-[#157069]"
            >
              <Icon icon="material-symbols:contact-support" className="text-sm" />
              Soporte TI
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa tus credenciales corporativas para acceder al panel.
          </p>

          {errorServidor && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorServidor}
            </div>
          )}

          <form onSubmit={manejarEnvio} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-slate-700">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Icon icon="material-symbols:mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 ${errores.correo
                      ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15'
                    }`}
                />
              </div>
              {errores.correo && <p className="mt-1 text-xs text-red-600">{errores.correo}</p>}
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-1.5 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <Icon icon="material-symbols:lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                <input
                  id="contrasena"
                  type={verContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 ${errores.contrasena
                      ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena(!verContrasena)}
                  aria-label="Alternar visibilidad de contraseña"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon
                    icon={verContrasena ? 'material-symbols:visibility-off' : 'material-symbols:visibility'}
                    className="text-lg"
                  />
                </button>
              </div>
              {errores.contrasena && <p className="mt-1 text-xs text-red-600">{errores.contrasena}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={recordar}
                  onChange={(e) => setRecordar(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#148D82]"
                />
                Recordar sesión en este equipo
              </label>
              <button
                type="button"
                onClick={() => setModalInfo({
                  titulo: 'Recuperación de contraseña',
                  mensaje: 'Para cambiar o recuperar su contraseña, comuníquese con su supervisor inmediato a cargo o con el área de Recursos Humanos.',
                })}
                className="text-sm font-medium text-[#148D82] hover:text-[#157069]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#148D82] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#157069] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? 'Validando...' : 'Ingresar al Sistema'}
              {!cargando && <Icon icon="material-symbols:arrow-forward" className="text-lg" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">O ingresa con credencial única</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Icon icon="mdi:microsoft-azure" className="h-5 w-5" />
              Iniciar con Microsoft Azure Active Directory (SSO)
            </button>
          </form>
        </div>
      </div>
      <ModalConfirmacion
        abierto={Boolean(modalInfo)}
        titulo={modalInfo?.titulo}
        mensaje={modalInfo?.mensaje}
        textoCancelar={null}
        textoConfirmar="Entendido"
        alConfirmar={() => setModalInfo(null)}
        alCancelar={() => setModalInfo(null)}
      />
    </div>
  )
}
