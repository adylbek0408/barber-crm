import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { shopAdminApi } from '../../api'
import useAuthStore from '../../store/authStore'
import ThemeToggle from '../../components/ThemeToggle'

const S = { BARBER: 'barber', SERVICE: 'service', PAY: 'pay', DONE: 'done' }

const PAYMENTS = [
  { id: 'cash', label: 'Наличные', sub: 'Оплата на месте' },
  { id: 'online', label: 'Онлайн', sub: 'Элсом, Мбанк, QR' },
]

export default function ShopAdminHome() {
  const { user, logout } = useAuthStore()
  const [barbers, setBarbers] = useState([])
  const [services, setServices] = useState([])
  const [step, setStep] = useState(S.BARBER)
  const [selBarber, setSelBarber] = useState(null)
  const [selService, setSelService] = useState(null)
  const [pay, setPay] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [loadingServices, setLoadingServices] = useState(false)

  useEffect(() => { loadBarbers() }, [])

  async function loadBarbers() {
    setLoadingBarbers(true)
    try {
      const r = await shopAdminApi.getBarbers()
      setBarbers(r.data)
    } catch {
      toast.error('Ошибка загрузки барберов')
    } finally {
      setLoadingBarbers(false)
    }
  }

  async function onSelectBarber(barber) {
    setSelBarber(barber)
    setSelService(null)
    setPay(null)
    setStep(S.SERVICE)
    setLoadingServices(true)
    try {
      const r = await shopAdminApi.getServices(barber.id)
      setServices(r.data)
    } catch {
      toast.error('Ошибка загрузки услуг')
    } finally {
      setLoadingServices(false)
    }
  }

  function onSelectService(service) {
    setSelService(service)
    setStep(S.PAY)
  }

  function errMsg(e, fallback = 'Ошибка') {
    if (!e.response) return 'Сервер не ответил. Проверьте, что бэкенд запущен (порт 8000).'
    const d = e.response.data
    if (!d || typeof d !== 'object') return fallback
    const detail = d.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]) return detail[0]
    if (d.barber?.[0]) return d.barber[0]
    if (d.service?.[0]) return d.service[0]
    if (d.payment_type?.[0]) return d.payment_type[0]
    return fallback
  }

  async function save() {
    if (!selBarber || !selService || !pay) return
    setSaving(true)
    try {
      const res = await shopAdminApi.createAppointment({
        barber: Number(selBarber.id),
        service: Number(selService.id),
        payment_type: String(pay),
      })
      setSaved(res.data)
      setStep(S.DONE)
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setStep(S.BARBER)
    setSelBarber(null)
    setSelService(null)
    setPay(null)
    setSaved(null)
  }

  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  return (
    <div className="page min-h-screen flex flex-col page-content">
      <header className="px-4 sm:px-5 pb-5 page-header flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium mb-[2px]" style={{ color: 'var(--tx-4)' }}>Администратор</p>
          <h1 className="text-[22px] font-black" style={{ color: 'var(--tx)' }}>
            {user?.full_name?.split(' ')[0] || user?.username}
          </h1>
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
      </header>

      <main className="flex-1 px-4 sm:px-5 pb-8">
        {step === S.BARBER && (
          <>
            <div className="mb-5">
              <h2 className="text-[24px] font-black" style={{ color: 'var(--tx)' }}>Выберите барбера</h2>
              <p className="text-[13px] mt-1" style={{ color: 'var(--tx-4)' }}>Шаг 1 из 3</p>
            </div>
            {loadingBarbers ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'var(--bd-2)', borderTopColor: 'var(--tx-3)' }} />
              </div>
            ) : barbers.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-medium" style={{ color: 'var(--tx-3)' }}>Барберов пока нет</p>
                <p className="text-sm mt-1" style={{ color: 'var(--tx-5)' }}>Владелец может добавить барберов в кабинете</p>
              </div>
            ) : (
              <div className="space-y-2">
                {barbers.map((b) => (
                  <button key={b.id} onClick={() => onSelectBarber(b)}
                    className="w-full rounded-2xl px-4 py-4 flex items-center justify-between text-left asi"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
                    <span className="font-semibold text-[15px]" style={{ color: 'var(--tx)' }}>
                      {b.first_name} {b.last_name}
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ic)" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === S.SERVICE && selBarber && (
          <>
            <button onClick={() => { setStep(S.BARBER); setSelBarber(null); setServices([]) }}
              className="flex items-center gap-2 mb-5 text-[13px] font-medium w-fit"
              style={{ color: 'var(--tx-3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Назад
            </button>
            <div className="mb-5">
              <h2 className="text-[24px] font-black" style={{ color: 'var(--tx)' }}>Услуга</h2>
              <p className="text-[13px] mt-1" style={{ color: 'var(--tx-4)' }}>
                Барбер: {selBarber.first_name} {selBarber.last_name} · Шаг 2 из 3
              </p>
            </div>
            {loadingServices ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'var(--bd-2)', borderTopColor: 'var(--tx-3)' }} />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-medium" style={{ color: 'var(--tx-3)' }}>У этого барбера нет услуг</p>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((s) => (
                  <button key={s.id} onClick={() => onSelectService(s)}
                    className="w-full rounded-2xl px-4 py-4 flex items-center justify-between text-left asi"
                    style={{
                      background: selService?.id === s.id ? 'var(--bg-el)' : 'var(--bg-card)',
                      border: `1px solid ${selService?.id === s.id ? 'var(--bd-3)' : 'var(--bd)'}`,
                    }}>
                    <span className="font-semibold text-[15px]" style={{ color: 'var(--tx)' }}>{s.name}</span>
                    <span className="text-[15px] font-bold" style={{ color: 'var(--tx-2)' }}>
                      {Number(s.price).toLocaleString()} сом
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === S.PAY && selBarber && selService && (
          <>
            <button onClick={() => setStep(S.SERVICE)}
              className="flex items-center gap-2 mb-5 text-[13px] font-medium w-fit"
              style={{ color: 'var(--tx-3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Назад
            </button>
            <div className="mb-5">
              <h2 className="text-[24px] font-black" style={{ color: 'var(--tx)' }}>Оплата</h2>
              <p className="text-[13px] mt-1" style={{ color: 'var(--tx-4)' }}>Шаг 3 из 3</p>
            </div>
            <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
              <div>
                <p className="text-[11px] mb-1" style={{ color: 'var(--tx-4)' }}>{selService.name}</p>
                <p className="text-[13px]" style={{ color: 'var(--tx-3)' }}>{selBarber.first_name} {selBarber.last_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-black leading-none" style={{ color: 'var(--tx)' }}>
                  {Number(selService.price).toLocaleString()}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--tx-4)' }}>сом</p>
              </div>
            </div>
            <div className="space-y-2">
              {PAYMENTS.map((p) => (
                <button key={p.id} onClick={() => setPay(p.id)}
                  className="w-full rounded-2xl px-4 py-4 flex items-center justify-between text-left"
                  style={{
                    background: pay === p.id ? 'var(--bg-el)' : 'var(--bg-card)',
                    border: `1px solid ${pay === p.id ? 'var(--bd-3)' : 'var(--bd)'}`,
                  }}>
                  <div>
                    <p className="font-semibold text-[15px]" style={{ color: 'var(--tx)' }}>{p.label}</p>
                    <p className="text-[12px]" style={{ color: 'var(--tx-4)' }}>{p.sub}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      border: `2px solid ${pay === p.id ? 'var(--tx-2)' : 'var(--bd-3)'}`,
                      background: pay === p.id ? 'var(--bd-2)' : 'transparent',
                    }}>
                    {pay === p.id && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </button>
              ))}
            </div>
            {pay && (
              <div className="mt-6">
                <button onClick={save} disabled={saving} className="btn-primary w-full">
                  {saving ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v8z"/>
                    </svg> Сохраняем...</>
                  ) : (
                    <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Сохранить запись</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {step === S.DONE && saved && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--bg-el)', border: '1px solid var(--bd-2)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--tx-2)" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-[28px] font-black mb-1" style={{ color: 'var(--tx)' }}>Готово</h2>
            <p className="text-[14px] mb-8" style={{ color: 'var(--tx-3)' }}>Запись сохранена</p>
            <div className="w-full max-w-xs rounded-2xl overflow-hidden mb-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
              {[
                { l: 'Услуга', v: saved.service_name },
                { l: 'Сумма', v: `${Number(saved.price).toLocaleString()} сом`, bold: true },
                { l: 'Оплата', v: saved.payment_display },
              ].map((row, i, arr) => (
                <div key={row.l} className="flex items-center justify-between px-4 py-3"
                  style={i < arr.length - 1 ? { borderBottom: '1px solid var(--sep-c)' } : {}}>
                  <span className="text-[13px]" style={{ color: 'var(--tx-3)' }}>{row.l}</span>
                  <span className={`text-[14px] ${row.bold ? 'font-bold' : 'font-medium'}`} style={{ color: 'var(--tx-2)' }}>{row.v}</span>
                </div>
              ))}
            </div>
            <button onClick={reset} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Новая запись
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
