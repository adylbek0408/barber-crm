import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 7:00 – 20:00 → light (день) | 20:00 – 7:00 → dark (ночь)
function detectThemeByTime() {
  const h = new Date().getHours()
  return h >= 7 && h < 20 ? 'light' : 'dark'
}

// Учёт системной темы при первом запуске (если авто)
function getInitialTheme() {
  if (typeof window === 'undefined') return detectThemeByTime()
  try {
    const m = window.matchMedia('(prefers-color-scheme: light)')
    return m.matches ? 'light' : 'dark'
  } catch {
    return detectThemeByTime()
  }
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      auto: true,
      setTheme: (theme) => set({ theme, auto: false }),
      resetAuto: () => set({ theme: detectThemeByTime(), auto: true }),
      tick: () => {
        if (get().auto) set({ theme: detectThemeByTime() })
      },
    }),
    { name: 'barbercrm-theme' }
  )
)

export default useThemeStore
