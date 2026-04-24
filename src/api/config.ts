import axios from 'axios'

// Base API configuration
const api = axios.create({
    // baseURL: 'https://localhost:7183/api',
    baseURL: 'https://localhost:7183:10000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
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
            // Redirect to login if needed
        }
        return Promise.reject(error)
    }
)

// Auth API endpoints
export const authAPI = {
    login: async (credentials: { identifier: string; password: string }) => {
        const response = await api.post('/Auth/login', credentials)
        return response.data
    },

    logout: async () => {
        const response = await api.post('/Auth/logout')
        return response.data
    },

    register: async (userData: any) => {
        const response = await api.post('/Auth/register', userData)
        return response.data
    },
}

// Locations API endpoints
export const locationsAPI = {
    getPickupOptions: async () => {
        const response = await api.get('/Locations/pickup-options')
        return response.data
    },
}

// Trips API endpoints
export const tripsAPI = {
    getFullRoute: async (params: { originId: number; destinationId: number; date: string }) => {
        const response = await api.get('/Trips/fullroute', { params })
        console.log(response.data);

        return response.data
    },
}

export default api