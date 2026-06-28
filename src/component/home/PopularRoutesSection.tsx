import { Loader2, MapPin } from 'lucide-react'
import type { PopularRouteSummary } from '../../api/config'
import { formatCurrency } from './data'

interface PopularRoutesSectionProps {
  popularRoutes: PopularRouteSummary[]
  loading: boolean
  onNavigateSection: (sectionId: string) => void
}

const formatDuration = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return 'Đang cập nhật'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!hours) return `${remainingMinutes} phút`
  if (!remainingMinutes) return `${hours} giờ`
  return `${hours} giờ ${remainingMinutes} phút`
}

const formatFrequency = (dailyTripCount: number) => {
  if (dailyTripCount <= 0) return 'Đang cập nhật'
  return `${dailyTripCount} chuyến/ngày`
}

const formatStartingPrice = (startingPrice?: number | null) => {
  if (startingPrice === null || startingPrice === undefined || startingPrice <= 0) {
    return 'Liên hệ'
  }

  return `Từ ${formatCurrency(startingPrice)}`
}

export default function PopularRoutesSection({
  popularRoutes,
  loading,
  onNavigateSection,
}: PopularRoutesSectionProps) {
  return (
    <section id="tuyen-pho-bien" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Tuyến phổ biến</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Những hành trình được quan tâm nhiều</h2>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.85rem] border border-dashed border-orange-200 bg-white px-6 py-12 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
            <p className="mt-4 text-sm font-semibold text-slate-600">Đang tải các tuyến nổi bật</p>
          </div>
        ) : popularRoutes.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {popularRoutes.map((route) => (
              <article
                key={route.routeId}
                className="rounded-[1.85rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.09),0_10px_22px_rgba(249,115,22,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                      <MapPin className="h-4 w-4" />
                      Tuyến vận hành
                    </div>
                    <h3 className="mt-4 text-2xl font-black text-slate-950">
                      {route.originName} <span className="text-slate-300">-</span> {route.destinationName}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    <div className="text-xs uppercase tracking-[0.14em] text-orange-500">Giá khởi điểm</div>
                    <div className="mt-1 text-lg font-black text-orange-600">
                      {formatStartingPrice(route.startingPrice)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Thời gian</div>
                    <div className="mt-2 text-sm font-bold text-slate-900">
                      {formatDuration(route.estimatedDurationMinutes)}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Tần suất</div>
                    <div className="mt-2 text-sm font-bold text-slate-900">
                      {formatFrequency(route.dailyTripCount)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('lich-trinh')}
                    className="rounded-[1.25rem] bg-slate-950 px-4 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Đặt theo tuyến này
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.85rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-base font-bold text-slate-900">Chưa có tuyến nổi bật để hiển thị</p>
            <p className="mt-2 text-sm text-slate-500">
              Hệ thống sẽ tự cập nhật khi có dữ liệu lịch chạy và đặt vé phù hợp.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
