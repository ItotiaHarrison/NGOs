'use client';

import { useState } from 'react';
import { OrganizationTier } from '@prisma/client';
import { formatUSD, getTierPriceUSD } from '@/lib/payment-utils';

interface PaymentPaypalProps {
  tier: OrganizationTier;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentPaypal({ tier, onSuccess, onError }: PaymentPaypalProps) {
  const [loading, setLoading] = useState(false);

  const amount = getTierPriceUSD(tier);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/paypal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (error: any) {
      onError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">💳</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pay with PayPal</h3>
          <p className="text-sm text-gray-600">Credit Card or PayPal Balance</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount to pay:</span>
            <span className="text-xl font-bold text-gray-900">{formatUSD(amount)}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Pay with PayPal</span>
              <span>{formatUSD(amount)}</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• You will be redirected to PayPal to complete payment</p>
        <p>• Pay with your PayPal balance or credit/debit card</p>
        <p>• Your account will be upgraded automatically upon successful payment</p>
      </div>
    </div>
  );
}
