import { useState, useEffect } from 'react'

/**
 * PWA Install Button — работает на любом устройстве:
 * - Android Chrome/Edge: нативный prompt
 * - iOS Safari: инструкция (Share → На экран «Домой»)
 * - Desktop Chrome/Edge: нативный prompt
 * - Остальные: инструкция из браузера
 */
export default function InstallPWA({ className = '' }) {
  const [prompt, setPrompt]       = useState(null)   // beforeinstallprompt event
  const [isIOS, setIsIOS]         = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Уже установлено как PWA?
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // iOS Safari?
    const ua = navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua)
    const safari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
    setIsIOS(ios && safari)

    // Android / Desktop — ловим prompt
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Если установили через prompt
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Уже установлено — не показываем
  if (isInstalled) return null

  // iOS — показываем кнопку с инструкцией
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 w-full py-[14px] rounded-2xl text-[14px] font-medium transition-all active:scale-95 ${className}`}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v13M7 7l5-5 5 5"/>
            <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>
          </svg>
          Установить приложение
        </button>

        {/* iOS инструкция — modal */}
        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[999] flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full rounded-t-3xl p-6 asi"
              style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6"
                style={{ background: 'rgba(255,255,255,0.2)' }} />

              <h3 className="text-white font-bold text-[18px] mb-5 text-center">
                Установить BarberCRM
              </h3>

              <div className="space-y-4 mb-6">
                {[
                  {
                    step: '1',
                    text: 'Нажми кнопку «Поделиться»',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#f8fafc" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2v13M7 7l5-5 5 5"/>
                        <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>
                      </svg>
                    ),
                  },
                  {
                    step: '2',
                    text: 'Прокрути вниз и выбери «На экран "Домой"»',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#f8fafc" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <path d="M17.5 14v7M14 17.5h7"/>
                      </svg>
                    ),
                  },
                  {
                    step: '3',
                    text: 'Нажми «Добавить» — готово!',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#f8fafc" strokeWidth="2" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ),
                  },
                ].map(({ step, text, icon }) => (
                  <div key={step} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {icon}
                    </div>
                    <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span className="text-white font-semibold">Шаг {step}:</span> {text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Визуальная подсказка — стрелка вниз к кнопке share */}
              <div className="flex items-center justify-center gap-2 mb-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v13M7 7l5-5 5 5"/>
                  <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>
                </svg>
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Кнопка «Поделиться» внизу браузера Safari
                </span>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="btn-primary"
              >
                Понял, закрыть
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // Android / Desktop — нативный prompt
  if (prompt) {
    return (
      <button
        onClick={async () => {
          prompt.prompt()
          const { outcome } = await prompt.userChoice
          if (outcome === 'accepted') setPrompt(null)
        }}
        className={`flex items-center justify-center gap-2 w-full py-[14px] rounded-2xl text-[14px] font-medium transition-all active:scale-95 ${className}`}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Установить приложение
      </button>
    )
  }

  // Prompt ещё не пришёл (пользователь уже отклонил или браузер не поддерживает)
  // Показываем кнопку с общей инструкцией
  return null
}
