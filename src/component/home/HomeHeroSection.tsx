import { ArrowRight, ChevronRight } from 'lucide-react'
import { homeSlides } from './data'

interface HomeHeroSectionProps {
  currentSlide: number
  onNavigateSection: (sectionId: string) => void
  onOpenLookup: () => void
}

export default function HomeHeroSection({
  currentSlide,
  onNavigateSection,
  onOpenLookup,
}: HomeHeroSectionProps) {
  return (
    <section id="top" className="group relative w-full overflow-hidden">
      {homeSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide-bg ${currentSlide === index ? 'active' : 'inactive'}`}
          style={{ backgroundImage: `url('${slide.url}')` }}
        />
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(96,48,18,0.12)_0%,rgba(171,92,33,0.18)_38%,rgba(255,214,170,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,229,198,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,190,132,0.22),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,24,39,0.22)_0%,rgba(17,24,39,0.04)_32%,rgba(17,24,39,0)_56%)]" />

      <div className="relative z-10 min-h-[calc(100vh-4.75rem)]">
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex max-w-7xl items-end justify-end gap-4">
            <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex gap-2">
                {homeSlides.map((slide, index) => (
                  <span
                    key={slide.id}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === index ? 'w-10 bg-white shadow-sm' : 'w-2.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <div className="flex translate-y-0 flex-wrap gap-3 opacity-100 transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => onNavigateSection('lich-trinh')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)] transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Đặt vé ngay
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenLookup}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/20 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  Tra cứu vé
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
