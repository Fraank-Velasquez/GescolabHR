// Encabezado superior con migas de navegación del panel
export default function Encabezado({ migas }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <span>Inicio</span>
        {migas.map((miga) => (
          <span key={miga} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">{miga}</span>
          </span>
        ))}
      </nav>
    </header>
  )
}
