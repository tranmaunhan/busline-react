import { useState } from 'react'
import { Loader2, User, Mail, Phone, Lock, X } from 'lucide-react'
import { authAPI } from '../api/config'
import { useToast } from './Toast'

interface RegisterModalProps {
    show: boolean
    onClose: () => void
    onLoginClick: () => void
}

export default function RegisterModal({ show, onClose, onLoginClick }: RegisterModalProps) {
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

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
        setSuccessMessage('')

        if (formData.password !== formData.confirmPassword) {
            const msg = 'Mật khẩu xác nhận không trùng khớp.'
            setError(msg)
            showToast(msg, 'warning')
            setIsLoading(false)
            return
        }

        try {
            // Match the API structure: password, fullName, email, phone
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            }

            await authAPI.register(payload)

            const successMsg = 'Đăng ký tài khoản thành công! Đang chuyển hướng...'
            setSuccessMessage(successMsg)
            showToast('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.', 'success')
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            })

            // Switch to login modal after a short delay so user can read the success message
            setTimeout(() => {
                onLoginClick()
                onClose()
            }, 2500)
        } catch (err: any) {
            console.error('Registration error:', err)
            let errMsg = 'Đăng ký thất bại. Vui lòng thử lại.'
            if (err.response?.data?.message) {
                errMsg = err.response.data.message
            } else if (err.message) {
                errMsg = err.message
            }
            setError(errMsg)
            showToast(errMsg, 'error')
        } finally {
            setIsLoading(false)
        }
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
                        Đăng ký tài khoản
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Tạo tài khoản để đặt vé nhanh chóng và quản lý các chuyến đi của bạn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-8 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-600 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
                            {successMessage}
                        </div>
                    )}

                    <div className="mb-4 sm:mb-5">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:mb-2 sm:text-sm">
                            Họ và tên
                        </label>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                            <User className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5" />

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Nhập họ và tên của bạn"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

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

                    <div className="mb-4 sm:mb-5">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:mb-2 sm:text-sm">
                            Số điện thoại
                        </label>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                            <Phone className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5" />

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-4 sm:mb-5">
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
                                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-5 sm:mb-6">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 sm:mb-2 sm:text-sm">
                            Xác nhận mật khẩu
                        </label>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100 sm:rounded-2xl sm:px-4">
                            <Lock className="mr-2 h-4 w-4 text-slate-400 sm:mr-3 sm:h-5 sm:w-5" />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Nhập lại mật khẩu"
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:py-3.5"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang đăng ký...
                            </>
                        ) : (
                            'Đăng ký tài khoản'
                        )}
                    </button>

                    <p className="mt-5 text-center text-xs text-slate-500 sm:mt-6 sm:text-sm">
                        Đã có tài khoản?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                onLoginClick()
                            }}
                            className="font-semibold text-orange-500 transition hover:text-orange-600"
                        >
                            Đăng nhập ngay
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
