'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationProfileSchema, type OrganizationProfileInput } from '@/lib/validations';
import { KENYAN_COUNTIES, SECTORS, STAFF_SIZES, BUDGET_RANGES, SDGS } from '@/lib/constants';
import Link from 'next/link';

export default function ProfileEditPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrganizationProfileInput>({
    resolver: zodResolver(organizationProfileSchema),
  });

  const selectedSectors = watch('sectors') || [];
  const selectedSdgs = watch('sdgs') || [];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user?.organization) {
      const org = user.organization;
      setValue('name', org.name);
      setValue('description', org.description || '');
      setValue('email', org.email);
      setValue('phone', org.phone);
      setValue('county', org.county);
      setValue('subCounty', org.subCounty || '');
      setValue('address', org.address || '');
      setValue('website', org.website || '');
      setValue('registrationNumber', org.registrationNumber || '');
      setValue('yearEstablished', org.yearEstablished || undefined);
      setValue('staffSize', org.staffSize || '');
      setValue('annualBudget', org.annualBudget || '');
      setValue('sectors', org.sectors || []);
      setValue('sdgs', org.sdgs || []);
    }
  }, [user, isLoading, router, setValue]);

  const toggleSector = (sector: string) => {
    const current = selectedSectors;
    if (current.includes(sector)) {
      setValue('sectors', current.filter((s) => s !== sector));
    } else {
      setValue('sectors', [...current, sector]);
    }
  };

  const toggleSdg = (sdgId: number) => {
    const current = selectedSdgs;
    if (current.includes(sdgId)) {
      setValue('sdgs', current.filter((id) => id !== sdgId));
    } else {
      setValue('sdgs', [...current, sdgId]);
    }
  };

  const onSubmit = async (data: OrganizationProfileInput) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/organization/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  if (!user) return null;

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
          <h2 className="text-3xl font-bold text-gray-900">Edit Organization Profile</h2>
          <p className="mt-2 text-gray-600">Update your organization's information</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description * (min. 50 characters)
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tell us about your organization, mission, and impact..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                County *
              </label>
              <select
                {...register('county')}
                id="county"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select County</option>
                {KENYAN_COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
              {errors.county && (
                <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subCounty" className="block text-sm font-medium text-gray-700 mb-1">
                Sub-County
              </label>
              <input
                {...register('subCounty')}
                type="text"
                id="subCounty"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address
              </label>
              <input
                {...register('address')}
                type="text"
                id="address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                id="website"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://..."
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                {...register('registrationNumber')}
                type="text"
                id="registrationNumber"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700 mb-1">
                Year Established
              </label>
              <input
                {...register('yearEstablished', { valueAsNumber: true })}
                type="number"
                id="yearEstablished"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.yearEstablished && (
                <p className="mt-1 text-sm text-red-600">{errors.yearEstablished.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="staffSize" className="block text-sm font-medium text-gray-700 mb-1">
                Staff Size
              </label>
              <select
                {...register('staffSize')}
                id="staffSize"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Staff Size</option>
                {STAFF_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="annualBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Budget (KES)
              </label>
              <select
                {...register('annualBudget')}
                id="annualBudget"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Budget Range</option>
                {BUDGET_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sectors * (Select at least one)
            </label>
            <div className="grid md:grid-cols-2 gap-2">
              {SECTORS.map((sector) => (
                <label
                  key={sector}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSectors.includes(sector)
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-300 hover:border-green-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sector)}
                    onChange={() => toggleSector(sector)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{sector}</span>
                </label>
              ))}
            </div>
            {errors.sectors && (
              <p className="mt-1 text-sm text-red-600">{errors.sectors.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sustainable Development Goals (Optional)
            </label>
            <div className="grid md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {SDGS.map((sdg) => (
                <label
                  key={sdg.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSdgs.includes(sdg.id)
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSdgs.includes(sdg.id)}
                    onChange={() => toggleSdg(sdg.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {sdg.id}
                  </span>
                  <span className="text-sm text-gray-900">{sdg.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
