'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { TIER_FEATURES } from '@/lib/constants';
import Link from 'next/link';

export default function UpgradePage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentTier = user.organization?.tier || 'BASIC_FREE';

  const handleUpgradeClick = (tier: string) => {
    router.push(`/dashboard/upgrade/${tier.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-green-600">Daraja Directory</h1>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600">
            Current Tier: <span className="font-semibold text-green-600">{TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES].name}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic Free */}
          <div className={`bg-white rounded-lg shadow-md p-8 ${currentTier === 'BASIC_FREE' ? 'ring-2 ring-green-500' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                KES 0
              </div>
              <p className="text-gray-600">Forever free</p>
            </div>

            <ul className="space-y-3 mb-8">
              {TIER_FEATURES.BASIC_FREE.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === 'BASIC_FREE' ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              >
                Cannot Downgrade
              </button>
            )}
          </div>

          {/* Self-Assessment */}
          <div className={`bg-white rounded-lg shadow-md p-8 ${currentTier === 'SELF_ASSESSMENT' ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Self-Assessment</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                KES 2,500
              </div>
              <p className="text-gray-600">One-time payment</p>
            </div>

            <ul className="space-y-3 mb-8">
              {TIER_FEATURES.SELF_ASSESSMENT.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === 'SELF_ASSESSMENT' ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : currentTier === 'DARAJA_VERIFIED' ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              >
                Cannot Downgrade
              </button>
            ) : (
              <button
                onClick={() => handleUpgradeClick('SELF_ASSESSMENT')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upgrade Now
              </button>
            )}
          </div>

          {/* Daraja Verified */}
          <div className={`bg-white rounded-lg shadow-md p-8 border-2 ${currentTier === 'DARAJA_VERIFIED' ? 'border-green-500' : 'border-green-200'}`}>
            <div className="bg-green-600 text-white text-center py-2 -mx-8 -mt-8 mb-6 rounded-t-lg font-semibold">
              RECOMMENDED
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Daraja Verified</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                KES 10,000
              </div>
              <p className="text-gray-600">One-time payment + verification</p>
            </div>

            <ul className="space-y-3 mb-8">
              {TIER_FEATURES.DARAJA_VERIFIED.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {currentTier === 'DARAJA_VERIFIED' ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgradeClick('DARAJA_VERIFIED')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Upgrade & Get Verified
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Methods</h3>
          <p className="text-blue-800 mb-4">
            We accept M-PESA and PayPal for secure payments.
          </p>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg font-semibold text-green-600">M-PESA</div>
            <div className="bg-white px-4 py-2 rounded-lg font-semibold text-blue-600">PayPal</div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard/payments"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Payment History →
          </Link>
        </div>
      </main>
    </div>
  );
}
