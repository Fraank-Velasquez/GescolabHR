// Controles de paginación reutilizables en tablas del sistema
export default function Paginacion({ pagina, totalPaginas, etiqueta, onCambiar }) {
  if (totalPaginas <= 1) {
    return (
      <p className="px-4 py-3 text-sm text-slate-500">{etiqueta}</p>
    )
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={pagina === 0}
          onClick={() => onCambiar(pagina - 1)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onCambiar(i)}
            className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
              pagina === i
                ? 'bg-[#148D82] text-white'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
          disabled={pagina >= totalPaginas - 1}
          onClick={() => onCambiar(pagina + 1)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
