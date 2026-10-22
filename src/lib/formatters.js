// Instancias compartidas: no recrear los formateadores por cada celda o tarjeta.
const moneda = new Intl.NumberFormat('es-GT', {
  style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2,
})
const fecha = new Intl.DateTimeFormat('es-GT', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
})
const mes = new Intl.DateTimeFormat('es-GT', { month: 'long', timeZone: 'UTC' })

/** Acepta números y cadenas decimales de Laravel; no transforma vacíos en cero. */
export function formatearMoneda(valor) {
  if ((typeof valor !== 'number' && typeof valor !== 'string') || String(valor).trim() === '') return '—'
  const numero = Number(valor)
  return Number.isFinite(numero) ? moneda.format(numero) : '—'
}

/** Fechas de calendario del backend: conservar YYYY-MM-DD incluso si Laravel añade hora ISO. */
export function formatearFecha(valor) {
  if (typeof valor !== 'string') return '—'
  const partes = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(valor)
  if (!partes) return '—'
  const [, anio, numeroMes, dia] = partes.map(Number)
  const date = new Date(0)
  date.setUTCFullYear(anio, numeroMes - 1, dia)
  date.setUTCHours(0, 0, 0, 0)
  // Date normaliza fechas imposibles: rechazarlas antes de presentarlas.
  if (date.getUTCFullYear() !== anio || date.getUTCMonth() !== numeroMes - 1 || date.getUTCDate() !== dia) return '—'
  return fecha.format(date)
}

/** Mes de 1 a 12; primera letra mayúscula para títulos y selectores. */
export function nombreMes(numero) {
  if ((typeof numero !== 'number' && typeof numero !== 'string') || String(numero).trim() === '') return '—'
  const valor = Number(numero)
  if (!Number.isInteger(valor) || valor < 1 || valor > 12) return '—'
  const nombre = mes.format(new Date(Date.UTC(2000, valor - 1, 1)))
  return nombre.charAt(0).toLocaleUpperCase('es-GT') + nombre.slice(1)
}
