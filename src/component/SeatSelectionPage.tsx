import { useEffect, useState } from 'react'
import {
    Armchair,
    ArrowLeft,
    Bus,
    ChevronDown,
    ChevronUp,
    Clock3,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Route,
    Ticket,
} from 'lucide-react'
import type { TripSearchResult, TripSeatMapResponse, TripSeatMapSeat } from '../api/config'

const deckLabels: Record<string, string> = {
    LOWER: 'Tầng dưới',
    UPPER: 'Tầng trên',
}

const seatTypeLabels: Record<string, string> = {
    BED: 'Giường nằm',
    SEAT: 'Ghế ngồi',
}

const progressSteps = ['Chọn chuyến', 'Chọn ghế', 'Thông tin hành khách', 'Thanh toán']

interface SeatSelectionPageProps {
    trip: TripSearchResult
    seatMap: TripSeatMapResponse | null
    loading: boolean
    error: string | null
    isAuthenticated?: boolean
    routeImageUrl?: string | null
    pickupLocationId: number
    dropoffLocationId: number
    pickupLocationName: string
    dropoffLocationName: string
    onBack: () => void
    onRetry: () => void
    onProceed?: (
        seats: TripSeatMapSeat[],
        bookingDetails: {
            useShuttleService: boolean
            shuttleNote: string
            pickupLocationId: number
            dropoffLocationId: number
            pickupLocationName: string
            dropoffLocationName: string
        },
    ) => void
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

const resolveSearchTripStartTime = (trip: TripSearchResult) => trip.pickupTime || trip.departureTime

const formatDuration = (minutes: number) => {
    if (!minutes) return '--'

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (!hours) return `${remainingMinutes} phút`
    if (!remainingMinutes) return `${hours} giờ`
    return `${hours} giờ ${remainingMinutes} phút`
}

const isSeatAvailable = (seat: TripSeatMapSeat) => seat.status === 0

export default function SeatSelectionPage({
    trip,
    seatMap,
    loading,
    error,
    isAuthenticated = false,
    routeImageUrl,
    pickupLocationId,
    dropoffLocationId,
    pickupLocationName,
    dropoffLocationName,
    onBack,
    onRetry,
    onProceed,
}: SeatSelectionPageProps) {
    const [activeDeck, setActiveDeck] = useState('LOWER')
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([])
    const [useShuttleService, setUseShuttleService] = useState(false)
    const [shuttleNote, setShuttleNote] = useState('')
    const [showFullRoute, setShowFullRoute] = useState(false)

    useEffect(() => {
        setSelectedSeatIds([])
        setShowFullRoute(false)

        if (!seatMap) {
            setActiveDeck('LOWER')
            return
        }

        const availableDecks = Array.from(new Set(seatMap.seats.map((seat) => seat.deck)))
        if (availableDecks.includes('LOWER')) {
            setActiveDeck('LOWER')
            return
        }

        setActiveDeck(availableDecks[0] || 'LOWER')
    }, [seatMap])

    const deckOptions = seatMap
        ? Array.from(new Set(seatMap.seats.map((seat) => seat.deck))).sort((left, right) => {
            if (left === right) return 0
            if (left === 'LOWER') return -1
            if (right === 'LOWER') return 1
            if (left === 'UPPER') return -1
            if (right === 'UPPER') return 1
            return left.localeCompare(right)
        })
        : []

    const selectedSeats = seatMap
        ? seatMap.seats.filter((seat) => selectedSeatIds.includes(seat.tripSeatId))
        : []

    const availableSeatCount = seatMap
        ? seatMap.seats.filter((seat) => isSeatAvailable(seat)).length
        : 0

    const displayOrigin = seatMap?.originName || trip.routeOrigin
    const displayDestination = seatMap?.destinationName || trip.routeDestination
    const displayVehicleType = seatMap?.vehicleTypeName || trip.vehicleType
    const displayVehicleLabel = seatMap?.vehicleBrand
        ? `${seatMap.vehicleBrand} - ${displayVehicleType}`
        : displayVehicleType
    const routePreviewImage = routeImageUrl?.trim()
    const selectedTotalAmount = selectedSeats.length * trip.price
    const serviceFee = 0
    const finalAmount = selectedTotalAmount + serviceFee
    const routeStops = seatMap?.routeStops ?? []
    const displayRouteStops =
        showFullRoute || routeStops.length <= 4
            ? routeStops
            : [routeStops[0], ...routeStops.slice(1, 3), routeStops[routeStops.length - 1]]
    const hiddenStopCount = Math.max(routeStops.length - displayRouteStops.length, 0)

    const deckSeats = seatMap
        ? seatMap.seats.filter((seat) => seat.deck === activeDeck)
        : []

    const seatByPosition = new Map<string, TripSeatMapSeat>()
    let maxRow = 0
    let maxCol = 0

    deckSeats.forEach((seat) => {
        seatByPosition.set(`${seat.rowIndex}-${seat.colIndex}`, seat)
        if (seat.rowIndex > maxRow) maxRow = seat.rowIndex
        if (seat.colIndex > maxCol) maxCol = seat.colIndex
    })

    const handleToggleSeat = (seat: TripSeatMapSeat) => {
        if (!isSeatAvailable(seat)) return

        setSelectedSeatIds((current) => {
            if (current.includes(seat.tripSeatId)) {
                return current.filter((id) => id !== seat.tripSeatId)
            }

            return [...current, seat.tripSeatId]
        })
    }

    const handleSelectShuttleService = (nextValue: boolean) => {
        setUseShuttleService(nextValue)

        if (!nextValue) {
            setShuttleNote('')
        }
    }

    const handleProceedSelection = () => {
        onProceed?.(selectedSeats, {
            useShuttleService,
            shuttleNote: shuttleNote.trim(),
            pickupLocationId,
            dropoffLocationId,
            pickupLocationName,
            dropoffLocationName,
        })
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.45),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(219,234,254,0.58),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_34%,_#ffffff_100%)] pb-28 text-slate-900 lg:pb-8">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                <div className="overflow-x-auto">
                    <div className="inline-flex min-w-full items-center gap-2 rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-sm sm:min-w-max">
                        {progressSteps.map((step, index) => {
                            const stepNumber = index + 1
                            const isActive = stepNumber === 2
                            const isDone = stepNumber < 2

                            return (
                                <div key={step} className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isActive
                                                ? 'bg-orange-500 text-white shadow-sm'
                                                : isDone
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {stepNumber}
                                        </span>
                                        <span className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {step}
                                        </span>
                                    </div>
                                    {index < progressSteps.length - 1 ? (
                                        <span className="mx-1 hidden h-px w-8 bg-slate-200 sm:block" />
                                    ) : null}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách chuyến
                </button>

                <section className="mt-4 rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-[0_18px_55px_rgba(148,163,184,0.12)] sm:p-5">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                                <Ticket className="h-3.5 w-3.5" />
                                Chọn ghế
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                    {displayOrigin} - {displayDestination}
                                </h1>

                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium ring-1 ring-slate-100">
                                        <Clock3 className="h-4 w-4 text-orange-500" />
                                        {formatDateTime(seatMap?.departureTime || resolveSearchTripStartTime(trip))}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium ring-1 ring-slate-100">
                                        <Bus className="h-4 w-4 text-orange-500" />
                                        {displayVehicleLabel}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-orange-600 ring-1 ring-orange-100">
                                        <Ticket className="h-4 w-4 text-orange-500" />
                                        {formatCurrency(trip.price)}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span>{seatMap?.totalDistanceKm ? `${seatMap.totalDistanceKm} km` : '--'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{seatMap?.totalDurationMinutes ? formatDuration(seatMap.totalDurationMinutes) : '--'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{seatMap?.totalSeats ?? '--'} ghế</span>
                                    <span className="text-slate-300">•</span>
                                    <span>Còn {availableSeatCount} ghế</span>
                                </div>
                            </div>

                            {routeStops.length > 0 ? (
                                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="text-sm font-semibold text-slate-900">Lộ trình</div>
                                        {routeStops.length > 4 ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowFullRoute((current) => !current)}
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                                            >
                                                {showFullRoute ? 'Thu gọn lộ trình' : 'Xem toàn bộ lộ trình'}
                                                {showFullRoute ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                        ) : null}
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                        {displayRouteStops.map((stop, index) => (
                                            <div key={`${stop}-${index}`} className="contents">
                                                <span className="rounded-full bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-sky-100">
                                                    {stop}
                                                </span>
                                                {index < displayRouteStops.length - 1 ? (
                                                    <span className="text-orange-400">→</span>
                                                ) : null}
                                            </div>
                                        ))}
                                        {!showFullRoute && hiddenStopCount > 0 ? (
                                            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 ring-1 ring-orange-100">
                                                +{hiddenStopCount} điểm dừng
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-slate-50 xl:self-start">
                            {routePreviewImage ? (
                                <img
                                    src={routePreviewImage}
                                    alt={`Hình minh họa tuyến ${displayOrigin} đến ${displayDestination}`}
                                    className="h-40 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,_#eff6ff_0%,_#fff7ed_100%)]">
                                    <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
                                        <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Tuyến đang chọn</div>
                                            <div className="text-xs text-slate-500">{displayOrigin} - {displayDestination}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-bold text-white">A</span>
                                    <div className="min-w-0">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Điểm đón</div>
                                        <div className="truncate text-sm font-semibold text-slate-900">
                                            {pickupLocationName || displayOrigin}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700">B</span>
                                    <div className="min-w-0">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Điểm trả</div>
                                        <div className="truncate text-sm font-semibold text-slate-900">
                                            {dropoffLocationName || displayDestination}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,70fr)_minmax(0,30fr)] xl:grid-cols-[minmax(0,75fr)_minmax(0,25fr)]">
                    <section className="rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_18px_55px_rgba(148,163,184,0.12)] sm:p-5">
                        {loading ? (
                            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                                <p className="mt-4 text-lg font-semibold text-slate-700">Đang tải sơ đồ ghế...</p>
                                <p className="mt-2 text-sm">Hệ thống đang lấy dữ liệu chuyến xe bạn đã chọn.</p>
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                                <div className="text-lg font-semibold text-red-700">Không thể tải sơ đồ ghế</div>
                                <p className="mt-2 text-sm text-red-600">{error}</p>
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    className="mt-5 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    Thử tải lại
                                </button>
                            </div>
                        ) : seatMap ? (
                            <>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Sơ đồ ghế</h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Chọn ghế còn trống để tiếp tục đặt vé.
                                            </p>
                                        </div>

                                        <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1 sm:w-auto">
                                            {deckOptions.map((deck) => (
                                                <button
                                                    key={deck}
                                                    type="button"
                                                    onClick={() => setActiveDeck(deck)}
                                                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${activeDeck === deck
                                                        ? 'bg-orange-500 text-white shadow-sm'
                                                        : 'text-slate-600 hover:text-orange-600'
                                                        }`}
                                                >
                                                    {deckLabels[deck] || deck}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2">
                                            <span className="h-3 w-3 rounded bg-white ring-1 ring-slate-300" />
                                            Còn trống
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2">
                                            <span className="h-3 w-3 rounded bg-orange-500" />
                                            Đang chọn
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                                            <span className="h-3 w-3 rounded bg-slate-400" />
                                            Đã đặt / tạm khóa
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-4 ring-1 ring-sky-100 sm:p-5">
                                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-400 ring-1 ring-sky-100">
                                        <span>Tài xế</span>
                                        <span className="text-orange-600">{deckLabels[activeDeck] || activeDeck}</span>
                                    </div>

                                    <div className="mt-4 overflow-x-auto">
                                        <div className="min-w-[320px] rounded-2xl border border-sky-100 bg-white p-3 sm:p-4">
                                            {deckSeats.length > 0 ? (
                                                <div
                                                    className="grid gap-2 sm:gap-3"
                                                    style={{ gridTemplateColumns: `repeat(${Math.max(maxCol, 1)}, minmax(0, 1fr))` }}
                                                >
                                                    {Array.from({ length: maxRow }, (_, rowOffset) => rowOffset + 1).flatMap((row) =>
                                                        Array.from({ length: maxCol }, (_, colOffset) => {
                                                            const col = colOffset + 1
                                                            const seat = seatByPosition.get(`${row}-${col}`)

                                                            if (!seat) {
                                                                return (
                                                                    <div
                                                                        key={`${activeDeck}-${row}-${col}`}
                                                                        className="h-16 rounded-xl border border-dashed border-sky-100 bg-sky-50/60 sm:h-24"
                                                                    />
                                                                )
                                                            }

                                                            const isSelected = selectedSeatIds.includes(seat.tripSeatId)
                                                            const available = isSeatAvailable(seat)

                                                            return (
                                                                <button
                                                                    key={seat.tripSeatId}
                                                                    type="button"
                                                                    onClick={() => handleToggleSeat(seat)}
                                                                    disabled={!available}
                                                                    className={`h-16 rounded-xl border p-2 text-center transition sm:h-24 sm:p-3 sm:text-left ${isSelected
                                                                        ? 'border-orange-300 bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)]'
                                                                        : available
                                                                            ? 'border-sky-100 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-sky-50'
                                                                            : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                                        }`}
                                                                >
                                                                    <div className="flex h-full flex-col items-center justify-between sm:items-start">
                                                                        <div className="text-sm font-bold sm:text-base">{seat.seatCode}</div>
                                                                        <div className={`hidden text-[11px] uppercase tracking-[0.2em] sm:block ${isSelected ? 'text-white/80' : available ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                            {seatTypeLabels[seat.seatType] || seat.seatType}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            )
                                                        }),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-4 py-8 text-center text-sm text-slate-500">
                                                    Không có ghế nào để hiển thị ở tầng này.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                                Chưa có dữ liệu sơ đồ ghế cho chuyến này.
                            </div>
                        )}
                    </section>

                    <aside className="self-start rounded-2xl border border-sky-100 bg-white p-4 text-slate-900 shadow-[0_18px_55px_rgba(148,163,184,0.12)] lg:sticky lg:top-24 sm:p-5">
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Thông tin đặt chỗ</div>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">Tóm tắt chuyến đi</h2>

                        {!isAuthenticated ? (
                            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                                Bạn đang đặt vé với tư cách khách.
                            </div>
                        ) : null}

                        <div className="mt-4 space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Armchair className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm font-semibold text-slate-900">Ghế đã chọn</span>
                                    </div>
                                    <span className="text-2xl font-black text-orange-500">{selectedSeats.length}</span>
                                </div>

                                <div className="mt-3 flex min-h-[52px] flex-wrap gap-2">
                                    {selectedSeats.length > 0 ? (
                                        selectedSeats.map((seat) => (
                                            <span
                                                key={seat.tripSeatId}
                                                className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white"
                                            >
                                                {seat.seatCode}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-500">Chọn ghế trong sơ đồ để tiếp tục.</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-sky-100 p-4">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Điểm đón</div>
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                                {pickupLocationName || displayOrigin}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                                            <Route className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Điểm trả</div>
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                                {dropoffLocationName || displayDestination}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
                                <div className="space-y-3 text-sm text-slate-700">
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Giá vé</span>
                                        <span className="font-semibold text-slate-900">
                                            {selectedSeats.length > 0
                                                ? `${formatCurrency(trip.price)} x ${selectedSeats.length}`
                                                : formatCurrency(trip.price)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Phí dịch vụ</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(serviceFee)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Thời gian giữ ghế</span>
                                        <span className="text-right font-semibold text-slate-900">
                                            Hiển thị ở bước tiếp theo
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-orange-200 pt-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-700">Tổng thanh toán</span>
                                        <span className="text-2xl font-black text-orange-600">{formatCurrency(finalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={selectedSeats.length === 0}
                            onClick={handleProceedSelection}
                            className="mt-5 hidden w-full rounded-2xl bg-orange-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 lg:block"
                        >
                            {selectedSeats.length > 0 ? `Tiếp tục với ${selectedSeats.length} ghế` : 'Chọn ghế để tiếp tục'}
                        </button>
                    </aside>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Tổng thanh toán</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedSeats.length > 0
                                ? `${selectedSeats.length} ghế - ${formatCurrency(finalAmount)}`
                                : 'Chọn ghế để tiếp tục'}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={selectedSeats.length === 0}
                        onClick={handleProceedSelection}
                        className="rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    )
}
