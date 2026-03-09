import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Регистрируем Service Worker
// При новой версии — показываем уведомление пользователю
registerSW({
  onNeedRefresh() {
    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14 }}>Доступна новая версия</span>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              window.location.reload()
            }}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-tx)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Обновить
          </button>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: 'var(--bg-el)',
          color: 'var(--tx)',
          border: '1px solid var(--bd-2)',
          borderRadius: 12,
        },
      }
    )
  },
  onOfflineReady() {
    toast('Готово к работе офлайн', {
      duration: 3000,
      style: {
        background: 'var(--bg-el)',
        color: 'var(--tx)',
        borderRadius: 12,
        border: '1px solid var(--bd-2)',
      },
    })
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-el)',
            color: 'var(--tx)',
            borderRadius: '12px',
            border: '1px solid var(--bd-2)',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
