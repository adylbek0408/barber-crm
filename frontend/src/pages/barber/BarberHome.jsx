import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { barberApi } from '../../api'
import useAuthStore from '../../store/authStore'
import InstallPWA from '../../components/InstallPWA'
import ServiceForm from '../../components/ServiceForm'

const S = { SELECT: 'select', PAY: 'pay', DONE: 'done' }
const TAB = { WORK: 'work', SERVICES: 'services' }

export default function BarberHome() {
  const { user, logout } = useAuthStore()
  const [tab, setTab] = useState(TAB.WORK)

  // ── Запись ──
  const [services, setServices] = useState([])
  const [step, setStep] = useState(S.SELECT)
  const [sel, setSel] = useState(null)
  const [pay, setPay] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Управление услугами ──
  const [showSvcForm, setShowSvcForm] = useState(false)
  const [editingService, setEditingService] = useState(null)   // услуга на редактирование
  const [deleteConfirm, setDeleteConfirm] = useState(null)     // id услуги для удаления
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadServices() }, [])

  async function loadServices() {
    setLoading(true)
    try {
      const r = await barberApi.getMyServices()
      setServices(r.data)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }

  async function handleDeleteService(id) {
    setDeleting(true)
    try {
      await barberApi.deleteService(id)
      toast.success('Услуга удалена')
      setDeleteConfirm(null)
      loadServices()
    } catch { toast.error('Ошибка удаления') }
    finally { setDeleting(false) }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await barberApi.createAppointment({ service: sel.id, payment_type: pay })
      setSaved(res.data)
      setStep(S.DONE)
    } catch { toast.error('Ошибка') }
    finally { setSaving(false) }
  }

  function reset() { setStep(S.SELECT); setSel(null); setPay(null); setSaved(null) }

  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#09090b' }}>

      {/* ── Кастомный диалог удаления ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-xs rounded-3xl p-6 asi"
            style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-white font-bold text-[17px] mb-2 text-center">Удалить услугу?</h3>
            <p className="text-center text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Это действие нельзя отменить
            </p>
            <button
              onClick={() => handleDeleteService(deleteConfirm)}
              disabled={deleting}
              className="w-full py-3 rounded-2xl font-semibold text-[15px] mb-3"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              {deleting ? 'Удаляем...' : 'Удалить'}
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="w-full py-3 rounded-2xl font-semibold text-[15px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Шапка */}
      <header className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[12px] mb-[2px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{date}</p>
          <h1 className="text-[19px] font-bold text-white">
            {user?.full_name?.split(' ')[0] || user?.username}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[13px] font-semibold text-white">{time}</p>
          <button onClick={logout}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.07)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* PWA install */}
      <div className="px-4 pb-1">
        <InstallPWA />
      </div>

      {/* Табы */}
      <div className="px-4 pb-3 flex gap-2">
        {[
          { id: TAB.WORK, label: 'Запись' },
          { id: TAB.SERVICES, label: 'Мои услуги' },
        ].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === TAB.WORK) reset() }}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
            style={tab === t.id
              ? { background: '#f8fafc', color: '#09090b' }
              : { background: '#1a1a1f', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }
            }>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ ТАБ: ЗАПИСЬ ══════════ */}
      {tab === TAB.WORK && (
        <>
          {step === S.SELECT && (
            <main className="flex-1 flex flex-col px-4 pb-8">
              <div className="mb-5">
                <h2 className="text-[24px] font-black text-white">Услуга</h2>
                <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Шаг 1 из 2</p>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.07)', borderTopColor: 'rgba(255,255,255,0.4)' }} />
                </div>
              ) : services.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(255,255,255,0.2)" strokeWidth="1.8">
                      <path d="M6 2v12M6 14c0 2.2 1.8 4 4 4h4a4 4 0 0 0 0-8H6"/>
                      <path d="M18 2v12"/>
                    </svg>
                  </div>
                  <p className="font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Услуги не настроены</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Добавьте услуги во вкладке «Мои услуги»
                  </p>
                </div>
              ) : (
                <div className="flex-1 space-y-2">
                  {services.map((s, i) => {
                    const on = sel?.id === s.id
                    return (
                      <button key={s.id} onClick={() => setSel(s)}
                        className="service-item afu"
                        style={{
                          animationDelay: `${i * 0.05}s`,
                          ...(on ? { background: '#16161c', border: '1px solid rgba(255,255,255,0.18)' } : {})
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: on ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)' }}>
                            {on
                              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8"><path d="M6 2v12M6 14c0 2.2 1.8 4 4 4h4a4 4 0 0 0 0-8H6"/><path d="M18 2v12"/></svg>
                            }
                          </div>
                          <span className="text-[15px] font-semibold"
                            style={{ color: on ? '#f8fafc' : 'rgba(255,255,255,0.7)' }}>
                            {s.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[17px] font-bold" style={{ color: on ? '#f8fafc' : 'rgba(255,255,255,0.5)' }}>
                            {Number(s.price).toLocaleString()}
                          </p>
                          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>сом</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {sel && (
                <div className="mt-4 asi">
                  <div className="rounded-xl px-4 py-3 mb-3 flex items-center justify-between"
                    style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{sel.name}</span>
                    <span className="text-[15px] font-bold text-white">{Number(sel.price).toLocaleString()} сом</span>
                  </div>
                  <button onClick={() => setStep(S.PAY)} className="btn-primary">
                    Выбрать способ оплаты
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              )}
            </main>
          )}

          {step === S.PAY && (
            <main className="flex-1 flex flex-col px-4 pb-8">
              <button onClick={() => setStep(S.SELECT)}
                className="flex items-center gap-2 mb-5 text-[13px] font-medium w-fit"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Назад
              </button>

              <div className="mb-5">
                <h2 className="text-[24px] font-black text-white">Оплата</h2>
                <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Шаг 2 из 2</p>
              </div>

              <div className="rounded-xl px-4 py-4 mb-4 flex items-center justify-between"
                style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p className="text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Услуга</p>
                  <p className="text-[15px] font-semibold text-white">{sel?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-black text-white leading-none">{Number(sel?.price).toLocaleString()}</p>
                  <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>сом</p>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {[
                  { id: 'cash', icon: '💵', label: 'Наличные', sub: 'Оплата на месте' },
                  { id: 'online', icon: '📲', label: 'Онлайн', sub: 'Элсом, Мбанк, QR' },
                ].map((p) => {
                  const on = pay === p.id
                  return (
                    <button key={p.id} onClick={() => setPay(p.id)}
                      className="payment-item"
                      style={on ? { background: '#16161c', border: '1px solid rgba(255,255,255,0.18)' } : {}}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: on ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
                        {p.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-[16px] font-semibold" style={{ color: on ? '#f8fafc' : 'rgba(255,255,255,0.7)' }}>
                          {p.label}
                        </p>
                        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{p.sub}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: `2px solid ${on ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
                          background: on ? 'rgba(255,255,255,0.15)' : 'transparent'
                        }}>
                        {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </button>
                  )
                })}
              </div>

              {pay && (
                <div className="mt-4 asi">
                  <button onClick={save} disabled={saving} className="btn-primary">
                    {saving
                      ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v8z"/>
                        </svg> Сохраняем...</>
                      : <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Сохранить</>
                    }
                  </button>
                </div>
              )}
            </main>
          )}

          {step === S.DONE && saved && (
            <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
              <div className="w-full max-w-xs text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ach"
                  style={{ background: '#1e1e22', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="text-[28px] font-black text-white mb-1">Готово</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Запись сохранена</p>
                <div className="rounded-2xl overflow-hidden mb-6"
                  style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {[
                    { l: 'Услуга', v: saved.service_name },
                    { l: 'Сумма', v: `${Number(saved.price).toLocaleString()} сом`, bold: true },
                    { l: 'Оплата', v: saved.payment_display },
                    { l: 'Время', v: new Date(saved.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) },
                  ].map((row, i, arr) => (
                    <div key={row.l} className="flex items-center justify-between px-4 py-3"
                      style={i < arr.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}>
                      <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.l}</span>
                      <span className={`text-[14px] ${row.bold ? 'font-bold text-white' : 'font-medium'}`}
                        style={!row.bold ? { color: 'rgba(255,255,255,0.7)' } : {}}>
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={reset} className="btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Новая запись
                </button>
              </div>
            </main>
          )}
        </>
      )}

      {/* ══════════ ТАБ: МОИ УСЛУГИ ══════════ */}
      {tab === TAB.SERVICES && (
        <main className="flex-1 flex flex-col px-4 pb-8">
          <div className="mb-5">
            <h2 className="text-[24px] font-black text-white">Мои услуги</h2>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {services.length} услуг
            </p>
          </div>

          {/* Кнопка добавить */}
          {!editingService && (
            <button
              onClick={() => setShowSvcForm(!showSvcForm)}
              className={showSvcForm ? 'btn-outline' : 'btn-primary'}
              style={{ marginBottom: '16px' }}>
              {showSvcForm ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg> Отмена</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg> Добавить услугу</>
              )}
            </button>
          )}

          {/* Форма добавления */}
          {showSvcForm && !editingService && (
            <ServiceForm onDone={() => { setShowSvcForm(false); loadServices() }} />
          )}

          {/* Форма редактирования */}
          {editingService && (
            <ServiceForm
              service={editingService}
              onDone={() => { setEditingService(null); loadServices() }}
            />
          )}
          {editingService && (
            <button
              onClick={() => setEditingService(null)}
              className="btn-outline mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Отмена
            </button>
          )}

          {/* Список услуг */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.07)', borderTopColor: 'rgba(255,255,255,0.4)' }} />
            </div>
          ) : services.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <p className="font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Услуг пока нет</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Добавьте первую услугу выше
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((s, i) => (
                <div key={s.id} className="glass-card afu flex items-center justify-between"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-[15px]">{s.name}</p>
                    <p className="text-[13px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {Number(s.price).toLocaleString()} сом
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Кнопка редактировать */}
                    <button
                      onClick={() => { setEditingService(s); setShowSvcForm(false) }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Кнопка удалить */}
                    <button
                      onClick={() => setDeleteConfirm(s.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}
