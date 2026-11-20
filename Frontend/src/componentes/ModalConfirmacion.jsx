import { Icon } from '@iconify/react'

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligroso = false,
  cargando = false,
  alCancelar,
  alConfirmar,
  valorObservacion,
  alCambiarObservacion,
  etiquetaObservacion,
}) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/45" onClick={cargando ? undefined : alCancelar} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${peligroso ? 'bg-red-100 text-red-600' : 'bg-[#CFF8EF] text-[#157069]'}`}>
          <Icon icon={peligroso ? 'material-symbols:warning' : 'material-symbols:help'} className="text-2xl" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{mensaje}</p>
        {alCambiarObservacion && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{etiquetaObservacion || 'Observación'}</label>
            <textarea
              rows="3"
              value={valorObservacion || ''}
              onChange={(evento) => alCambiarObservacion(evento.target.value)}
              placeholder="Ingrese una observación opcional..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#148D82] focus:ring-2 focus:ring-[#148D82]/15"
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          {textoCancelar && (
            <button
              type="button"
              onClick={alCancelar}
              disabled={cargando}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {textoCancelar}
            </button>
          )}
          <button
            type="button"
            onClick={alConfirmar}
            disabled={cargando}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
              peligroso ? 'bg-red-600 hover:bg-red-700' : 'bg-[#148D82] hover:bg-[#157069]'
            }`}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
