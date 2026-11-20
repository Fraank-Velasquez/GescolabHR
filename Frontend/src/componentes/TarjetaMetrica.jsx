import { Icon } from '@iconify/react'

// Tarjeta de métrica reutilizable del panel ejecutivo y vistas globales
export default function TarjetaMetrica({ etiqueta, valor, icono, color = 'teal', pie, sufijo }) {
  const colores = {
    teal: 'bg-[#CFF8EF] text-[#157069]',
    ambar: 'bg-amber-100 text-amber-600',
    rojo: 'bg-red-100 text-red-600',
    azul: 'bg-sky-100 text-sky-600',
    gris: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
            {valor}
            {sufijo && <span className="ml-1 text-sm font-medium text-slate-500">{sufijo}</span>}
          </p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colores[color]}`}>
          <Icon icon={`material-symbols:${icono.replace(/_/g, '-')}`} className="text-2xl" />
        </span>
      </div>
      {pie && <p className="mt-3 text-xs text-slate-500">{pie}</p>}
    </div>
  )
}
