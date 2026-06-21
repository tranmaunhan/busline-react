import { useState } from 'react'
import { Loader2, Mail, Lock, X } from 'lucide-react'
import { authAPI } from '../api/config'
import type { AuthUser } from '../api/config'
import { useToast } from './Toast'

interface LoginModalProps {
    show: boolean
    onClose: () => void
    onLoginSuccess?: (userData: AuthUser) => void
    onRegisterClick?: () => void
}

export default function LoginModal({ show, onClose, onLoginSuccess, onRegisterClick }: LoginModalProps) {
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    if (!show) return null

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (error) setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await authAPI.login(formData)

            if (response.accessToken && response.user) {
                localStorage.setItem('authToken', response.accessToken)
                localStorage.setItem('authTokenType', response.tokenType)
                localStorage.setItem(
                    'authExpiresAt',
                    String(Date.now() + response.expiresInMs)
                )
                localStorage.setItem('userData', JSON.stringify(response.user))

                onLoginSuccess?.(response.user)

                setFormData({
                    email: '',
                    password: '',
                })

                onClose()
            } else {
                const msg = 'Dữ liệu đăng nhập không hợp lệ.'
                setError(msg)
                showToast(msg, 'error')
            }
        } catch (err: any) {
            console.error('Login error:', err)
            let msg = 'Đăng nhập thất bại. Vui lòng thử lại.'
            if (err.response?.data?.message) {
                msg = err.response.data.message
            } else if (err.message) {
                msg = err.message
            }
            setError(msg)
            showToast(msg, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const fillDemoData = () => {
        setFormData({
            email: 'nhanbaymau@gmail.com',
            password: '123456',
        })
        setError('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl animate-scale-in sm:rounded-3xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed sm:right-5 sm:top-5"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="px-6 pt-8 text-center sm:px-8 sm:pt-10">
                    <div className="mb-3 flex items-center justify-center">
                        <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Saigon
                        </span>
                        <span className="text-2xl font-extrabold tracking-tight text-orange-500 sm:text-3xl">
                            .ST
                        </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                        Đăng nhập tài khoản
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Đăng nhập để đặt vé, quản lý chuyến đi và theo dõi lịch sử đặt vé của bạn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-8">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4 sm:mb-5">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:mb-2 sm:text-sm">
                            Email
                        </label>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                            <Mail className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email của bạn"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:mb-2 sm:text-sm">
                            Mật khẩu
                        </label>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                            <Lock className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5" />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-5 flex items-center justify-between sm:mb-6">
                        <button
                            type="button"
                            onClick={fillDemoData}
                            disabled={isLoading}
                            className="text-xs font-medium text-sky-600 transition hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                        >

                        </button>

                        <a
                            href="#"
                            className="text-xs font-medium text-orange-500 transition hover:text-orange-600 sm:text-sm"
                        >
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:py-3.5"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>

                    <p className="mt-5 text-center text-xs text-slate-500 sm:mt-6 sm:text-sm">
                        Chưa có tài khoản?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                onRegisterClick?.()
                            }}
                            className="font-semibold text-orange-500 transition hover:text-orange-600"
                        >
                            Đăng ký ngay
                        </a>
                    </p>
                </form>

                <div className="border-t border-slate-100 px-6 py-4 sm:px-8 sm:py-5">
                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 sm:text-xs">
                        <a href="#" className="transition hover:text-orange-500">
                            Điều khoản
                        </a>
                        <span>•</span>
                        <a href="#" className="transition hover:text-orange-500">
                            Chính sách
                        </a>
                        <span>•</span>
                        <a href="#" className="transition hover:text-orange-500">
                            Liên hệ
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}