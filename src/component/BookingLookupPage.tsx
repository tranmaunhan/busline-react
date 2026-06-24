import { useMemo } from 'react'
import type { FormEventHandler, ReactNode } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Copy,
  CreditCard,
  Download,
  Home,
  Info,
  MapPin,
  Phone,
  QrCode,
  Search,
  Ticket,
} from 'lucide-react'
import type { BookingResponse } from '../api/config'
import {
  buildVietQrUrl,
  PAYMENT_ACCOUNT_NAME,
  PAYMENT_ACCOUNT_NO,
} from '../paymentQr'

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

const getBookingStatusLabel = (status: number | string) => {
  if (status === 1 || status === '1') return 'Đã thanh toán'
  if (status === 0 || status === '0') return 'Chờ thanh toán'
  return `Trạng thái ${status}`
}

const isPendingPaymentStatus = (status: number | string) => status === 0 || status === '0'

interface BookingLookupPageProps {
  header: ReactNode
  footer?: ReactNode
  bookingCode: string
  phone: string
  suggestedPhone?: string | null
  isLoading?: boolean
  errorMessage?: string | null
  bookingResult?: BookingResponse | null
  onBookingCodeChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onBackHome: () => void
}

export default function BookingLookupPage({
  header,
  footer,
  bookingCode,
  phone,
  suggestedPhone,
  isLoading = false,
  errorMessage,
  bookingResult,
  onBookingCodeChange,
  onPhoneChange,
  onSubmit,
  onBackHome,
}: BookingLookupPageProps) {
  const pendingPaymentQrUrl = useMemo(() => {
    if (!bookingResult || !isPendingPaymentStatus(bookingResult.status)) return ''
    return buildVietQrUrl(bookingResult.totalAmount, bookingResult.bookingCode)
  }, [bookingResult])

  const handleDownloadQr = async () => {
    if (!pendingPaymentQrUrl || !bookingResult) return

    try {
      const response = await fetch(pendingPaymentQrUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `vietqr-${bookingResult.bookingCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch {
      window.open(pendingPaymentQrUrl, '_blank')
    }
  }

  const handleCopyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
      }

      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'absolute'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    } catch {
      // No-op fallback
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_45%,_#f8fbff_100%)] text-slate-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        {header}

        <main className="mx-auto flex w-full max-w-[1400px] flex-1 items-start px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-8">
          <section className="w-full rounded-[2rem] border border-sky-100 bg-white/95 p-4 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="h-fit rounded-[1.75rem] border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f7fbff_100%)] p-6 shadow-sm">
                <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-600">
                  Tra cứu vé
                </div>
                <h1 className="mt-4 text-2xl font-black text-slate-950">Kiểm tra đơn hàng</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Nhập thông tin bên dưới để xem chi tiết vé của bạn và tiếp tục thanh toán nếu đơn hàng đang chờ xử lý.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="lookup-booking-code" className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                      Mã đặt chỗ
                    </label>
                    <div className="flex items-center rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                      <Ticket className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                      <input
                        id="lookup-booking-code"
                        type="text"
                        required
                        value={bookingCode}
                        onChange={(event) => onBookingCodeChange(event.target.value)}
                        placeholder="VD: SAIGONSTBK123"
                        className="w-full bg-transparent py-3.5 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lookup-phone" className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                      Số điện thoại
                    </label>
                    <div className="flex items-center rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                      <Phone className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                      <input
                        id="lookup-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(event) => onPhoneChange(event.target.value)}
                        placeholder={suggestedPhone || 'Nhập số điện thoại'}
                        className="w-full bg-transparent py-3.5 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col flex-wrap gap-3 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)] transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_14px_30px_rgba(249,115,22,0.3)] disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      <Search className="h-4 w-4" />
                      {isLoading ? 'Đang tra cứu...' : 'Tra cứu đơn'}
                    </button>

                    <button
                      type="button"
                      onClick={onBackHome}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Home className="h-4 w-4 text-slate-500" />
                      Trang chủ
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex min-h-[320px] flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-6">
                {errorMessage ? (
                  <div className="mb-5 flex items-start gap-3 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    <p>{errorMessage}</p>
                  </div>
                ) : null}

                {bookingResult ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/60">
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                          Mã đơn vé của bạn
                        </div>
                        <div className="mt-1 truncate text-2xl font-black text-slate-950">
                          {bookingResult.bookingCode}
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-4 py-1.5 text-sm font-bold ring-1 ${
                          isPendingPaymentStatus(bookingResult.status)
                            ? 'bg-amber-50 text-amber-700 ring-amber-200'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }`}
                      >
                        {getBookingStatusLabel(bookingResult.status)}
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="grid h-fit gap-4 sm:grid-cols-2">
                        <div className="min-w-0 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/60">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                            <span className="truncate">Tuyến đường</span>
                          </div>
                          <div className="mt-3 text-sm font-bold text-slate-900">
                            {bookingResult.routeOrigin} <span className="px-1 font-medium text-slate-400">→</span> {bookingResult.routeDestination}
                          </div>
                          <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                            <p className="truncate"><span className="font-semibold text-slate-400">Đón:</span> {bookingResult.pickupLocationName}</p>
                            <p className="truncate"><span className="font-semibold text-slate-400">Trả:</span> {bookingResult.dropoffLocationName}</p>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/60">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <CalendarDays className="h-4 w-4 shrink-0 text-indigo-400" />
                            <span className="truncate">Thời gian</span>
                          </div>
                          <div className="mt-3 flex flex-col gap-2">
                            <div className="text-sm">
                              <span className="mb-0.5 block text-xs font-semibold text-slate-400">Đặt vé lúc:</span>
                              <span className="font-medium text-slate-900">{formatDateTime(bookingResult.bookingTime)}</span>
                            </div>
                            <div className="text-sm">
                              <span className="mb-0.5 block text-xs font-semibold text-slate-400">Khởi hành:</span>
                              <span className="font-medium text-slate-900">{formatDateTime(bookingResult.tripDepartureTime)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/60">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            <CreditCard className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="truncate">Thanh toán</span>
                          </div>
                          <div className="mt-3 truncate text-xl font-black text-slate-950">
                            {formatCurrency(bookingResult.totalAmount)}
                          </div>
                          <div className="mt-2 truncate text-sm text-slate-500">
                            Mã chuyến: <span className="font-semibold text-slate-700">{bookingResult.tripId}</span>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/60">
                          <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            Ghế đã đặt
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {bookingResult.tickets.map((ticket) => (
                              <div
                                key={ticket.ticketId}
                                className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-800 ring-1 ring-sky-100"
                              >
                                {ticket.seatCode} - <span className="font-medium">{ticket.seatType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isPendingPaymentStatus(bookingResult.status) ? (
                        <div className="h-fit rounded-[1.5rem] border border-amber-200 bg-white p-5 shadow-sm ring-1 ring-amber-100">
                          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-amber-700 ring-1 ring-amber-200">
                            <QrCode className="h-4 w-4 shrink-0" />
                            Cần thanh toán
                          </div>

                          <div className="mx-auto mt-4 max-w-[200px] rounded-[1.25rem] border border-slate-200 bg-white p-2.5 shadow-sm">
                            <img
                              src={pendingPaymentQrUrl}
                              alt="QR thanh toán đơn đặt vé"
                              className="aspect-square w-full rounded-xl bg-white object-contain"
                            />
                          </div>

                          <div className="mt-4 space-y-2.5 rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Số tiền</span>
                              <span className="font-black text-rose-600">{formatCurrency(bookingResult.totalAmount)}</span>
                            </div>
                            <hr className="border-slate-200" />
                            <div className="flex items-start justify-between gap-3">
                              <span className="mt-0.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Tài khoản</span>
                              <div className="text-right">
                                <div className="font-black text-slate-900">{PAYMENT_ACCOUNT_NO}</div>
                                <div className="mt-0.5 text-xs font-medium text-slate-500">{PAYMENT_ACCOUNT_NAME}</div>
                              </div>
                            </div>
                            <hr className="border-slate-200" />
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Nội dung</span>
                              <span className="max-w-[140px] truncate text-right font-black text-slate-900" title={bookingResult.bookingCode}>
                                {bookingResult.bookingCode}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleCopyText(bookingResult.bookingCode)}
                              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 hover:shadow-md"
                            >
                              <Copy className="h-4 w-4 shrink-0 opacity-80" />
                              Sao chép nội dung CK
                            </button>

                            <div className="grid grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                onClick={() => handleCopyText(PAYMENT_ACCOUNT_NO)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Copy className="h-4 w-4 shrink-0 text-slate-400" />
                                Copy STK
                              </button>

                              <button
                                type="button"
                                onClick={handleDownloadQr}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Download className="h-4 w-4 shrink-0 text-slate-400" />
                                Tải mã QR
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : !errorMessage ? (
                  <div className="flex h-full flex-1 flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white/50 px-6 py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                      <Info className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">Chưa có thông tin hiển thị</h3>
                    <p className="mt-2 max-w-xs text-sm text-slate-500">
                      Vui lòng nhập <strong className="font-semibold text-slate-700">Mã đặt chỗ</strong> và{' '}
                      <strong className="font-semibold text-slate-700">Số điện thoại</strong> để kiểm tra thông tin vé của bạn.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </main>

        {footer}
      </div>
    </div>
  )
}
