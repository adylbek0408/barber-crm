import { useState, useEffect } from 'react'

function getOS() {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

function getBrowser() {
  const ua = navigator.userAgent
  if (/samsungbrowser/i.test(ua)) return 'samsung'
  if (/edg\//i.test(ua)) return 'edge'
  if (/chrome|crios/i.test(ua)) return 'chrome'
  if (/firefox|fxios/i.test(ua)) return 'firefox'
  if (/safari/i.test(ua)) return 'safari'
  return 'other'
}

const GUIDES = {
  ios: [
    { icon: '⬆️', text: 'Нажми кнопку «Поделиться» (квадрат со стрелкой вверх) в нижней панели Safari' },
    { icon: '📜', text: 'Прокрути список действий вниз — найди «На экран "Домой"»' },
    { icon: '📲', text: 'Нажми «На экран "Домой"»' },
    { icon: '✅', text: 'Нажми «Добавить» в правом верхнем углу' },
  ],
  android_chrome: [
    { icon: '⋮', text: 'Нажми «⋮» (три точки) в правом верхнем углу Chrome' },
    { icon: '📲', text: 'Выбери «Добавить на главный экран»' },
    { icon: '✅', text: 'Нажми «Добавить»' },
  ],
  android_samsung: [
    { icon: '⋮', text: 'Нажми «⋮» в адресной строке' },
    { icon: '📲', text: 'Выбери «Добавить страницу на»' },
    { icon: '🏠', text: 'Выбери «Главный экран»' },
  ],
  desktop_chrome: [
    { icon: '⋮', text: 'Нажми «⋮» в правом верхнем углу браузера' },
    { icon: '💾', text: 'Выбери «Сохранить и поделиться» → «Создать ярлык»' },
    { icon: '✅', text: 'Нажми «Создать»' },
  ],
  desktop_edge: [
    { icon: '…', text: 'Нажми «…» в правом верхнем углу Edge' },
    { icon: '📲', text: 'Выбери «Приложения» → «Установить этот сайт как приложение»' },
    { icon: '✅', text: 'Нажми «Установить»' },
  ],
  default: [
    { icon: '🌐', text: 'Открой меню браузера (три точки / настройки)' },
    { icon: '📲', text: 'Найди «Добавить на главный экран» или «Установить»' },
    { icon: '✅', text: 'Подтверди установку' },
  ],
}

function getGuide() {
  const os = getOS()
  const br = getBrowser()
  if (os === 'ios') return { title: 'Установить на iPhone/iPad', steps: GUIDES.ios }
  if (os === 'android' && br === 'samsung') return { title: 'Установить на Android', steps: GUIDES.android_samsung }
  if (os === 'android') return { title: 'Установить на Android', steps: GUIDES.android_chrome }
  if (br === 'edge') return { title: 'Установить приложение', steps: GUIDES.desktop_edge }
  if (br === 'chrome') return { title: 'Установить приложение', steps: GUIDES.desktop_chrome }
  return { title: 'Установить приложение', steps: GUIDES.default }
}

export default function InstallPWA({ className = '' }) {
  const [installed, setInstalled] = useState(false)
  const [prompt, setPrompt] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Уже запущено как PWA?
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setInstalled(true)
      return
    }

    // Проверяем localStorage
    if (localStorage.getItem('pwa-dismissed') === '1') {
      setDismissed(true)
    }

    // Нативный prompt (Chrome/Edge HTTPS)
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setPrompt(null)
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setDismissed(true)
  }

  if (installed || dismissed) return null

  const { title, steps } = getGuide()

  async function handleNativeInstall() {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
  }

  return (
    <>
      {/* Баннер */}
      <button
        onClick={() => prompt ? handleNativeInstall() : setShowGuide(true)}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all active:scale-95 ${className}`}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-semibold text-white leading-tight">Установить приложение</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Добавить на главный экран</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <div
          role="button" tabIndex={0}
          onClick={e => { e.stopPropagation(); dismiss() }}
          onKeyDown={e => e.key === 'Enter' && (e.stopPropagation(), dismiss())}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.4)" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      </button>

      {/* Инструкция */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[999] flex items-end"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowGuide(false)}>
          <div
            className="w-full rounded-t-3xl p-6 asi"
            style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6"
              style={{ background: 'rgba(255,255,255,0.15)' }} />
            <h3 className="text-white font-bold text-[18px] mb-6 text-center">{title}</h3>
            <div className="space-y-4 mb-6">
              {steps.map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[20px] flex-shrink-0"
                    style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="text-white font-semibold text-[13px]">Шаг {i + 1}: </span>
                    <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowGuide(false)} className="btn-primary">
              Понял, закрыть
            </button>
            <button
              onClick={() => { setShowGuide(false); dismiss() }}
              className="w-full mt-3 py-3 text-[13px] text-center"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Больше не показывать
            </button>
          </div>
        </div>
      )}
    </>
  )
}
