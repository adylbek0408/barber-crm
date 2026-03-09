/**
 * Общий диалог подтверждения (удаление и т.п.).
 * Использует CSS-переменные темы (--danger-*, --bg-deep, --tx).
 */
export default function ConfirmModal({ text, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="font-bold text-[17px] mb-2 text-center" style={{ color: 'var(--tx)' }}>{text}</h3>
        <p className="text-center text-[13px] mb-6" style={{ color: 'var(--tx-3)' }}>
          Это действие нельзя отменить
        </p>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="btn-danger mb-3"
        >
          {loading ? 'Удаляем...' : 'Удалить'}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-2xl font-semibold text-[15px]"
          style={{ background: 'var(--bg-deep)', color: 'var(--tx-3)' }}
        >
          Отмена
        </button>
      </div>
    </div>
  )
}
