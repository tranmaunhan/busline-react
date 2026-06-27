import axios from 'axios'

export interface AuthUser {
    id: number
    username: string
    fullName: string
    email: string
    phone: string
    status: string
    roles: string[]
}

export interface LoginResponse {
    accessToken: string
    tokenType: string
    expiresInMs: number
    user: AuthUser
}

export interface GoogleAuthConfigResponse {
    enabled: boolean
    clientId: string | null
    redirectUri: string | null
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

export interface Location {
    id: number
    name: string
    address: string
    type: string
}

export interface TripSearchParams {
    pickupLocationId: number
    dropoffLocationId: number
    departureDate: string
}

export interface TripSearchResult {
    tripId: number
    departureTime: string
    pickupTime: string
    dropoffTime: string
    routeOrigin: string
    routeDestination: string
    pickupLocationId: number
    pickupLocationName: string
    dropoffLocationId: number
    dropoffLocationName: string
    licensePlate: string
    vehicleType: string
    availableSeats: number
    segmentDurationMinutes: number
    price: number
}

export interface TripSeatMapSeat {
    tripSeatId: number
    seatCode: string
    rowIndex: number
    colIndex: number
    deck: string
    seatType: string
    status: number
}

export interface TripSeatMapResponse {
    tripId: number
    departureTime: string
    tripStatus: number
    vehicleId: number
    licensePlate: string
    vehicleBrand: string
    vehicleTypeName: string
    totalSeats: number
    routeId: number
    originName: string
    destinationName: string
    totalDistanceKm: number
    totalDurationMinutes: number
    routeStops: string[]
    seats: TripSeatMapSeat[]
}

interface TripSeatMapApiSeat {
    trip_seat_id: number
    seat_status: number
    seat_code: string
    row_index: number
    col_index: number
    deck: string
    seat_type: string
}

interface TripSeatMapApiResponse {
    tripId: number
    departureTime: string
    tripStatus: number
    vehicleId: number
    licensePlate: string
    vehicleBrand: string
    vehicleTypeName: string
    totalSeats: number
    routeId: number
    originName: string
    destinationName: string
    totalDistanceKm: number
    totalDurationMinutes: number
    routeStops: string[]
    seatLayout: TripSeatMapApiSeat[]
}

const normalizeDeck = (deck: string) => deck?.trim().toUpperCase() || 'LOWER'
const normalizeSeatType = (seatType: string) => seatType?.trim().toUpperCase() || 'SEAT'

const normalizeTripSeatMap = (data: TripSeatMapApiResponse): TripSeatMapResponse => ({
    tripId: data.tripId,
    departureTime: data.departureTime,
    tripStatus: data.tripStatus,
    vehicleId: data.vehicleId,
    licensePlate: data.licensePlate,
    vehicleBrand: data.vehicleBrand,
    vehicleTypeName: data.vehicleTypeName,
    totalSeats: data.totalSeats,
    routeId: data.routeId,
    originName: data.originName,
    destinationName: data.destinationName,
    totalDistanceKm: data.totalDistanceKm,
    totalDurationMinutes: data.totalDurationMinutes,
    routeStops: data.routeStops ?? [],
    seats: (data.seatLayout ?? [])
        .map((seat) => ({
            tripSeatId: seat.trip_seat_id,
            seatCode: seat.seat_code,
            rowIndex: seat.row_index,
            colIndex: seat.col_index,
            deck: normalizeDeck(seat.deck),
            seatType: normalizeSeatType(seat.seat_type),
            status: Number(seat.seat_status),
        }))
        .sort((left, right) => {
            const deckOrder = (deck: string) => {
                if (deck === 'LOWER') return 0
                if (deck === 'UPPER') return 1
                return 2
            }

            return (
                deckOrder(left.deck) - deckOrder(right.deck) ||
                left.rowIndex - right.rowIndex ||
                left.colIndex - right.colIndex ||
                left.seatCode.localeCompare(right.seatCode)
            )
        }),
})

// Base API configuration
const api = axios.create({
    // baseURL: 'https://api.aihost.io.vn/api',
    baseURL: 'http://localhost:8080/api',
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json',
    },
})
// http://103.176.179.139:8080/swagger-ui/index.html
// Request interceptor for adding auth token if needed
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
            const tokenType = localStorage.getItem('authTokenType') || 'Bearer'
            config.headers.Authorization = `${tokenType} ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken')
            localStorage.removeItem('authTokenType')
            localStorage.removeItem('authExpiresAt')
            localStorage.removeItem('userData')
            // Redirect to login if needed
        }
        return Promise.reject(error)
    }
)

// Auth API endpoints
export const authAPI = {
    login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials)
        return response.data
    },

    getGoogleConfig: async (): Promise<GoogleAuthConfigResponse> => {
        const response = await api.get('/auth/google/config')
        return response.data
    },

    loginWithGoogle: async (payload: { code: string }): Promise<LoginResponse> => {
        const response = await api.post('/auth/google', payload)
        return response.data
    },

    logout: async () => {
        const response = await api.post('/auth/logout')
        return response.data
    },

    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData)
        return response.data
    },

    changePassword: async (payload: ChangePasswordRequest) => {
        const response = await api.post('/auth/change-password', payload)
        return response.data
    },
}
// Locations API endpoints
export const locationsAPI = {
    getLocations: async (): Promise<Location[]> => {
        const response = await api.get('/locations')
        return response.data
    },
}

// Trips API endpoints
export const tripsAPI = {
    searchTrips: async (params: TripSearchParams): Promise<TripSearchResult[]> => {
        const response = await api.get('/trips/search', { params })
        console.log('Dữ liệu trả về chuyến', response)
        return response.data
    },

    getSeatMap: async (tripId: number): Promise<TripSeatMapResponse> => {
        const response = await api.get<TripSeatMapApiResponse>(`/trips/${tripId}/details`)
        console.log('Dữ liệu trả sơ đồ trả về', response)
        return normalizeTripSeatMap(response.data)
    },
}

export interface CreateBookingRequest {
    tripId: number
    tripSeatIds: number[]
    pickupLocationId: number
    dropoffLocationId: number
    contactName: string
    contactPhone: string
    contactEmail: string
    note?: string | null
    paymentExpiry: string
}

export interface BookingTicketEntity {
    ticketId: number
    tripSeatId: number
    seatCode: string
    deck: string
    seatType: string
    price: number
}

export interface BookingEntity {
    id: number
    bookingId: number
    userId: number | null
    bookingCode: string
    bookingTime: string
    status: number | string
    totalAmount: number
    contactName: string | null
    contactPhone: string | null
    contactEmail: string | null
    note: string | null
    paymentExpiry: string | null
    tripId: number
    tripDepartureTime: string
    routeOrigin: string
    routeDestination: string
    pickupLocationName: string
    dropoffLocationName: string
    tickets: BookingTicketEntity[]
}

export type TicketResponse = BookingTicketEntity
export type BookingResponse = BookingEntity

interface BookingTicketApiResponse {
    ticketId?: number
    id?: number
    tripSeatId?: number
    trip_seat_id?: number
    seatCode?: string
    seat_code?: string
    deck?: string
    seatType?: string
    seat_type?: string
    price?: number | string | null
}

interface BookingApiResponse {
    id?: number
    bookingId?: number
    userId?: number | null
    user_id?: number | null
    bookingCode?: string
    booking_code?: string
    bookingTime?: string
    booking_time?: string
    status?: number | string
    totalAmount?: number | string | null
    total_amount?: number | string | null
    contactName?: string | null
    contact_name?: string | null
    contactPhone?: string | null
    contact_phone?: string | null
    contactEmail?: string | null
    contact_email?: string | null
    note?: string | null
    paymentExpiry?: string | null
    payment_expiry?: string | null
    tripId?: number
    trip_id?: number
    tripDepartureTime?: string
    trip_departure_time?: string
    routeOrigin?: string
    route_origin?: string
    routeDestination?: string
    route_destination?: string
    pickupLocationName?: string
    pickup_location_name?: string
    dropoffLocationName?: string
    dropoff_location_name?: string
    tickets?: BookingTicketApiResponse[] | null
}

const toNullableString = (value: unknown) => {
    if (value === null || value === undefined) return null
    const normalized = String(value).trim()
    return normalized ? normalized : null
}

const toNumberValue = (value: unknown, fallback = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return fallback
}

const normalizeBookingTicket = (ticket: BookingTicketApiResponse): BookingTicketEntity => ({
    ticketId: toNumberValue(ticket.ticketId ?? ticket.id),
    tripSeatId: toNumberValue(ticket.tripSeatId ?? ticket.trip_seat_id),
    seatCode: String(ticket.seatCode ?? ticket.seat_code ?? ''),
    deck: String(ticket.deck ?? ''),
    seatType: String(ticket.seatType ?? ticket.seat_type ?? ''),
    price: toNumberValue(ticket.price),
})

const normalizeBooking = (booking: BookingApiResponse): BookingEntity => ({
    id: toNumberValue(booking.id ?? booking.bookingId),
    bookingId: toNumberValue(booking.id ?? booking.bookingId),
    userId: booking.userId ?? booking.user_id ?? null,
    bookingCode: String(booking.bookingCode ?? booking.booking_code ?? ''),
    bookingTime: String(booking.bookingTime ?? booking.booking_time ?? ''),
    status: booking.status ?? 0,
    totalAmount: toNumberValue(booking.totalAmount ?? booking.total_amount),
    contactName: toNullableString(booking.contactName ?? booking.contact_name),
    contactPhone: toNullableString(booking.contactPhone ?? booking.contact_phone),
    contactEmail: toNullableString(booking.contactEmail ?? booking.contact_email),
    note: toNullableString(booking.note),
    paymentExpiry: toNullableString(booking.paymentExpiry ?? booking.payment_expiry),
    tripId: toNumberValue(booking.tripId ?? booking.trip_id),
    tripDepartureTime: String(booking.tripDepartureTime ?? booking.trip_departure_time ?? ''),
    routeOrigin: String(booking.routeOrigin ?? booking.route_origin ?? ''),
    routeDestination: String(booking.routeDestination ?? booking.route_destination ?? ''),
    pickupLocationName: String(booking.pickupLocationName ?? booking.pickup_location_name ?? ''),
    dropoffLocationName: String(booking.dropoffLocationName ?? booking.dropoff_location_name ?? ''),
    tickets: Array.isArray(booking.tickets) ? booking.tickets.map(normalizeBookingTicket) : [],
})

export interface BookingPaymentStatusResponse {
    success: boolean
    message: string
    bookingCode: string
    status: number | null
}

export interface MessageResponse {
    message: string
}

// Bookings API endpoints
export const bookingsAPI = {
    createBooking: async (request: CreateBookingRequest): Promise<BookingResponse> => {
        const response = await api.post<BookingApiResponse>('/bookings', request)
        return normalizeBooking(response.data)
    },

    getMyBookings: async (): Promise<BookingResponse[]> => {
        const response = await api.get<BookingApiResponse[]>('/bookings/me')
        return Array.isArray(response.data) ? response.data.map(normalizeBooking) : []
    },

    lookupBooking: async (bookingCode: string, phone: string): Promise<BookingResponse> => {
        const response = await api.get<BookingApiResponse>('/bookings/lookup', {
            params: {
                bookingCode,
                phone,
            },
        })
        return normalizeBooking(response.data)
    },

    getPaymentStatus: async (bookingCode: string): Promise<BookingPaymentStatusResponse> => {
        const response = await api.get<BookingPaymentStatusResponse>(
            `/bookings/${encodeURIComponent(bookingCode)}/status`
        )
        return response.data
    },

    cancelPendingBooking: async (bookingId: number): Promise<MessageResponse> => {
        const response = await api.delete<MessageResponse>(`/bookings/${bookingId}`)
        return response.data
    },
}

export default api
