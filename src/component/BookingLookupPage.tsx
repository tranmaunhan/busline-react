import type { FormEventHandler, ReactNode } from 'react'
import { Phone, Ticket } from 'lucide-react'

interface BookingLookupPageProps {
  header: ReactNode
  bookingCode: string
  phone: string
  suggestedPhone?: string | null
  onBookingCodeChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onBackHome: () => void
}

export default function BookingLookupPage({
  header,
  bookingCode,
  phone,
  suggestedPhone,
  onBookingCodeChange,
  onPhoneChange,
  onSubmit,
  onBackHome,
}: BookingLookupPageProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_45%,_#f8fbff_100%)] text-slate-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        {header}

        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:p-10">
              <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                Tra cuu ve
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-black text-slate-950 sm:text-4xl">
                Tim nhanh thong tin don dat ve cua ban
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Nhap ma dat ve va so dien thoai da dung khi dat cho de he thong doi chieu thong tin. Form nay da san
                sang de noi API tra cuu o buoc tiep theo.
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="lookup-booking-code" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    BookingCode
                  </label>
                  <div className="flex items-center rounded-[1.5rem] border border-sky-100 bg-sky-50/70 px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                    <Ticket className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                    <input
                      id="lookup-booking-code"
                      type="text"
                      value={bookingCode}
                      onChange={(event) => onBookingCodeChange(event.target.value)}
                      placeholder="VD: SAIGONSTBK123"
                      className="w-full bg-transparent py-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lookup-phone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Sdt
                  </label>
                  <div className="flex items-center rounded-[1.5rem] border border-sky-100 bg-sky-50/70 px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                    <Phone className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                    <input
                      id="lookup-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => onPhoneChange(event.target.value)}
                      placeholder="Nhap so dien thoai"
                      className="w-full bg-transparent py-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    Tra cuu don
                  </button>

                  <button
                    type="button"
                    onClick={onBackHome}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ve trang chu
                  </button>
                </div>
              </form>
            </section>

            <aside className="rounded-[2rem] border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f7fbff_100%)] p-6 shadow-[0_20px_60px_rgba(148,163,184,0.16)] sm:p-8">
              <div className="rounded-[1.75rem] bg-slate-950 px-5 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                  Huong dan nhanh
                </div>
                <div className="mt-3 text-2xl font-black leading-tight">
                  Can dung thong tin giong luc dat ve
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-300">
                  He thong se doi chieu ma dat ve va so dien thoai de hien thi dung ket qua tra cuu.
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Buoc 1</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">Nhap BookingCode chinh xac</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">Ma nay thuong co dang nhu SAIGONSTBK123.</div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Buoc 2</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">Dung dung so dien thoai da dat</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">Neu sai so dien thoai, ket qua tra cuu co the khong khop.</div>
                </div>

                <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Goi y</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    {suggestedPhone
                      ? `So dien thoai dang dang nhap cua ban la ${suggestedPhone}. Ban co the su dung ngay de tra cuu.`
                      : 'Dang nhap se giup ban dien nhanh thong tin so dien thoai va di tiep toi don da dat.'}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
