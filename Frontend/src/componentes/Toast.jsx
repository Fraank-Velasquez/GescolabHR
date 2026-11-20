import { createContext, useCallback, useContext, useState } from 'react'
import { Icon } from '@iconify/react'

const ToastContext = createContext(null)

const ICONOS = {
  exito: 'material-symbols:check-circle',
  error: 'material-symbols:error',
  advertencia: 'material-symbols:warning',
  info: 'material-symbols:info',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const quitar = useCallback((id) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id))
  }, [])

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((actuales) => [...actuales, { id, mensaje, tipo }])
    window.setTimeout(() => quitar(id), 4000)
  }, [quitar])

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
              toast.tipo === 'error'
                ? 'border-red-200'
                : toast.tipo === 'advertencia'
                  ? 'border-amber-200'
                  : 'border-slate-200'
            }`}
          >
            <Icon
              icon={ICONOS[toast.tipo] || ICONOS.info}
              className={`mt-0.5 text-xl ${
                toast.tipo === 'error'
                  ? 'text-red-500'
                  : toast.tipo === 'advertencia'
                    ? 'text-amber-500'
                    : 'text-[#148D82]'
              }`}
            />
            <p className="flex-1 text-sm font-medium text-slate-700">{toast.mensaje}</p>
            <button type="button" onClick={() => quitar(toast.id)} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600">
              <Icon icon="material-symbols:close" className="text-lg" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const contexto = useContext(ToastContext)
  if (!contexto) throw new Error('useToast debe usarse dentro de ToastProvider')
  return contexto
}
