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
    routeOrigin: string
    routeDestination: string
    licensePlate: string
    vehicleType: string
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
    baseURL: 'https://api.aihost.io.vn/api',
    // baseURL: 'http://localhost:8080/api',
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
}

export interface TicketResponse {
    ticketId: number
    tripSeatId: number
    seatCode: string
    deck: string
    seatType: string
    price: number
}

export interface BookingResponse {
    bookingId: number
    bookingCode: string
    bookingTime: string
    status: number | string
    totalAmount: number
    tripId: number
    tripDepartureTime: string
    routeOrigin: string
    routeDestination: string
    pickupLocationName: string
    dropoffLocationName: string
    tickets: TicketResponse[]
}

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
        const response = await api.post<BookingResponse>('/bookings', request)
        return response.data
    },

    getMyBookings: async (): Promise<BookingResponse[]> => {
        const response = await api.get<BookingResponse[]>('/bookings/me')
        return response.data
    },

    lookupBooking: async (bookingCode: string, phone: string): Promise<BookingResponse> => {
        const response = await api.get<BookingResponse>('/bookings/lookup', {
            params: {
                bookingCode,
                phone,
            },
        })
        return response.data
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
