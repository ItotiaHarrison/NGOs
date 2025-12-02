import { OrganizationTier } from '@prisma/client';

// Tier pricing in KES
export const TIER_PRICING = {
    BASIC_FREE: 0,
    SELF_ASSESSMENT: 5000,
    DARAJA_VERIFIED: 15000,
} as const;

// Tier pricing in USD (for PayPal)
export const TIER_PRICING_USD = {
    BASIC_FREE: 0,
    SELF_ASSESSMENT: 39,
    DARAJA_VERIFIED: 115,
} as const;

/**
 * Get tier price in KES
 */
export function getTierPrice(tier: OrganizationTier): number {
    return TIER_PRICING[tier];
}

/**
 * Get tier price in USD
 */
export function getTierPriceUSD(tier: OrganizationTier): number {
    return TIER_PRICING_USD[tier];
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: OrganizationTier): string {
    const names = {
        BASIC_FREE: 'Basic (Free)',
        SELF_ASSESSMENT: 'Self-Assessment',
        DARAJA_VERIFIED: 'Daraja Verified',
    };
    return names[tier];
}

/**
 * Validate tier upgrade
 */
export function canUpgradeToTier(currentTier: OrganizationTier, targetTier: OrganizationTier): boolean {
    const tierOrder = {
        BASIC_FREE: 0,
        SELF_ASSESSMENT: 1,
        DARAJA_VERIFIED: 2,
    };

    return tierOrder[targetTier] > tierOrder[currentTier];
}

/**
 * Generate payment reference
 */
export function generatePaymentReference(organizationId: string, tier: OrganizationTier): string {
    const timestamp = Date.now();
    return `ORG-${organizationId.slice(0, 8)}-${tier}-${timestamp}`;
}

/**
 * Format currency (KES)
 */
export function formatKES(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format currency (USD)
 */
export function formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(method: string): string {
    const names: Record<string, string> = {
        MPESA: 'M-PESA',
        PAYPAL: 'PayPal',
    };
    return names[method] || method;
}

/**
 * Get payment status display
 */
export function getPaymentStatusDisplay(status: string): {
    label: string;
    color: string;
} {
    const displays: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Pending', color: 'yellow' },
        COMPLETED: { label: 'Completed', color: 'green' },
        FAILED: { label: 'Failed', color: 'red' },
        REFUNDED: { label: 'Refunded', color: 'gray' },
    };
    return displays[status] || { label: status, color: 'gray' };
}
