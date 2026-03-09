import { useNavigate } from 'react-router-dom'

const IC_ON  = 'var(--tx)'
const IC_OFF = 'var(--ic)'

const tabs = [
  {
    key: 'analytics', label: 'Аналитика', path: '/owner',
    icon: (on) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={on ? IC_ON : IC_OFF} strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="3" width="5" height="18" rx="1.5"/>
        <rect x="9.5" y="8" width="5" height="13" rx="1.5"/>
        <rect x="17" y="13" width="5" height="8" rx="1.5"/>
      </svg>
    )
  },
  {
    key: 'barbers', label: 'Барберы', path: '/owner/barbers',
    icon: (on) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={on ? IC_ON : IC_OFF} strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    key: 'branches', label: 'Филиалы', path: '/owner/branches',
    icon: (on) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={on ? IC_ON : IC_OFF} strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
]

export default function BottomNav({ active }) {
  const navigate = useNavigate()
  return (
    <nav className="bottom-nav z-50">
      {tabs.map((tab) => {
        const on = tab.key === active
        return (
          <button key={tab.key} onClick={() => navigate(tab.path)} className="nav-item">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={on ? { background: 'var(--bg-el)', border: '1px solid var(--bd-2)' } : {}}>
              {tab.icon(on)}
            </div>
            <span className="text-[10px] font-medium"
              style={{ color: on ? 'var(--tx-2)' : 'var(--tx-5)' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
