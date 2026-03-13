import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api'
import useAuthStore from '../../store/authStore'
import ThemeToggle from '../../components/ThemeToggle'

// Поля формы — определены ВНЕ компонента (иначе клавиатура закрывается на мобиле)
const FIELDS = [
  { key: 'name',       placeholder: 'Название барбершопа' },
  { key: 'owner_name', placeholder: 'Имя владельца' },
  { key: 'phone',      placeholder: 'Телефон' },
  { key: 'address',    placeholder: 'Адрес' },
  { key: 'username',   placeholder: 'Логин владельца для входа' },
  { key: 'password',   placeholder: 'Пароль владельца', type: 'password' },
]

const EMPTY = {
  name: '', owner_name: '', phone: '', address: '', username: '', password: '',
  has_shop_admin: false,
  shop_admin_first_name: '', shop_admin_last_name: '', shop_admin_username: '', shop_admin_password: '',
}

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
      <div className="page min-h-screen pb-nav page-content">

      <header className="px-4 sm:px-5 pb-5 page-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium mb-[2px]" style={{ color: 'var(--tx-4)' }}>
              Администратор
            </p>
            <h1 className="text-[22px] font-black" style={{ color: 'var(--tx)' }}>Платформа</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={logout}
              className="w-9 h-9 rounded-xl flex items-center justify-center touch-target"
              style={{ background: 'var(--bg-el)', border: '1px solid var(--bd)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="var(--ic)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-5 space-y-3">
        <button onClick={() => setShowForm(v => !v)} className={showForm ? 'btn-outline' : 'btn-primary'}>
          {showForm ? (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg> Отмена</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg> Создать барбершоп</>
          )}
        </button>

        {showForm && (
          <div className="card space-y-3 asi">
            <p className="font-bold text-[15px]" style={{ color: 'var(--tx)' }}>Новый барбершоп</p>
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
                spellCheck={false}
                className="input-field"
              />
            ))}
            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input type="checkbox" checked={!!form.has_shop_admin}
                onChange={(e) => setForm(f => ({ ...f, has_shop_admin: e.target.checked }))}
                className="w-5 h-5 rounded border-2" style={{ accentColor: 'var(--tx)' }} />
              <span className="text-[14px] font-medium" style={{ color: 'var(--tx)' }}>
                Есть администратор барбершопа (записи и оплаты ведёт он, барберы не создают записи)
              </span>
            </label>
            {form.has_shop_admin && (
              <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--bd)' }}>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--tx-3)' }}>Данные администратора барбершопа</p>
                <input type="text" placeholder="Имя" value={form.shop_admin_first_name}
                  onChange={(e) => setForm(f => ({ ...f, shop_admin_first_name: e.target.value }))}
                  className="input-field" />
                <input type="text" placeholder="Фамилия" value={form.shop_admin_last_name}
                  onChange={(e) => setForm(f => ({ ...f, shop_admin_last_name: e.target.value }))}
                  className="input-field" />
                <input type="text" placeholder="Логин" value={form.shop_admin_username}
                  onChange={(e) => setForm(f => ({ ...f, shop_admin_username: e.target.value }))}
                  autoCapitalize="none" className="input-field" />
                <input type="password" placeholder="Пароль" value={form.shop_admin_password}
                  onChange={(e) => setForm(f => ({ ...f, shop_admin_password: e.target.value }))}
                  className="input-field" />
              </div>
            )}
            <button onClick={handleCreate} disabled={loading} className="btn-primary">
              {loading ? 'Создаём...' : 'Создать'}
            </button>
          </div>
        )}

        {shops.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="var(--ic)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2v12M6 14c0 2.2 1.8 4 4 4h4a4 4 0 0 0 0-8H6"/>
                <path d="M18 2v12"/>
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--tx-3)' }}>Барбершопов пока нет</p>
          </div>
        )}

        {shops.map((shop, idx) => (
          <div key={shop.id} className="card afu" style={{ animationDelay: `${idx * 0.06}s` }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-[15px]"
                style={{ background: 'var(--bg-el)', color: 'var(--tx-2)' }}>
                {shop.name?.[0]?.toUpperCase() || 'B'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-[3px]">
                  <p className="font-bold text-[15px] truncate" style={{ color: 'var(--tx)' }}>{shop.name}</p>
                  <span className={shop.is_active ? 'badge-green' : 'badge-red'}>
                    {shop.is_active ? 'Активен' : 'Заблок.'}
                  </span>
                </div>
                <p className="text-[12px] truncate" style={{ color: 'var(--tx-3)' }}>
                  {shop.owner_name} · {shop.phone}
                </p>
                <p className="text-[11px] mt-[2px]" style={{ color: 'var(--tx-5)' }}>{shop.address}</p>
              </div>
              <button
                onClick={() => handleToggle(shop.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 touch-target"
                style={shop.is_active
                  ? { background: 'var(--danger-bg-subtle)', border: '1px solid var(--danger-border-subtle)' }
                  : { background: 'var(--success-bg)', border: '1px solid var(--success-border)' }
                }>
                {shop.is_active
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--danger-ic)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success-ic)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                }
              </button>
            </div>

            {shop.subscription && (
              <div className="rounded-xl px-3 py-[10px] flex items-center justify-between"
                style={{ background: 'var(--bg-deep)', border: '1px solid var(--bd)' }}>
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--ic)" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-[12px]" style={{ color: 'var(--tx-3)' }}>
                    {shop.subscription.plan} · до {shop.subscription.expires_at}
                  </span>
                </div>
                <span className={`text-[11px] font-semibold ${
                  shop.subscription.is_paid ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {shop.subscription.is_paid ? 'Оплачено' : 'Не оплачено'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
