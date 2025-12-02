'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

export default function VerificationStatusPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

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

  const org = user.organization;
  const status = org?.verificationStatus || 'PENDING';
  const tier = org?.tier || 'BASIC_FREE';

  const statusInfo = {
    PENDING: {
      icon: '⏳',
      color: 'yellow',
      title: 'Under Review',
      description: 'Your organization profile is currently being reviewed by our team.',
      action: 'We typically review profiles within 2-3 business days.',
    },
    APPROVED: {
      icon: '✓',
      color: 'green',
      title: 'Approved',
      description: 'Your organization has been approved and is now visible in the directory.',
      action: tier === 'DARAJA_VERIFIED' ? 'Your verification request is in the queue.' : 'Consider upgrading to get verified.',
    },
    REJECTED: {
      icon: '✗',
      color: 'red',
      title: 'Needs Attention',
      description: 'Your profile needs additional information before it can be approved.',
      action: 'Please update your profile with complete and accurate information.',
    },
    VERIFIED: {
      icon: '🎉',
      color: 'blue',
      title: 'Daraja Verified',
      description: 'Congratulations! Your organization has earned the Daraja Verified badge.',
      action: 'You now have access to all premium features.',
    },
  };

  const info = statusInfo[status as keyof typeof statusInfo];

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Verification Status</h2>
          <p className="mt-2 text-gray-600">Track your organization's verification progress</p>
        </div>

        <div className={`bg-${info.color}-50 border-2 border-${info.color}-200 rounded-lg p-8 mb-8`}>
          <div className="flex items-start gap-4">
            <div className="text-6xl">{info.icon}</div>
            <div className="flex-1">
              <h3 className={`text-2xl font-bold text-${info.color}-900 mb-2`}>
                {info.title}
              </h3>
              <p className={`text-${info.color}-800 mb-4`}>{info.description}</p>
              <p className={`text-${info.color}-700 font-medium`}>{info.action}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Verification Timeline</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status !== 'PENDING' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {status !== 'PENDING' ? '✓' : '1'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Profile Submitted</h4>
                <p className="text-sm text-gray-600">Your organization profile has been created</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'APPROVED' || status === 'VERIFIED' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {status === 'APPROVED' || status === 'VERIFIED' ? '✓' : '2'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Profile Approved</h4>
                <p className="text-sm text-gray-600">Admin team reviews and approves your profile</p>
              </div>
            </div>

            {tier === 'DARAJA_VERIFIED' && (
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'VERIFIED' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {status === 'VERIFIED' ? '✓' : '3'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Verification Complete</h4>
                  <p className="text-sm text-gray-600">Manual verification and badge assignment</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {status === 'REJECTED' && (
            <Link
              href="/dashboard/profile"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 text-center"
            >
              <h4 className="font-semibold mb-2">Update Profile</h4>
              <p className="text-sm">Complete your profile information</p>
            </Link>
          )}

          {(status === 'APPROVED' || status === 'VERIFIED') && tier !== 'DARAJA_VERIFIED' && (
            <Link
              href="/dashboard/upgrade"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 text-center"
            >
              <h4 className="font-semibold mb-2">Get Verified</h4>
              <p className="text-sm">Upgrade to Daraja Verified tier</p>
            </Link>
          )}

          <Link
            href="/dashboard/documents"
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 text-center"
          >
            <h4 className="font-semibold mb-2">Upload Documents</h4>
            <p className="text-sm">Add supporting documents</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
