// Simple in-memory cache for auth checks to prevent duplicate requests
let authCache: { user: any; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds

export function getCachedAuth() {
    if (authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
        return authCache.user;
    }
    return null;
}

export function setCachedAuth(user: any) {
    authCache = {
        user,
        timestamp: Date.now(),
    };
}

export function clearAuthCache() {
    authCache = null;
}
