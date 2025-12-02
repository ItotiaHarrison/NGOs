'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  county: string;
  tier: string;
  verificationStatus: string;
  createdAt: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  user: {
    email: string;
  };
}

export default function VerificationQueuePage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }

    if (user?.role === 'ADMIN') {
      fetchRequests();
    }
  }, [user, isLoading, router]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/verification');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orgId: string) => {
    if (!confirm('Are you sure you want to verify this organization?')) return;

    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to verify organization:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin">
              <h1 className="text-2xl font-bold text-green-600">Daraja Admin</h1>
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Verification Queue</h2>
          <p className="mt-2 text-gray-600">
            Review organizations requesting Daraja Verified status
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No verification requests pending
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((req) => (
                <div key={req.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {req.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📧 {req.email}</p>
                        <p>📍 {req.county}</p>
                        <p>👤 User: {req.user.email}</p>
                        <p>📅 Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {req.tier.replace('_', ' ')}
                    </span>
                  </div>

                  {req.documents.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Uploaded Documents ({req.documents.length})
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {req.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm">
                              {doc.type === 'application/pdf' ? '📄' : '🖼️'}
                            </span>
                            <span className="text-sm text-gray-700 truncate">
                              {doc.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/directory/${req.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      View Full Profile
                    </Link>
                    <button
                      onClick={() => handleVerify(req.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      ✓ Verify Organization
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
