// Security utilities and helpers

import { NextRequest } from 'next/server';

// Input sanitization
export function sanitizeInput(input: string): string {
    if (!input) return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential XSS characters
        .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

// SQL Injection prevention (Prisma handles this, but good to validate)
export function validateId(id: string): boolean {
    // Check if ID is a valid CUID or UUID
    const cuidRegex = /^c[a-z0-9]{24}$/;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return cuidRegex.test(id) || uuidRegex.test(id);
}

// CSRF Token generation and validation
export function generateCSRFToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
}

// Password strength validation
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Check for common passwords
    const commonPasswords = ['password', '12345678', 'qwerty', 'admin'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Password is too common');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// File upload validation
export function validateFileUpload(file: File): {
    isValid: boolean;
    error?: string;
} {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'File size must be less than 10MB',
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Only PDF and image files (JPG, PNG) are allowed',
        };
    }

    // Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeToExt: Record<string, string[]> = {
        'application/pdf': ['pdf'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
    };

    const validExtensions = mimeToExt[file.type] || [];
    if (extension && !validExtensions.includes(extension)) {
        return {
            isValid: false,
            error: 'File extension does not match file type',
        };
    }

    return { isValid: true };
}

// Request origin validation
export function validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://localhost:3001',
    ];

    if (!origin) return true; // Same-origin requests don't have origin header

    return allowedOrigins.some(allowed => origin.startsWith(allowed || ''));
}

// IP-based rate limiting helper
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    constructor(
        private maxRequests: number = 100,
        private windowMs: number = 60000
    ) { }

    isRateLimited(identifier: string): boolean {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];

        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.windowMs);

        if (validRequests.length >= this.maxRequests) {
            return true;
        }

        validRequests.push(now);
        this.requests.set(identifier, validRequests);

        return false;
    }

    reset(identifier: string): void {
        this.requests.delete(identifier);
    }
}

// Audit logging
export interface AuditLog {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
    timestamp: Date;
    success: boolean;
    error?: string;
}

export function logAuditEvent(log: AuditLog): void {
    // In production, send to logging service (e.g., Datadog, Sentry)
    if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Audit Log:', log);
    }

    // Store in database for compliance
    // await prisma.auditLog.create({ data: log });
}

// Content Security Policy
export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
`.replace(/\s+/g, ' ').trim();

// Security checklist for production
export const SECURITY_CHECKLIST = {
    environment: [
        'JWT_SECRET is set and strong (min 32 characters)',
        'DATABASE_URL uses SSL in production',
        'All API keys are in environment variables',
        'NODE_ENV is set to production',
    ],
    headers: [
        'HTTPS is enforced',
        'Security headers are set (HSTS, CSP, etc.)',
        'CORS is properly configured',
        'Rate limiting is enabled',
    ],
    authentication: [
        'Passwords are hashed with bcrypt',
        'JWT tokens have expiration',
        'Session cookies are HTTP-only',
        'Email verification is enabled',
    ],
    database: [
        'Prisma prevents SQL injection',
        'Database backups are configured',
        'Sensitive data is encrypted',
        'Indexes are optimized',
    ],
    fileUpload: [
        'File size limits are enforced',
        'File types are validated',
        'Files are scanned for viruses',
        'Files are stored securely (S3/Cloudinary)',
    ],
    monitoring: [
        'Error tracking is set up (Sentry)',
        'Audit logs are enabled',
        'Performance monitoring is active',
        'Uptime monitoring is configured',
    ],
};
