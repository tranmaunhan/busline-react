import { MapPin } from 'lucide-react'
import { popularRoutes } from './data'

interface PopularRoutesSectionProps {
  onNavigateSection: (sectionId: string) => void
}

export default function PopularRoutesSection({ onNavigateSection }: PopularRoutesSectionProps) {
  return (
    <section id="tuyen-pho-bien" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Tuyến phổ biến</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Những hành trình được quan tâm nhiều</h2>
        </div>
       
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {popularRoutes.map((route) => (
          <article
            key={`${route.from}-${route.to}`}
            className="rounded-[1.85rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  <MapPin className="h-4 w-4" />
                  Tuyến vận hành
                </div>
                <h3 className="mt-4 text-2xl font-black text-slate-950">
                  {route.from} <span className="text-slate-300">-</span> {route.to}
                </h3>
              </div>
              <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.14em] text-orange-500">Giá tham khảo</div>
                <div className="mt-1 text-lg font-black text-orange-600">{route.price}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Thời gian</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{route.duration}</div>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Tần suất</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{route.frequency}</div>
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
    </section>
  )
}
