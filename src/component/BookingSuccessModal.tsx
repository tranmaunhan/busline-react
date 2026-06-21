import { useEffect, useMemo, useState } from 'react'
import { Clock3, Copy, Download, QrCode, X } from 'lucide-react'
import type { BookingResponse } from '../api/config'

interface BookingSuccessModalProps {
    show: boolean
    booking: BookingResponse | null
    onClose: () => void
}

const PAYMENT_TIMEOUT_MINUTES = 15
const BANK_ID = '970432'
const ACCOUNT_NO = '0352789648'
const ACCOUNT_NAME = 'TRAN MAU NHAN'
const QR_TEMPLATE = 'compact2'
const TRANSFER_CONTENT_PREFIX = 'SAIGONSTBKG'

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value)

const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const buildVietQrUrl = (amount: number, transferContent: string) =>
    `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${QR_TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(
        transferContent
    )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

export default function BookingSuccessModal({
    show,
    booking,
    onClose,
}: BookingSuccessModalProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(0)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const transferContent = useMemo(() => {
        if (!booking?.bookingCode) return TRANSFER_CONTENT_PREFIX
        return `${booking.bookingCode}`
    }, [booking?.bookingCode])

    const vietQrUrl = useMemo(() => {
        if (!booking) return ''
        return buildVietQrUrl(booking.totalAmount, transferContent)
    }, [booking, transferContent])

    useEffect(() => {
        if (!show || !booking?.bookingTime) {
            setRemainingSeconds(0)
            return
        }

        const bookingTimestamp = new Date(booking.bookingTime).getTime()

        if (Number.isNaN(bookingTimestamp)) {
            setRemainingSeconds(PAYMENT_TIMEOUT_MINUTES * 60)
            return
        }

        const expiredAt = bookingTimestamp + PAYMENT_TIMEOUT_MINUTES * 60 * 1000

        const updateCountdown = () => {
            const diff = Math.max(0, Math.floor((expiredAt - Date.now()) / 1000))
            setRemainingSeconds(diff)
        }

        updateCountdown()

        const timer = window.setInterval(updateCountdown, 1000)
        return () => window.clearInterval(timer)
    }, [show, booking?.bookingTime])

    useEffect(() => {
        if (!copiedField) return

        const timer = window.setTimeout(() => setCopiedField(null), 1500)
        return () => window.clearTimeout(timer)
    }, [copiedField])

    if (!show || !booking) return null

    const isExpired = remainingSeconds <= 0

    const copyText = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm">
            <div className="relative max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-[0_24px_90px_rgba(15,23,42,0.35)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-slate-500 shadow hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Đóng"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="px-5 pb-6 pt-7 text-center sm:px-8">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
                        <QrCode className="h-4 w-4" />
                        Đặt chỗ thành công
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
                        Vui lòng thanh toán trong 15 phút
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Quét mã QR bên dưới hoặc chuyển khoản đúng thông tin để hệ thống xác nhận vé tự động.
                    </p>

                    <div
                        className={`mx-auto mt-5 flex w-fit items-center gap-3 rounded-2xl px-5 py-3 ${isExpired
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                            }`}
                    >
                        <Clock3 className="h-5 w-5" />
                        <span className="text-sm font-bold">
                            {isExpired ? 'Đã hết thời gian thanh toán' : 'Còn lại'}
                        </span>
                        <span className="text-3xl font-black tabular-nums">
                            {formatCountdown(remainingSeconds)}
                        </span>
                    </div>

                    <div className="mx-auto mt-6 max-w-[430px] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.12)]">
                        <img
                            src={vietQrUrl}
                            alt="Mã QR thanh toán"
                            className="aspect-square w-full rounded-[1.5rem] bg-white object-contain"
                        />
                    </div>

                    <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4 text-left ring-1 ring-slate-200">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Số tiền
                                </div>
                                <div className="mt-1 text-2xl font-black text-slate-950">
                                    {formatCurrency(booking.totalAmount)}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Ngân hàng
                                </div>
                                <div className="mt-1 text-lg font-bold text-slate-950">
                                    VPBank
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Số tài khoản
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-lg font-black tracking-wide text-slate-950">
                                            {ACCOUNT_NO}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {ACCOUNT_NAME}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => copyText(ACCOUNT_NO, 'accountNo')}
                                        className="rounded-full bg-white p-2 text-slate-500 shadow hover:text-slate-900"
                                        aria-label="Sao chép số tài khoản"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>

                                {copiedField === 'accountNo' && (
                                    <div className="mt-1 text-xs font-semibold text-emerald-600">
                                        Đã sao chép số tài khoản
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Nội dung chuyển khoản
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-3">
                                    <div className="break-all text-lg font-black tracking-wide text-slate-950">
                                        {transferContent}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => copyText(transferContent, 'transferContent')}
                                        className="rounded-full bg-white p-2 text-slate-500 shadow hover:text-slate-900"
                                        aria-label="Sao chép nội dung chuyển khoản"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>

                                {copiedField === 'transferContent' && (
                                    <div className="mt-1 text-xs font-semibold text-emerald-600">
                                        Đã sao chép nội dung chuyển khoản
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={handleDownloadQr}
                            className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                            <Download className="h-4 w-4" />
                            Tải mã QR
                        </button>

                        <button
                            type="button"
                            onClick={() => copyText(transferContent, 'transferContent')}
                            className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-slate-950 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800"
                        >
                            <Copy className="h-4 w-4" />
                            Sao chép nội dung CK
                        </button>
                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-500">
                        Lưu ý: Vui lòng chuyển khoản đúng số tiền và đúng nội dung để vé được xác nhận tự động.
                    </p>
                </div>
            </div>
        </div>
    )
}