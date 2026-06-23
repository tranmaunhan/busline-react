import type { ReactNode } from 'react'
import { CalendarDays, CreditCard, Home, MapPin, RefreshCw, Ticket } from 'lucide-react'
import type { BookingResponse } from '../api/config'

interface MyBookingsPageProps {
  header: ReactNode
  bookings: BookingResponse[]
  loading: boolean
  error: string | null
  onReload: () => void
  onBackHome: () => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getStatusLabel = (status: number | string) => {
  if (status === 1 || status === '1') return 'Đã thanh toán'
  if (status === 0 || status === '0') return 'Chờ thanh toán'
  return `Trạng thái ${status}`
}

const getStatusClassName = (status: number | string) => {
  if (status === 1 || status === '1') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (status === 0 || status === '0') {
    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

export default function MyBookingsPage({
  header,
  bookings,
  loading,
  error,
  onReload,
  onBackHome,
}: MyBookingsPageProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_45%,_#f8fbff_100%)] text-slate-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        {header}

        <main className="mx-auto flex w-full max-w-6xl flex-1 items-start px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
          <section className="w-full rounded-[2rem] border border-sky-100 bg-white/95 p-5 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                  Đơn đã đặt
                </div>
                <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
                  Lịch sử đơn hàng
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Kiểm tra toàn bộ đơn vé đã tạo, trạng thái thanh toán, thông tin ghế và lịch khởi hành.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onReload}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  Tải lại
                </button>

                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Home className="h-4 w-4 shrink-0" />
                  Về trang chủ
                </button>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  Đang tải danh sách đơn hàng...
                </div>
              ) : error ? (
                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : bookings.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  Chưa có đơn hàng nào để hiển thị.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <article
                      key={booking.bookingId}
                      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Mã đơn
                          </div>
                          <div className="mt-1 text-2xl font-black text-slate-950">
                            {booking.bookingCode}
                          </div>
                        </div>

                        <div className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${getStatusClassName(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-4">
                        <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                            Tuyến đường
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-900">
                            {booking.routeOrigin} → {booking.routeDestination}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Đón: {booking.pickupLocationName}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Trả: {booking.dropoffLocationName}
                          </div>
                        </div>

                        <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <CalendarDays className="h-4 w-4 shrink-0 text-sky-500" />
                            Thời gian
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-900">
                            Đặt vé: {formatDateTime(booking.bookingTime)}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Khởi hành: {formatDateTime(booking.tripDepartureTime)}
                          </div>
                        </div>

                        <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <CreditCard className="h-4 w-4 shrink-0 text-sky-500" />
                            Thanh toán
                          </div>
                          <div className="mt-2 text-lg font-black text-slate-950">
                            {formatCurrency(booking.totalAmount)}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Trip ID: {booking.tripId}
                          </div>
                        </div>

                        <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <Ticket className="h-4 w-4 shrink-0 text-sky-500" />
                            Ghế đã đặt
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {booking.tickets.length > 0 ? (
                              booking.tickets.map((ticket) => (
                                <span
                                  key={ticket.ticketId}
                                  className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-800 ring-1 ring-slate-200"
                                >
                                  {ticket.seatCode}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-500">Chưa có thông tin ghế.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
