'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
  email: string;
  county: string;
  tier: string;
  verificationStatus: string;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function AdminOrganizationsPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }

    if (user?.role === 'ADMIN') {
      fetchOrganizations();
    }
  }, [user, isLoading, router, filter]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/organizations?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orgId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
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

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    VERIFIED: 'bg-blue-100 text-blue-800',
  };

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
          <h2 className="text-3xl font-bold text-gray-900">Organizations</h2>
          <p className="mt-2 text-gray-600">Review and manage organization listings</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  filter === 'all'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  filter === 'pending'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  filter === 'approved'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  filter === 'rejected'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rejected
              </button>
            </nav>
          </div>

          <div className="divide-y">
            {organizations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No organizations found
              </div>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[org.verificationStatus as keyof typeof statusColors]
                          }`}
                        >
                          {org.verificationStatus}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {org.tier.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📧 {org.email}</p>
                        <p>📍 {org.county}</p>
                        <p>👤 User: {org.user.email}</p>
                        <p>📅 Registered: {new Date(org.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link
                        href={`/directory/${org.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center"
                      >
                        View Profile
                      </Link>
                      
                      {org.verificationStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(org.id, 'APPROVED')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(org.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {org.verificationStatus === 'APPROVED' && org.tier === 'DARAJA_VERIFIED' && (
                        <button
                          onClick={() => handleStatusChange(org.id, 'VERIFIED')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Mark Verified
                        </button>
                      )}

                      {org.verificationStatus === 'REJECTED' && (
                        <button
                          onClick={() => handleStatusChange(org.id, 'PENDING')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
