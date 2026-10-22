import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { api } from '@/lib/api'
import IngresoForm from '@/components/IngresoForm'
import EgresoForm from '@/components/EgresoForm'
import IngresosPage from '@/pages/IngresosPage'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))
const categories = [
  { id: 1, nombre: 'Empleo', subcategorias: [{ id: 10, nombre: 'Primera subcategoría' }] },
  { id: 2, nombre: 'Otro', subcategorias: [{ id: 20, nombre: 'Segunda subcategoría' }] },
]
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); api.get.mockResolvedValue(categories) })

async function ready() { await screen.findByRole('option', { name: 'Empleo' }) }
function props() { return { onSaved: vi.fn(), onCancel: vi.fn(), onBusyChange: vi.fn(), busy: false } }

describe('Formularios conectados a la API', () => {
  it('crea un ingreso conservando monto decimal y campos del backend', async () => {
    const callbacks = props()
    api.post.mockResolvedValue({ id: 5 })
    render(<IngresoForm {...callbacks} />)
    await ready()
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-05-10' } })
    await userEvent.type(screen.getByLabelText('Fuente'), 'Trabajo')
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), '1')
    await userEvent.type(screen.getByLabelText('Monto (Q)'), '1250.25')
    await userEvent.click(screen.getByRole('button', { name: 'Crear ingreso' }))
    await waitFor(() => expect(callbacks.onSaved).toHaveBeenCalledWith({ id: 5 }))
    expect(api.post).toHaveBeenCalledWith('/ingresos', { fecha: '2026-05-10', fuente: 'Trabajo', categoria_id: '1', monto: '1250.25', notas: null })
    expect(callbacks.onBusyChange.mock.calls).toEqual([[true], [false]])
  })

  it('precarga y actualiza un ingreso por su identificador', async () => {
    const callbacks = props()
    const ingreso = { id: 7, fecha: '2026-05-10T00:00:00.000Z', fuente: 'Trabajo', monto: '10.25', categoria_id: 1, notas: 'Nota' }
    api.put.mockResolvedValue({ ...ingreso, monto: '20.30' })
    render(<IngresoForm {...callbacks} ingreso={ingreso} />)
    await ready()
    expect(screen.getByLabelText('Fecha').value).toBe('2026-05-10')
    expect(screen.getByLabelText('Fuente').value).toBe('Trabajo')
    fireEvent.change(screen.getByLabelText('Monto (Q)'), { target: { value: '20.30' } })
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/ingresos/7', expect.objectContaining({ monto: '20.30', notas: 'Nota' })))
    expect(api.post).not.toHaveBeenCalled()
  })

  it('muestra el error 422 debajo del campo y conserva el formulario', async () => {
    const callbacks = props()
    api.post.mockRejectedValue({ status: 422, message: 'Datos inválidos', errors: { monto: ['El monto debe ser mayor que cero.'] } })
    render(<IngresoForm {...callbacks} />)
    await ready()
    await userEvent.click(screen.getByRole('button', { name: 'Crear ingreso' }))
    const error = await screen.findByText('El monto debe ser mayor que cero.')
    expect(error.parentElement.id).toBe(screen.getByLabelText('Monto (Q)').getAttribute('aria-describedby'))
    expect(callbacks.onSaved).not.toHaveBeenCalled()
  })

  it('limpia la subcategoría al cambiar categoría de un egreso', async () => {
    render(<EgresoForm {...props()} egreso={{ id: 1, categoria_id: 1, subcategoria_id: 10 }} />)
    await ready()
    expect(screen.getByLabelText('Subcategoría (opcional)').value).toBe('10')
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), '2')
    expect(screen.getByLabelText('Subcategoría (opcional)').value).toBe('')
    expect(screen.getByRole('option', { name: 'Segunda subcategoría' })).toBeDefined()
  })

  it('envía un egreso con categoría y subcategoría a la API', async () => {
    const callbacks = props()
    api.post.mockResolvedValue({ id: 6 })
    render(<EgresoForm {...callbacks} />)
    await ready()
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-05-10' } })
    await userEvent.type(screen.getByLabelText('Descripción'), 'Compra')
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), '1')
    await userEvent.selectOptions(screen.getByLabelText('Subcategoría (opcional)'), '10')
    await userEvent.type(screen.getByLabelText('Monto (Q)'), '25.50')
    await userEvent.click(screen.getByRole('button', { name: 'Crear egreso' }))
    await waitFor(() => expect(callbacks.onSaved).toHaveBeenCalledWith({ id: 6 }))
    expect(api.post).toHaveBeenCalledWith('/egresos', expect.objectContaining({ descripcion: 'Compra', monto: '25.50', categoria_id: '1', subcategoria_id: '10' }))
  })
  it('deshabilita el envío mientras guarda', async () => {
    render(<IngresoForm {...props()} busy />)
    await ready()
    expect(screen.getByRole('button', { name: 'Guardando…' }).disabled).toBe(true)
    expect(screen.getByLabelText('Fuente').disabled).toBe(true)
  })
})

describe('Listado de ingresos', () => {
  it('usa el periodo de la URL y exige confirmar antes de eliminar', async () => {
    api.get.mockResolvedValue([{ id: 9, fecha: '2026-05-10', fuente: 'Temporal', monto: '10.25', categoria: { nombre: 'Empleo' } }])
    api.delete.mockResolvedValue(null)
    render(<MemoryRouter initialEntries={['/ingresos?anio=2026&mes=5']}><IngresosPage /></MemoryRouter>)
    await screen.findByText('Temporal')
    expect(api.get).toHaveBeenCalledWith('/ingresos?anio=2026&mes=5')
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Temporal' }))
    expect(api.delete).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(api.delete).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Temporal' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/ingresos/9'))
    await screen.findByText('Ingreso eliminado correctamente.')
  })
})
