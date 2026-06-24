import { bookingSteps } from './data'

export default function BookingStepsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,_#ffffff_0%,_#eff6ff_100%)] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Hướng dẫn đặt vé</p>
        <h2 className="mt-3 text-3xl font-black text-slate-950">3 bước để hoàn tất đặt vé</h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {bookingSteps.map((step) => {
            const Icon = step.icon

            return (
              <article key={step.step} className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-slate-200">{step.step}</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{step.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
