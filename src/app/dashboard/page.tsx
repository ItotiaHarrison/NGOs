'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/');
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-green-600">Daraja Directory</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h2>
          <p className="mt-2 text-gray-600">Manage your organization profile and settings</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Organization Profile</h3>
            <p className="text-gray-600 mb-4">
              {user.organization?.name || 'Complete your profile'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Tier: {user.organization?.tier || 'BASIC_FREE'}
            </p>
            <Link
              href="/dashboard/profile"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Edit Profile →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
            <p className="text-gray-600 mb-4">
              {user.organization?.verificationStatus || 'PENDING'}
            </p>
            <Link
              href="/dashboard/verification"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Upgrade Tier</h3>
            <p className="text-gray-600 mb-4">
              Unlock more features with premium tiers
            </p>
            <Link
              href="/dashboard/upgrade"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View Plans →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Payment History</h3>
            <p className="text-gray-600 mb-4">
              View your transactions and receipts
            </p>
            <Link
              href="/dashboard/payments"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View History →
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Account created successfully</li>
            <li>→ Complete your organization profile</li>
            <li>→ Upload required documents</li>
            <li>→ Consider upgrading for verification</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
