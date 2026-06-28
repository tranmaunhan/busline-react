import { useEffect, useMemo, useState } from 'react'
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
  if (searchDate !== toLocalDateISO(now)) return true

  const tripStartValue = resolveTripStartTime(trip)
  if (!tripStartValue) return true

  const tripStartTime = new Date(tripStartValue)
  if (Number.isNaN(tripStartTime.getTime())) return true

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
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-[0_10px_24px_rgba(249,115,22,0.08)]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <div className="truncate text-[15px] font-extrabold text-slate-700">
          {value}
        </div>
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
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_16px_46px_rgba(15,23,42,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10),0_10px_24px_rgba(249,115,22,0.06)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_230px]">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex shrink-0 items-center gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-300 group-hover:shadow-[0_14px_30px_rgba(249,115,22,0.07)] md:flex-col md:gap-3 md:px-4">
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-500">
                  Đi
                </p>
                <p className="mt-0.5 text-[28px] font-black leading-none tracking-tight text-orange-600">
                  {pickupTime}
                </p>
              </div>

              <div className="hidden h-7 w-px bg-slate-200 md:block" />

              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Đến
                </p>
                <p className="mt-0.5 text-[22px] font-black leading-none tracking-tight text-slate-800">
                  {dropoffTime}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-100">
                  <Users className="h-3.5 w-3.5" />
                  Còn {availableSeats} ghế
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-extrabold text-sky-700 ring-1 ring-sky-100">
                  <BusFront className="h-3.5 w-3.5" />
                  {trip.vehicleType}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[21px] font-black leading-tight tracking-tight text-slate-950">
                <span className="max-w-full truncate">{pickupName}</span>
                <ArrowRight className="h-5 w-5 shrink-0 text-orange-400 transition duration-300 group-hover:translate-x-0.5" />
                <span className="max-w-full truncate">{dropoffName}</span>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <TripInfoChip
                  icon={<Clock className="h-4 w-4" />}
                  label="Thời gian"
                  value={formatDuration(trip.segmentDurationMinutes)}
                />

                <TripInfoChip
                  icon={<MapPin className="h-4 w-4" />}
                  label="Lộ trình"
                  value={`${trip.routeOrigin} - ${trip.routeDestination}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-slate-200 bg-white p-4 transition duration-300 sm:p-5 lg:border-l lg:border-t-0">
          <div>
            <p className="text-sm font-bold text-slate-500">Giá vé</p>
            <p className="mt-1 text-[28px] font-black leading-tight tracking-tight text-orange-600">
              {formatCurrency(trip.price)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">/ hành khách</p>
          </div>

          <button
            type="button"
            disabled={!canSelect}
            onClick={() => onSelectTrip(trip)}
            className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(249,115,22,0.30)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_22px_46px_rgba(249,115,22,0.36)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {canSelect ? 'Xem ghế trống' : 'Hết ghế'}
          </button>
        </div>
      </div>
    </article>
  )
}

function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="animate-pulse">
        <div className="flex gap-4">
          <div className="h-24 w-24 rounded-3xl bg-slate-100" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 rounded-full bg-slate-100" />
            <div className="h-7 w-3/4 rounded-full bg-slate-100" />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="h-14 rounded-2xl bg-slate-100" />
              <div className="h-14 rounded-2xl bg-slate-100" />
            </div>
          </div>
          <div className="hidden w-48 space-y-3 lg:block">
            <div className="h-8 rounded-full bg-slate-100" />
            <div className="h-12 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
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

  const visibleTrips = useMemo(
    () => trips.filter((trip) => isTripStillAvailableForSearch(trip, date)),
    [trips, date],
  )

  const slotItems = useMemo(
    () =>
      TIME_SLOTS
        .map((slot) => ({
          ...slot,
          trips: visibleTrips.filter((trip) => matchesTimeSlot(trip, slot)),
        }))
        .filter((slot) => slot.trips.length > 0),
    [visibleTrips],
  )

  useEffect(() => {
    if (!slotItems.length) {
      if (selectedSlotKey !== null) setSelectedSlotKey(null)
      return
    }

    if (!selectedSlotKey || !slotItems.some((slot) => slot.key === selectedSlotKey)) {
      setSelectedSlotKey(slotItems[0].key)
    }
  }, [selectedSlotKey, slotItems])

  const activeSlot =
    slotItems.find((slot) => slot.key === selectedSlotKey) || slotItems[0] || null

  if (!hasSearchedTrips && !loadingTrips) return null

  return (
    <section
      ref={resultsRef}
      className="mx-auto w-full max-w-7xl px-4 pb-8 pt-7 sm:px-6 lg:px-8"
    >
      <div className="animate-[fadeUp_450ms_ease-out] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08),0_10px_24px_rgba(249,115,22,0.05)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.20em] text-orange-600">
                Lịch trình tìm thấy
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Kết quả tìm kiếm chuyến xe
              </h3>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Chọn khung giờ phù hợp, xem giá vé và số ghế trống trước khi đặt chỗ.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm ring-1 ring-slate-100">
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
            <div className="grid gap-4">
              <TripCardSkeleton />
              <TripCardSkeleton />
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
                      className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition duration-300 ease-out active:scale-[0.98] ${isActive
                        ? 'scale-[1.02] border-orange-500 bg-orange-500 text-white shadow-[0_16px_32px_rgba(249,115,22,0.24)]'
                        : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]'
                        }`}
                    >
                      <div className="text-sm font-black">{slot.label}</div>
                      <div
                        className={`mt-1 text-xs font-bold ${isActive ? 'text-orange-100' : 'text-slate-500'
                          }`}
                      >
                        {slot.trips.length} chuyến
                      </div>
                    </button>
                  )
                })}
              </div>

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

              <h4 className="mt-5 text-xl font-black tracking-tight text-slate-900">
                {trips.length > 0
                  ? 'Không còn chuyến nào phù hợp trong các khung giờ còn lại'
                  : 'Chưa tìm thấy chuyến phù hợp'}
              </h4>

              <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-7 text-slate-500">
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
