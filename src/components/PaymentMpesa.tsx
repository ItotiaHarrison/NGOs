'use client';

import { useState } from 'react';
import { OrganizationTier } from '@prisma/client';
import { formatKES, getTierPrice } from '@/lib/payment-utils';

interface PaymentMpesaProps {
  tier: OrganizationTier;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentMpesa({ tier, onSuccess, onError }: PaymentMpesaProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const amount = getTierPrice(tier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber,
          tier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setPaymentId(data.paymentId);
      
      // Start checking payment status
      checkPaymentStatus(data.paymentId);
    } catch (error: any) {
      onError(error.message);
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (id: string) => {
    setCheckingStatus(true);
    let attempts = 0;
    const maxAttempts = 30; // Check for 2 minutes (30 * 4 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payments/mpesa/status?paymentId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setCheckingStatus(false);
          setLoading(false);
          onSuccess();
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setCheckingStatus(false);
          setLoading(false);
          onError('Payment failed. Please try again.');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setCheckingStatus(false);
          setLoading(false);
          onError('Payment timeout. Please check your transaction history.');
        }
      } catch (error) {
        // Continue checking
      }
    }, 4000); // Check every 4 seconds
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📱</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pay with M-PESA</h3>
          <p className="text-sm text-gray-600">Lipa Na M-PESA Online</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            M-PESA Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0712345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={loading}
            pattern="[0-9]{10}"
            title="Enter a valid 10-digit phone number"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your Safaricom number (e.g., 0712345678)
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount to pay:</span>
            <span className="text-xl font-bold text-gray-900">{formatKES(amount)}</span>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-0.5"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {checkingStatus ? 'Waiting for payment confirmation...' : 'Initiating payment...'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {checkingStatus
                    ? 'Check your phone for the M-PESA prompt and enter your PIN'
                    : 'Please wait...'}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : `Pay ${formatKES(amount)}`}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>• You will receive an M-PESA prompt on your phone</p>
        <p>• Enter your M-PESA PIN to complete the payment</p>
        <p>• Your account will be upgraded automatically upon successful payment</p>
      </div>
    </div>
  );
}
