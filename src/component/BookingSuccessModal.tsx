import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Copy, Download, QrCode, X } from 'lucide-react'
import { bookingsAPI } from '../api/config'
import type { BookingResponse } from '../api/config'

interface BookingSuccessModalProps {
    show: boolean
    booking: BookingResponse | null
    onClose: () => void
    onPaymentConfirmed: (bookingCode: string) => void
}

const PAYMENT_TIMEOUT_MINUTES = 15
const PAYMENT_POLL_INTERVAL_MS = 5000
const BANK_ID = '970432'
const ACCOUNT_NO = '0352789648'
const ACCOUNT_NAME = 'TRAN MAU NHAN'
const QR_TEMPLATE = 'compact2'

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

    const isExpired = remainingSeconds <= 0

    useEffect(() => {
        hasConfirmedPaymentRef.current = false
        setIsCheckingPayment(false)
    }, [booking?.bookingCode, show])

    useEffect(() => {
        if (!show || !booking?.bookingCode || isExpired) return

        let isMounted = true

        const checkPaymentStatus = async () => {
            if (hasConfirmedPaymentRef.current) return

            try {
                if (isMounted) {
                    setIsCheckingPayment(true)
                }

                const response = await bookingsAPI.getPaymentStatus(booking.bookingCode)

                if (!isMounted || hasConfirmedPaymentRef.current) return

                if (response.success && response.status === 1) {
                    hasConfirmedPaymentRef.current = true
                    onPaymentConfirmed(response.bookingCode)
                }
            } catch (error) {
                console.error('Error checking booking payment status:', error)
            } finally {
                if (isMounted) {
                    setIsCheckingPayment(false)
                }
            }
        }

        checkPaymentStatus()
        const timer = window.setInterval(checkPaymentStatus, PAYMENT_POLL_INTERVAL_MS)

        return () => {
            isMounted = false
            window.clearInterval(timer)
        }
    }, [booking?.bookingCode, isExpired, onPaymentConfirmed, show])

    if (!show || !booking) return null

    const copyField = async (text: string, field: string) => {
        try {
            await copyTextWithFallback(text)
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
                    aria-label="Dong"
                >
                    <X className="h-5 w-5 shrink-0" strokeWidth={2} />
                </button>

                <div className="border-b border-slate-200 px-4 pb-5 pt-6 text-center sm:px-8 sm:pb-6 sm:pt-7">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 ring-1 ring-slate-200 sm:px-4 sm:text-sm sm:normal-case sm:tracking-normal">
                        <QrCode className="h-4 w-4 shrink-0" strokeWidth={2} />
                        Dat cho thanh cong
                    </div>

                    <h2 className="mt-3 text-xl font-black text-slate-950 sm:mt-4 sm:text-3xl">
                        Thanh toan trong 15 phut
                    </h2>

                    <p className="mt-2 hidden text-sm leading-6 text-slate-500 sm:block">
                        Quet ma QR hoac chuyen khoan dung thong tin de he thong xac nhan ve tu dong.
                    </p>

                    <div className="mt-3 text-xs font-medium text-slate-500 sm:text-sm">
                        {isCheckingPayment ? 'He thong dang kiem tra trang thai thanh toan...' : 'He thong se tu dong cap nhat sau khi nhan duoc thanh toan.'}
                    </div>

                    <div
                        className={`mt-4 grid gap-2 rounded-2xl px-4 py-3 text-left sm:mx-auto sm:mt-5 sm:inline-flex sm:w-fit sm:min-w-[320px] sm:items-center sm:justify-center sm:gap-4 sm:text-center ${
                            isExpired
                                ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}
                    >
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Clock3 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={2} />
                            <span>{isExpired ? 'Da het thoi gian thanh toan' : 'Thoi gian con lai'}</span>
                        </div>
                        <div className="text-2xl font-black tabular-nums sm:text-3xl">
                            {formatCountdown(remainingSeconds)}
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500 sm:hidden">
                        Ma don: <span className="font-semibold text-slate-700">{booking.bookingCode}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section className="order-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5 lg:order-1">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-900">Thong tin thanh toan</div>
                                    <div className="mt-1 hidden text-xs text-slate-500 sm:block">
                                        Ma dat ve: {booking.bookingCode}
                                    </div>
                                </div>
                                <div className="hidden text-right sm:block">
                                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">So tien</div>
                                    <div className="mt-1 text-xl font-black text-slate-950">
                                        {formatCurrency(booking.totalAmount)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200 sm:hidden">
                                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                        So tien
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-slate-950">
                                        {formatCurrency(booking.totalAmount)}
                                    </div>
                                </div>

                                <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200">
                                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Noi dung chuyen khoan
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <div className="min-w-0 break-all text-base font-black tracking-wide text-slate-950 sm:text-lg">
                                            {transferContent}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyField(transferContent, 'transferContent')}
                                            className="rounded-full bg-slate-50 p-2 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
                                            aria-label="Sao chep noi dung chuyen khoan"
                                        >
                                            <Copy className="h-4 w-4 shrink-0" strokeWidth={2} />
                                        </button>
                                    </div>
                                    {copiedField === 'transferContent' ? (
                                        <div className="mt-2 text-xs font-semibold text-emerald-600">
                                            Da sao chep noi dung chuyen khoan
                                        </div>
                                    ) : null}
                                </div>

                                <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200">
                                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                        So tai khoan
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-base font-black tracking-wide text-slate-950 sm:text-lg">
                                                {ACCOUNT_NO}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                {ACCOUNT_NAME}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyField(ACCOUNT_NO, 'accountNo')}
                                            className="rounded-full bg-slate-50 p-2 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
                                            aria-label="Sao chep so tai khoan"
                                        >
                                            <Copy className="h-4 w-4 shrink-0" strokeWidth={2} />
                                        </button>
                                    </div>
                                    {copiedField === 'accountNo' ? (
                                        <div className="mt-2 text-xs font-semibold text-emerald-600">
                                            Da sao chep so tai khoan
                                        </div>
                                    ) : null}
                                </div>

                                <div className="hidden rounded-[1.25rem] bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200 sm:block">
                                    Vui long chuyen khoan dung so tien va dung noi dung de he thong xac nhan ve tu dong.
                                </div>
                            </div>
                        </section>

                        <section className="order-1 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.08)] lg:order-2">
                            <div className="mx-auto max-w-[280px] rounded-[1.5rem] border border-slate-200 bg-white p-3">
                                <img
                                    src={vietQrUrl}
                                    alt="Ma QR thanh toan"
                                    className="aspect-square w-full rounded-[1.25rem] bg-white object-contain"
                                />
                            </div>

                            <div className="mt-3 text-center text-xs leading-5 text-slate-500 sm:text-sm">
                                Quet bang ung dung ngan hang de thanh toan nhanh hon.
                            </div>
                        </section>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => copyField(transferContent, 'transferContent')}
                            className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                            <Copy className="h-4 w-4 shrink-0" strokeWidth={2} />
                            Sao chep noi dung CK
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadQr}
                            className="hidden items-center justify-center gap-2 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                        >
                            <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
                            Tai ma QR
                        </button>

                        <button
                            type="button"
                            onClick={() => copyField(ACCOUNT_NO, 'accountNo')}
                            className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:hidden"
                        >
                            <Copy className="h-4 w-4 shrink-0" strokeWidth={2} />
                            Sao chep so tai khoan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
