import { useState } from 'react'
import { Bus, Clock3, Loader2, ShieldAlert, Ticket, X } from 'lucide-react'
import type { BookingResponse, TripSearchResult, TripSeatMapSeat } from '../api/config'
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
    onBookingSuccess: (booking: BookingResponse) => void
}

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

export default function BookingConfirmModal({
    show,
    onClose,
    trip,
    selectedSeats,
    pickupLocationId,
    dropoffLocationId,
    pickupLocationName,
    dropoffLocationName,
    onBookingSuccess,
}: BookingConfirmModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    if (!show) return null

    const handleConfirm = async () => {
        setIsLoading(true)
        setError('')

        try {
            const seatIds = selectedSeats.map((seat) => seat.tripSeatId)
            const response = await bookingsAPI.createBooking({
                tripId: trip.tripId,
                tripSeatIds: seatIds,
                pickupLocationId,
                dropoffLocationId,
            })

            console.log('Booking create response:', response)
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

    const totalAmount = selectedSeats.length * trip.price

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.24)] animate-in fade-in zoom-in-95 duration-300 sm:rounded-[2rem]">
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
                        Kiểm tra thông tin trước khi xác nhận.
                    </p>
                </div>

                <div className="max-h-[calc(100dvh-176px)] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[70vh] sm:space-y-5 sm:px-6 sm:py-6">
                    {error ? (
                        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
                            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    ) : null}

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
                                    {formatDateTime(trip.departureTime)}
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

                    <div className="space-y-3 border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-800">Ghế đã chọn</h4>
                            <span className="hidden text-xs text-slate-500 sm:inline">
                                Đơn giá: {formatCurrency(trip.price)}/ghế
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedSeats.map((seat) => (
                                <div
                                    key={seat.tripSeatId}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-slate-800"
                                >
                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                    {seat.seatCode}
                                    <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                                        ({seat.deck === 'UPPER' ? 'Tang tren' : 'Tang duoi'})
                                        
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div>
                            <div className="text-xs font-medium text-slate-500">Tổng tiền thanh toán</div>
                            <div className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                                Giá đã bao gồm VAT và phí dịch vụ
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-black text-orange-500">
                                {formatCurrency(totalAmount)}
                            </div>
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
                        Hủy
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
                                Đang giữ chỗ...
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
