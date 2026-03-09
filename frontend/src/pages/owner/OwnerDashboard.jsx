import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api'
import useAuthStore from '../../store/authStore'
import BottomNav from '../../components/BottomNav'
import InstallPWA from '../../components/InstallPWA'

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '6px 12px', fontSize: 13, color: '#f1f5f9'
    }}>
      {Number(payload[0].value).toLocaleString()} сом
    </div>
  )
}

const Stat = ({ label, value, sub }) => (
  <div className="card flex-1 min-w-0">
    <p className="text-[11px] font-medium mb-2 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
    <p className="text-white font-bold text-[20px] leading-none">{value}</p>
    {sub && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</p>}
  </div>
)

export default function OwnerDashboard() {
  const { user, logout } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [byBarber, setByBarber] = useState([])
  const [byBranch, setByBranch] = useState([])
  const [byDay, setByDay] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [month, setMonth] = useState(cur)

  useEffect(() => { load() }, [month])

  async function load() {
    setLoading(true)
    try {
      const [s, bb, br, bd] = await Promise.all([
        ownerApi.getSummary({ month }),
        ownerApi.getByBarber({ month }),
        ownerApi.getByBranch({ month }),
        ownerApi.getByDay({ month }),
      ])
      setSummary(s.data)
      setByBarber(bb.data)
      setByBranch(br.data)
      setByDay(bd.data.map((d) => ({
        d: new Date(d.day).getDate(),
        v: Number(d.total_revenue),
        n: d.total_appointments,
      })))
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }

  const cash   = summary?.payment_stats?.find((p) => p.payment_type === 'cash')
  const online = summary?.payment_stats?.find((p) => p.payment_type === 'online')
  const total  = Number(summary?.total_revenue || 0)
  const cashPct = total ? Math.round((Number(cash?.total || 0) / total) * 100) : 0

  const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
  const [yr, mo] = month.split('-')
  const monthLabel = `${MONTHS[parseInt(mo) - 1]} ${yr}`

  return (
    <div className="min-h-screen pb-28" style={{ background: '#09090b' }}>

      {/* Шапка */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[12px] font-medium mb-[2px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Аналитика
            </p>
            <h1 className="text-[20px] font-bold text-white leading-tight">
              {user?.full_name || user?.username}
            </h1>
          </div>
          <button onClick={logout}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.07)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.35)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        {/* PWA install */}
        <InstallPWA className="mb-3" />

        {/* Выбор месяца */}
        <label htmlFor="mpick"
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
          style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="flex-1 text-[14px] font-medium text-white">{monthLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <input id="mpick" type="month" value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="sr-only" />
        </label>
      </header>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 animate-spin mb-3"
              style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Загрузка...</p>
          </div>
        ) : (
          <>
            {/* Главная карточка оборота */}
            <div className="rounded-2xl p-5 afu"
              style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.25)' }}>Оборот за {monthLabel}</p>
              <p className="font-black leading-none mb-4" style={{ fontSize: 44, color: '#f8fafc' }}>
                {total.toLocaleString()}
                <span className="text-[18px] font-semibold ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>сом</span>
              </p>
              <div className="sep mb-4" />
              <div className="flex gap-3">
                <Stat label="Стрижек" value={summary?.total_appointments || 0} />
                <Stat label="Средний чек" value={`${Math.round(summary?.avg_check || 0).toLocaleString()}`} sub="сом" />
              </div>
            </div>

            {/* Оплаты */}
            <div className="card afu" style={{ animationDelay: '0.06s' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.25)' }}>Оплаты</p>
              <div className="space-y-4">
                {[
                  {
                    label: 'Наличные', val: Number(cash?.total || 0), cnt: cash?.count || 0, pct: cashPct,
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>
                  },
                  {
                    label: 'Онлайн', val: Number(online?.total || 0), cnt: online?.count || 0, pct: 100 - cashPct,
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {row.icon} {row.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{row.cnt} шт</span>
                        <span className="text-[14px] font-semibold text-white">{row.val.toLocaleString()} сом</span>
                      </div>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${row.pct}%`, background: 'rgba(255,255,255,0.35)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* График по дням */}
            {byDay.length > 0 && (
              <div className="card afu" style={{ animationDelay: '0.1s' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>По дням</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={byDay} barSize={6} margin={{ left: -20 }}>
                    <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }}
                      axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                    <Bar dataKey="v" radius={[4, 4, 1, 1]}>
                      {byDay.map((_, i) => (
                        <Cell key={i}
                          fill={i === byDay.length - 1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Топ барберов */}
            {byBarber.length > 0 && (
              <div className="card afu" style={{ animationDelay: '0.14s' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Топ барберов</p>
                <div className="space-y-4">
                  {byBarber.map((b, i) => {
                    const tot = byBarber.reduce((s, x) => s + Number(x.total_revenue), 0)
                    const pct = tot ? Math.round((Number(b.total_revenue) / tot) * 100) : 0
                    return (
                      <div key={b.barber__id}>
                        <div className="flex items-center gap-3 mb-[7px]">
                          <span className="text-[13px] font-bold w-5 text-center flex-shrink-0"
                            style={{ color: i === 0 ? '#f8fafc' : 'rgba(255,255,255,0.25)' }}>
                            {i + 1}
                          </span>
                          <span className="flex-1 text-[14px] font-medium text-white truncate">
                            {b.barber__first_name} {b.barber__last_name}
                          </span>
                          <span className="text-[14px] font-semibold flex-shrink-0"
                            style={{ color: i === 0 ? '#f8fafc' : 'rgba(255,255,255,0.5)' }}>
                            {Number(b.total_revenue).toLocaleString()} сом
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 flex-shrink-0" />
                          <div className="flex-1 h-[2px] rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)',
                                transition: 'width 0.7s ease'
                              }} />
                          </div>
                          <span className="text-[11px] flex-shrink-0"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>
                            {b.total_appointments} стр.
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Топ филиалов */}
            {byBranch.length > 0 && (
              <div className="card afu" style={{ animationDelay: '0.18s' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Топ филиалов</p>
                <div className="space-y-4">
                  {byBranch.map((b, i) => {
                    const tot = byBranch.reduce((s, x) => s + Number(x.total_revenue), 0)
                    const pct = tot ? Math.round((Number(b.total_revenue) / tot) * 100) : 0
                    return (
                      <div key={b.branch__id}>
                        <div className="flex items-center gap-3 mb-[7px]">
                          <span className="text-[13px] font-bold w-5 text-center flex-shrink-0"
                            style={{ color: i === 0 ? '#f8fafc' : 'rgba(255,255,255,0.25)' }}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-[14px] font-medium text-white truncate block">
                              {b.branch__name}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[14px] font-semibold"
                              style={{ color: i === 0 ? '#f8fafc' : 'rgba(255,255,255,0.5)' }}>
                              {Number(b.total_revenue).toLocaleString()} сом
                            </p>
                            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                              {b.total_appointments} стрижек
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 flex-shrink-0" />
                          <div className="flex-1 h-[2px] rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)',
                                transition: 'width 0.7s ease'
                              }} />
                          </div>
                          <span className="text-[11px] flex-shrink-0"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Пусто */}
            {!summary?.total_appointments && byBarber.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center afu">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.2)" strokeWidth="1.8">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <p className="font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Нет данных за {monthLabel}
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Записи появятся после первых стрижек
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="analytics" />
    </div>
  )
}
