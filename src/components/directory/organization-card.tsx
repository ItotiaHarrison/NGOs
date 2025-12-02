import Link from 'next/link';
import { Organization } from '@prisma/client';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const tierBadges = {
    BASIC_FREE: { color: 'bg-gray-100 text-gray-700', label: 'Basic' },
    SELF_ASSESSMENT: { color: 'bg-blue-100 text-blue-700', label: 'Self-Assessed' },
    DARAJA_VERIFIED: { color: 'bg-green-100 text-green-700', label: '✓ Verified' },
  };

  const badge = tierBadges[organization.tier];

  return (
    <Link href={`/directory/${organization.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {organization.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              📍 {organization.county}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {organization.description || 'No description available'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {organization.sectors.slice(0, 3).map((sector) => (
            <span
              key={sector}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {sector}
            </span>
          ))}
          {organization.sectors.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{organization.sectors.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>👥 {organization.staffSize || 'N/A'}</span>
          <span>💰 {organization.annualBudget || 'N/A'}</span>
        </div>
      </div>
    </Link>
  );
}
