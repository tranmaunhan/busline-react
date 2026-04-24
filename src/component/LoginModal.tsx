import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authAPI } from '../api/config'

interface LoginModalProps {
    show: boolean
    onClose: () => void
    onLoginSuccess?: (userData: any) => void
}

export default function LoginModal({ show, onClose, onLoginSuccess }: LoginModalProps) {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    if (!show) return null

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (error) setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await authAPI.login(formData)

            // Store auth token and user data
            if (response.token) {
                localStorage.setItem('authToken', response.token)
                localStorage.setItem('userData', JSON.stringify({
                    userId: response.userId,
                    username: response.username,
                    fullName: response.fullName,
                    email: response.email
                }))
            }

            // Call success callback with user data
            if (onLoginSuccess) {
                onLoginSuccess({
                    userId: response.userId,
                    username: response.username,
                    fullName: response.fullName,
                    email: response.email,
                    token: response.token
                })
            }

            // Close modal
            onClose()

            // Reset form
            setFormData({ identifier: '', password: '' })

        } catch (err: any) {
            console.error('Login error:', err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else if (err.message) {
                setError(err.message)
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const fillDemoData = () => {
        setFormData({
            identifier: 'xiaomir4b@gmail.com',
            password: '123456'
        })
        setError('')
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-300 px-8 pt-8 pb-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="text-4xl font-bold text-white">VéXe</div>
                        <div className="text-4xl font-bold text-orange-100">.vn</div>
                    </div>
                    <p className="text-orange-100 text-sm">Đặt vé xe - Yên tâm đi lại</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email/Phone */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email hoặc Số điện thoại
                        </label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleInputChange}
                            className="w-full border-2 text-gray-700 border-gray-200 rounded-lg px-4 py-3 text-base transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                            placeholder="Nhập email hoặc số điện thoại"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="text-gray-700 w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Demo Data Button */}
                    <div className="text-right mb-4">
                        <button
                            type="button"
                            onClick={fillDemoData}
                            className="text-sm text-blue-500 hover:text-blue-600 font-medium transition"
                            disabled={isLoading}
                        >
                            Dùng dữ liệu demo
                        </button>
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right mb-6">
                        <a href="#" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition">
                            Quên mật khẩu?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3 px-6 rounded-lg font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng Nhập'
                        )}
                    </button>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <a href="#" className="text-orange-500 hover:text-orange-600 font-semibold transition">
                            Đăng ký ngay
                        </a>
                    </p>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <a href="#" className="hover:text-orange-500 transition">Điều khoản</a>
                        <span>•</span>
                        <a href="#" className="hover:text-orange-500 transition">Chính sách</a>
                        <span>•</span>
                        <a href="#" className="hover:text-orange-500 transition">Liên hệ</a>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}