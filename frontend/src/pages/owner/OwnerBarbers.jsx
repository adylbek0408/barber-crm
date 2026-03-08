import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api'
import BottomNav from '../../components/BottomNav'

// Стиль инпута — константа, не создаётся заново при каждом рендере
const INPUT = 'input-field text-[14px] py-3'

export default function OwnerBarbers() {
  const [barbers, setBarbers] = useState([])
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [svcForm, setSvcForm] = useState(null)
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', branch: '', username: '', password: ''
  })
  const [svc, setSvc] = useState({ name: '', price: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [b, br] = await Promise.all([ownerApi.getBarbers(), ownerApi.getBranches()])
    setBarbers(b.data); setBranches(br.data)
  }

  // Один универсальный обработчик для формы барбера
  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function create() {
    if (!form.first_name || !form.username || !form.password || !form.branch) {
      toast.error('Заполните все поля'); return
    }
    setLoading(true)
    try {
      await ownerApi.createBarber(form)
      toast.success('Создан!')
      setShowForm(false)
      setForm({ first_name: '', last_name: '', phone: '', branch: '', username: '', password: '' })
      load()
    } catch { toast.error('Ошибка') }
    finally { setLoading(false) }
  }

  async function del(id) {
    if (!confirm('Удалить барбера?')) return
    await ownerApi.deleteBarber(id); toast.success('Удалён'); load()
  }

  async function addSvc(bid) {
    if (!svc.name || !svc.price) return
    try {
      await ownerApi.createService({ barber: bid, ...svc })
      toast.success('Добавлено')
      setSvcForm(null); setSvc({ name: '', price: '' }); load()
    } catch { toast.error('Ошибка') }
  }

  async function delSvc(id) { await ownerApi.deleteService(id); load() }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#09090b' }}>
      <header className="px-5 pt-12 pb-5">
        <h1 className="text-[24px] font-black text-white">Барберы</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {barbers.length} сотрудников
        </p>
      </header>

      <div className="px-4 space-y-3">
        <button onClick={() => setShowForm(v => !v)}
          className={showForm ? 'btn-outline' : 'btn-primary'}>
          {showForm
            ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Отмена</>
            : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Добавить барбера</>
          }
        </button>

        {showForm && (
          <div className="card space-y-3">
            <p className="text-[15px] font-bold text-white">Новый барбер</p>

            {/* Прямые <input> без обёрток — стабильный фокус на мобиле */}
            <div className="grid grid-cols-2 gap-2">
              <input
                className={INPUT}
                placeholder="Имя"
                value={form.first_name}
                autoCapitalize="words"
                autoCorrect="off"
                onChange={e => setField('first_name', e.target.value)}
              />
              <input
                className={INPUT}
                placeholder="Фамилия"
                value={form.last_name}
                autoCapitalize="words"
                autoCorrect="off"
                onChange={e => setField('last_name', e.target.value)}
              />
            </div>
            <input
              className={INPUT}
              placeholder="Телефон"
              value={form.phone}
              type="tel"
              onChange={e => setField('phone', e.target.value)}
            />
            <select
              value={form.branch}
              onChange={e => setField('branch', e.target.value)}
              className="input-field"
              style={{ color: form.branch ? '#f8fafc' : 'rgba(255,255,255,0.2)' }}>
              <option value="">Выберите филиал</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} style={{ color: '#000' }}>{b.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                className={INPUT}
                placeholder="Логин"
                value={form.username}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={e => setField('username', e.target.value)}
              />
              <input
                className={INPUT}
                placeholder="Пароль"
                type="password"
                value={form.password}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={e => setField('password', e.target.value)}
              />
            </div>
            <button onClick={create} disabled={loading} className="btn-primary">
              {loading ? 'Создаём...' : 'Создать'}
            </button>
          </div>
        )}

        {barbers.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)' }} className="font-medium">Барберов пока нет</p>
          </div>
        )}

        {barbers.map((barber, idx) => (
          <div key={barber.id} className="card afu" style={{ animationDelay: `${idx * 0.06}s` }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[16px] flex-shrink-0"
                style={{ background: '#1a1a1f', color: 'rgba(255,255,255,0.6)' }}>
                {barber.first_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-white truncate">{barber.full_name}</p>
                <p className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {barber.branch_name}{barber.phone ? ` · ${barber.phone}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setExpanded(v => v === barber.id ? null : barber.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1f' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                    style={{ transform: expanded === barber.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <button onClick={() => del(barber.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              </div>
            </div>

            {expanded === barber.id && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>Услуги</p>

                {barber.services?.length === 0 &&
                  <p className="text-[13px] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Нет услуг</p>}

                <div className="space-y-[6px] mb-3">
                  {barber.services?.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-3 py-[10px] rounded-xl"
                      style={{ background: '#0f0f12' }}>
                      <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-white">{Number(s.price).toLocaleString()} сом</span>
                        <button onClick={() => delSvc(s.id)} style={{ color: 'rgba(255,255,255,0.15)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {svcForm === barber.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Название"
                        value={svc.name}
                        onChange={e => setSvc(s => ({ ...s, name: e.target.value }))}
                        autoCorrect="off"
                        spellCheck={false}
                        className="input-field text-[13px] py-3"
                      />
                      <input
                        type="number"
                        placeholder="Цена"
                        value={svc.price}
                        onChange={e => setSvc(s => ({ ...s, price: e.target.value }))}
                        className="input-field text-[13px] py-3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => addSvc(barber.id)} className="btn-primary py-3 text-[13px]">Добавить</button>
                      <button onClick={() => setSvcForm(null)} className="btn-outline py-3 text-[13px]">Отмена</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSvcForm(barber.id)}
                    className="w-full py-[11px] rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{ border: '1px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Добавить услугу
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <BottomNav active="barbers" />
    </div>
  )
}
