import { useState } from 'react'
import { Bus, Clock3, Loader2, Ticket, ShieldAlert, X } from 'lucide-react'
import type { TripSearchResult, TripSeatMapSeat, BookingResponse } from '../api/config'
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
            const seatIds = selectedSeats.map((s) => s.tripSeatId)
            const response = await bookingsAPI.createBooking({
                tripId: trip.tripId,
                tripSeatIds: seatIds,
                pickupLocationId,
                dropoffLocationId,
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
                setError('Đặt vé thất bại. Ghế có thể đã bị đặt bởi người khác hoặc kết nối lỗi. Vui lòng thử lại.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const totalAmount = selectedSeats.length * trip.price

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.24)] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_100%)] border-b border-sky-50 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-orange-500" />
                            Xác nhận đặt vé &amp; Giữ chỗ
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Vui lòng kiểm tra lại thông tin trước khi xác nhận.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        disabled={isLoading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">
                            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Hãng xe & Tuyến đường */}
                    <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100 space-y-3">
                        <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
                            <span className="text-orange-600 font-bold text-base">Saigon.ST Busline</span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Bus className="h-3.5 w-3.5" />
                                {trip.vehicleType}
                            </span>
                        </div>

                        <div className="border-t border-sky-100/50 pt-3 flex justify-between items-center">
                            <div>
                                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tuyến đường</div>
                                <div className="font-bold text-slate-800 mt-0.5">
                                    {trip.routeOrigin} → {trip.routeDestination}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Thời gian đi</div>
                                <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1 justify-end">
                                    <Clock3 className="h-3.5 w-3.5 text-orange-500" />
                                    {formatDateTime(trip.departureTime)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Điểm đón / trả khách */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-800">Điểm đón trả khách</h4>
                        <div className="relative pl-5 border-l-2 border-orange-200 space-y-4">
                            <div className="relative">
                                <span className="absolute -left-[26px] top-0 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                                <div className="text-xs text-slate-400 font-medium uppercase">Điểm đón</div>
                                <div className="text-sm font-semibold text-slate-800">{pickupLocationName}</div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-[26px] top-0 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-slate-100" />
                                <div className="text-xs text-slate-400 font-medium uppercase">Điểm trả</div>
                                <div className="text-sm font-semibold text-slate-800">{dropoffLocationName}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết ghế & Giá vé */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-800">Danh sách ghế chọn</h4>
                            <span className="text-xs text-slate-500">Đơn giá: {formatCurrency(trip.price)}/ghế</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {selectedSeats.map((seat) => (
                                <div key={seat.tripSeatId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-100 bg-sky-50 text-slate-800 font-semibold text-sm">
                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                    {seat.seatCode}
                                    <span className="text-xs font-medium text-slate-400">({seat.deck === 'UPPER' ? 'Tầng trên' : 'Tầng dưới'})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tổng số tiền */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Tổng tiền thanh toán</div>
                            <div className="text-xs text-slate-400 mt-0.5">Giá đã bao gồm VAT &amp; phí dịch vụ</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-orange-500">
                                {formatCurrency(totalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:bg-orange-600 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
