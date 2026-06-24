import { useState } from 'react'
import { faqs } from './data'

export default function FaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Câu hỏi thường gặp</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Giải đáp nhanh cho khách đặt vé</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Phần FAQ giúp người dùng nắm nhanh thông tin trước khi liên hệ trực tiếp với nhà xe.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => (
            <article key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpenFaqIndex((current) => (current === index ? -1 : index))}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-base font-black text-slate-950">{item.question}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {openFaqIndex === index ? 'Đóng' : 'Mở'}
                </span>
              </button>

              {openFaqIndex === index ? (
                <div className="px-5 pb-5 text-sm leading-7 text-slate-500">{item.answer}</div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
