import { useEffect, useState } from 'react'
import { Loader2, Lock, Mail, X } from 'lucide-react'
import { authAPI } from '../api/config'
import type { AuthUser, GoogleAuthConfigResponse, LoginResponse } from '../api/config'
import { useToast } from './Toast'

let googleScriptPromise: Promise<void> | null = null

const loadGoogleScript = () => {
    if (window.google?.accounts?.oauth2) {
        return Promise.resolve()
    }

    if (googleScriptPromise) {
        return googleScriptPromise
    }

    googleScriptPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]')

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true })
            existingScript.addEventListener('error', () => reject(new Error('Không thể tải Google Identity Services')), {
                once: true,
            })
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.dataset.googleIdentity = 'true'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Không thể tải Google Identity Services'))
        document.head.appendChild(script)
    })

    return googleScriptPromise
}

interface LoginModalProps {
    show: boolean
    onClose: () => void
    onLoginSuccess?: (userData: AuthUser) => void
    onRegisterClick?: () => void
}

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.38 0 24 0 14.64 0 6.55 5.38 2.56 13.22l7.98 6.19C12.46 13.05 17.74 9.5 24 9.5z"
        />
        <path
            fill="#4285F4"
            d="M46.5 24.55c0-1.57-.14-3.09-.41-4.55H24v9.09h12.65c-.55 2.95-2.22 5.45-4.73 7.14l7.65 5.94c4.47-4.12 6.93-10.18 6.93-17.62z"
        />
        <path
            fill="#FBBC05"
            d="M10.54 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19A24.04 24.04 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.98-6.19z"
        />
        <path
            fill="#34A853"
            d="M24 48c6.48 0 11.92-2.13 15.89-5.83l-7.65-5.94c-2.13 1.43-4.85 2.27-8.24 2.27-6.26 0-11.54-3.55-13.46-8.91l-7.98 6.19C6.55 42.62 14.64 48 24 48z"
        />
    </svg>
)

export default function LoginModal({ show, onClose, onLoginSuccess, onRegisterClick }: LoginModalProps) {
    const { showToast } = useToast()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfigResponse | null>(null)
    const [isGoogleReady, setIsGoogleReady] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!show) return

        let cancelled = false

        const prepareGoogleLogin = async () => {
            try {
                const config = await authAPI.getGoogleConfig()

                if (cancelled) return

                setGoogleConfig(config)

                if (!config.enabled || !config.clientId || !config.redirectUri) {
                    setIsGoogleReady(false)
                    return
                }

                await loadGoogleScript()

                if (!cancelled) {
                    setIsGoogleReady(Boolean(window.google?.accounts?.oauth2))
                }
            } catch (err) {
                console.error('Lỗi chuẩn bị đăng nhập Google:', err)

                if (!cancelled) {
                    setGoogleConfig(null)
                    setIsGoogleReady(false)
                }
            }
        }

        prepareGoogleLogin()

        return () => {
            cancelled = true
        }
    }, [show])

    if (!show) return null

    const persistAuthSession = (response: LoginResponse) => {
        localStorage.setItem('authToken', response.accessToken)
        localStorage.setItem('authTokenType', response.tokenType)
        localStorage.setItem('authExpiresAt', String(Date.now() + response.expiresInMs))
        localStorage.setItem('userData', JSON.stringify(response.user))
    }

    const finishLogin = (response: LoginResponse) => {
        persistAuthSession(response)
        onLoginSuccess?.(response.user)

        setFormData({
            email: '',
            password: '',
        })

        onClose()
    }

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
                finishLogin(response)
            } else {
                const message = 'Dữ liệu đăng nhập không hợp lệ.'
                setError(message)
                showToast(message, 'error')
            }
        } catch (err: any) {
            console.error('Lỗi đăng nhập:', err)

            const message =
                err.response?.data?.message ||
                err.message ||
                'Đăng nhập thất bại. Vui lòng thử lại.'

            setError(message)
            showToast(message, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        if (!googleConfig?.enabled || !googleConfig.clientId || !googleConfig.redirectUri) {
            const message = 'Đăng nhập Google chưa được cấu hình.'
            setError(message)
            showToast(message, 'error')
            return
        }

        if (!window.google?.accounts?.oauth2) {
            const message = 'Không tải được Google Login. Vui lòng thử lại.'
            setError(message)
            showToast(message, 'error')
            return
        }

        setIsGoogleLoading(true)
        setError('')

        const codeClient = window.google.accounts.oauth2.initCodeClient({
            client_id: googleConfig.clientId,
            scope: 'openid email profile',
            ux_mode: 'popup',
            redirect_uri: googleConfig.redirectUri,
            select_account: true,
            callback: async (response) => {
                if (response.error || !response.code) {
                    const message = response.error_description || 'Đăng nhập Google không thành công.'
                    setError(message)
                    showToast(message, 'error')
                    setIsGoogleLoading(false)
                    return
                }

                try {
                    const loginResponse = await authAPI.loginWithGoogle({
                        code: response.code,
                    })

                    finishLogin(loginResponse)
                } catch (err: any) {
                    console.error('Lỗi đăng nhập Google:', err)

                    const message =
                        err.response?.data?.message ||
                        err.message ||
                        'Đăng nhập Google thất bại. Vui lòng thử lại.'

                    setError(message)
                    showToast(message, 'error')
                } finally {
                    setIsGoogleLoading(false)
                }
            },
            error_callback: (googleError) => {
                console.error('Lỗi popup đăng nhập Google:', googleError)

                const message = 'Không thể mở cửa sổ đăng nhập Google.'
                setError(message)
                showToast(message, 'error')
                setIsGoogleLoading(false)
            },
        })

        codeClient.requestCode()
    }

    const isBusy = isLoading || isGoogleLoading

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="relative max-h-[96vh] w-full max-w-[420px] overflow-hidden rounded-[1.5rem] bg-white shadow-2xl animate-scale-in sm:rounded-3xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isBusy}
                    aria-label="Đóng"
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed sm:right-5 sm:top-5"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="px-5 pt-7 text-center sm:px-8 sm:pt-10">
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

                    <p className="mt-2 hidden text-xs leading-5 text-slate-500 sm:block sm:text-sm sm:leading-6">
                        Đăng nhập để đặt vé, quản lý chuyến đi và theo dõi lịch sử đặt vé của bạn.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="max-h-[calc(96vh-150px)] overflow-y-auto px-5 py-5 sm:max-h-none sm:px-8 sm:py-8"
                >
                    {error ? (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
                            {error}
                        </div>
                    ) : null}

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
                                disabled={isBusy}
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
                                disabled={isBusy}
                                className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-5 flex items-center justify-end sm:mb-6">
                        <a
                            href="#"
                            className="text-xs font-medium text-orange-500 transition hover:text-orange-600 sm:text-sm"
                        >
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isBusy}
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

                    {googleConfig?.enabled ? (
                        <>
                            <div className="my-4 flex items-center gap-3 text-xs text-slate-400 sm:my-5">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span>hoặc</span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isBusy || !isGoogleReady}
                                className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-6 text-sm font-medium text-[#3c4043] shadow-sm transition-all hover:bg-[#f8f9fa] hover:shadow-md active:bg-[#f1f3f4] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isGoogleLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang mở Google...
                                    </>
                                ) : (
                                    <>
                                        <GoogleIcon />
                                        Tiếp tục với Google
                                    </>
                                )}
                            </button>
                        </>
                    ) : null}

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

                <div className="hidden border-t border-slate-100 px-6 py-4 sm:block sm:px-8 sm:py-5">
                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 sm:text-xs">
                        <a href="#" className="transition hover:text-orange-500">
                            Điều khoản
                        </a>
                        <span>|</span>
                        <a href="#" className="transition hover:text-orange-500">
                            Chính sách
                        </a>
                        <span>|</span>
                        <a href="#" className="transition hover:text-orange-500">
                            Liên hệ
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}