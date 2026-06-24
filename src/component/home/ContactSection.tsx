import { Mail, MapPin, MessageCircleHeart, Phone } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="lien-he" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Liên hệ và bản đồ</p>
          <h2 className="mt-3 text-3xl font-black">Thông tin doanh nghiệp hiển thị đầy đủ</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-orange-300" />
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Hotline đặt vé</div>
                  <div className="mt-1 text-lg font-black text-white">1900 1010</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <MessageCircleHeart className="mt-1 h-5 w-5 shrink-0 text-orange-300" />
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Zalo hỗ trợ</div>
                  <div className="mt-1 text-lg font-black text-white">0352789648</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-orange-300" />
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Email</div>
                  <div className="mt-1 text-lg font-black text-white">hotro@SaigonST.vn</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-orange-300" />
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Địa chỉ</div>
                  <div className="mt-1 text-lg font-black text-white">Bến xe Miền Tây, TP.HCM</div>
                  <div className="mt-2 text-sm leading-7 text-slate-200">Thời gian hỗ trợ: 24/24</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
              <MapPin className="h-4 w-4" />
              Bản đồ vị trí
            </div>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Bến xe Miền Tây, TP.HCM</h3>
          </div>

          <iframe
            title="Bản đồ Bến xe Miền Tây"
            src="https://www.google.com/maps?q=B%E1%BA%BFn%20xe%20Mi%E1%BB%81n%20T%C3%A2y%2C%20TP.HCM&z=15&output=embed"
            className="h-[360px] w-full border-0 sm:h-[460px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
