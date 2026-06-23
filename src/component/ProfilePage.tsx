import type { ReactNode } from 'react'
import { Home, KeyRound, Mail, Phone, SquarePen, Ticket, UserRound } from 'lucide-react'
import type { AuthUser } from '../api/config'

interface ProfilePageProps {
  header: ReactNode
  user: AuthUser
  onBackHome: () => void
  onViewBookings: () => void
  onEditProfile: () => void
  onChangePassword: () => void
}

const getDisplayName = (user: AuthUser) => user.fullName || user.username || 'Chưa cập nhật'

export default function ProfilePage({
  header,
  user,
  onBackHome,
  onViewBookings,
  onEditProfile,
  onChangePassword,
}: ProfilePageProps) {
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

              <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
                Thông tin cá nhân
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Kiểm tra nhanh thông tin tài khoản của bạn. Giao diện giữ theo dạng form dọc và chỉ hiển thị tên, email, số điện thoại.
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f7fbff_100%)] p-5 shadow-sm sm:p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <UserRound className="h-8 w-8" />
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xl font-black text-slate-950">{getDisplayName(user)}</div>
                  <div className="mt-1 text-sm text-slate-500">@{user.username}</div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      <UserRound className="h-4 w-4 shrink-0 text-sky-500" />
                      Tên
                    </label>
                    <div className="rounded-[1.25rem] border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {getDisplayName(user)}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      <Mail className="h-4 w-4 shrink-0 text-sky-500" />
                      Email
                    </label>
                    <div className="rounded-[1.25rem] border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {user.email || 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      <Phone className="h-4 w-4 shrink-0 text-sky-500" />
                      Số điện thoại
                    </label>
                    <div className="rounded-[1.25rem] border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {user.phone || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    <SquarePen className="h-4 w-4 shrink-0" />
                    Chỉnh sửa thông tin
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
      </div>
    </div>
  )
}
