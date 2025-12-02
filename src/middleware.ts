import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // Rate limiting for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const maxRequests = 100; // 100 requests per minute

        const key = `${ip}:${request.nextUrl.pathname}`;
        const record = rateLimitStore.get(key);

        if (record) {
            if (now < record.resetTime) {
                if (record.count >= maxRequests) {
                    return new NextResponse('Too Many Requests', {
                        status: 429,
                        headers: {
                            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
                        },
                    });
                }
                record.count++;
            } else {
                rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            }
        } else {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        }

        // Clean up old entries periodically
        if (Math.random() < 0.01) {
            for (const [k, v] of rateLimitStore.entries()) {
                if (now > v.resetTime) {
                    rateLimitStore.delete(k);
                }
            }
        }
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth-token');

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
