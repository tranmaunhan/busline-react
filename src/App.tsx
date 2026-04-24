import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import LoginModal from './component/LoginModal'
import { locationsAPI, tripsAPI } from './api/config'
import './App.css'

// Helper: format ISO date (yyyy-mm-dd) to dd/mm/yyyy
const formatDateDisplay = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// Helper: parse dd/mm/yyyy to ISO yyyy-mm-dd (returns null if invalid)
const parseDisplayToISO = (s: string) => {
  if (!s) return null
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null
  return d.toISOString().slice(0, 10)
}

const slides = [
  'https://picsum.photos/1920/1080?random=1',
  'https://picsum.photos/1920/1080?random=2',
  'https://picsum.photos/1920/1080?random=3',
]

const slideTexts = [
  'Khám phá Việt Nam',
  'Đặt vé nhanh chóng',
  'Hàng trăm tuyến đường',
]

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [displayDate, setDisplayDate] = useState(() => formatDateDisplay(new Date().toISOString().slice(0, 10)))
  const [dateError, setDateError] = useState<string | null>(null)
  const hiddenDateRef = useRef<HTMLInputElement | null>(null)
  const todayIso = new Date().toISOString().slice(0, 10)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [trips, setTrips] = useState<any[]>([])
  const [loadingTrips, setLoadingTrips] = useState(false)

  // Load user data from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        setUser(parsedUserData)
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        // Clear corrupted data
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
  }, [])

  // Load locations data on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoadingLocations(true)
        const data = await locationsAPI.getPickupOptions()
        // Sort locations by ID ascending
        const sortedLocations = data.sort((a: any, b: any) => a.id - b.id)
        setLocations(sortedLocations)
      } catch (error) {
        console.error('Error loading locations:', error)
        // Fallback to empty array or show error
        setLocations([])
      } finally {
        setLoadingLocations(false)
      }
    }

    loadLocations()
  }, [])

  // Get filtered destination locations (exclude selected origin)
  const getDestinationLocations = () => {
    if (!from) return locations
    const selectedOrigin = locations.find(location => location.name === from)
    if (!selectedOrigin) return locations
    return locations.filter(location => location.id !== selectedOrigin.id)
  }

  const handleFromChange = (value: string) => {
    setFrom(value)
    // Reset destination if it's the same as the new origin
    if (to && locations.find(loc => loc.name === value)?.id === locations.find(loc => loc.name === to)?.id) {
      setTo('')
    }
  }

  // Sync displayDate when internal date changes (e.g., programmatically)
  useEffect(() => {
    setDisplayDate(formatDateDisplay(date))
  }, [date])

  const handleLoginClick = () => {
    if (user) {
      // If already logged in, maybe show user menu
      alert(`Xin chào ${user.fullName || user.email || 'User'}!`)
    } else {
      setShowLoginModal(true)
    }
  }

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    alert('Đăng nhập thành công!')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    alert('Đã đăng xuất!')
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Check if user is authenticated
    if (!user) {
      alert('Vui lòng đăng nhập trước khi tìm vé!')
      setShowLoginModal(true)
      return
    }

    if (!from || !to || !date) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    // Get location IDs
    const originLocation = locations.find(loc => loc.name === from)
    const destinationLocation = locations.find(loc => loc.name === to)

    if (!originLocation || !destinationLocation) {
      alert('Không tìm thấy thông tin điểm đi hoặc điểm đến!')
      return
    }

    // Call API to search trips
    searchTrips(originLocation.id, destinationLocation.id, date)
  }

  const searchTrips = async (originId: number, destinationId: number, searchDate: string) => {
    try {
      setLoadingTrips(true)
      const data = await tripsAPI.getFullRoute({
        originId,
        destinationId,
        date: searchDate
      })
      setTrips(data)
    } catch (error) {
      console.error('Error searching trips:', error)
      alert('Có lỗi xảy ra khi tìm chuyến xe. Vui lòng thử lại!')
      setTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 text-white">
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-6 py-4 text-white">
        <div className="text-xl font-bold">
          VéXe<span className="text-orange-500">.vn</span>
        </div>

        <button
          className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition"
          onClick={handleLoginClick}
        >
          {user ? (
            <>
              <span className="text-xl">👤</span>
              <span className="hidden md:block">{user.fullName || user.email || 'User'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLogout()
                }}
                className="ml-2 text-xs bg-red-500 px-2 py-1 rounded hover:bg-red-600"
              >
                Thoát
              </button>
            </>
          ) : (
            <>
              <span className="text-xl">👤</span>
              <span className="hidden md:block">Đăng nhập</span>
            </>
          )}
        </button>
      </div>

      {slides.map((slide, index) => (
        <div
          key={slide}
          className={`slide-bg ${currentSlide === index ? 'active' : 'inactive'}`}
          style={{ backgroundImage: `url('${slide}')` }}
        />
      ))}

      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute inset-0 flex flex-col items-center justify-start pt-[10%] text-center text-white">
        <p className="uppercase text-sm opacity-70">Đặt vé dễ dàng</p>
        <h1 id="heading" className="text-5xl font-bold mt-3 max-w-3xl">
          {slideTexts[currentSlide]}
        </h1>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-[52%] w-[95%] max-w-5xl text-gray-900">
        <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-2xl p-6">
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500">Nơi đi</label>
              <select
                id="from"
                value={from}
                onChange={(event) => handleFromChange(event.target.value)}
                className="w-full border rounded-xl p-3"
                disabled={loadingLocations}
              >
                <option value="">
                  {loadingLocations ? 'Đang tải...' : 'Chọn điểm đi...'}
                </option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Nơi đến</label>
              <select
                id="to"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="w-full border rounded-xl p-3"
                disabled={loadingLocations}
              >
                <option value="">
                  {loadingLocations ? 'Đang tải...' : from ? 'Chọn điểm đến...' : 'Chọn điểm đi trước'}
                </option>
                {getDestinationLocations().map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Ngày</label>
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
                    setDate(iso)
                    setDisplayDate(formatDateDisplay(iso))
                    setDateError(null)
                  }}
                  className={`w-full border rounded-xl p-3 ${dateError ? 'border-red-400' : ''}`}
                />

                <button
                  type="button"
                  onClick={() => {
                    // open native date picker
                    if (hiddenDateRef.current) {
                      try {
                        // showPicker is supported in some browsers
                        // @ts-ignore
                        if (typeof hiddenDateRef.current.showPicker === 'function') hiddenDateRef.current.showPicker()
                        else hiddenDateRef.current.focus()
                        hiddenDateRef.current.click()
                      } catch (e) {
                        hiddenDateRef.current.focus()
                      }
                    }
                  }}
                  className="absolute right-2 top-2 p-1 text-gray-500"
                  aria-label="Open calendar"
                >
                  📅
                </button>

                <input
                  ref={hiddenDateRef}
                  type="date"
                  value={date}
                  min={todayIso}
                  onChange={(e) => {
                    const iso = e.target.value
                    if (iso) {
                      setDate(iso)
                      setDisplayDate(formatDateDisplay(iso))
                      setDateError(null)
                    }
                  }}
                  className="sr-only"
                  aria-hidden
                />

                {dateError && <div className="text-sm text-red-500 mt-1">{dateError}</div>}
              </div>
            </div>

            <div>
              <button
                id="btn"
                type="submit"
                disabled={loadingTrips}
                className={`w-full p-3 rounded-xl font-medium transition-all duration-200 ${user
                  ? 'bg-orange-600 text-white hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
              >
                {loadingTrips ? 'Đang tìm...' : user ? 'Tìm vé' : 'Đăng nhập để tìm vé'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Trip Results */}
      {(trips.length > 0 || loadingTrips) && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[50%] w-[95%] max-w-5xl text-gray-900">
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Kết quả tìm kiếm chuyến xe
            </h3>

            {loadingTrips ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="mt-2 text-gray-600">Đang tìm chuyến xe...</p>
              </div>
            ) : trips.length > 0 ? (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div
                    key={trip.trip_id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-2xl font-bold text-orange-500">
                            {new Date(trip.departure_time).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{trip.route_origin}</span>
                              <div className="flex items-center gap-2 text-gray-400">
                                <div className="w-8 h-px bg-gray-300"></div>
                                <span className="text-xs">→</span>
                                <div className="w-8 h-px bg-gray-300"></div>
                              </div>
                              <span className="font-medium">{trip.route_destination}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Biển số: {trip.license_plate}</span>
                          <span>Loại xe: {trip.vehicle_type}</span>
                          <span className="text-green-600 font-medium">
                            Còn chỗ
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                          Đặt vé
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Không tìm thấy chuyến xe nào phù hợp.</p>
                <p className="text-sm mt-1">Hãy thử thay đổi ngày hoặc tuyến đường khác.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal show={showLoginModal} onClose={closeLoginModal} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}

export default App
