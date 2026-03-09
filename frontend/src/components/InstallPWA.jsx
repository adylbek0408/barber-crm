import { useState, useEffect } from 'react'

function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) }
function isSafari() { return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) }

const IcoDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const IcoShare = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8fafc"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)

const IcoPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8fafc"
    strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="4"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)

const IcoCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f8fafc"
    strokeWidth="1.8" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IOS_STEPS = [
  { icon: <IcoShare />, title: 'Нажми «Поделиться»', sub: 'Кнопка внизу Safari — квадрат со стрелкой вверх' },
  { icon: <IcoPlus />, title: 'На экран «Домой»', sub: 'Прокрути список действий вниз и найди этот пункт' },
  { icon: <IcoCheck />, title: 'Нажми «Добавить»', sub: 'Кнопка в правом верхнем углу диалога' },
]

export default function InstallPWA({ className = '' }) {
  const [standalone, setStandalone] = useState(false)
  const [prompt, setPrompt]         = useState(null)
  const [showSheet, setShowSheet]   = useState(false)

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) { setStandalone(true); return }

    const onPrompt = e => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', () => { setStandalone(true); setPrompt(null) })
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function install() {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setStandalone(true)
    } else if (isIOS() && isSafari()) {
      setShowSheet(true)
    }
  }

  // Не показываем кнопку если: уже установлено, или нет ни промпта ни iOS Safari
  const noAction = !prompt && !(isIOS() && isSafari())
  if (standalone || noAction) return null

  return (
    <>
      {/* Кнопка установки */}
      <button
        onClick={install}
        className={`btn-primary ${className}`}
        style={{ gap: 8 }}>
        <IcoDownload />
        Установить приложение
      </button>

      {/* iOS Bottom Sheet */}
      {showSheet && (
        <div
          className="fixed inset-0 z-[999] flex items-end"
          style={{ background: 'var(--overlay)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          onClick={() => setShowSheet(false)}>
          <div
            className="w-full rounded-t-3xl pb-8"
            style={{ background: 'var(--bg-el)', border: '1px solid var(--bd-2)' }}
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-center pt-3 pb-5">
              <div className="w-9 h-1 rounded-full" style={{ background: 'var(--bd-3)' }} />
            </div>

            <p className="font-bold text-[17px] text-center mb-6 px-6" style={{ color: 'var(--tx)' }}>
              Добавить на главный экран
            </p>

            <div className="px-5 space-y-3 mb-7">
              {IOS_STEPS.map(({ icon, title, sub }, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--bg-deep)' }}>
                      {icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--btn-bg)' }}>
                      <span className="text-[9px] font-black" style={{ color: 'var(--btn-tx)' }}>{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white leading-tight">{title}</p>
                    <p className="text-[11px] mt-[2px]" style={{ color: 'var(--tx-3)' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5">
              <button
                onClick={() => setShowSheet(false)}
                className="w-full py-3 rounded-2xl text-[14px] font-bold btn-primary">
                Понял
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
