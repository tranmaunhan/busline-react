export {}

declare global {
    interface Window {
        google?: GoogleAccounts
    }
}

interface GoogleAccounts {
    accounts: {
        oauth2: {
            initCodeClient(config: GoogleCodeClientConfig): GoogleCodeClient
        }
    }
}

interface GoogleCodeClient {
    requestCode(): void
}

interface GoogleCodeClientConfig {
    client_id: string
    scope: string
    ux_mode?: 'popup' | 'redirect'
    redirect_uri?: string
    select_account?: boolean
    callback: (response: GoogleCodeResponse) => void
    error_callback?: (error: GoogleCodeError) => void
}

interface GoogleCodeResponse {
    code: string
    scope: string
    error?: string
    error_description?: string
}

interface GoogleCodeError {
    type: string
}
