// Performance monitoring utilities

export class PerformanceMonitor {
    private static timers = new Map<string, number>();

    static start(label: string): void {
        this.timers.set(label, performance.now());
    }

    static end(label: string): number {
        const startTime = this.timers.get(label);
        if (!startTime) {
            console.warn(`No timer found for label: ${label}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(label);

        if (process.env.NODE_ENV === 'development') {
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    static async measure<T>(
        label: string,
        fn: () => Promise<T>
    ): Promise<T> {
        this.start(label);
        try {
            const result = await fn();
            this.end(label);
            return result;
        } catch (error) {
            this.end(label);
            throw error;
        }
    }
}

// Database query optimization helpers
export function optimizeQuery(query: any) {
    // Add common optimizations
    return {
        ...query,
        // Use select to limit fields
        // Use include sparingly
        // Add proper indexes
    };
}

// Cache helper for expensive operations
const cache = new Map<string, { data: any; expiry: number }>();

export function getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiry) {
        return cached.data as T;
    }
    cache.delete(key);
    return null;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 60000): void {
    cache.set(key, {
        data,
        expiry: Date.now() + ttlMs,
    });
}

export function clearCache(key?: string): void {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

// Image optimization helper
export function getOptimizedImageUrl(
    url: string,
    width?: number,
    quality: number = 75
): string {
    if (!url) return '';

    // If using Next.js Image component, it handles optimization
    // For external images, you might want to use a service like Cloudinary
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());

    return url.includes('?')
        ? `${url}&${params.toString()}`
        : `${url}?${params.toString()}`;
}

// Debounce helper for search/filter
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy loading helper
export function lazyLoad<T>(
    importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
    return importFn();
}
