import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,

      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user }),

      logout: () =>
        set({ token: null, refreshToken: null, user: null }),
    }),
    {
      name: 'barbercrm-auth',
    }
  )
)

export default useAuthStore
