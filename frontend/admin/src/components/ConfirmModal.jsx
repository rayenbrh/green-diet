import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirmer', danger, busy, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={busy ? () => {} : onClose} className="relative z-[600]">
      <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl border border-[rgba(74,124,89,0.18)] bg-white p-6 shadow-xl">
          <DialogTitle className="text-lg font-semibold text-[#2d5a3d]">{title}</DialogTitle>
          {description && <p className="mt-2 text-sm text-[#6b7280]">{description}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#374151]"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                danger ? 'bg-red-600' : 'bg-[#2d5a3d]'
              }`}
            >
              {busy ? '…' : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
