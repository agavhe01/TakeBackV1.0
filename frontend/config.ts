// API Configuration
export const API_CONFIG = {
    // Base URL for API calls
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production'
        ? 'https://takeback-agavhera.vercel.app/'
        : 'http://localhost:8000'),

    // API Endpoints
    ENDPOINTS: {
        // Auth endpoints
        SIGNUP: '/api/auth/signup',
        SIGNIN: '/api/auth/login',
        SIGNOUT: '/api/auth/logout',
        USER_PROFILE: '/api/auth/profile',
        UPDATE_PROFILE: '/api/auth/update-profile',

        // Cards endpoints
        CARDS: '/api/cards',
        CARD_BALANCE: '/api/cards/{id}/balance',

        // Budgets endpoints
        BUDGETS: '/api/budgets',

        // Transactions endpoints
        TRANSACTIONS: '/api/transactions',

        // Analytics endpoints
        ANALYTICS_BALANCES: '/api/analytics/balances',
        ANALYTICS_SPENDING: '/api/analytics/spending',
        ANALYTICS_RECENT_TRANSACTIONS: '/api/analytics/transactions/recent',

        // Card budgets endpoints
        CARD_BUDGETS: '/api/card-budgets',

        // Policies endpoints
        POLICIES: '/api/policies',

        // Receipts endpoints
        RECEIPTS: '/api/receipts',
        RECEIPTS_UPLOAD: '/api/receipts/upload',
    }
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to build API URLs with dynamic parameters
export const buildApiUrlWithParams = (endpoint: string, params: Record<string, string>): string => {
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value);
    });
    return `${API_CONFIG.BASE_URL}${url}`;
};

// Pre-built API URLs for common endpoints
export const API_URLS = {
    // Auth URLs
    SIGNUP: buildApiUrl(API_CONFIG.ENDPOINTS.SIGNUP),
    SIGNIN: buildApiUrl(API_CONFIG.ENDPOINTS.SIGNIN),
    SIGNOUT: buildApiUrl(API_CONFIG.ENDPOINTS.SIGNOUT),
    USER_PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.USER_PROFILE),
    UPDATE_PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROFILE),

    // Cards URLs
    CARDS: buildApiUrl(API_CONFIG.ENDPOINTS.CARDS),

    // Budgets URLs
    BUDGETS: buildApiUrl(API_CONFIG.ENDPOINTS.BUDGETS),

    // Transactions URLs
    TRANSACTIONS: buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS),

    // Analytics URLs
    ANALYTICS_BALANCES: buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS_BALANCES),
    ANALYTICS_SPENDING: buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS_SPENDING),
    ANALYTICS_RECENT_TRANSACTIONS: buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS_RECENT_TRANSACTIONS),

    // Card budgets URLs
    CARD_BUDGETS: buildApiUrl(API_CONFIG.ENDPOINTS.CARD_BUDGETS),

    // Policies URLs
    POLICIES: buildApiUrl(API_CONFIG.ENDPOINTS.POLICIES),

    // Receipts URLs
    RECEIPTS: buildApiUrl(API_CONFIG.ENDPOINTS.RECEIPTS),
    RECEIPTS_UPLOAD: buildApiUrl(API_CONFIG.ENDPOINTS.RECEIPTS_UPLOAD),
} as const;

// Helper functions for dynamic endpoints
export const getCardBalanceUrl = (cardId: string) =>
    buildApiUrlWithParams(API_CONFIG.ENDPOINTS.CARD_BALANCE, { id: cardId });

export const getCardUrl = (cardId: string) =>
    `${API_URLS.CARDS}/${cardId}`;

export const getBudgetUrl = (budgetId: string) =>
    `${API_URLS.BUDGETS}/${budgetId}`;

export const getTransactionUrl = (transactionId: string) =>
    `${API_URLS.TRANSACTIONS}/${transactionId}`;

export const getReceiptUrl = (receiptId: string) =>
    `${API_URLS.RECEIPTS}/${receiptId}`;

// API request helper
export const apiRequest = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = localStorage.getItem('access_token');

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    return fetch(url, {
        ...options,
        headers: defaultHeaders,
    });
};

// Common API methods
export const api = {
    get: (url: string) => apiRequest(url),
    post: (url: string, data?: any) => apiRequest(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    }),
    put: (url: string, data?: any) => apiRequest(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    }),
    delete: (url: string) => apiRequest(url, {
        method: 'DELETE',
    }),
}; 