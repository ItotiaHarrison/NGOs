'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { KENYAN_COUNTIES, SECTORS } from '@/lib/constants';

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [county, setCounty] = useState(searchParams.get('county') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || '');
  const [tier, setTier] = useState(searchParams.get('tier') || '');

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (county) params.set('county', county);
    if (sector) params.set('sector', sector);
    if (tier) params.set('tier', tier);
    
    router.push(`/directory?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setCounty('');
    setSector('');
    setTier('');
    router.push('/directory');
  };

  const activeFiltersCount = [search, county, sector, tier].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
            placeholder="Organization name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
            County
          </label>
          <select
            id="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Counties</option>
            {KENYAN_COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
            Sector
          </label>
          <select
            id="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Sectors</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Tier
          </label>
          <select
            id="tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Tiers</option>
            <option value="BASIC_FREE">Basic</option>
            <option value="SELF_ASSESSMENT">Self-Assessed</option>
            <option value="DARAJA_VERIFIED">Verified</option>
          </select>
        </div>

        <button
          onClick={updateFilters}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          Apply Filters
          {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </button>
      </div>
    </div>
  );
}
