import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, Loader2, Lock, ShieldAlert, X } from 'lucide-react'

interface ChangePasswordModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (payload: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }) => Promise<void>
}

export default function ChangePasswordModal({
  show,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!show) return null

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    if (loading) return
    resetForm()
    onClose()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Vui lòng nhập đầy đủ các trường mật khẩu.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu mới không khớp.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit({
        currentPassword,
        newPassword,
        confirmNewPassword,
      })
      resetForm()
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Không thể thay đổi mật khẩu. Vui lòng kiểm tra lại thông tin.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.24)]"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-sky-50 bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_100%)] px-5 py-5 sm:px-6">
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 sm:text-xl">
            <KeyRound className="h-5 w-5 text-orange-500" />
            Thay đổi mật khẩu
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : null}

          <div>
            <label htmlFor="current-password" className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Mật khẩu hiện tại
            </label>
            <div className="flex items-center rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4">
              <Lock className="mr-3 h-4 w-4 shrink-0 text-slate-400" />
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Mật khẩu mới
            </label>
            <div className="flex items-center rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4">
              <Lock className="mr-3 h-4 w-4 shrink-0 text-slate-400" />
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Xác nhận mật khẩu mới
            </label>
            <div className="flex items-center rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4">
              <Lock className="mr-3 h-4 w-4 shrink-0 text-slate-400" />
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              'Đổi mật khẩu'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
