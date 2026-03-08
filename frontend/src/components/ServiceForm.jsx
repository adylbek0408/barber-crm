import { useState } from 'react'
import toast from 'react-hot-toast'
import { barberApi } from '../api'

export default function ServiceForm({ onDone, service = null }) {
  const isEdit = !!service
  const [form, setForm] = useState({
    name: service?.name || '',
    price: service?.price || '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!form.name || !form.price) { toast.error('Заполните все поля'); return }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast.error('Введите корректную цену'); return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await barberApi.updateService(service.id, { name: form.name, price: form.price })
        toast.success('Услуга обновлена!')
      } else {
        await barberApi.createService({ name: form.name, price: form.price })
        toast.success('Услуга добавлена!')
      }
      onDone()
    } catch (e) {
      const err = e.response?.data
      const msg = typeof err === 'string'
        ? err
        : err?.detail || err?.name?.[0] || err?.price?.[0] || 'Ошибка при сохранении'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card space-y-3 asi mb-4">
      <p className="text-white font-bold">{isEdit ? 'Редактировать услугу' : 'Новая услуга'}</p>
      <input
        placeholder="Название (напр. Стрижка)"
        value={form.name}
        autoComplete="off"
        autoCorrect="off"
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="input-field"
      />
      <input
        placeholder="Цена (сом)"
        type="number"
        inputMode="numeric"
        value={form.price}
        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
        className="input-field"
      />
      <button onClick={handleSubmit} disabled={loading} className="btn-primary">
        {loading ? 'Сохраняем...' : isEdit ? 'Сохранить изменения' : 'Сохранить'}
      </button>
    </div>
  )
}
