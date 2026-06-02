import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authAPI } from '../api/config'
import type { AuthUser } from '../api/config'

interface LoginModalProps {
    show: boolean
    onClose: () => void
    onLoginSuccess?: (userData: AuthUser) => void
}

export default function LoginModal({ show, onClose, onLoginSuccess }: LoginModalProps) {
    const [formData, setFormData] = useState({
        username: '',
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
                localStorage.setItem('authExpiresAt', String(Date.now() + response.expiresInMs))
                localStorage.setItem('userData', JSON.stringify(response.user))
            }

            if (onLoginSuccess) {
                onLoginSuccess(response.user)
            }

            onClose()
            setFormData({ username: '', password: '' })
        } catch (err: any) {
            console.error('Login error:', err)

            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else if (err.message) {
                setError(err.message)
            } else {
                setError('Dang nhap that bai. Vui long thu lai.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const fillDemoData = () => {
        setFormData({
            username: 'nhanbaymau',
            password: '123456',
        })
        setError('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.24)] animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[linear-gradient(180deg,_#eff6ff_0%,_#ffffff_55%,_#f8fbff_100%)] px-8 pb-6 pt-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="text-4xl font-bold text-slate-900">VeXe</div>
                        <div className="text-4xl font-bold text-orange-500">.vn</div>
                    </div>
                    <p className="text-sm text-slate-500">Dat ve xe - Yen tam di lai</p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ten dang nhap
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-2 border-sky-100 bg-sky-50/70 px-4 py-3 text-base text-slate-700 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                            placeholder="Nhap ten dang nhap"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mat khau
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-2 border-sky-100 bg-sky-50/70 px-4 py-3 text-base text-slate-700 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="text-right mb-4">
                        <button
                            type="button"
                            onClick={fillDemoData}
                            className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
                            disabled={isLoading}
                        >
                            Dung du lieu demo
                        </button>
                    </div>

                    <div className="text-right mb-6">
                        <a href="#" className="text-sm font-medium text-orange-500 transition hover:text-orange-600">
                            Quen mat khau?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Dang dang nhap...
                            </>
                        ) : (
                            'Dang nhap'
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Chua co tai khoan?{' '}
                        <a href="#" className="font-semibold text-orange-500 transition hover:text-orange-600">
                            Dang ky ngay
                        </a>
                    </p>
                </form>

                <div className="border-t border-sky-100 bg-sky-50/60 px-8 py-4">
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                        <a href="#" className="transition hover:text-orange-500">
                            Dieu khoan
                        </a>
                        <span>•</span>
                        <a href="#" className="transition hover:text-orange-500">
                            Chinh sach
                        </a>
                        <span>•</span>
                        <a href="#" className="transition hover:text-orange-500">
                            Lien he
                        </a>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-orange-500"
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
