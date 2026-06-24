import type { ReactNode } from 'react'
import {
  CalendarDays,
  CreditCard,
  Home,
  MapPin,
  RefreshCw,
  Ticket,
  XCircle,
} from 'lucide-react'
import type { BookingResponse } from '../api/config'

interface MyBookingsPageProps {
  header: ReactNode
  footer?: ReactNode
  bookings: BookingResponse[]
  loading: boolean
  error: string | null
  cancellingBookingId: number | null
  onReload: () => void
  onBackHome: () => void
  onPayBooking: (bookingId: number) => void
  onCancelBooking: (bookingId: number) => void
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

const isPaidStatus = (status: number | string) => status === 1 || status === '1'
const isPendingStatus = (status: number | string) => status === 0 || status === '0'

const getStatusClassName = (status: number | string) => {
  if (isPaidStatus(status)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (isPendingStatus(status)) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

const getStatusDotClassName = (status: number | string) => {
  if (isPaidStatus(status)) return 'bg-emerald-500'
  if (isPendingStatus(status)) return 'bg-amber-500'
  return 'bg-slate-400'
}

const getSafeAmount = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  )
}

function BookingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="h-6 w-44 rounded-full bg-slate-200" />
            </div>
            <div className="h-8 w-28 rounded-full bg-slate-200" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((box) => (
              <div key={box} className="h-28 rounded-[1.25rem] bg-slate-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyBookingsPage({
  header,
  footer,
  bookings,
  loading,
  error,
  cancellingBookingId,
  onReload,
  onBackHome,
  onPayBooking,
  onCancelBooking,
}: MyBookingsPageProps) {
  const paidBookings = bookings.filter((booking) => isPaidStatus(booking.status))
  const pendingBookings = bookings.filter((booking) => isPendingStatus(booking.status))
  const totalPaidAmount = paidBookings.reduce(
    (total, booking) => total + getSafeAmount(booking.totalAmount),
    0,
  )

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-12rem] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-[-12rem] top-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {header}

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-24 pt-4 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
          <section className="rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  <Ticket className="h-3.5 w-3.5" />
                  Đơn vé của tôi
                </div>

                <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Quản lý vé nhanh, rõ ràng và dễ theo dõi
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Theo dõi trạng thái thanh toán, thời gian khởi hành, điểm đón trả và ghế đã đặt trong một màn hình duy nhất.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <button
                  type="button"
                  onClick={onReload}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 sm:col-span-1"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  Tải lại
                </button>

                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 sm:col-span-1"
                >
                  <Home className="h-4 w-4 shrink-0" />
                  Trang chủ
                </button>

                <div className="col-span-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800 sm:col-span-1 lg:col-span-1">
                  Vé chờ thanh toán nên được xử lý sớm để tránh hết thời gian giữ ghế.
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Tổng đơn"
                value={bookings.length}
                helper="Tất cả vé đã tạo"
              />

              <SummaryCard
                label="Chờ thanh toán"
                value={pendingBookings.length}
                helper="Cần hoàn tất giao dịch"
              />

              <SummaryCard
                label="Đã thanh toán"
                value={formatCurrency(totalPaidAmount)}
                helper={`${paidBookings.length} đơn đã xác nhận`}
              />
            </div>
          </section>

          <section className="mt-6">
            {loading ? (
              <BookingSkeleton />
            ) : error ? (
              <div className="rounded-[1.75rem] border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <XCircle className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-black text-slate-950">
                        Không thể tải danh sách đơn
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-rose-700">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onReload}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                  </button>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-5 py-14 text-center shadow-sm sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-600">
                  <Ticket className="h-8 w-8" />
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  Bạn chưa có đơn vé nào
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                  Khi bạn đặt vé thành công, thông tin chuyến đi, ghế và trạng thái thanh toán sẽ xuất hiện tại đây.
                </p>

                <button
                  type="button"
                  onClick={onBackHome}
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  <Home className="h-4 w-4" />
                  Tìm chuyến xe ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const pending = isPendingStatus(booking.status)
                  const isCancelling = cancellingBookingId === booking.bookingId
                  const seats = booking.tickets ?? []

                  return (
                    <article
                      key={booking.bookingId}
                      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
                    >
                      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                  Mã đơn
                                </span>

                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getStatusClassName(
                                    booking.status,
                                  )}`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${getStatusDotClassName(
                                      booking.status,
                                    )}`}
                                  />
                                  {getStatusLabel(booking.status)}
                                </span>
                              </div>

                              <h2 className="mt-2 break-all text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                                {booking.bookingCode}
                              </h2>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                                Tổng tiền
                              </p>
                              <p className="mt-1 text-xl font-black text-slate-950">
                                {formatCurrency(getSafeAmount(booking.totalAmount))}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-[1.25rem] bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                                Tuyến đường
                              </div>

                              <p className="mt-3 text-sm font-black leading-6 text-slate-950">
                                {booking.routeOrigin} → {booking.routeDestination}
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                Đón:{' '}
                                <span className="font-semibold text-slate-700">
                                  {booking.pickupLocationName}
                                </span>
                              </p>

                              <p className="text-sm leading-6 text-slate-500">
                                Trả:{' '}
                                <span className="font-semibold text-slate-700">
                                  {booking.dropoffLocationName}
                                </span>
                              </p>
                            </div>

                            <div className="rounded-[1.25rem] bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                <CalendarDays className="h-4 w-4 shrink-0 text-orange-500" />
                                Thời gian
                              </div>

                              <p className="mt-3 text-sm leading-6 text-slate-500">
                                Đặt vé
                                <span className="mt-0.5 block font-black text-slate-950">
                                  {formatDateTime(booking.bookingTime)}
                                </span>
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                Khởi hành
                                <span className="mt-0.5 block font-black text-slate-950">
                                  {formatDateTime(booking.tripDepartureTime)}
                                </span>
                              </p>
                            </div>

                            <div className="rounded-[1.25rem] bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                <Ticket className="h-4 w-4 shrink-0 text-orange-500" />
                                Ghế đã đặt
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {seats.length > 0 ? (
                                  seats.map((ticket) => (
                                    <span
                                      key={ticket.ticketId}
                                      className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-slate-800 ring-1 ring-slate-200"
                                    >
                                      {ticket.seatCode}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm leading-6 text-slate-500">
                                    Chưa có thông tin ghế.
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="rounded-[1.25rem] bg-slate-50 p-4">
                              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                <CreditCard className="h-4 w-4 shrink-0 text-orange-500" />
                                Thông tin khác
                              </div>

                              <p className="mt-3 text-sm leading-6 text-slate-500">
                                Mã chuyến
                                <span className="mt-0.5 block font-black text-slate-950">
                                  #{booking.tripId}
                                </span>
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                Số vé
                                <span className="mt-0.5 block font-black text-slate-950">
                                  {seats.length} vé
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <aside className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6 lg:border-l lg:border-t-0">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                              Hành động
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {pending
                                ? 'Đơn đang giữ ghế. Bạn có thể thanh toán hoặc hủy vé nếu không còn nhu cầu.'
                                : 'Đơn đã hoàn tất. Vui lòng đến đúng điểm đón trước giờ khởi hành.'}
                            </p>
                          </div>

                          {pending ? (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                              <button
                                type="button"
                                onClick={() => onPayBooking(booking.bookingId)}
                                disabled={cancellingBookingId !== null}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <CreditCard className="h-4 w-4 shrink-0" />
                                Thanh toán ngay
                              </button>

                              <button
                                type="button"
                                onClick={() => onCancelBooking(booking.bookingId)}
                                disabled={cancellingBookingId !== null}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <XCircle className="h-4 w-4 shrink-0" />
                                {isCancelling ? 'Đang hủy...' : 'Hủy vé'}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
                              Vé đã được xác nhận thanh toán.
                            </div>
                          )}
                        </aside>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </main>

        {footer}
      </div>
    </div>
  )
}
