import { ArrowRight, BusFront } from 'lucide-react'
import type { HomePageProps } from './types'
import { formatCurrency } from './data'

type TripResultsSectionProps = Pick<
  HomePageProps,
  'loadingTrips' | 'hasSearchedTrips' | 'trips' | 'resultsRef' | 'onSelectTrip'
>

export default function TripResultsSection({
  loadingTrips,
  hasSearchedTrips,
  trips,
  resultsRef,
  onSelectTrip,
}: TripResultsSectionProps) {
  if (!hasSearchedTrips && !loadingTrips) {
    return null
  }

  return (
    <section ref={resultsRef} className="mx-auto w-full max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-sky-100 bg-white p-4 shadow-[0_24px_70px_rgba(148,163,184,0.12)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Lịch trình tìm thấy</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">Kết quả tìm kiếm chuyến xe</h3>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">
            {loadingTrips ? 'Hệ thống đang tải lịch trình...' : `${trips.length} chuyến phù hợp`}
          </div>
        </div>

        {loadingTrips ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-b-orange-500" />
            <p className="mt-4 text-sm text-slate-500">Đang tìm chuyến xe cho hành trình của bạn...</p>
          </div>
        ) : trips.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {trips.map((trip) => (
              <article
                key={trip.tripId}
                className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f7fbff_100%)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl bg-orange-50 px-4 py-3 text-xl font-black text-orange-600">
                        {new Date(trip.departureTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-lg font-black text-slate-950">
                          <span>{trip.routeOrigin}</span>
                          <ArrowRight className="h-4 w-4 text-orange-400" />
                          <span>{trip.routeDestination}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span>Biển số: {trip.licensePlate}</span>
                          <span>Loại xe: {trip.vehicleType}</span>
                          <span className="font-bold text-orange-600">{formatCurrency(trip.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTrip(trip)}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-[1.25rem] bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    Chọn ghế
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
              <BusFront className="h-7 w-7" />
            </div>
            <h4 className="mt-4 text-xl font-black text-slate-900">Chưa tìm thấy chuyến phù hợp</h4>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
              Hãy thử đổi ngày đi, điểm đến hoặc kiểm tra lại lịch trình để xem thêm các tùy chọn khác.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
