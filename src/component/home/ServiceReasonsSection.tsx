import { serviceReasons } from './data'

export default function ServiceReasonsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_26px_70px_rgba(15,23,42,0.12)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Vì sao nên chọn</p>
          <h2 className="mt-3 text-3xl font-black">Dịch vụ hướng đến sự rõ ràng và tin cậy</h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Bố cục được tối ưu để thương hiệu nổi bật hơn nhưng vẫn giữ các thông tin quan trọng dễ tiếp cận.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {serviceReasons.map((reason) => {
            const Icon = reason.icon

            return (
              <article key={reason.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950">{reason.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{reason.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
