import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BusFront,
  Clock,
  Loader2,
  MapPin,
  SearchX,
  Ticket,
  Users,
} from 'lucide-react'
import type { HomePageProps } from './types'
import { formatCurrency } from './data'

type TripResultsSectionProps = Pick<
  HomePageProps,
  'date' | 'loadingTrips' | 'hasSearchedTrips' | 'trips' | 'resultsRef' | 'onSelectTrip'
>

type TripItem = HomePageProps['trips'][number]

interface TimeSlotDefinition {
  key: string
  label: string
  startHour: number
  endHour: number
}

const TIME_SLOTS: TimeSlotDefinition[] = [
  { key: 'early-morning', label: '00:00 - 05:59', startHour: 0, endHour: 6 },
  { key: 'morning', label: '06:00 - 11:59', startHour: 6, endHour: 12 },
  { key: 'afternoon', label: '12:00 - 17:59', startHour: 12, endHour: 18 },
  { key: 'evening', label: '18:00 - 23:59', startHour: 18, endHour: 24 },
]

const toLocalDateISO = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const resolveTripStartTime = (trip: TripItem) => trip.pickupTime || trip.departureTime

const formatTime = (iso?: string | null) => {
  if (!iso) return '--:--'

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--:--'

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return 'Chưa rõ'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!hours) return `${remainingMinutes} phút`
  if (!remainingMinutes) return `${hours} giờ`
  return `${hours} giờ ${remainingMinutes} phút`
}

const isTripStillAvailableForSearch = (
  trip: TripItem,
  searchDate: string,
  now = new Date(),
) => {
  if (searchDate !== toLocalDateISO(now)) {
    return true
  }

  const tripStartValue = resolveTripStartTime(trip)
  if (!tripStartValue) {
    return true
  }

  const tripStartTime = new Date(tripStartValue)
  if (Number.isNaN(tripStartTime.getTime())) {
    return true
  }

  return tripStartTime.getTime() >= now.getTime()
}

const matchesTimeSlot = (trip: TripItem, slot: TimeSlotDefinition) => {
  const tripStartValue = resolveTripStartTime(trip)
  if (!tripStartValue) return false

  const tripStartTime = new Date(tripStartValue)
  if (Number.isNaN(tripStartTime.getTime())) return false

  const hour = tripStartTime.getHours()
  return hour >= slot.startHour && hour < slot.endHour
}

function TripInfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="truncate font-bold text-slate-700">{value}</div>
      </div>
    </div>
  )
}

function TripCard({
  trip,
  onSelectTrip,
}: {
  trip: TripItem
  onSelectTrip: (trip: TripItem) => void
}) {
  const pickupName = trip.pickupLocationName || trip.routeOrigin
  const dropoffName = trip.dropoffLocationName || trip.routeDestination
  const pickupTime = formatTime(trip.pickupTime || trip.departureTime)
  const dropoffTime = formatTime(trip.dropoffTime || trip.departureTime)
  const availableSeats = trip.availableSeats ?? 0
  const canSelect = availableSeats > 0

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl">
      <div className="grid gap-0 lg:grid-cols-[1fr_240px]">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex shrink-0 items-center gap-3 rounded-3xl bg-orange-50 p-3 md:flex-col md:px-4">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Đi
                </p>
                <p className="text-2xl font-black text-orange-600">
                  {pickupTime}
                </p>
              </div>

              <div className="hidden h-8 w-px bg-orange-200 md:block" />

              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Đến
                </p>
                <p className="text-xl font-black text-slate-800">
                  {dropoffTime}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <Users className="h-3.5 w-3.5" />
                  Còn {availableSeats} ghế
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                  <BusFront className="h-3.5 w-3.5" />
                  {trip.vehicleType}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xl font-black text-slate-950">
                <span className="max-w-full truncate">{pickupName}</span>
                <ArrowRight className="h-5 w-5 shrink-0 text-orange-400" />
                <span className="max-w-full truncate">{dropoffName}</span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <TripInfoChip
                  icon={<Clock className="h-4 w-4" />}
                  label="Thời gian"
                  value={formatDuration(trip.segmentDurationMinutes)}
                />

                <TripInfoChip
                  icon={<Ticket className="h-4 w-4" />}
                  label="Giá vé"
                  value={
                    <span className="text-orange-600">
                      {formatCurrency(trip.price)}
                    </span>
                  }
                />

                <TripInfoChip
                  icon={<BusFront className="h-4 w-4" />}
                  label="Biển số"
                  value={trip.licensePlate || 'Đang cập nhật'}
                />

                <TripInfoChip
                  icon={<MapPin className="h-4 w-4" />}
                  label="Tuyến gốc"
                  value={`${trip.routeOrigin} - ${trip.routeDestination}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div>
            <p className="text-sm font-semibold text-slate-500">Giá từ</p>
            <p className="mt-1 text-2xl font-black text-orange-600">
              {formatCurrency(trip.price)}
            </p>
            <p className="mt-1 text-xs text-slate-400">/ hành khách</p>
          </div>

          <button
            type="button"
            disabled={!canSelect}
            onClick={() => onSelectTrip(trip)}
            className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {canSelect ? 'Xem ghế trống' : 'Hết ghế'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function TripResultsSection({
  date,
  loadingTrips,
  hasSearchedTrips,
  trips,
  resultsRef,
  onSelectTrip,
}: TripResultsSectionProps) {
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null)

  const visibleTrips = trips.filter((trip) => isTripStillAvailableForSearch(trip, date))
  const slotItems = TIME_SLOTS
    .map((slot) => ({
      ...slot,
      trips: visibleTrips.filter((trip) => matchesTimeSlot(trip, slot)),
    }))
    .filter((slot) => slot.trips.length > 0)

  useEffect(() => {
    if (!slotItems.length) {
      if (selectedSlotKey !== null) {
        setSelectedSlotKey(null)
      }
      return
    }

    if (!selectedSlotKey || !slotItems.some((slot) => slot.key === selectedSlotKey)) {
      setSelectedSlotKey(slotItems[0].key)
    }
  }, [selectedSlotKey, slotItems])

  const activeSlot =
    slotItems.find((slot) => slot.key === selectedSlotKey) || slotItems[0] || null
  const hasExpiredTripsHidden = trips.length > 0 && visibleTrips.length < trips.length

  if (!hasSearchedTrips && !loadingTrips) {
    return null
  }

  return (
    <section
      ref={resultsRef}
      className="mx-auto w-full max-w-7xl px-4 pb-6 pt-6 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(148,163,184,0.14)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_55%,_#f0f9ff_100%)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                Lịch trình tìm thấy
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Kết quả tìm kiếm chuyến xe
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Chọn khung giờ phù hợp để xem các chuyến còn nhận khách và tiếp tục đặt vé.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
              {loadingTrips ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  Đang tải lịch trình
                </>
              ) : (
                <>
                  <Ticket className="h-4 w-4 text-orange-500" />
                  {visibleTrips.length} chuyến còn khả dụng
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loadingTrips ? (
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-orange-200 bg-orange-50/50 px-6 py-14 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <h4 className="mt-4 text-lg font-black text-slate-900">
                Đang tìm chuyến xe phù hợp
              </h4>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Hệ thống đang kiểm tra lịch trình, số ghế trống và giá vé cho hành trình của bạn.
              </p>
            </div>
          ) : visibleTrips.length > 0 && activeSlot ? (
            <div>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                {slotItems.map((slot) => {
                  const isActive = slot.key === activeSlot.key

                  return (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => setSelectedSlotKey(slot.key)}
                      className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-orange-500 bg-orange-500 text-white shadow-[0_14px_28px_rgba(249,115,22,0.2)]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <div className="text-sm font-black">{slot.label}</div>
                      <div className={`mt-1 text-xs font-semibold ${isActive ? 'text-orange-100' : 'text-slate-500'}`}>
                        {slot.trips.length} chuyến
                      </div>
                    </button>
                  )
                })}
              </div>

              {hasExpiredTripsHidden ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Một số chuyến đã qua giờ chạy nên được ẩn khỏi kết quả hiện tại.
                </div>
              ) : null}

              <div className="grid gap-4">
                {activeSlot.trips.map((trip) => (
                  <TripCard
                    key={trip.tripId}
                    trip={trip}
                    onSelectTrip={onSelectTrip}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-orange-500 shadow-sm">
                <SearchX className="h-8 w-8" />
              </div>

              <h4 className="mt-5 text-xl font-black text-slate-900">
                {trips.length > 0
                  ? 'Không còn chuyến nào phù hợp trong các khung giờ còn lại'
                  : 'Chưa tìm thấy chuyến phù hợp'}
              </h4>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
                {trips.length > 0
                  ? 'Các chuyến đã quá giờ chạy sẽ được ẩn trên giao diện. Bạn có thể đổi ngày đi hoặc thử lại ở hành trình khác.'
                  : 'Hãy thử đổi ngày đi, điểm đón, điểm trả hoặc kiểm tra lại lịch trình để xem thêm các lựa chọn khác.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
