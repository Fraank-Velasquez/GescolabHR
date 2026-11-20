// Redondea un porcentaje al múltiplo de 5 para usar las clases de dashboard.css
export function redondearCinco(valor) {
  return Math.min(100, Math.max(0, Math.round(valor / 5) * 5))
}

export function claseBarra(valor) {
  return `barra-${redondearCinco(valor)}`
}

export function claseAncho(valor) {
  return `ancho-${redondearCinco(valor)}`
}
