import { Star } from 'lucide-react'
import { testimonials } from './data'

export default function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Đánh giá khách hàng</p>
        <h2 className="mt-3 text-3xl font-black text-slate-950">Cảm nhận về giao diện và dịch vụ</h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center gap-1 text-orange-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">"{item.quote}"</p>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="font-black text-slate-950">{item.name}</div>
                <div className="text-sm text-slate-500">{item.role}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
