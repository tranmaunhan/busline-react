import { CheckCircle2, Ticket, Calendar, MapPin, User, Phone } from 'lucide-react'
import type { BookingResponse, AuthUser } from '../api/config'

interface BookingSuccessModalProps {
    show: boolean
    booking: BookingResponse | null
    user: AuthUser | null
    onClose: () => void
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

export default function BookingSuccessModal({
    show,
    booking,
    user,
    onClose,
}: BookingSuccessModalProps) {
    if (!show || !booking) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.24)] animate-in fade-in zoom-in-95 duration-300">
                
                {/* Lớp trang trí thành công */}
                <div className="bg-[linear-gradient(135deg,_#eff6ff_0%,_#dbeafe_100%)] px-6 py-8 text-center relative overflow-hidden">
                    {/* Bụi sao / Vòng tròn trang trí */}
                    <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-200/50 blur-2xl" />
                    <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-200/40 blur-2xl" />

                    <div className="relative flex flex-col items-center">
                        <div className="mb-3 rounded-full bg-emerald-50 p-2 text-emerald-500 shadow-md ring-8 ring-emerald-500/10 animate-bounce">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">
                            Đặt Vé Thành Công!
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">Ghế của bạn đã được khóa và giữ chỗ thành công.</p>
                        
                        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 font-bold text-xs uppercase tracking-wider text-white shadow-sm">
                            Mã Booking: #{booking.bookingId}
                        </div>
                    </div>
                </div>

                {/* Nội dung dạng chiếc vé */}
                <div className="bg-white px-6 py-6 space-y-5 relative">
                    
                    {/* Hàng răng cưa giả lập hai bên góc vé (Ticket Cutout) */}
                    <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-slate-900/40 translate-y-[-50%]" />
                    <div className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-slate-900/40 translate-y-[-50%]" />

                    {/* Thông tin chuyến đi */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-dashed border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Chuyến xe</span>
                                <div className="text-base font-extrabold text-slate-800">
                                    {booking.routeOrigin} → {booking.routeDestination}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Khởi hành</span>
                                <div className="text-sm font-bold text-slate-800 flex items-center gap-1 justify-end mt-0.5">
                                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                    {formatDateTime(booking.tripDepartureTime)}
                                </div>
                            </div>
                        </div>

                        {/* Điểm đón trả cụ thể */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 font-medium">Điểm đón khách</span>
                                <p className="font-semibold text-slate-800 mt-1 flex items-start gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                                    {booking.pickupLocationName}
                                </p>
                            </div>
                            <div>
                                <span className="text-slate-400 font-medium">Điểm trả khách</span>
                                <p className="font-semibold text-slate-800 mt-1 flex items-start gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    {booking.dropoffLocationName}
                                </p>
                            </div>
                        </div>

                        {/* Thông tin khách hàng */}
                        {user && (
                            <div className="bg-sky-50/40 rounded-xl p-3 border border-sky-100/50 grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <User className="h-3.5 w-3.5 text-sky-500" />
                                    <span className="font-semibold truncate">{user.fullName || user.username}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-700 justify-end">
                                    <Phone className="h-3.5 w-3.5 text-sky-500" />
                                    <span>{user.phone || 'Không có SĐT'}</span>
                                </div>
                            </div>
                        )}

                        {/* Chi tiết từng vé */}
                        <div className="border-t border-slate-100 pt-4 space-y-2">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Danh sách vé ({booking.tickets.length} ghế)</span>
                            <div className="grid grid-cols-2 gap-2">
                                {booking.tickets.map((ticket) => (
                                    <div key={ticket.ticketId} className="flex justify-between items-center px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                        <span className="font-bold text-slate-700 flex items-center gap-1">
                                            <Ticket className="h-3.5 w-3.5 text-orange-400" />
                                            {ticket.seatCode}
                                        </span>
                                        <span className="text-slate-500 font-medium">{formatCurrency(ticket.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tổng tiền và trạng thái */}
                        <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-500 font-medium">Tổng cộng</span>
                                <div className="text-2xl font-black text-orange-500 mt-0.5">
                                    {formatCurrency(booking.totalAmount)}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Trạng thái</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                                    {booking.status}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 transition text-center"
                    >
                        Quay về trang chủ
                    </button>
                </div>

            </div>
        </div>
    )
}
