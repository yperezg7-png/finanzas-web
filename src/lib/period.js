import { nombreMes } from './formatters'

export const monthNames = Array.from({ length: 12 }, (_, index) => nombreMes(index + 1))

export function currentPeriod() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Guatemala', year: 'numeric', month: 'numeric',
  }).formatToParts(new Date())
  return {
    anio: Number(parts.find((part) => part.type === 'year').value),
    mes: Number(parts.find((part) => part.type === 'month').value),
  }
}

