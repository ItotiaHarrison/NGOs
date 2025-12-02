import axios from 'axios';

// M-PESA API Configuration
const MPESA_BASE_URL = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

interface MpesaAuthResponse {
    access_token: string;
    expires_in: string;
}

interface StkPushRequest {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
}

interface StkPushResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
}

interface StkQueryResponse {
    ResponseCode: string;
    ResponseDescription: string;
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: string;
    ResultDesc: string;
}

/**
 * Get M-PESA OAuth access token
 */
export async function getMpesaAccessToken(): Promise<string> {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error('M-PESA credentials not configured');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get<MpesaAuthResponse>(
            `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('M-PESA auth error:', error);
        throw new Error('Failed to authenticate with M-PESA');
    }
}

/**
 * Generate M-PESA password for STK Push
 */
function generatePassword(): string {
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const timestamp = getTimestamp();

    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

/**
 * Get timestamp in M-PESA format (YYYYMMDDHHmmss)
 */
function getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Format phone number to M-PESA format (254XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-+]/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
        cleaned = '254' + cleaned;
    }

    return cleaned;
}

/**
 * Initiate STK Push (Lipa Na M-PESA Online)
 */
export async function initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    const accessToken = await getMpesaAccessToken();
    const shortcode = process.env.MPESA_SHORTCODE!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    if (!shortcode || !callbackUrl) {
        throw new Error('M-PESA configuration incomplete');
    }

    const timestamp = getTimestamp();
    const password = generatePassword();
    const formattedPhone = formatPhoneNumber(request.phoneNumber);

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(request.amount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
    };

    try {
        const response = await axios.post<StkPushResponse>(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('STK Push error:', error.response?.data || error.message);
        throw new Error('Failed to initiate M-PESA payment');
    }
}

/**
 * Query STK Push transaction status
 */
export async function queryStkPushStatus(checkoutRequestId: string): Promise<StkQueryResponse> {
    const accessToken = await getMpesaAccessToken();
    const shortcode = process.env.MPESA_SHORTCODE!;
    const timestamp = getTimestamp();
    const password = generatePassword();

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
    };

    try {
        const response = await axios.post<StkQueryResponse>(
            `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('STK Query error:', error.response?.data || error.message);
        throw new Error('Failed to query M-PESA transaction status');
    }
}

/**
 * Validate M-PESA callback data
 */
export function validateMpesaCallback(data: any): boolean {
    return (
        data &&
        data.Body &&
        data.Body.stkCallback &&
        data.Body.stkCallback.ResultCode !== undefined
    );
}

/**
 * Extract transaction details from M-PESA callback
 */
export function extractCallbackData(callback: any) {
    const stkCallback = callback.Body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const merchantRequestId = stkCallback.MerchantRequestID;

    let transactionId = null;
    let phoneNumber = null;
    let amount = null;

    if (resultCode === 0 && stkCallback.CallbackMetadata) {
        const items = stkCallback.CallbackMetadata.Item;

        items.forEach((item: any) => {
            switch (item.Name) {
                case 'MpesaReceiptNumber':
                    transactionId = item.Value;
                    break;
                case 'PhoneNumber':
                    phoneNumber = item.Value;
                    break;
                case 'Amount':
                    amount = item.Value;
                    break;
            }
        });
    }

    return {
        resultCode,
        resultDesc,
        checkoutRequestId,
        merchantRequestId,
        transactionId,
        phoneNumber,
        amount,
        success: resultCode === 0,
    };
}
