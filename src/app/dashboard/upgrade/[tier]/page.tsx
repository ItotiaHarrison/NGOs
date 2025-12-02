'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import PaymentMpesa from '@/components/PaymentMpesa';
import PaymentPaypal from '@/components/PaymentPaypal';
import { OrganizationTier } from '@prisma/client';
import { getTierDisplayName, formatKES, formatUSD, getTierPrice, getTierPriceUSD } from '@/lib/payment-utils';

export default function TierUpgradePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading, fetchUser } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'PAYPAL'>('MPESA');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tierParam = params.tier as string;
  const tier = tierParam?.toUpperCase() as OrganizationTier;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Validate tier
  if (!['SELF_ASSESSMENT', 'DARAJA_VERIFIED'].includes(tier)) {
    router.push('/dashboard/upgrade');
    return null;
  }

  const currentTier = user.organization?.tier || 'BASIC_FREE';

  // Check if can upgrade
  const tierOrder = {
    BASIC_FREE: 0,
    SELF_ASSESSMENT: 1,
    DARAJA_VERIFIED: 2,
  };

  if (tierOrder[tier] <= tierOrder[currentTier as keyof typeof tierOrder]) {
    router.push('/dashboard/upgrade');
    return null;
  }

  const handleSuccess = async () => {
    setSuccess(true);
    // Refresh user data
    await fetchUser();
    
    // Redirect after 3 seconds
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been upgraded to {getTierDisplayName(tier)}
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/upgrade')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Plans
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Upgrade to {getTierDisplayName(tier)}
          </h1>
          <p className="text-gray-600 mt-2">Choose your preferred payment method</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">{getTierDisplayName(tier)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium text-gray-900">One-time</span>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatKES(getTierPrice(tier))}
                      </div>
                      <div className="text-sm text-gray-500">
                        ≈ {formatUSD(getTierPriceUSD(tier))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">What you'll get:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                {tier === 'SELF_ASSESSMENT' && (
                  <>
                    <li>✓ Enhanced profile visibility</li>
                    <li>✓ Upload up to 5 documents</li>
                    <li>✓ Self-assessment badge</li>
                    <li>✓ Priority in search results</li>
                  </>
                )}
                {tier === 'DARAJA_VERIFIED' && (
                  <>
                    <li>✓ Full verification by Daraja</li>
                    <li>✓ Verified badge on profile</li>
                    <li>✓ Upload up to 10 documents</li>
                    <li>✓ Featured in directory</li>
                    <li>✓ Top priority in search</li>
                    <li>✓ Enhanced credibility</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            {/* Payment Method Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('MPESA')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'MPESA'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div className="font-medium text-gray-900">M-PESA</div>
                  <div className="text-xs text-gray-500">Pay in KES</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('PAYPAL')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'PAYPAL'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">💳</div>
                  <div className="font-medium text-gray-900">PayPal</div>
                  <div className="text-xs text-gray-500">Pay in USD</div>
                </button>
              </div>
            </div>

            {/* Payment Form */}
            {paymentMethod === 'MPESA' ? (
              <PaymentMpesa tier={tier} onSuccess={handleSuccess} onError={handleError} />
            ) : (
              <PaymentPaypal tier={tier} onSuccess={handleSuccess} onError={handleError} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
