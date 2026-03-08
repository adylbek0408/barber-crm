import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api'
import useAuthStore from '../../store/authStore'

// Поля формы — определены ВНЕ компонента (иначе клавиатура закрывается на мобиле)
const FIELDS = [
  { key: 'name',       placeholder: 'Название барбершопа' },
  { key: 'owner_name', placeholder: 'Имя владельца' },
  { key: 'phone',      placeholder: 'Телефон' },
  { key: 'address',    placeholder: 'Адрес' },
  { key: 'username',   placeholder: 'Логин для входа' },
  { key: 'password',   placeholder: 'Пароль', type: 'password' },
]

const EMPTY = { name: '', owner_name: '', phone: '', address: '', username: '', password: '' }

export default function AdminDashboard() {
  const { logout } = useAuthStore()
  const [shops, setShops] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const res = await adminApi.getBarbershops()
    setShops(res.data)
  }

  async function handleCreate() {
    setLoading(true)
    try {
      await adminApi.createBarbershop(form)
      toast.success('Барбершоп создан!')
      setShowForm(false)
      setForm(EMPTY)
      loadData()
    } catch {
      toast.error('Ошибка создания')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id) {
    await adminApi.toggleActive(id)
    loadData()
  }

  return (
    <div className="min-h-screen bg-primary pb-10">
      <header className="px-5 pt-6 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">⚙️ Платформа</h1>
          <p className="text-white/50 text-sm">Все барбершопы</p>
        </div>
        <button onClick={logout} className="text-white/40 text-sm px-3 py-2 rounded-xl border border-white/10">
          Выйти
        </button>
      </header>

      <div className="px-5 space-y-4">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + Создать барбершоп
        </button>

        {showForm && (
          <div className="card space-y-3">
            <h3 className="font-bold">Новый барбершоп</h3>
            {FIELDS.map(({ key, placeholder, type = 'text' }) => (
              <input
                key={key}
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => {
                  const val = e.target.value
                  setForm(f => ({ ...f, [key]: val }))
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="w-full px-4 py-3 bg-primary rounded-xl text-white border border-white/10 focus:outline-none"
              />
            ))}
            <button onClick={handleCreate} disabled={loading} className="btn-primary">
              {loading ? 'Создаём...' : 'Создать'}
            </button>
          </div>
        )}

        {shops.map((shop) => (
          <div key={shop.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-lg">{shop.name}</p>
                <p className="text-white/50 text-sm">{shop.owner_name} · {shop.phone}</p>
                <p className="text-white/40 text-xs">{shop.address}</p>
              </div>
              <button
                onClick={() => handleToggle(shop.id)}
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  shop.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {shop.is_active ? 'Активен' : 'Заблок.'}
              </button>
            </div>
            {shop.subscription && (
              <div className="text-xs text-white/40 flex gap-3">
                <span>📋 {shop.subscription.plan}</span>
                <span>до {shop.subscription.expires_at}</span>
                <span className={shop.subscription.is_paid ? 'text-green-400' : 'text-yellow-400'}>
                  {shop.subscription.is_paid ? '✅ Оплачено' : '⏳ Не оплачено'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
