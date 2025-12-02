import {
    Client,
    Environment,
    OrdersController,
    CheckoutPaymentIntent,
    OrderApplicationContextLandingPage,
    OrderApplicationContextUserAction
} from '@paypal/paypal-server-sdk';

let client: Client | null = null;

/**
 * Get PayPal client instance
 */
export function getPayPalClient(): Client {
    if (!client) {
        if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
            throw new Error('PayPal credentials not configured');
        }

        client = new Client({
            clientCredentialsAuthCredentials: {
                oAuthClientId: process.env.PAYPAL_CLIENT_ID,
                oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
            },
            environment: process.env.PAYPAL_MODE === 'production'
                ? Environment.Production
                : Environment.Sandbox,
        });
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
        const client = getPayPalClient();
        const ordersController = new OrdersController(client);

        const orderRequest = {
            body: {
                intent: CheckoutPaymentIntent.Capture,
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: request.currency || 'USD',
                            value: request.amount.toFixed(2),
                        },
                        description: request.description,
                    },
                ],
                applicationContext: {
                    returnUrl: request.returnUrl,
                    cancelUrl: request.cancelUrl,
                    brandName: 'Daraja Directory',
                    landingPage: OrderApplicationContextLandingPage.Billing,
                    userAction: OrderApplicationContextUserAction.PayNow,
                },
            },
        };

        const response = await ordersController.createOrder(orderRequest);

        return {
            id: response.result.id || '',
            status: response.result.status || '',
            links: (response.result.links || []).map(link => ({
                href: link.href || '',
                rel: link.rel || '',
                method: link.method || '',
            })),
        };
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
        const ordersController = new OrdersController(client);

        const response = await ordersController.captureOrder({
            id: orderId,
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
        const ordersController = new OrdersController(client);

        const response = await ordersController.getOrder({
            id: orderId,
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
