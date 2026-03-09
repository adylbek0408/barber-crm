import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import useAuthStore from '../store/authStore'
import InstallPWA from '../components/InstallPWA'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  async function handleLogin() {
    if (!username || !password) { setErr('Заполните все поля'); return }
    setLoading(true); setErr('')
    try {
      const res = await authApi.login(username.trim(), password)
      const { access, refresh, role, full_name } = res.data
      setAuth(access, refresh, { role, full_name, username: username.trim() })
      if (role === 'barber') navigate('/barber')
      else if (role === 'owner') navigate('/owner')
      else if (role === 'platform_admin') navigate('/admin')
    } catch (e) {
      if (e.code === 'ERR_NETWORK') setErr('Сервер недоступен')
      else if (e.response?.status === 401) setErr('Неверный логин или пароль')
      else setErr(`Ошибка ${e.response?.status || e.message}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 sm:px-6"
      style={{
        background: 'var(--bg)',
        paddingTop: 'calc(env(safe-area-inset-top) + 48px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
      }}>

      {/* Центр */}
      <div className="afu">
        {/* Лого */}
        <div className="mb-10">
          <div className="logo-box w-[76px] h-[76px] mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--ic-2)" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 2v12M6 14c0 2.2 1.8 4 4 4h4a4 4 0 0 0 0-8H6"/>
              <path d="M18 2v12"/>
            </svg>
          </div>
          <h1 className="text-[40px] font-black tracking-tight leading-none mb-2" style={{ color: 'var(--tx)' }}>
            BarberCRM
          </h1>
          <p className="text-[15px]" style={{ color: 'var(--tx-4)' }}>
            Платформа для барбершопов
          </p>
        </div>

        {/* Ошибка */}
        {err && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm asi"
            style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-tx)' }}>
            {err}
          </div>
        )}

        {/* Поля */}
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--tx-4)' }}>Логин</p>
            <input type="text" value={username}
              onChange={(e) => { setUsername(e.target.value); setErr('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Введите логин"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              className="input-field" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--tx-4)' }}>Пароль</p>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); setErr('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Введите пароль"
                className="input-field pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--ic)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading} className="btn-primary mt-3">
          {loading
            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v8z"/>
              </svg> Входим...</>
            : 'Войти'}
        </button>
      </div>

      {/* Низ */}
      <div className="space-y-3">
        <InstallPWA />
        <p className="text-center text-[12px]" style={{ color: 'var(--tx-5)' }}>
          BarberCRM · iAnt Studio
        </p>
      </div>
    </div>
  )
}
