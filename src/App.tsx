import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, ChevronDown, CircleUserRound, Headphones, LogIn, LogOut, Mail, MapPin, Phone, Search, Ticket, User } from 'lucide-react'
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom'
import BookingLookupPage from './component/BookingLookupPage'
import ChangePasswordModal from './component/ChangePasswordModal'
import HomePage, { homeSlides } from './component/home'
import LoginModal from './component/LoginModal'
import MyBookingsPage from './component/MyBookingsPage'
import ProfilePage from './component/ProfilePage'
import RegisterModal from './component/RegisterModal'
import SeatSelectionPage from './component/SeatSelectionPage'
import BookingConfirmModal from './component/BookingConfirmModal'
import BookingSuccessModal from './component/BookingSuccessModal'
import { authAPI, bookingsAPI, locationsAPI, tripsAPI } from './api/config'
import type { AuthUser, BookingResponse, Location, LoginResponse, PopularRouteSummary, TripSearchResult, TripSeatMapResponse, TripSeatMapSeat, UpdateProfileRequest } from './api/config'
import { useToast } from './component/Toast'
import './App.css'

const routePlaceholder = '/anh_000.webp'

const toLocalDateISO = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateDisplay = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const parseDisplayToISO = (s: string) => {
  if (!s) return null
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null
  return toLocalDateISO(d)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const slides = homeSlides

const slideTexts = [
  'Không ngừng hoàn thiện để thành công',
  'Đặt vé nhanh chóng',
  'Minh bạch rõ ràng',
]

const locationTypeLabels: Record<string, string> = {
  STATION: 'Bến xe',
  HIGHWAY: 'Cao tốc',
  STOP: 'Điểm đón trả',
  Stop: 'Điểm đón trả',
}

const formatLocationLabel = (location: Location) => {
  const typeLabel = locationTypeLabels[location.type] || location.type
  return `${location.name} - ${location.address} (${typeLabel})`
}

const groupLocationsByType = (items: Location[]) => {
  const groups = new Map<string, Location[]>()

  items.forEach((location) => {
    const key = location.type.toUpperCase()
    const existing = groups.get(key) || []
    existing.push(location)
    groups.set(key, existing)
  })

  return Array.from(groups.entries())
}

const BOOKING_FLOW_STORAGE_KEY = 'vexe.booking.flow'
const LOOKUP_PAYMENT_POLL_INTERVAL_MS = 5000

interface PersistedBookingFlow {
  from: string
  to: string
  date: string
  trips: TripSearchResult[]
  hasSearchedTrips: boolean
  selectedTrip: TripSearchResult | null
}

const loadPersistedBookingFlow = (): PersistedBookingFlow | null => {
  return null
}

const persistBookingFlow = (state: PersistedBookingFlow) => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(BOOKING_FLOW_STORAGE_KEY, JSON.stringify(state))
}

const persistAuthSession = (response: LoginResponse) => {
  localStorage.setItem('authToken', response.accessToken)
  localStorage.setItem('authTokenType', response.tokenType)
  localStorage.setItem('authExpiresAt', String(Date.now() + response.expiresInMs))
  localStorage.setItem('userData', JSON.stringify(response.user))
}

interface SeatSelectionRouteProps {
  selectedTrip: TripSearchResult | null
  persistedSelectedTrip: TripSearchResult | null
  trips: TripSearchResult[]
  seatMap: TripSeatMapResponse | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  routeImageUrl?: string | null
  pickupLocationId: number
  dropoffLocationId: number
  pickupLocationName: string
  dropoffLocationName: string
  onResolveTrip: (trip: TripSearchResult) => void
  onBack: () => void
  onRetry: (tripId: number) => void
  onProceed: (
    seats: TripSeatMapSeat[],
    bookingDetails: {
      useShuttleService: boolean
      shuttleNote: string
      pickupLocationId: number
      dropoffLocationId: number
      pickupLocationName: string
      dropoffLocationName: string
    },
  ) => void
}

function SeatSelectionRoute({
  selectedTrip,
  persistedSelectedTrip,
  trips,
  seatMap,
  loading,
  error,
  isAuthenticated,
  routeImageUrl,
  pickupLocationId,
  dropoffLocationId,
  pickupLocationName,
  dropoffLocationName,
  onResolveTrip,
  onBack,
  onRetry,
  onProceed,
}: SeatSelectionRouteProps) {
  const params = useParams()
  const routeTripId = Number(params.tripId)

  const matchedTrip =
    (Number.isFinite(routeTripId) && selectedTrip?.tripId === routeTripId ? selectedTrip : null) ||
    (Number.isFinite(routeTripId) ? trips.find((trip) => trip.tripId === routeTripId) : null) ||
    (Number.isFinite(routeTripId) && persistedSelectedTrip?.tripId === routeTripId ? persistedSelectedTrip : null)

  useEffect(() => {
    if (matchedTrip && selectedTrip?.tripId !== matchedTrip.tripId) {
      onResolveTrip(matchedTrip)
    }
  }, [matchedTrip, onResolveTrip, selectedTrip?.tripId])

  if (!Number.isFinite(routeTripId)) {
    return <Navigate to="/" replace />
  }

  if (!matchedTrip) {
    return <Navigate to="/" replace />
  }

  const isTripResolved = selectedTrip?.tripId === matchedTrip.tripId
  const routeLoading = isTripResolved ? loading || (!seatMap && !error) : true

  return (
    <SeatSelectionPage
      trip={matchedTrip}
      seatMap={isTripResolved ? seatMap : null}
      loading={routeLoading}
      error={isTripResolved ? error : null}
      isAuthenticated={isAuthenticated}
      routeImageUrl={routeImageUrl}
      pickupLocationId={pickupLocationId}
      dropoffLocationId={dropoffLocationId}
      pickupLocationName={pickupLocationName}
      dropoffLocationName={dropoffLocationName}
      onBack={onBack}
      onRetry={() => onRetry(matchedTrip.tripId)}
      onProceed={onProceed}
    />
  )
}

function App() {
  const { showToast } = useToast()
  // Load persisted booking flow only once (useRef prevents re-parsing on every render)
  const restoredRef = useRef(loadPersistedBookingFlow())
  const restoredBookingFlow = restoredRef.current
  const persistedSelectedTrip = restoredBookingFlow?.selectedTrip ?? null

  const defaultDateIso = toLocalDateISO(new Date())
  const navigate = useNavigate()
  const location = useLocation()
  const seatRouteMatch = useMatch('/trips/:tripId/seats')
  const routeSeatTripId = Number(seatRouteMatch?.params.tripId ?? '')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [from, setFrom] = useState(() => restoredBookingFlow?.from ?? '')
  const [to, setTo] = useState(() => restoredBookingFlow?.to ?? '')
  const [date, setDate] = useState(() => restoredBookingFlow?.date ?? defaultDateIso)
  const [displayDate, setDisplayDate] = useState(() => formatDateDisplay(restoredBookingFlow?.date ?? defaultDateIso))
  const [dateError, setDateError] = useState<string | null>(null)
  const hiddenDateRef = useRef<HTMLInputElement | null>(null)
  const resultsRef = useRef<HTMLElement | null>(null)
  const seatMapRequestRef = useRef(0)
  const todayIso = defaultDateIso
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [lookupBookingCode, setLookupBookingCode] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupResult, setLookupResult] = useState<BookingResponse | null>(null)
  const [myBookings, setMyBookings] = useState<BookingResponse[]>([])
  const [myBookingsLoading, setMyBookingsLoading] = useState(false)
  const [myBookingsError, setMyBookingsError] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [trips, setTrips] = useState<TripSearchResult[]>(() => restoredBookingFlow?.trips ?? [])
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [popularRoutes, setPopularRoutes] = useState<PopularRouteSummary[]>([])
  const [loadingPopularRoutes, setLoadingPopularRoutes] = useState(false)
  const [hasSearchedTrips, setHasSearchedTrips] = useState(() => restoredBookingFlow?.hasSearchedTrips ?? false)
  const [selectedTrip, setSelectedTrip] = useState<TripSearchResult | null>(() => restoredBookingFlow?.selectedTrip ?? null)
  const [seatMap, setSeatMap] = useState<TripSeatMapResponse | null>(null)
  const [loadingSeatMap, setLoadingSeatMap] = useState(false)
  const [seatMapError, setSeatMapError] = useState<string | null>(null)

  const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false)
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false)
  const [paymentModalSource, setPaymentModalSource] = useState<'checkout' | 'my-bookings' | null>(null)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [bookingConfirmData, setBookingConfirmData] = useState<{
    seats: TripSeatMapSeat[]
    pickupLocationId: number
    dropoffLocationId: number
    pickupLocationName: string
    dropoffLocationName: string
    note: string
  } | null>(null)
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const resetSearchResults = () => {
    setTrips([])
    setHasSearchedTrips(false)
    setSelectedTrip(null)
    setSeatMap(null)
    setSeatMapError(null)
    setLoadingSeatMap(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData) as AuthUser
        setUser(parsedUserData)
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('authTokenType')
        localStorage.removeItem('authExpiresAt')
        localStorage.removeItem('userData')
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return

    const targetId = decodeURIComponent(location.hash.slice(1))
    const timer = window.setTimeout(() => {
      if (targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      const element = document.getElementById(targetId)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)

    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname])

  useEffect(() => {
    if (user?.phone && !lookupPhone) {
      setLookupPhone(user.phone)
    }
  }, [lookupPhone, user?.phone])

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoadingLocations(true)
        const data = await locationsAPI.getLocations()
        const sortedLocations = [...data].sort((a, b) => a.id - b.id)
        setLocations(sortedLocations)
      } catch (error) {
        console.error('Error loading locations:', error)
        setLocations([])
      } finally {
        setLoadingLocations(false)
      }
    }

    loadLocations()
  }, [])

  useEffect(() => {
    const loadPopularRoutes = async () => {
      try {
        setLoadingPopularRoutes(true)
        const data = await tripsAPI.getPopularRoutes()
        setPopularRoutes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error loading popular routes:', error)
        setPopularRoutes([])
      } finally {
        setLoadingPopularRoutes(false)
      }
    }

    loadPopularRoutes()
  }, [])

  const getDestinationLocations = () => {
    if (!from) return locations
    return locations.filter((location) => String(location.id) !== from)
  }

  const handleFromChange = (value: string) => {
    if (value !== from) {
      resetSearchResults()
    }

    setFrom(value)

    if (to && to === value) {
      setTo('')
    }
  }

  const handleToChange = (value: string) => {
    if (value !== to) {
      resetSearchResults()
    }

    setTo(value)
  }

  const commitSearchDate = (iso: string) => {
    if (iso !== date) {
      resetSearchResults()
    }

    setDate(iso)
    setDisplayDate(formatDateDisplay(iso))
    setDateError(null)
  }

  useEffect(() => {
    setDisplayDate(formatDateDisplay(date))
  }, [date])

  useEffect(() => {
    persistBookingFlow({
      from,
      to,
      date,
      trips,
      hasSearchedTrips,
      selectedTrip,
    })
  }, [from, to, date, trips, hasSearchedTrips, selectedTrip])

  const handleLoginSuccess = (userData: AuthUser) => {
    setUser(userData)
    showToast('Đăng nhập thành công!', 'success')
  }

  const handleUpdateProfile = useCallback(async (payload: UpdateProfileRequest) => {
    const response = await authAPI.updateProfile(payload)
    persistAuthSession(response)
    setUser(response.user)
    showToast('Cập nhật thông tin cá nhân thành công.', 'success')
  }, [showToast])

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    setShowChangePasswordModal(false)
    setShowBookingSuccessModal(false)
    setPaymentModalSource(null)
    setBookingResult(null)
    setUser(null)
    setMyBookings([])
    setMyBookingsError(null)
    setCancellingBookingId(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authTokenType')
    localStorage.removeItem('authExpiresAt')
    localStorage.removeItem('userData')
    showToast('Đã đăng xuất thành công!', 'success')
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
  }

  const closeRegisterModal = () => {
    setShowRegisterModal(false)
  }

  const handleRegisterClick = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleLoginClickFromRegister = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const handleOpenLoginFromMenu = () => {
    setIsUserMenuOpen(false)
    setShowLoginModal(true)
  }

  const handleNavigateFromMenu = (path: string) => {
    setIsUserMenuOpen(false)
    navigate(path)
  }

  const showProfileFeatureToast = useCallback((featureName: string) => {
    showToast(`${featureName} sẽ sớm được cập nhật.`, 'info')
  }, [showToast])

  const loadMyBookings = useCallback(async () => {
    try {
      setMyBookingsLoading(true)
      setMyBookingsError(null)
      const data = await bookingsAPI.getMyBookings()
      setMyBookings(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error loading my bookings:', error)
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Không thể tải danh sách đơn hàng. Vui lòng thử lại.'

      setMyBookings([])
      setMyBookingsError(message)
    } finally {
      setMyBookingsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setMyBookings([])
      setMyBookingsError(null)
      setMyBookingsLoading(false)
      setCancellingBookingId(null)
      return
    }

    if (location.pathname !== '/my-bookings') {
      return
    }

    loadMyBookings()
  }, [loadMyBookings, location.pathname, user])

  const handleCancelPendingBooking = useCallback(async (bookingId: number) => {
    const booking = myBookings.find((item) => item.id === bookingId)

    if (!booking) {
      showToast('Không tìm thấy booking để hủy.', 'error')
      return
    }

    if (!(booking.status === 0 || booking.status === '0')) {
      showToast('Chỉ booking chờ thanh toán mới được hủy.', 'warning')
      return
    }

    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn ${booking.bookingCode}?`)) {
      return
    }

    try {
      setCancellingBookingId(bookingId)
      const response = await bookingsAPI.cancelPendingBooking(bookingId)
      showToast(response.message || `Đã hủy đơn ${booking.bookingCode}.`, 'success')
      await loadMyBookings()
    } catch (error: any) {
      console.error('Error cancelling pending booking:', error)
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Không thể hủy booking này. Vui lòng thử lại.'

      showToast(message, 'error')
    } finally {
      setCancellingBookingId(null)
    }
  }, [loadMyBookings, myBookings, showToast])

  const handlePayPendingBooking = useCallback((bookingId: number) => {
    const booking = myBookings.find((item) => item.id === bookingId)

    if (!booking) {
      showToast('Không tìm thấy booking để thanh toán.', 'error')
      return
    }

    if (!(booking.status === 0 || booking.status === '0')) {
      showToast('Booking này không còn ở trạng thái chờ thanh toán.', 'warning')
      return
    }

    setBookingResult(booking)
    setPaymentModalSource('my-bookings')
    setShowBookingSuccessModal(true)
  }, [myBookings, showToast])

  const handleChangePassword = useCallback(async (payload: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }) => {
    await authAPI.changePassword(payload)
    setShowChangePasswordModal(false)
    showToast('Đổi mật khẩu thành công.', 'success')
  }, [showToast])

  const handlePendingProfileFeature = useCallback((featureName: string) => {
    showToast(`${featureName} sẽ sớm được cập nhật.`, 'info')
  }, [showToast])

  const refreshLookupBooking = useCallback(async (bookingCode: string, phone: string, suppressError = false) => {
    try {
      const data = await bookingsAPI.lookupBooking(bookingCode, phone)
      setLookupResult(data)
      setLookupError(null)
      return data
    } catch (error) {
      console.error('Error refreshing booking lookup:', error)
      if (!suppressError) {
        throw error
      }
      return null
    }
  }, [])

  const handleBookingLookupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const bookingCode = lookupBookingCode.trim()
    const phone = lookupPhone.trim()

    if (!bookingCode || !phone) {
      setLookupError('Vui lòng nhập mã đặt vé và số điện thoại để tra cứu!')
      setLookupResult(null)
      showToast('Vui lòng nhập mã đặt vé và số điện thoại để tra cứu!', 'warning')
      return
    }

    setLookupLoading(true)
    setLookupError(null)

    refreshLookupBooking(bookingCode, phone)
      .then((data) => {
        if (!data) return

        setLookupResult(data)
        setLookupError(null)
        showToast(`Tra cứu thành công đơn ${data.bookingCode}!`, 'success')
      })
      .catch((error: any) => {
        console.error('Error looking up booking:', error)

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không tìm thấy đơn đặt vé. Vui lòng kiểm tra lại BookingCode và số điện thoại.'

        setLookupResult(null)
        setLookupError(message)
        showToast(message, 'error')
      })
      .finally(() => {
        setLookupLoading(false)
      })
  }

  useEffect(() => {
    const isLookupPage = location.pathname === '/booking-lookup'
    const isPendingPayment = lookupResult?.status === 0 || lookupResult?.status === '0'
    const phone = lookupPhone.trim()

    if (!isLookupPage || !lookupResult?.bookingCode || !isPendingPayment || !phone) {
      return
    }

    let isMounted = true
    let isCheckingPayment = false
    let isRefreshingLookup = false

    const pollPaymentStatus = async () => {
      if (!isMounted || isCheckingPayment || isRefreshingLookup) return

      try {
        isCheckingPayment = true
        const paymentStatus = await bookingsAPI.getPaymentStatus(lookupResult.bookingCode)

        if (!isMounted || !(paymentStatus.success && paymentStatus.status === 1)) {
          return
        }

        isRefreshingLookup = true
        const refreshedBooking = await refreshLookupBooking(lookupResult.bookingCode, phone, true)

        if (!isMounted || !refreshedBooking) {
          return
        }

        if (refreshedBooking.status === 1 || refreshedBooking.status === '1') {
          showToast(`Đơn ${refreshedBooking.bookingCode} đã được thanh toán. Đã làm mới kết quả tra cứu!`, 'success')
        }
      } catch (error) {
        console.error('Error polling payment status from lookup page:', error)
      } finally {
        isCheckingPayment = false
        isRefreshingLookup = false
      }
    }

    pollPaymentStatus()
    const interval = window.setInterval(pollPaymentStatus, LOOKUP_PAYMENT_POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [location.pathname, lookupPhone, lookupResult?.bookingCode, lookupResult?.status, refreshLookupBooking, showToast])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % homeSlides.length)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!(hasSearchedTrips || loadingTrips) || location.pathname !== '/') return

    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [hasSearchedTrips, loadingTrips, location.pathname])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!from || !to || !date) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'warning')
      return
    }

    const originId = Number(from)
    const destinationId = Number(to)

    if (!originId || !destinationId) {
      showToast('Không tìm thấy thông tin điểm đi hoặc điểm đến!', 'error')
      return
    }

    searchTrips(originId, destinationId, date)
  }

  const handleGuestFriendlySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!from || !to || !date) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'warning')
      return
    }

    const originId = Number(from)
    const destinationId = Number(to)

    if (!originId || !destinationId) {
      showToast('Không tìm thấy thông tin điểm đi hoặc điểm đến!', 'error')
      return
    }

    searchTrips(originId, destinationId, date)
  }

  const searchTrips = async (originId: number, destinationId: number, searchDate: string) => {
    try {
      setLoadingTrips(true)
      setHasSearchedTrips(true)
      const data = await tripsAPI.searchTrips({
        pickupLocationId: originId,
        dropoffLocationId: destinationId,
        departureDate: searchDate,
      })
      setTrips(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error searching trips:', error)
      showToast('Có lỗi xảy ra khi tìm chuyến xe. Vui lòng thử lại!', 'error')
      setTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }

  const fetchSeatMap = useCallback(async (tripId: number) => {
    const requestId = seatMapRequestRef.current + 1
    seatMapRequestRef.current = requestId

    try {
      setLoadingSeatMap(true)
      setSeatMapError(null)
      const data = await tripsAPI.getSeatMap(tripId)
      if (seatMapRequestRef.current !== requestId) return
      setSeatMap(data)
    } catch (error) {
      if (seatMapRequestRef.current !== requestId) return
      console.error('Error loading seat map:', error)
      setSeatMap(null)
      setSeatMapError('Không thể tải sơ đồ ghế cho chuyến này. Vui lòng thử lại.')
    } finally {
      if (seatMapRequestRef.current !== requestId) return
      setLoadingSeatMap(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedTrip || !seatRouteMatch) return
    if (!Number.isFinite(routeSeatTripId) || selectedTrip.tripId !== routeSeatTripId) return
    setSeatMap(null)
    setSeatMapError(null)
    fetchSeatMap(selectedTrip.tripId)
  }, [routeSeatTripId, seatRouteMatch, selectedTrip, fetchSeatMap])

  const handleSelectTrip = (trip: TripSearchResult) => {
    setLoadingSeatMap(true)
    setSeatMap(null)
    setSeatMapError(null)
    setSelectedTrip(trip)
    navigate(`/trips/${trip.tripId}/seats`)
  }

  const handleBackFromSeatMap = () => {
    seatMapRequestRef.current += 1
    setSelectedTrip(null)
    setSeatMap(null)
    setSeatMapError(null)
    setLoadingSeatMap(false)
    navigate('/')
  }

  const handleResolveSeatRouteTrip = (trip: TripSearchResult) => {
    setLoadingSeatMap(true)
    setSeatMap(null)
    setSeatMapError(null)
    setSelectedTrip(trip)
  }

  const handleProceedWithSeats = (
    selectedSeats: TripSeatMapSeat[],
    bookingDetails: {
      useShuttleService: boolean
      shuttleNote: string
      pickupLocationId: number
      dropoffLocationId: number
      pickupLocationName: string
      dropoffLocationName: string
    },
  ) => {
    const bookingNote = bookingDetails.useShuttleService
      ? bookingDetails.shuttleNote
        ? `Yeu cau trung chuyen: ${bookingDetails.shuttleNote}`
        : 'Yeu cau trung chuyen'
      : ''

    setBookingConfirmData({
      seats: selectedSeats,
      pickupLocationId: bookingDetails.pickupLocationId,
      dropoffLocationId: bookingDetails.dropoffLocationId,
      pickupLocationName: bookingDetails.pickupLocationName,
      dropoffLocationName: bookingDetails.dropoffLocationName,
      note: bookingNote,
    })
    setShowBookingConfirmModal(true)
  }

  const handleProceedWithAuthCheck = (
    selectedSeats: TripSeatMapSeat[],
    bookingDetails: {
      useShuttleService: boolean
      shuttleNote: string
      pickupLocationId: number
      dropoffLocationId: number
      pickupLocationName: string
      dropoffLocationName: string
    },
  ) => {
    handleProceedWithSeats(selectedSeats, bookingDetails)
  }

  const handleBookingSuccess = (booking: BookingResponse) => {
    setLookupBookingCode(booking.bookingCode)
    setLookupPhone(booking.contactPhone || '')
    setBookingResult(booking)
    setPaymentModalSource('checkout')
    setShowBookingSuccessModal(true)
  }

  const handleCloseBookingSuccess = () => {
    setShowBookingSuccessModal(false)
    setBookingResult(null)
    setPaymentModalSource(null)

    if (paymentModalSource === 'my-bookings') {
      return
    }

    setBookingConfirmData(null)
    resetSearchResults()
    navigate('/')
  }

  const handlePaymentConfirmed = useCallback((bookingCode: string) => {
    setShowBookingSuccessModal(false)
    setBookingResult(null)
    const currentSource = paymentModalSource
    setPaymentModalSource(null)
    if (currentSource === 'my-bookings') {
      showToast(`Thanh toán thành công cho đơn ${bookingCode}!`, 'success')
      void loadMyBookings()
      return
    }
    setBookingConfirmData(null)
    resetSearchResults()
    showToast(`Thanh toán thành công cho đơn ${bookingCode}!`, 'success')
    navigate('/')
  }, [loadMyBookings, navigate, paymentModalSource, showToast])

  const destinationGroups = groupLocationsByType(getDestinationLocations())
  const originGroups = groupLocationsByType(locations)

  const renderHeader = () => (
    <header className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="rounded-full border border-sky-100 bg-white/90 px-3 py-1.5 text-base font-bold text-slate-900 shadow-[0_10px_30px_rgba(148,163,184,0.16)] backdrop-blur transition hover:bg-white sm:px-4 sm:py-2 sm:text-xl"
      >
        Saigon<span className="text-orange-500">.ST</span>
      </button>

      <div ref={userMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((current) => !current)}
          className={`flex items-center rounded-2xl border border-sky-100 bg-white/90 text-slate-700 shadow-[0_10px_30px_rgba(148,163,184,0.16)] backdrop-blur transition hover:bg-white ${user ? 'gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2' : 'gap-1.5 px-3 py-2'
            }`}
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          aria-label={user ? 'Mở menu tài khoản' : 'Mở menu lựa chọn'}
        >
          <User className="h-5 w-5 shrink-0 text-slate-500" />
          {user ? (
            <span className="hidden min-w-0 text-left sm:flex sm:flex-col sm:items-start sm:leading-tight">
              <span className="text-sm font-medium text-slate-800">
                {user.fullName || user.username || 'User'}
              </span>
              <span className="text-xs text-slate-500">
                {[user.phone].filter(Boolean).join(' - ') || user.email}
              </span>
            </span>
          ) : null}
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isUserMenuOpen ? (
          <div className="absolute right-0 z-30 mt-2 w-[250px] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {user ? 'Tài khoản của bạn' : 'Tùy chọn nhanh'}
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {user ? user.fullName || user.username || 'Người dùng' : 'Chọn thao tác bạn muốn'}
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => handleNavigateFromMenu('/booking-lookup')}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>Tra cứu vé</span>
              </button>

              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavigateFromMenu('/my-bookings')}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Ticket className="h-4 w-4 shrink-0" />
                    <span>Xem đơn đã đặt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigateFromMenu('/profile')}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    <CircleUserRound className="h-4 w-4 shrink-0" />
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLoginFromMenu}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-orange-600 transition hover:bg-orange-50"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )

  const renderUtilityPage = (
    title: string,
    description: string,
    primaryAction: {
      label: string
      onClick: () => void
    },
    secondaryAction?: {
      label: string
      onClick: () => void
    },
  ) => (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_45%,_#f8fbff_100%)] text-slate-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        {renderHeader()}

        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
          <section className="w-full rounded-[2rem] border border-sky-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:p-10">
            <div className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Saigon.ST
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                {primaryAction.label}
              </button>

              {secondaryAction ? (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {secondaryAction.label}
                </button>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  )

  const searchPage = location.pathname === '/__legacy__' ? (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,_#f8fbff_0%,_#eff6ff_45%,_#f8fbff_100%)] text-slate-900">
      {/* Slide backgrounds — keep absolute */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide-bg ${currentSlide === index ? 'active' : 'inactive'}`}
          style={{ backgroundImage: `url('${slide.url}')` }}
        />
      ))}

      {/* Main content wrapper — flexbox, not absolute */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {renderHeader()}

        {/* ===== HERO SECTION ===== */}
        <div className="flex flex-col items-center px-4 pt-3 text-center sm:pt-8">
          <p className="hidden rounded-full border border-sky-100 bg-white/100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm backdrop-blur sm:inline-flex sm:px-4 sm:text-xs">Saigon.ST Busline</p>
          <h1 id="heading" className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-slate-900 text-balance sm:mt-4 sm:text-4xl lg:text-5xl">
            {slideTexts[currentSlide]}
          </h1>
          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-slate-600 sm:mt-4 sm:block sm:text-base sm:leading-7">
            Trải nghiệm đặt vé đơn giản, thông tin rõ ràng và minh bạch cùng Saigon.ST.
          </p>
        </div>

        {/* ===== SEARCH FORM ===== */}
        <div className="mx-auto mt-5 w-full max-w-5xl px-3 sm:mt-8 sm:px-4">
          <form onSubmit={handleSearch} className="rounded-2xl border border-sky-100 bg-white p-3 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <div>
                <label htmlFor="from" className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nơi đi</label>
                <div className="flex items-center rounded-xl border border-sky-100 bg-sky-50/70 px-3 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                  <MapPin className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5 shrink-0" />
                  <select
                    id="from"
                    value={from}
                    onChange={(event) => handleFromChange(event.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm text-slate-700 outline-none disabled:cursor-not-allowed sm:py-3"
                    disabled={loadingLocations}
                  >
                    <option value="">
                      {loadingLocations ? 'Đang tải...' : 'Chọn điểm đi...'}
                    </option>
                    {originGroups.map(([type, items]) => (
                      <optgroup key={type} label={locationTypeLabels[type] || type}>
                        {items.map((location) => (
                          <option key={location.id} value={String(location.id)}>
                            {formatLocationLabel(location)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="to" className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nơi đến</label>
                <div className="flex items-center rounded-xl border border-sky-100 bg-sky-50/70 px-3 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                  <MapPin className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5 shrink-0" />
                  <select
                    id="to"
                    value={to}
                    onChange={(event) => handleToChange(event.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm text-slate-700 outline-none disabled:cursor-not-allowed sm:py-3"
                    disabled={loadingLocations}
                  >
                    <option value="">
                      {loadingLocations ? 'Đang tải...' : from ? 'Chọn điểm đến...' : 'Chọn điểm đi trước'}
                    </option>
                    {destinationGroups.map(([type, items]) => (
                      <optgroup key={type} label={locationTypeLabels[type] || type}>
                        {items.map((location) => (
                          <option key={location.id} value={String(location.id)}>
                            {formatLocationLabel(location)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="date" className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ngày</label>
                <div className="relative">
                  <input
                    id="date"
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    value={displayDate}
                    onChange={(event) => {
                      setDisplayDate(event.target.value)
                      setDateError(null)
                    }}
                    onBlur={() => {
                      const iso = parseDisplayToISO(displayDate)
                      if (!iso) {
                        setDateError('Định dạng ngày không hợp lệ (dd/mm/yyyy)')
                        return
                      }
                      if (iso < todayIso) {
                        setDateError('Không thể chọn ngày đã qua')
                        return
                      }
                      commitSearchDate(iso)
                    }}
                    className={`w-full rounded-xl border bg-sky-50/70 p-2.5 pr-12 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-4 focus:ring-orange-100 sm:rounded-2xl sm:p-3 ${dateError ? 'border-red-400' : 'border-sky-100 focus:border-orange-300'}`}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (hiddenDateRef.current) {
                        try {
                          // @ts-ignore
                          if (typeof hiddenDateRef.current.showPicker === 'function') hiddenDateRef.current.showPicker()
                          else hiddenDateRef.current.focus()
                          hiddenDateRef.current.click()
                        } catch {
                          hiddenDateRef.current.focus()
                        }
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-white hover:text-orange-500"
                    aria-label="Mở lịch chọn ngày"
                  >
                    <CalendarDays className="h-5 w-5" />
                  </button>

                  <input
                    ref={hiddenDateRef}
                    type="date"
                    value={date}
                    min={todayIso}
                    onChange={(e) => {
                      const iso = e.target.value
                      if (iso) {
                        commitSearchDate(iso)
                      }
                    }}
                    className="sr-only"
                    aria-hidden
                  />
                  {dateError && <div className="mt-1 text-xs text-red-500 sm:text-sm">{dateError}</div>}
                </div>
              </div>

              <div>
                <button
                  id="btn"
                  type="submit"
                  disabled={loadingTrips}
                  className="w-full rounded-xl bg-orange-500 p-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:p-3"
                >
                  {loadingTrips ? 'Đang tìm...' : 'Tìm vé'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ===== SEARCH RESULTS ===== */}
        {(hasSearchedTrips || loadingTrips) && (
          <div className="mx-auto mt-5 w-full max-w-5xl px-3 pb-8 sm:mt-8 sm:px-4 sm:pb-12">
            <div className="rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:rounded-[2rem] sm:p-6">
              <h3 className="mb-3 text-base font-bold text-slate-800 sm:mb-4 sm:text-xl">
                Kết quả tìm kiếm chuyến xe
              </h3>

              {loadingTrips ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-2 text-slate-600">Đang tìm chuyến xe...</p>
                </div>
              ) : trips.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {trips.map((trip) => (
                    <div
                      key={trip.tripId}
                      className="rounded-xl border border-sky-100 bg-[linear-gradient(135deg,_#ffffff_0%,_#f7fbff_100%)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(148,163,184,0.16)] sm:rounded-[1.5rem] sm:p-5"
                    >
                      {/* Mobile: stack vertically. Tablet+: side by side */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex items-center gap-3 sm:gap-4">
                            <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-lg font-bold text-orange-500 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-2xl">
                              {new Date(trip.departureTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-800 text-sm sm:text-base">{trip.routeOrigin}</span>
                                <span className="text-sky-400 text-xs">→</span>
                                <span className="font-semibold text-slate-800 text-sm sm:text-base">{trip.routeDestination}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 sm:gap-x-4 sm:text-sm">
                            <span>Biển số: {trip.licensePlate}</span>
                            <span>Loại xe: {trip.vehicleType}</span>
                            <span className="font-semibold text-orange-600">{formatCurrency(trip.price)}</span>
                          </div>
                        </div>
                        <div className="sm:ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelectTrip(trip)}
                            className="w-full rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600 sm:w-auto sm:px-6"
                          >
                            Đặt vé
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p>Không tìm thấy chuyến xe nào phù hợp.</p>
                  <p className="text-sm mt-1">Hãy thử thay đổi ngày hoặc tuyến đường khác.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null

  const isHomePage = location.pathname === '/'

  const handleNavigateHomeSection = (sectionId: string) => {
    setIsUserMenuOpen(false)

    if (!isHomePage) {
      navigate({ pathname: '/', hash: `#${sectionId}` })
      return
    }

    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      return
    }
    if (sectionId === 'lich-trinh') {
      window.scrollTo({ top: 450, behavior: 'smooth' })
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      return
    }
    if (sectionId === 'tuyen-pho-bien') {
      window.scrollTo({ top: 950, behavior: 'smooth' })
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      return
    }

    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${sectionId}`)
  }

  const siteHeader = () => {
    const navItems = [
      { label: 'Trang chủ', onClick: () => handleNavigateHomeSection('top') },
      { label: 'Tuyến phổ biến', onClick: () => handleNavigateHomeSection('tuyen-pho-bien') },
      { label: 'Liên hệ', onClick: () => handleNavigateHomeSection('lien-he') },
      { label: 'Tra cứu', onClick: () => navigate('/booking-lookup') },
    ]

    return (
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleNavigateHomeSection('top')}
                className="rounded-full border border-sky-100 bg-white px-4 py-2 text-base font-black text-slate-900 shadow-sm transition hover:bg-slate-50 sm:text-xl"
              >
                Saigon<span className="text-orange-500">.ST</span>
              </button>

              <nav className="hidden items-center gap-1 lg:flex">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:19001010"
                className="hidden items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 md:inline-flex"
              >
                <Phone className="h-4 w-4" />
                1900 1010
              </a>

              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className={`flex items-center rounded-2xl border border-sky-100 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 ${user ? 'gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2' : 'gap-1.5 px-3 py-2'
                    }`}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  aria-label={user ? 'Mở menu tài khoản' : 'Mở menu lựa chọn'}
                >
                  <User className="h-5 w-5 shrink-0 text-slate-500" />
                  {user ? (
                    <span className="hidden min-w-0 text-left sm:flex sm:flex-col sm:items-start sm:leading-tight">
                      <span className="text-sm font-medium text-slate-800">
                        {user.fullName || user.username || 'User'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {[user.phone].filter(Boolean).join(' - ') || user.email}
                      </span>
                    </span>
                  ) : null}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-[260px] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {user ? 'Tài khoản của bạn' : 'Tùy chọn nhanh'}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {user ? user.fullName || user.username || 'Người dùng' : 'Chọn thao tác bạn muốn'}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      {/* <button
                        type="button"
                        onClick={() => handleNavigateFromMenu('/booking-lookup')}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                      >
                        <Search className="h-4 w-4 shrink-0" />
                        <span>Tra cứu vé</span>
                      </button> */}

                      {user ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleNavigateFromMenu('/my-bookings')}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                          >
                            <Ticket className="h-4 w-4 shrink-0" />
                            <span>Xem đơn đã đặt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNavigateFromMenu('/profile')}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                          >
                            <CircleUserRound className="h-4 w-4 shrink-0" />
                            <span>Hồ sơ cá nhân</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                          >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Đăng xuất</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenLoginFromMenu}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-orange-600 transition hover:bg-orange-50"
                        >
                          <LogIn className="h-4 w-4 shrink-0" />
                          <span>Đăng nhập</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    )
  }

  const siteFooter = () => (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-base font-black">
            Saigon<span className="text-orange-400">.ST</span> Busline
          </div>
          {/* <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Giao diện trang chủ mới tập trung vào nhận diện doanh nghiệp, thông tin liên hệ rõ ràng và trải nghiệm đặt vé
            gọn gàng hơn cho khách hàng.
          </p> */}
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
              <span>Hotline đặt vé: 1900 1010</span>
            </div>
            <div className="flex items-start gap-3">
              <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
              <span>Zalo hỗ trợ: 0352789648 | Hỗ trợ 24/24</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
              <span>Email: hotro@SaigonST.vn</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
              <span>Địa chỉ: Bến xe Miền Tây, TP.HCM</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Điều hướng nhanh</h3>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={() => handleNavigateHomeSection('top')} className="text-left text-sm text-slate-300 transition hover:text-white">
              Trang chủ
            </button>
            <button type="button" onClick={() => handleNavigateHomeSection('lich-trinh')} className="text-left text-sm text-slate-300 transition hover:text-white">
              Lịch trình
            </button>
            <button type="button" onClick={() => handleNavigateHomeSection('tuyen-pho-bien')} className="text-left text-sm text-slate-300 transition hover:text-white">
              Tuyến phổ biến
            </button>
            <button type="button" onClick={() => navigate('/booking-lookup')} className="text-left text-sm text-slate-300 transition hover:text-white">
              Tra cứu vé
            </button>
            <button type="button" onClick={() => handleNavigateHomeSection('lien-he')} className="text-left text-sm text-slate-300 transition hover:text-white">
              Liên hệ
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Chính sách tạm thời</h3>
          <div className="mt-4 grid gap-2">
            {['Chính sách đặt vé', 'Điều khoản sử dụng', 'Chính sách hoàn hủy', 'Bảo mật thông tin'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        Saigon.ST Busline
      </div>
    </footer>
  )

  const landingPage = (
    <HomePage
      header={siteHeader()}
      footer={siteFooter()}
      currentSlide={currentSlide}
      user={user}
      from={from}
      to={to}
      date={date}
      displayDate={displayDate}
      dateError={dateError}
      todayIso={todayIso}
      loadingLocations={loadingLocations}
      loadingTrips={loadingTrips}
      loadingPopularRoutes={loadingPopularRoutes}
      hasSearchedTrips={hasSearchedTrips}
      trips={trips}
      popularRoutes={popularRoutes}
      originGroups={originGroups}
      destinationGroups={destinationGroups}
      locationTypeLabels={locationTypeLabels}
      hiddenDateRef={hiddenDateRef}
      resultsRef={resultsRef}
      onSearch={handleGuestFriendlySearch}
      onFromChange={handleFromChange}
      onToChange={handleToChange}
      onDisplayDateChange={(value) => {
        setDisplayDate(value)
        setDateError(null)
      }}
      onDateBlur={() => {
        const iso = parseDisplayToISO(displayDate)
        if (!iso) {
          setDateError('Định dạng ngày không hợp lệ (dd/mm/yyyy)')
          return
        }
        if (iso < todayIso) {
          setDateError('Không thể chọn ngày đã qua')
          return
        }
        commitSearchDate(iso)
      }}
      onDatePickerOpen={() => {
        if (hiddenDateRef.current) {
          try {
            // @ts-ignore
            if (typeof hiddenDateRef.current.showPicker === 'function') hiddenDateRef.current.showPicker()
            else hiddenDateRef.current.focus()
            hiddenDateRef.current.click()
          } catch {
            hiddenDateRef.current.focus()
          }
        }
      }}
      onDateSelect={(value) => {
        if (value) {
          commitSearchDate(value)
        }
      }}
      onSelectTrip={handleSelectTrip}
      onNavigateHome={() => handleNavigateHomeSection('top')}
      onNavigateSection={handleNavigateHomeSection}
      onOpenLookup={() => navigate('/booking-lookup')}
    />
  )

  const pickupLocationId = Number(from)
  const dropoffLocationId = Number(to)

  const pickupLoc = locations.find((l) => l.id === pickupLocationId)
  const dropoffLoc = locations.find((l) => l.id === dropoffLocationId)

  const pickupLocationName = pickupLoc ? `${pickupLoc.name} - ${pickupLoc.address}` : ''
  const dropoffLocationName = dropoffLoc ? `${dropoffLoc.name} - ${dropoffLoc.address}` : ''
  const bookingLookupPage = (
    <BookingLookupPage
      header={siteHeader()}
      footer={siteFooter()}
      bookingCode={lookupBookingCode}
      phone={lookupPhone}
      suggestedPhone={user?.phone}
      isLoading={lookupLoading}
      errorMessage={lookupError}
      bookingResult={lookupResult}
      onBookingCodeChange={(value) => {
        setLookupBookingCode(value.toUpperCase())
        setLookupError(null)
        setLookupResult(null)
      }}
      onPhoneChange={(value) => {
        setLookupPhone(value)
        setLookupError(null)
        setLookupResult(null)
      }}
      onSubmit={handleBookingLookupSubmit}
      onBackHome={() => navigate('/')}
    />
  )
  const myBookingsPage = user
    ? renderUtilityPage(
      'Đơn đã đặt',
      'Đây là trang tổng hợp để người dùng xem lại các đơn đã đặt. Hiện tại mình đã nối route và menu để bạn có sẵn điểm đặt cho phần danh sách đơn hàng sau này.',
      {
        label: 'Đặt vé tiếp',
        onClick: () => navigate('/'),
      },
      {
        label: 'Hồ sơ cá nhân',
        onClick: () => navigate('/profile'),
      },
    )
    : <Navigate to="/" replace />
  const profilePage = user
    ? (
      <ProfilePage
        header={siteHeader()}
        footer={siteFooter()}
        user={user}
        onBackHome={() => navigate('/')}
        onViewBookings={() => navigate('/my-bookings')}
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={() => handlePendingProfileFeature('Chức năng thay đổi mật khẩu')}
      />
    )
    : <Navigate to="/" replace />

  const resolvedMyBookingsPage = user
    ? (
      <MyBookingsPage
        header={siteHeader()}
        footer={siteFooter()}
        bookings={myBookings}
        loading={myBookingsLoading}
        error={myBookingsError}
        cancellingBookingId={cancellingBookingId}
        onReload={loadMyBookings}
        onBackHome={() => navigate('/')}
        onPayBooking={handlePayPendingBooking}
        onCancelBooking={handleCancelPendingBooking}
      />
    )
    : <Navigate to="/" replace />

  const resolvedProfilePage = user
    ? (
      <ProfilePage
        header={siteHeader()}
        footer={siteFooter()}
        user={user}
        onBackHome={() => navigate('/')}
        onViewBookings={() => navigate('/my-bookings')}
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={() => setShowChangePasswordModal(true)}
      />
    )
    : <Navigate to="/" replace />

  void renderUtilityPage
  void showProfileFeatureToast
  void handlePendingProfileFeature
  void myBookingsPage
  void profilePage
  void searchPage

  return (
    <>
      <Routes>
        <Route path="/" element={landingPage} />
        <Route path="/booking-lookup" element={bookingLookupPage} />
        <Route path="/my-bookings" element={resolvedMyBookingsPage} />
        <Route path="/profile" element={resolvedProfilePage} />
        <Route
          path="/trips/:tripId/seats"
          element={
            <SeatSelectionRoute
              selectedTrip={selectedTrip}
              persistedSelectedTrip={persistedSelectedTrip}
              trips={trips}
              seatMap={seatMap}
              loading={loadingSeatMap}
              error={seatMapError}
              isAuthenticated={Boolean(user)}
              routeImageUrl={routePlaceholder}
              pickupLocationId={pickupLocationId}
              dropoffLocationId={dropoffLocationId}
              pickupLocationName={pickupLocationName}
              dropoffLocationName={dropoffLocationName}
              onResolveTrip={handleResolveSeatRouteTrip}
              onBack={handleBackFromSeatMap}
              onRetry={fetchSeatMap}
              onProceed={handleProceedWithAuthCheck}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoginModal
        show={showLoginModal}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={handleRegisterClick}
      />

      <RegisterModal
        show={showRegisterModal}
        onClose={closeRegisterModal}
        onLoginClick={handleLoginClickFromRegister}
      />

      {selectedTrip && bookingConfirmData && (
        <BookingConfirmModal
          show={showBookingConfirmModal}
          onClose={() => setShowBookingConfirmModal(false)}
          trip={selectedTrip}
          selectedSeats={bookingConfirmData.seats}
          pickupLocationId={bookingConfirmData.pickupLocationId}
          dropoffLocationId={bookingConfirmData.dropoffLocationId}
          pickupLocationName={bookingConfirmData.pickupLocationName}
          dropoffLocationName={bookingConfirmData.dropoffLocationName}
          currentUser={user}
          initialNote={bookingConfirmData.note}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      <BookingSuccessModal
        show={showBookingSuccessModal}
        booking={bookingResult}
        onClose={handleCloseBookingSuccess}
        onPaymentConfirmed={handlePaymentConfirmed}
      />

      <ChangePasswordModal
        show={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handleChangePassword}
      />
    </>
  )
}

export default App
