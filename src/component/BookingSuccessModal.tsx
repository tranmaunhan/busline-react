import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Loader2,
  QrCode,
  X,
} from 'lucide-react'
import { bookingsAPI } from '../api/config'
import type { BookingResponse } from '../api/config'
import {
  buildVietQrUrl,
  PAYMENT_ACCOUNT_NAME,
  PAYMENT_ACCOUNT_NO,
} from '../paymentQr'

interface BookingSuccessModalProps {
  show: boolean
  booking: BookingResponse | null
  onClose: () => void
  onPaymentConfirmed: (bookingCode: string) => void
}

const DEFAULT_PAYMENT_HOLD_HOURS = 24
const PAYMENT_POLL_INTERVAL_MS = 5000

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const formatCountdown = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '--'

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

const resolvePaymentExpiryTimestamp = (booking: BookingResponse) => {
  const paymentExpiryTimestamp = booking.paymentExpiry
    ? new Date(booking.paymentExpiry).getTime()
    : Number.NaN

  if (!Number.isNaN(paymentExpiryTimestamp)) return paymentExpiryTimestamp

  const bookingTimestamp = new Date(booking.bookingTime).getTime()
  if (Number.isNaN(bookingTimestamp)) return Number.NaN

  return bookingTimestamp + DEFAULT_PAYMENT_HOLD_HOURS * 60 * 60 * 1000
}

const copyTextWithFallback = async (text: string) => {
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
}

export default function BookingSuccessModal({
  show,
  booking,
  onClose,
  onPaymentConfirmed,
}: BookingSuccessModalProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const hasConfirmedPaymentRef = useRef(false)

  const transferContent = useMemo(() => booking?.bookingCode || '', [booking?.bookingCode])

  const vietQrUrl = useMemo(() => {
    if (!booking || !transferContent) return ''
    return buildVietQrUrl(booking.totalAmount, transferContent)
  }, [booking, transferContent])

  useEffect(() => {
    if (!show || !booking) {
      setRemainingSeconds(0)
      return
    }

    const expiredAt = resolvePaymentExpiryTimestamp(booking)

    if (Number.isNaN(expiredAt)) {
      setRemainingSeconds(DEFAULT_PAYMENT_HOLD_HOURS * 60 * 60)
      return
    }

    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expiredAt - Date.now()) / 1000))
      setRemainingSeconds(diff)
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(timer)
  }, [booking, show])

  useEffect(() => {
    if (!copiedField) return

    const timer = window.setTimeout(() => setCopiedField(null), 1500)
    return () => window.clearTimeout(timer)
  }, [copiedField])

  useEffect(() => {
    hasConfirmedPaymentRef.current = false
    setIsCheckingPayment(false)
  }, [booking?.bookingCode, show])

  const isExpired = remainingSeconds <= 0

  useEffect(() => {
    if (!show || !booking?.bookingCode || isExpired) return

    let isMounted = true

    const checkPaymentStatus = async () => {
      if (hasConfirmedPaymentRef.current) return

      try {
        if (isMounted) setIsCheckingPayment(true)

        const response = await bookingsAPI.getPaymentStatus(booking.bookingCode)

        if (!isMounted || hasConfirmedPaymentRef.current) return

        if (response.success && response.status === 1) {
          hasConfirmedPaymentRef.current = true
          onPaymentConfirmed(response.bookingCode)
        }
      } catch (error) {
        console.error('Error checking booking payment status:', error)
      } finally {
        if (isMounted) setIsCheckingPayment(false)
      }
    }

    void checkPaymentStatus()
    const timer = window.setInterval(checkPaymentStatus, PAYMENT_POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [booking?.bookingCode, isExpired, onPaymentConfirmed, show])

  if (!show || !booking) return null

  const resolvedPaymentExpiryTimestamp = resolvePaymentExpiryTimestamp(booking)
  const resolvedPaymentExpiryDisplay = Number.isNaN(resolvedPaymentExpiryTimestamp)
    ? null
    : new Date(resolvedPaymentExpiryTimestamp).toISOString()

  const handleCopy = async (value: string, field: string) => {
    try {
      await copyTextWithFallback(value)
      setCopiedField(field)
    } catch {
      setCopiedField(null)
    }
  }

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(vietQrUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `vietqr-${booking.bookingCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch {
      window.open(vietQrUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_90px_rgba(15,23,42,0.28)] sm:max-h-[95vh] sm:rounded-[2rem]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900 sm:right-4 sm:top-4"
          aria-label="Đóng"
        >
          <X className="h-5 w-5 shrink-0" strokeWidth={2} />
        </button>

        <div className="border-b border-slate-100 px-4 pb-4 pt-5 text-center sm:px-8 sm:pb-5 sm:pt-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Đặt chỗ thành công
          </div>

          <h2 className="mt-3 text-xl font-black text-slate-950 sm:text-3xl">
            Thanh toán trước khi hết hạn giữ chỗ
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Quét mã QR hoặc chuyển khoản đúng nội dung để hệ thống xác nhận tự động.
          </p>

          <div className="mt-3 text-sm font-medium text-slate-500">
            Hạn giữ chỗ:{' '}
            <span className="font-bold text-slate-800">
              {formatDateTime(resolvedPaymentExpiryDisplay)}
            </span>
          </div>

          <div
            className={`mx-auto mt-4 flex w-fit min-w-[300px] items-center justify-center gap-4 rounded-2xl px-5 py-3 ${isExpired
                ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <Clock3 className="h-5 w-5 shrink-0" strokeWidth={2} />
              {isExpired ? 'Đã hết hạn' : 'Còn lại'}
            </div>
            <div className="text-3xl font-black tabular-nums">
              {formatCountdown(remainingSeconds)}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            {isCheckingPayment ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang kiểm tra trạng thái thanh toán...
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Đang chờ thanh toán
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <section className="order-2 space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:order-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-black text-slate-950">
                    Thông tin thanh toán
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Mã đặt vé: {booking.bookingCode}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Số tiền
                  </div>
                  <div className="mt-1 text-xl font-black text-slate-950">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Nội dung chuyển khoản
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="min-w-0 break-all text-lg font-black tracking-wide text-slate-950">
                    {transferContent}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(transferContent, 'transferContent')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>

                {copiedField === 'transferContent' ? (
                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                    Đã sao chép nội dung chuyển khoản
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Số tài khoản
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-black tracking-wide text-slate-950">
                      {PAYMENT_ACCOUNT_NO}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-500">
                      {PAYMENT_ACCOUNT_NAME}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(PAYMENT_ACCOUNT_NO, 'accountNo')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>

                {copiedField === 'accountNo' ? (
                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                    Đã sao chép số tài khoản
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.25rem] bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Liên hệ nhận vé
                </div>

                <div className="mt-2 space-y-1.5">
                  <div className="font-semibold text-slate-900">
                    {booking.contactName || '--'}
                  </div>
                  <div>{booking.contactPhone || '--'}</div>
                  <div>{booking.contactEmail || '--'}</div>

                  {booking.note ? (
                    <div className="pt-1 text-xs text-slate-500">
                      Ghi chú: {booking.note}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200">
                <div className="text-sm font-black text-slate-950">
                  Hướng dẫn thanh toán
                </div>

                <div className="mt-2 grid gap-2 text-xs leading-relaxed text-slate-500">
                  <div>1. Mở ứng dụng ngân hàng.</div>
                  <div>2. Quét mã QR hoặc chuyển khoản thủ công.</div>
                  <div>3. Chuyển đúng số tiền và đúng nội dung.</div>
                  <div>4. Chờ vài giây để hệ thống tự động xác nhận.</div>
                </div>
              </div>
            </section>

            <section className="order-1 rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)] lg:order-2">
              <div className="mx-auto max-w-[300px] rounded-[1.5rem] border border-slate-200 bg-white p-3">
                <img
                  src={vietQrUrl}
                  alt="Mã QR thanh toán"
                  className="aspect-square w-full rounded-[1.25rem] bg-white object-contain"
                />
              </div>

              <div className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Số tiền cần thanh toán
              </div>

              <div className="mt-1 text-3xl font-black text-orange-500">
                {formatCurrency(booking.totalAmount)}
              </div>

              <div className="mt-2 text-sm leading-5 text-slate-500">
                Quét bằng ứng dụng ngân hàng để thanh toán nhanh hơn.
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-left text-xs leading-relaxed text-slate-500">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <QrCode className="h-4 w-4 text-orange-500" />
                  VietQR hỗ trợ hầu hết ngân hàng tại Việt Nam.
                </div>
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleCopy(transferContent, 'transferContent')}
              className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-slate-950 px-4 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Copy className="h-4 w-4 shrink-0" strokeWidth={2} />
              Sao chép nội dung CK
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
              Tải mã QR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}