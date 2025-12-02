'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

interface Analytics {
  overview: {
    totalOrganizations: number;
    totalUsers: number;
    totalViews: number;
    avgViewsPerOrg: number;
  };
  byTier: {
    tier: string;
    count: number;
    percentage: number;
  }[];
  byCounty: {
    county: string;
    count: number;
  }[];
  bySector: {
    sector: string;
    count: number;
  }[];
  recentActivity: {
    date: string;
    registrations: number;
    approvals: number;
  }[];
  topOrganizations: {
    id: string;
    name: string;
    county: string;
    viewCount: number;
  }[];
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }

    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [user, isLoading, router]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daraja-directory-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN' || !analytics) {
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {exporting ? 'Exporting...' : '📊 Export CSV'}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {exporting ? 'Exporting...' : '📄 Export PDF'}
              </button>
              <Link
                href="/admin"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="mt-2 text-gray-600">Comprehensive insights and statistics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalOrganizations}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Profile Views</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Avg Views/Org</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.avgViewsPerOrg}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* By Tier */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizations by Tier</h3>
            <div className="space-y-3">
              {analytics.byTier.map((item) => (
                <div key={item.tier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.tier.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Counties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Counties</h3>
            <div className="space-y-2">
              {analytics.byCounty.slice(0, 10).map((item, index) => (
                <div key={item.county} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{item.county}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Sectors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Sectors</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {analytics.bySector.slice(0, 9).map((item) => (
              <div key={item.sector} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{item.sector}</span>
                <span className="text-sm font-semibold text-green-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Organizations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Organizations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">County</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Views</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topOrganizations.map((org, index) => (
                  <tr key={org.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">#{index + 1}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/directory/${org.id}`}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{org.county}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                      {org.viewCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
