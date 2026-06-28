import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Home, KeyRound, Mail, Phone, Save, Ticket, UserRound } from 'lucide-react'
import type { AuthUser, UpdateProfileRequest } from '../api/config'

interface ProfilePageProps {
  header: ReactNode
  footer?: ReactNode
  user: AuthUser
  onBackHome: () => void
  onViewBookings: () => void
  onUpdateProfile: (payload: UpdateProfileRequest) => Promise<void>
  onChangePassword: () => void
}

const getDisplayName = (user: AuthUser) => user.fullName || user.username || 'Chưa cập nhật'

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function ProfilePage({
  header,
  footer,
  user,
  onBackHome,
  onViewBookings,
  onUpdateProfile,
  onChangePassword,
}: ProfilePageProps) {
  const [form, setForm] = useState<UpdateProfileRequest>({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    })
    setSubmitError(null)
  }, [user.email, user.fullName, user.phone])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    }

    if (!payload.fullName) {
      setSubmitError('Vui lòng nhập họ tên.')
      return
    }

    if (!payload.email) {
      setSubmitError('Vui lòng nhập email.')
      return
    }

    if (!isValidEmail(payload.email)) {
      setSubmitError('Email không hợp lệ.')
      return
    }

    if (!payload.phone) {
      setSubmitError('Vui lòng nhập số điện thoại.')
      return
    }

    try {
      setSaving(true)
      setSubmitError(null)
      await onUpdateProfile(payload)
    } catch (error: any) {
      console.error('Profile update error:', error)
      setSubmitError(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_45%,_#f8fbff_100%)] text-slate-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        {header}

        <main className="mx-auto flex w-full max-w-4xl flex-1 items-start px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
          <section className="w-full rounded-[2rem] border border-sky-100 bg-white/95 p-5 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:p-8">
            <div className="mx-auto max-w-2xl">
              <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                Hồ sơ cá nhân
              </div>

              <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">Thông tin cá nhân</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Cập nhật trực tiếp họ tên, email và số điện thoại để hệ thống dùng đúng thông tin khi đặt vé và liên hệ.
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f7fbff_100%)] p-5 shadow-sm sm:p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <UserRound className="h-8 w-8" />
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xl font-black text-slate-950">{getDisplayName(user)}</div>
                  <div className="mt-1 text-sm text-slate-500">@{user.username}</div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      <UserRound className="h-4 w-4 shrink-0 text-sky-500" />
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      placeholder="Nhập họ và tên"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      <Mail className="h-4 w-4 shrink-0 text-sky-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Nhập email"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      <Phone className="h-4 w-4 shrink-0 text-sky-500" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="Nhập số điện thoại"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  {submitError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {submitError}
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300 disabled:hover:translate-y-0"
                    >
                      <Save className="h-4 w-4 shrink-0" />
                      {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>

                    <button
                      type="button"
                      onClick={onChangePassword}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <KeyRound className="h-4 w-4 shrink-0" />
                      Thay đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onViewBookings}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <Ticket className="h-4 w-4 shrink-0" />
                  Xem đơn đã đặt
                </button>

                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Home className="h-4 w-4 shrink-0" />
                  Về trang chủ
                </button>
              </div>
            </div>
          </section>
        </main>

        {footer}
      </div>
    </div>
  )
}
