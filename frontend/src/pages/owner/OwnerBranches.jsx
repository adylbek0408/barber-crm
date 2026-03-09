import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ownerApi } from '../../api'
import BottomNav from '../../components/BottomNav'

function ConfirmModal({ text, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="font-bold text-[17px] mb-2 text-center" style={{ color: 'var(--tx)' }}>{text}</h3>
        <p className="text-center text-[13px] mb-6" style={{ color: 'var(--tx-3)' }}>
          Это действие нельзя отменить
        </p>
        <button onClick={onConfirm} disabled={loading}
          className="w-full py-3 rounded-2xl font-semibold text-[15px] mb-3"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}>
          {loading ? 'Удаляем...' : 'Удалить'}
        </button>
        <button onClick={onCancel}
          className="w-full py-3 rounded-2xl font-semibold text-[15px]"
          style={{ background: 'var(--bg-deep)', color: 'var(--tx-3)' }}>
          Отмена
        </button>
      </div>
    </div>
  )
}

export default function OwnerBranches() {
  const [branches, setBranches] = useState([])

  // Создание
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })
  const [loading, setLoading] = useState(false)

  // Редактирование
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', address: '' })
  const [saving, setSaving] = useState(false)

  // Удаление
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await ownerApi.getBranches()
      setBranches(res.data)
    } catch { toast.error('Ошибка загрузки') }
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

  async function handleSaveEdit() {
    if (!editForm.name || !editForm.address) { toast.error('Заполните все поля'); return }
    setSaving(true)
    try {
      await ownerApi.updateBranch(editId, editForm)
      toast.success('Филиал обновлён!')
      setEditId(null)
      loadData()
    } catch { toast.error('Ошибка') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await ownerApi.deleteBranch(deleteId)
      toast.success('Филиал удалён')
      setDeleteId(null)
      loadData()
    } catch { toast.error('Ошибка удаления') }
    finally { setDeleting(false) }
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#09090b' }}>

      {/* Модал удаления */}
      {deleteId && (
        <ConfirmModal
          text="Удалить филиал?"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <header className="px-5 pb-5 page-header">
        <h1 className="text-[26px] font-black" style={{ color: 'var(--tx)' }}>Филиалы</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tx-4)' }}>{branches.length} локаций</p>
      </header>

      <div className="px-4 space-y-4">

        {/* Кнопка добавить */}
        {!editId && (
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
        )}

        {/* Форма создания */}
        {showForm && !editId && (
          <div className="glass-card space-y-3 asi">
            <p className="text-white font-bold text-lg">Новый филиал</p>
            <input placeholder="Название (напр. Центр, Юг)" value={form.name}
              autoCorrect="off"
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field" />
            <input placeholder="Адрес" value={form.address}
              autoCorrect="off"
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="input-field" />
            <button onClick={handleCreate} disabled={loading} className="btn-primary">
              {loading ? 'Создаём...' : 'Создать филиал'}
            </button>
          </div>
        )}

        {/* Форма редактирования */}
        {editId && (
          <div className="glass-card space-y-3 asi">
            <p className="text-white font-bold text-lg">Редактировать филиал</p>
            <input placeholder="Название" value={editForm.name}
              autoCorrect="off"
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              className="input-field" />
            <input placeholder="Адрес" value={editForm.address}
              autoCorrect="off"
              onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
              className="input-field" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditId(null)} className="btn-outline">
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Пустое состояние */}
        {branches.length === 0 && !showForm && !editId && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-deep)', border: '1px solid var(--bd-2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ic)" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p className="text-white/40 font-medium">Филиалов пока нет</p>
          </div>
        )}

        {/* Список филиалов */}
        {branches.map((b, idx) => (
          <div key={b.id} className="glass-card afu" style={{ animationDelay: `${idx * 0.07}s` }}>
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
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Редактировать */}
                <button
                  onClick={() => { setEditId(b.id); setEditForm({ name: b.name, address: b.address }); setShowForm(false) }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                {/* Удалить */}
                <button
                  onClick={() => setDeleteId(b.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="branches" />
    </div>
  )
}
