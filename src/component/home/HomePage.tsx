import ContactSection from './ContactSection'
import BookingStepsSection from './BookingStepsSection'
import FaqSection from './FaqSection'
import GallerySection from './GallerySection'
import HomeHeroSection from './HomeHeroSection'
import PopularRoutesSection from './PopularRoutesSection'
import ServiceReasonsSection from './ServiceReasonsSection'
import TestimonialsSection from './TestimonialsSection'
import TripResultsSection from './TripResultsSection'
import TripSearchSection from './TripSearchSection'
import type { HomePageProps } from './types'

export default function HomePage(props: HomePageProps) {
  const {
    header,
    footer,
    currentSlide,
    onNavigateSection,
    onOpenLookup,
  } = props

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#edf5ff_32%,_#ffffff_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="absolute right-[-10rem] top-32 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {header}

        <main className="flex-1">
          <HomeHeroSection
            currentSlide={currentSlide}
            onNavigateSection={onNavigateSection}
            onOpenLookup={onOpenLookup}
          />
          <TripSearchSection {...props} />
          <TripResultsSection {...props} />
          <PopularRoutesSection onNavigateSection={onNavigateSection} />
          <ServiceReasonsSection />
          <BookingStepsSection />
          <GallerySection />
          <TestimonialsSection />
          <FaqSection />
          <ContactSection />
        </main>

        <div className="mt-4">{footer}</div>
      </div>
    </div>
  )
}
