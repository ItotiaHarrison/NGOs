'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

interface Stats {
  totalOrganizations: number;
  pendingApproval: number;
  verified: number;
  totalUsers: number;
  recentRegistrations: number;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }

    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">Manage organizations, users, and verifications</p>
        </div>

        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrganizations}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified</p>
                  <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/organizations"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Organizations</h3>
                <p className="text-gray-600">Manage and approve organizations</p>
              </div>
            </div>
            {stats && stats.pendingApproval > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 font-medium">
                  {stats.pendingApproval} pending approval
                </p>
              </div>
            )}
          </Link>

          <Link
            href="/admin/verification"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Verification Queue</h3>
                <p className="text-gray-600">Review verification requests</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Users</h3>
                <p className="text-gray-600">Manage user accounts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View platform statistics</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
