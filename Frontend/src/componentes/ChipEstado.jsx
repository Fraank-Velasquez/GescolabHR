// Chip de estado con la paleta definida en el design system
const ESTILOS = {
  PUNTUAL: 'bg-[#CFF8EF] text-[#157069] border-[#148D82]/20',
  ACTIVO: 'bg-[#CFF8EF] text-[#157069] border-[#148D82]/20',
  APROBADA: 'bg-[#CFF8EF] text-[#157069] border-[#148D82]/20',
  TARDANZA: 'bg-amber-100 text-amber-600 border-amber-500/20',
  PENDIENTE: 'bg-amber-100 text-amber-600 border-amber-500/20',
  EN_CURSO: 'bg-slate-100 text-slate-600 border-slate-200',
  EN_LICENCIA: 'bg-slate-100 text-slate-600 border-slate-200',
  RECHAZADA: 'bg-red-100 text-red-600 border-red-500/20',
  AUSENTE: 'bg-red-100 text-red-600 border-red-500/20',
  INACTIVO: 'bg-slate-100 text-slate-500 border-slate-200',
  JUSTIFICADA: 'bg-sky-100 text-sky-700 border-sky-500/20',
}

const TEXTO = {
  EN_CURSO: 'En Curso',
  PUNTUAL: 'Puntual',
  TARDANZA: 'Tardanza',
  AUSENTE: 'Ausente',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  EN_LICENCIA: 'En Licencia',
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  JUSTIFICADA: 'Justificada',
}

// Muestra el estado con fondo y texto
export default function ChipEstado({ estado }) {
  const estilo = ESTILOS[estado] || 'bg-slate-100 text-slate-600 border-slate-200'
  const texto = TEXTO[estado] || estado

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${estilo}`}>
      {texto}
    </span>
  )
}
