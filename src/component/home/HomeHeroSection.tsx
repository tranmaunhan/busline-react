import type { ReactNode } from 'react'

interface HomeHeroSectionProps {
  currentSlide: number
  onNavigateSection: (sectionId: string) => void
  onOpenLookup: () => void
  searchSection: ReactNode
}

export default function HomeHeroSection({
  searchSection,
}: HomeHeroSectionProps) {
  return (
    <section id="top" className="group relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/anh_000.webp')" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.44)_0%,rgba(15,23,42,0.28)_35%,rgba(15,23,42,0.4)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)]" />

      <div className="relative z-10 flex min-h-[calc(100vh-4.75rem)] items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center">
          {searchSection}
        </div>
      </div>
    </section>
  )
}
