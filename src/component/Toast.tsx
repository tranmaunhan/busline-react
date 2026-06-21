import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void
    toasts: ToastMessage[]
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id)
        }, 4000)
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

interface ToastItemProps {
    toast: ToastMessage
    onClose: () => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const { message, type } = toast

    const config = {
        success: {
            bg: 'bg-emerald-50/95 border-emerald-200 text-emerald-800',
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
        },
        error: {
            bg: 'bg-rose-50/95 border-rose-200 text-rose-800',
            icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
        },
        info: {
            bg: 'bg-sky-50/95 border-sky-200 text-sky-800',
            icon: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
        },
        warning: {
            bg: 'bg-amber-50/95 border-amber-200 text-amber-800',
            icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
        },
    }[type]

    return (
        <div
            className={`flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm pointer-events-auto transition-all duration-300 animate-slide-in-right ${config.bg}`}
        >
            <div className="flex items-start gap-3">
                {config.icon}
                <p className="text-sm font-medium leading-5">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-full hover:bg-slate-100/50 shrink-0"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
