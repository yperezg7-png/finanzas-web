import { api } from '@/lib/api'
import { monthNames } from '@/lib/period'

const numeric = (value) => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value))

export function normalizeSummary(data) {
  const fields = ['ingresos_mes', 'egresos_mes', 'balance_mes', 'balance_acumulado']
  if (!data || fields.some((key) => !numeric(data[key]))) throw new Error('El servidor devolvió un resumen no válido.')
  return Object.fromEntries(fields.map((key) => [key, Number(data[key])]))
}
export function normalizeCategories(data) {
  if (!Array.isArray(data) || data.some((row) => !row.nombre || !numeric(row.total))) throw new Error('El servidor devolvió datos de categorías no válidos.')
  return data.map((row) => ({ ...row, total: Number(row.total) })).sort((a, b) => b.total - a.total)
}
export function normalizeAnnual(data) {
  const fields = ['ingresos', 'egresos', 'balance']
  const valid = Array.isArray(data) && data.length === 12
    && new Set(data.map((row) => Number(row.mes))).size === 12
    && data.every((row) => Number.isInteger(Number(row.mes)) && Number(row.mes) >= 1 && Number(row.mes) <= 12 && fields.every((key) => numeric(row[key])))
  if (!valid) throw new Error('El servidor no devolvió un resumen válido de los doce meses.')
  return data.map((row) => ({ mes: Number(row.mes), nombre: monthNames[Number(row.mes) - 1], ...Object.fromEntries(fields.map((key) => [key, Number(row[key])])) })).sort((a, b) => a.mes - b.mes)
}

// El cliente HTTP conserva autenticación y errores; este servicio prepara los datos del dashboard.
export async function getSummary(anio, mes) {
  return normalizeSummary(await api.get(`/dashboard/resumen?${new URLSearchParams({ anio, mes })}`))
}
export async function getCategoryExpenses(anio, mes) {
  return normalizeCategories(await api.get(`/dashboard/egresos-por-categoria?${new URLSearchParams({ anio, mes })}`))
}
export async function getAnnualSummary(anio) {
  return normalizeAnnual(await api.get(`/dashboard/resumen-anual?${new URLSearchParams({ anio })}`))
}
