import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api'
import BottomNav from '../../components/BottomNav'

export default function OwnerBranches() {
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const res = await ownerApi.getBranches()
    setBranches(res.data)
  }

  async function handleCreate() {
    if (!form.name || !form.address) { toast.error('Заполните все поля'); return }
    setLoading(true)
    try {
      await ownerApi.createBranch(form)
      toast.success('Филиал создан!')
      setShowForm(false)
      setForm({ name: '', address: '' })
      loadData()
    } catch { toast.error('Ошибка') }
    finally { setLoading(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Удалить филиал?')) return
    await ownerApi.deleteBranch(id)
    toast.success('Удалён')
    loadData()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      <header className="px-5 pt-14 pb-5">
        <h1 className="text-[26px] font-black text-white">Филиалы</h1>
        <p className="text-white/30 text-sm mt-1">{branches.length} локаций</p>
      </header>

      <div className="px-4 space-y-4">
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-outline' : 'btn-primary'}>
          {showForm ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg> Отмена</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg> Добавить филиал</>
          )}
        </button>

        {showForm && (
          <div className="glass-card space-y-3 asi">
            <p className="text-white font-bold text-lg">Новый филиал</p>
            <input placeholder="Название (напр. Центр, Юг)" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" />
            <input placeholder="Адрес" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-field" />
            <button onClick={handleCreate} disabled={loading} className="btn-primary">
              {loading ? 'Создаём...' : 'Создать филиал'}
            </button>
          </div>
        )}

        {branches.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p className="text-white/40 font-medium">Филиалов пока нет</p>
          </div>
        ) : (
          branches.map((b, idx) => (
            <div key={b.id} className="glass-card afu"
              style={{ animationDelay: `${idx * 0.07}s` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-[16px]">{b.name}</p>
                    <span className={b.is_active ? 'badge-green' : 'badge-red'}>
                      {b.is_active ? 'Активен' : 'Закрыт'}
                    </span>
                  </div>
                  <p className="text-white/35 text-sm">{b.address}</p>
                </div>
                <button onClick={() => handleDelete(b.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav active="branches" />
    </div>
  )
}
