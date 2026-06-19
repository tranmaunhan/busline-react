import { useState } from 'react'
import { Loader2, Mail, Lock, X } from 'lucide-react'
import { authAPI } from '../api/config'
import type { AuthUser } from '../api/config'

interface LoginModalProps {
    show: boolean
    onClose: () => void
    onLoginSuccess?: (userData: AuthUser) => void
}

export default function LoginModal({ show, onClose, onLoginSuccess }: LoginModalProps) {
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
                setError('Dữ liệu đăng nhập không hợp lệ.')
            }
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
            email: 'nhanbaymau@gmail.com',
            password: '123456',
        })
        setError('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[420px] rounded-3xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="px-8 pt-10 text-center">
                    <div className="mb-3 flex items-center justify-center">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                            VeXe
                        </span>
                        <span className="text-3xl font-extrabold tracking-tight text-orange-500">
                            .vn
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">
                        Đăng nhập tài khoản
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Đăng nhập để đặt vé, quản lý chuyến đi và theo dõi lịch sử đặt vé của bạn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8">
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Email
                        </label>

                        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                            <Mail className="mr-3 h-5 w-5 text-slate-400" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email của bạn"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Mật khẩu
                        </label>

                        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
                            <Lock className="mr-3 h-5 w-5 text-slate-400" />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={fillDemoData}
                            disabled={isLoading}
                            className="text-sm font-medium text-sky-600 transition hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                        </button>

                        <a
                            href="#"
                            className="text-sm font-medium text-orange-500 transition hover:text-orange-600"
                        >
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Chưa có tài khoản?{' '}
                        <a
                            href="#"
                            className="font-semibold text-orange-500 transition hover:text-orange-600"
                        >
                            Đăng ký ngay
                        </a>
                    </p>
                </form>

                <div className="border-t border-slate-100 px-8 py-5">
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
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