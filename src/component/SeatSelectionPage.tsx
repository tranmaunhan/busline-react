
import { useEffect, useState } from 'react'
import { ArrowLeft, Bus, Clock3, Image as ImageIcon, Loader2, MapPin, Route, Ticket } from 'lucide-react'
import type { TripSearchResult, TripSeatMapResponse, TripSeatMapSeat } from '../api/config'

const deckLabels: Record<string, string> = {
    LOWER: 'Tầng dưới',
    UPPER: 'Tầng trên',
}

const seatTypeLabels: Record<string, string> = {
    BED: 'Giường nằm',
    SEAT: 'Ghế ngồi',
}

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

    useEffect(() => {
        setSelectedSeatIds([])

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
    const selectedTotalAmount = selectedSeats.length * trip.price
    const routePreviewImage = routeImageUrl?.trim()

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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.45),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(219,234,254,0.58),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_34%,_#ffffff_100%)] pb-28 text-slate-900 xl:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-white hover:text-orange-600 sm:w-auto"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách chuyến
                </button>

                <section className="relative mt-5 overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fbff_52%,_#edf6ff_100%)] p-4 shadow-[0_28px_90px_rgba(148,163,184,0.12)] sm:p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.16),_transparent_28%)]" />
                    <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-sky-200/35 blur-3xl" />
                    <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-blue-100/70 blur-3xl" />

                    <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                        <div className="flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 ring-1 ring-sky-200">
                                    <Ticket className="h-3.5 w-3.5" />
                                    Chọn ghế
                                </div>

                                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                    {displayOrigin} - {displayDestination}
                                </h1>

                                {seatMap?.routeStops?.length ? (
                                    <div className="mt-4 hidden rounded-[1.5rem] border border-sky-100 bg-white/88 p-4 shadow-sm sm:block">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
                                            Lộ trình tổng quan
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                            {seatMap.routeStops.map((stop, index) => (
                                                <div key={`${stop}-${index}`} className="contents">
                                                    <span className="rounded-full bg-sky-50 px-3 py-1.5 font-medium text-slate-700 ring-1 ring-sky-100">
                                                        {stop}
                                                    </span>
                                                    {index < seatMap.routeStops.length - 1 ? (
                                                        <span className="text-orange-400">→</span>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}


                                <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-700 sm:gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 ring-1 ring-sky-100 shadow-sm">
                                        <Clock3 className="h-4 w-4 text-orange-500" />
                                        {formatDateTime(seatMap?.departureTime || resolveSearchTripStartTime(trip))}
                                    </div>

                                    <div className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-2 ring-1 ring-sky-100 shadow-sm sm:inline-flex">
                                        <MapPin className="h-4 w-4 text-orange-500" />
                                        {seatMap?.licensePlate || trip.licensePlate}
                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 ring-1 ring-sky-100 shadow-sm">
                                        <Bus className="h-4 w-4 text-orange-500" />
                                        {displayVehicleLabel}
                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 font-semibold text-orange-600 ring-1 ring-orange-100 shadow-sm">
                                        <Ticket className="h-4 w-4 text-orange-500" />
                                        {formatCurrency(trip.price)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-sky-100 shadow-sm">
                                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Số chỗ trống</div>
                                    <div className="mt-2 text-3xl font-black text-slate-900">{availableSeatCount}</div>
                                    <div className="mt-1 text-sm text-slate-500">
                                        / {seatMap?.totalSeats ?? '--'} vị trí khả dụng
                                    </div>
                                </div>

                                <div className="hidden rounded-[1.5rem] bg-white p-4 ring-1 ring-sky-100 shadow-sm sm:block">
                                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Tổng số ghế</div>
                                    <div className="mt-2 text-xl font-bold text-slate-900">
                                        {seatMap?.totalSeats ?? '--'}
                                    </div>
                                </div>

                                <div className="hidden rounded-[1.5rem] bg-white p-4 ring-1 ring-sky-100 shadow-sm sm:block">
                                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Quãng đường</div>
                                    <div className="mt-2 text-xl font-bold text-slate-900">
                                        {seatMap?.totalDistanceKm ? `${seatMap.totalDistanceKm} km` : '--'}
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-sky-100 shadow-sm">
                                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Thời lượng</div>
                                    <div className="mt-2 text-xl font-bold text-slate-900">
                                        {seatMap?.totalDurationMinutes ? formatDuration(seatMap.totalDurationMinutes) : '--'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white/92 p-4 shadow-sm xl:block">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.14),_transparent_40%)]" />
                            {routePreviewImage ? (
                                <img
                                    src={routePreviewImage}
                                    alt={`Hình mô tả lộ trình ${displayOrigin} đến ${displayDestination}`}
                                    className="relative h-full min-h-[260px] w-full rounded-[1.25rem] object-cover shadow-sm"
                                />
                            ) : (
                                <div className="relative flex min-h-[260px] flex-col justify-between rounded-[1.25rem] border border-dashed border-sky-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f1f7ff_100%)] p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.24em] text-sky-600">Ảnh mô tả lộ trình</div>
                                            <div className="mt-2 text-xl font-bold text-slate-900">Vị trí cho hình ảnh tuyến đường</div>
                                        </div>
                                        <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100">
                                            <ImageIcon className="h-7 w-7 text-sky-500" />
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-[1.25rem] bg-white p-4 ring-1 ring-sky-100 shadow-sm">
                                        <div className="flex items-center gap-3 text-slate-900">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-bold text-white">A</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Điểm đón</div>
                                                <div className="truncate text-sm font-semibold">{pickupLocationName || displayOrigin}</div>
                                            </div>
                                        </div>

                                        <div className="mx-4 my-3 flex items-center gap-3">
                                            <div className="h-px flex-1 bg-sky-100" />
                                            <Route className="h-4 w-4 text-orange-400" />
                                            <div className="h-px flex-1 bg-sky-100" />
                                        </div>

                                        <div className="flex items-center gap-3 text-slate-900">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">B</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Điểm trả</div>
                                                <div className="truncate text-sm font-semibold">{dropoffLocationName || displayDestination}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {seatMap?.routeStops?.length ? (
                                        <div className="mt-5 rounded-[1.25rem] bg-white/88 p-4 ring-1 ring-sky-100">
                                            <div className="text-xs uppercase tracking-[0.2em] text-sky-600">Các điểm trên tuyến</div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {seatMap.routeStops.slice(0, 4).map((stop) => (
                                                    <span
                                                        key={stop}
                                                        className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-sky-100"
                                                    >
                                                        {stop}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-5 text-sm leading-6 text-slate-500">
                                            Khu vực này dành cho ảnh bản đồ, ảnh xe, hoặc ảnh mô tả hành trình. Khi có URL ảnh, chỉ cần truyền vào `routeImageUrl`.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
                    <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white p-4 shadow-[0_22px_70px_rgba(148,163,184,0.12)] sm:p-6">
                        {loading ? (
                            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                                <p className="mt-4 text-lg font-semibold text-slate-700">Đang tải sơ đồ ghế...</p>
                                <p className="mt-2 text-sm">Hệ thống đang lấy dữ liệu chuyến xe bạn đã chọn.</p>
                            </div>
                        ) : error ? (
                            <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-8 text-center">
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
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="hidden flex-wrap gap-2 sm:flex">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-xs font-medium text-slate-600">
                                            <span className="h-3 w-3 rounded bg-white ring-1 ring-slate-300"></span>
                                            Còn trống
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-xs font-medium text-slate-600">
                                            <span className="h-3 w-3 rounded bg-orange-500"></span>
                                            Đang chọn
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-xs font-medium text-slate-600">
                                            <span className="h-3 w-3 rounded bg-slate-400"></span>
                                            Đã đặt / tạm khóa
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {deckOptions.map((deck) => (
                                            <button
                                                key={deck}
                                                type="button"
                                                onClick={() => setActiveDeck(deck)}
                                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeDeck === deck
                                                    ? 'bg-orange-500 text-white shadow-md'
                                                    : 'bg-sky-50 text-slate-600 hover:bg-white hover:text-orange-600'
                                                    }`}
                                            >
                                                {deckLabels[deck] || deck}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-[2rem] border border-sky-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f3f8ff_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs uppercase tracking-[0.28em] text-slate-400 ring-1 ring-sky-100">
                                        <span>Tài xế</span>
                                        <span className="text-orange-600">{deckLabels[activeDeck] || activeDeck}</span>
                                    </div>

                                    <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-white p-3 sm:p-5">
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
                                                                    className="h-16 rounded-xl border border-dashed border-sky-100 bg-sky-50/60 sm:h-24 sm:rounded-[1.25rem]"
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
                                                                className={`h-16 rounded-xl border p-1.5 text-center transition sm:h-24 sm:rounded-[1.25rem] sm:p-3 sm:text-left ${isSelected
                                                                    ? 'border-orange-300 bg-orange-500 text-white shadow-[0_14px_24px_rgba(249,115,22,0.24)]'
                                                                    : available
                                                                        ? 'border-sky-100 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-sky-50'
                                                                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                                    }`}
                                                            >
                                                                <div className="flex h-full flex-col justify-between items-center sm:items-start">
                                                                    <div className="text-sm font-bold sm:text-base">{seat.seatCode}</div>
                                                                    <div className={`hidden text-[11px] uppercase tracking-[0.22em] sm:block ${isSelected ? 'text-white/80' : available ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                        {seatTypeLabels[seat.seatType] || seat.seatType}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        )
                                                    }),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-[1.25rem] border border-dashed border-sky-200 bg-sky-50/70 px-4 py-8 text-center text-sm text-slate-500">
                                                Không có ghế nào để hiển thị ở tầng này.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                                Chưa có dữ liệu sơ đồ ghế cho chuyến này.
                            </div>
                        )}
                    </section>

                    <aside className="rounded-[2rem] border border-sky-100 bg-white p-4 text-slate-900 shadow-[0_22px_70px_rgba(148,163,184,0.12)] sm:p-6">
                        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Thông tin đặt chỗ</div>
                        <h2 className="mt-3 text-2xl font-black">Tóm tắt lựa chọn</h2>

                        {!isAuthenticated ? (
                            <div className="mt-3 rounded-[1.25rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                                Ban dang dat ve voi tu cach khach. O buoc tiep theo, he thong se mo form de ban nhap thong tin lien he va thoi gian giu cho.
                            </div>
                        ) : null}

                        <div className="mt-6 space-y-3">




                            <div className="rounded-[1.5rem] bg-sky-50/70 p-4 ring-1 ring-sky-100">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-slate-900">Dịch vụ trung chuyển</div>
                                    <div className="group relative hidden sm:block">
                                        <button
                                            type="button"
                                            aria-label="Thông tin dịch vụ trung chuyển"
                                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-200 bg-white text-xs font-bold text-orange-500 transition hover:border-orange-300 hover:bg-orange-50"
                                        >
                                            i
                                        </button>

                                        <div className="pointer-events-none absolute right-0 top-8 z-10 w-64 rounded-2xl bg-slate-900 px-4 py-3 text-left text-xs leading-5 text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                                            Dịch vụ trung chuyển hỗ trợ đón hoặc trả khách tại điểm hẹn phù hợp. Hãy ghi rõ địa chỉ, số điện thoại và thời gian mong muốn ở ô note nếu bạn cần sử dụng.
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectShuttleService(true)}
                                        className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold transition ${useShuttleService
                                            ? 'border-orange-300 bg-orange-500 text-white shadow-[0_14px_24px_rgba(249,115,22,0.2)]'
                                            : 'border-orange-100 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-100'
                                            }`}
                                    >
                                        Có sử dụng
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSelectShuttleService(false)}
                                        className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold transition ${!useShuttleService
                                            ? 'border-orange-300 bg-orange-500 text-white shadow-[0_14px_24px_rgba(249,115,22,0.2)]'
                                            : 'border-orange-100 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-100'
                                            }`}
                                    >
                                        Không sử dụng
                                    </button>
                                </div>

                                {useShuttleService ? (
                                    <div className="mt-4">
                                        <label htmlFor="shuttle-note" className="text-sm font-medium text-slate-700">
                                            Note trung chuyển
                                        </label>
                                        <textarea
                                            id="shuttle-note"
                                            value={shuttleNote}
                                            onChange={(event) => setShuttleNote(event.target.value)}
                                            rows={4}
                                            placeholder="Ví dụ: Đón tại 12 Nguyễn Trãi, quận 1 lúc 18:30. SĐT liên hệ 09xx..."
                                            className="mt-2 w-full rounded-[1.25rem] border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                        />
                                    </div>
                                ) : null}
                            </div>

                        </div>

                        <div className="mt-6 rounded-[1.5rem] bg-sky-50/80 p-4 ring-1 ring-sky-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Ghế đã chọn</span>
                                <span className="text-2xl font-black text-orange-500">{selectedSeats.length}</span>
                            </div>

                            <div className="mt-2 text-sm font-medium text-slate-600">
                                Tạm tính: <span className="font-bold text-slate-900">{formatCurrency(selectedTotalAmount)}</span>
                            </div>

                            <div className="mt-4 flex min-h-[58px] flex-wrap gap-2">
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
                                    <span className="text-sm text-slate-500">
                                        Chọn ghế trong sơ đồ để tiếp tục.
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-sky-100">
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Còn trống</div>
                                <div className="mt-2 text-2xl font-black">{availableSeatCount}/{seatMap?.totalSeats ?? '--'}</div>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={selectedSeats.length === 0}
                            onClick={handleProceedSelection}
                            className="mt-8 hidden w-full rounded-[1.25rem] bg-orange-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 xl:block"
                        >
                            {selectedSeats.length > 0 ? `Tiếp tục với ${selectedSeats.length} ghế` : 'Chọn ghế để tiếp tục'}
                        </button>
                    </aside>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Đã chọn</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedSeats.length > 0
                                ? `${selectedSeats.length} ghế - ${formatCurrency(selectedTotalAmount)}`
                                : 'Chọn ghế để tiếp tục'}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={selectedSeats.length === 0}
                        onClick={handleProceedSelection}
                        className="rounded-[1rem] bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    )
}
