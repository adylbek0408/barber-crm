import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 7:00 – 20:00 → light | 20:00 – 7:00 → dark
function detectTheme() {
  const h = new Date().getHours()
  return h >= 7 && h < 20 ? 'light' : 'dark'
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: detectTheme(),
      auto: true,                          // если true — тема авто по времени
      setTheme: (theme) => set({ theme, auto: false }),
      resetAuto: () => set({ theme: detectTheme(), auto: true }),
      tick: () => {
        if (get().auto) set({ theme: detectTheme() })
      },
    }),
    { name: 'barbercrm-theme' }
  )
)

export default useThemeStore
