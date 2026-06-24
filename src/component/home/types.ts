import type { FormEventHandler, ReactNode, RefObject } from 'react'
import type { AuthUser, Location, TripSearchResult } from '../../api/config'

export interface HomePageProps {
  header: ReactNode
  footer: ReactNode
  currentSlide: number
  user: AuthUser | null
  from: string
  to: string
  date: string
  displayDate: string
  dateError: string | null
  todayIso: string
  loadingLocations: boolean
  loadingTrips: boolean
  hasSearchedTrips: boolean
  trips: TripSearchResult[]
  originGroups: [string, Location[]][]
  destinationGroups: [string, Location[]][]
  locationTypeLabels: Record<string, string>
  hiddenDateRef: RefObject<HTMLInputElement | null>
  resultsRef: RefObject<HTMLElement | null>
  onSearch: FormEventHandler<HTMLFormElement>
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onDisplayDateChange: (value: string) => void
  onDateBlur: () => void
  onDatePickerOpen: () => void
  onDateSelect: (value: string) => void
  onSelectTrip: (trip: TripSearchResult) => void
  onNavigateHome: () => void
  onNavigateSection: (sectionId: string) => void
  onOpenLookup: () => void
}
