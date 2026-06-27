import { useEffect, useState } from 'react'
import { Bus, Clock3, Loader2, ShieldAlert, Ticket, UserRound, X } from 'lucide-react'
import type { AuthUser, BookingResponse, TripSearchResult, TripSeatMapSeat } from '../api/config'
import { bookingsAPI } from '../api/config'

interface BookingConfirmModalProps {
  show: boolean
  onClose: () => void
  trip: TripSearchResult
  selectedSeats: TripSeatMapSeat[]
  pickupLocationId: number
  dropoffLocationId: number
  pickupLocationName: string
  dropoffLocationName: string
  currentUser?: AuthUser | null
  initialNote?: string
  onBookingSuccess: (booking: BookingResponse) => void
}

const DEFAULT_PAYMENT_HOLD_HOURS = 24

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const toDateTimeLocalValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const parseDateTimeLocalValue = (value: string) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const resolveSearchTripStartTime = (trip: TripSearchResult) => trip.pickupTime || trip.departureTime

const buildDefaultPaymentExpiryValue = (trip: TripSearchResult) => {
  const now = new Date()
  const defaultExpiry = new Date(now.getTime() + DEFAULT_PAYMENT_HOLD_HOURS * 60 * 60 * 1000)
  const tripStartTime = new Date(resolveSearchTripStartTime(trip))

  if (!Number.isNaN(tripStartTime.getTime()) && tripStartTime.getTime() < defaultExpiry.getTime()) {
    return toDateTimeLocalValue(tripStartTime)
  }

  return toDateTimeLocalValue(defaultExpiry)
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default function BookingConfirmModal({
  show,
  onClose,
  trip,
  selectedSeats,
  pickupLocationId,
  dropoffLocationId,
  pickupLocationName,
  dropoffLocationName,
  currentUser,
  initialNote = '',
  onBookingSuccess,
}: BookingConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [note, setNote] = useState('')
  const [paymentExpiryInput, setPaymentExpiryInput] = useState('')

  useEffect(() => {
    if (!show) return

    setError('')
    setContactName(currentUser?.fullName || '')
    setContactPhone(currentUser?.phone || '')
    setContactEmail(currentUser?.email || '')
    setNote(initialNote)
    setPaymentExpiryInput(buildDefaultPaymentExpiryValue(trip))
  }, [currentUser?.email, currentUser?.fullName, currentUser?.phone, initialNote, show, trip])

  if (!show) return null

  const tripStartTime = resolveSearchTripStartTime(trip)
  const tripStartDate = new Date(tripStartTime)
  const totalAmount = selectedSeats.length * trip.price

  const handleConfirm = async () => {
    const trimmedContactName = contactName.trim()
    const trimmedContactPhone = contactPhone.trim()
    const trimmedContactEmail = contactEmail.trim()
    const trimmedNote = note.trim()
    const paymentExpiryDate = parseDateTimeLocalValue(paymentExpiryInput)

    if (!trimmedContactName) {
      setError('Vui lòng nhập tên liên hệ.')
      return
    }

    if (!trimmedContactPhone) {
      setError('Vui lòng nhập số điện thoại liên hệ.')
      return
    }

    if (!trimmedContactEmail) {
      setError('Vui lòng nhập email để nhận vé điện tử.')
      return
    }

    if (!isValidEmail(trimmedContactEmail)) {
      setError('Email liên hệ không hợp lệ.')
      return
    }

    if (!paymentExpiryDate) {
      setError('Vui lòng chọn thời gian giữ chỗ hợp lệ.')
      return
    }

    if (paymentExpiryDate.getTime() <= Date.now()) {
      setError('Thời gian giữ chỗ phải lớn hơn thời điểm hiện tại.')
      return
    }

    if (
      !Number.isNaN(tripStartDate.getTime()) &&
      paymentExpiryDate.getTime() > tripStartDate.getTime()
    ) {
      setError('Thời gian giữ chỗ không thể sau giờ khởi hành của chuyến xe.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const seatIds = selectedSeats.map((seat) => seat.tripSeatId)
      const response = await bookingsAPI.createBooking({
        tripId: trip.tripId,
        tripSeatIds: seatIds,
        pickupLocationId,
        dropoffLocationId,
        contactName: trimmedContactName,
        contactPhone: trimmedContactPhone,
        contactEmail: trimmedContactEmail,
        note: trimmedNote,
        paymentExpiry: paymentExpiryDate.toISOString(),
      })

      onBookingSuccess(response)
      onClose()
    } catch (err: any) {
      console.error('Booking confirmation error:', err)

      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Đặt vé thất bại. Vui lòng thử lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.24)] animate-in fade-in zoom-in-95 duration-300 sm:rounded-[2rem]">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed sm:right-5 sm:top-5"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-sky-50 bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_100%)] px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
            <Ticket className="h-5 w-5 text-orange-500" />
            Xác nhận đặt vé
          </h3>
          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
            Kiểm tra thông tin chuyến đi, liên hệ và thời gian giữ chỗ trước khi tạo booking.
          </p>
        </div>

        <div className="max-h-[calc(100dvh-176px)] space-y-5 overflow-y-auto px-4 py-4 sm:max-h-[78vh] sm:px-6 sm:py-6">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span className="text-base font-bold text-orange-600">Saigon.ST Busline</span>
                  <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex">
                    <Bus className="h-3.5 w-3.5" />
                    {trip.vehicleType}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-sky-100/50 pt-3">
                  <div className="min-w-0">
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Tuyến đường
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-slate-800 sm:text-base">
                      {trip.routeOrigin} - {trip.routeDestination}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Khởi hành
                    </div>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-sm font-bold text-slate-800">
                      <Clock3 className="h-3.5 w-3.5 text-orange-500" />
                      {formatDateTime(tripStartTime)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Điểm đón và điểm trả</h4>
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-400">Điểm đón</div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">{pickupLocationName}</div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-medium uppercase text-slate-400">Điểm trả</div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">{dropoffLocationName}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-orange-500" />
                  <h4 className="text-sm font-bold text-slate-800">Thông tin liên hệ</h4>
                </div>

                {currentUser ? (
                  <p className="text-xs text-slate-500">
                    Form đã nạp sẵn từ tài khoản đăng nhập. Bạn có thể chỉnh sửa trước khi đặt vé.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Khách vãng lai vẫn có thể đặt vé. Vui lòng nhập thông tin liên hệ để tạo booking.
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-name" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Ho ten lien he
                    </label>
                    <input
                      id="contact-name"
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder="Nhập họ tên"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Số điện thoại
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Email nhan ve dien tu
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      placeholder="Nhập email để nhận vé điện tử"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="booking-note" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Ghi chú booking
                    </label>
                    <textarea
                      id="booking-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      placeholder="Them ghi chu cho nha xe neu can"
                      className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
                <h4 className="text-sm font-bold text-slate-800">Thời gian giữ chỗ</h4>
                <p className="text-xs text-slate-500">
                  Mặc định là {DEFAULT_PAYMENT_HOLD_HOURS} giờ kể từ lúc đặt. Bạn có thể điều chỉnh, nhưng không vượt quá giờ khởi hành.
                </p>
                <div>
                  <label htmlFor="payment-expiry" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Han thanh toan / giu cho
                  </label>
                  <input
                    id="payment-expiry"
                    type="datetime-local"
                    value={paymentExpiryInput}
                    onChange={(event) => setPaymentExpiryInput(event.target.value)}
                    className="w-full rounded-[1.25rem] border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Ghe da chon</h4>
                  <span className="text-xs text-slate-500">
                    Don gia: {formatCurrency(trip.price)}/ghe
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <div
                      key={seat.tripSeatId}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-100 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      {seat.seatCode}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-medium text-slate-500">Tong tien thanh toan</div>
                <div className="mt-2 text-3xl font-black text-orange-500">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  Hinh thuc giu cho se duoc tao ngay sau khi booking thanh cong.
                </div>
              </div>

              {!Number.isNaN(tripStartDate.getTime()) ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-600">
                  Chuyen xe khoi hanh luc{' '}
                  <span className="font-bold text-slate-900">{formatDateTime(tripStartTime)}</span>.
                  Han giu cho can nam truoc moc nay.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50"
            disabled={isLoading}
          >
            Huy
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)] transition active:scale-[0.98] hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Dang tao booking...
              </>
            ) : (
              'Xác nhận đặt vé'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
