import { PayPalHttpClient, core } from '@paypal/paypal-server-sdk';

// PayPal Configuration
const environment = process.env.PAYPAL_MODE === 'production'
    ? new core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    )
    : new core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    );

let client: PayPalHttpClient | null = null;

/**
 * Get PayPal client instance
 */
export function getPayPalClient(): PayPalHttpClient {
    if (!client) {
        if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
            throw new Error('PayPal credentials not configured');
        }
        client = new PayPalHttpClient(environment);
    }
    return client;
}

interface CreateOrderRequest {
    amount: number;
    currency?: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
}

interface CreateOrderResponse {
    id: string;
    status: string;
    links: Array<{
        href: string;
        rel: string;
        method: string;
    }>;
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
        const orderRequest = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: request.currency || 'USD',
                        value: request.amount.toFixed(2),
                    },
                    description: request.description,
                },
            ],
            application_context: {
                return_url: request.returnUrl,
                cancel_url: request.cancelUrl,
                brand_name: 'Daraja Directory',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
            },
        };

        const client = getPayPalClient();
        const response = await client.execute({
            path: '/v2/checkout/orders',
            verb: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: orderRequest,
        });

        return response.result as CreateOrderResponse;
    } catch (error: any) {
        console.error('PayPal create order error:', error);
        throw new Error('Failed to create PayPal order');
    }
}

/**
 * Capture PayPal order payment
 */
export async function capturePayPalOrder(orderId: string) {
    try {
        const client = getPayPalClient();
        const response = await client.execute({
            path: `/v2/checkout/orders/${orderId}/capture`,
            verb: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.result;
    } catch (error: any) {
        console.error('PayPal capture order error:', error);
        throw new Error('Failed to capture PayPal payment');
    }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(orderId: string) {
    try {
        const client = getPayPalClient();
        const response = await client.execute({
            path: `/v2/checkout/orders/${orderId}`,
            verb: 'GET',
        });

        return response.result;
    } catch (error: any) {
        console.error('PayPal get order error:', error);
        throw new Error('Failed to get PayPal order details');
    }
}

/**
 * Convert KES to USD (approximate rate)
 */
export function convertKEStoUSD(amountKES: number): number {
    const exchangeRate = 0.0077; // Approximate rate, should be updated regularly
    return Math.round(amountKES * exchangeRate * 100) / 100;
}

/**
 * Get approval URL from PayPal order response
 */
export function getApprovalUrl(order: CreateOrderResponse): string | null {
    const approveLink = order.links.find(link => link.rel === 'approve');
    return approveLink?.href || null;
}
