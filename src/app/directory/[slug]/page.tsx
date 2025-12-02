import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SDGS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      documents: true,
    },
  });

  if (!organization) {
    notFound();
  }

  // Increment view count
  await prisma.organization.update({
    where: { id: organization.id },
    data: { viewCount: { increment: 1 } },
  });

  const tierBadges = {
    BASIC_FREE: { color: 'bg-gray-100 text-gray-700', label: 'Basic' },
    SELF_ASSESSMENT: { color: 'bg-blue-100 text-blue-700', label: 'Self-Assessed' },
    DARAJA_VERIFIED: { color: 'bg-green-100 text-green-700', label: '✓ Daraja Verified' },
  };

  const badge = tierBadges[organization.tier];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-green-600">Daraja Directory</h1>
            </Link>
            <Link
              href="/directory"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              ← Back to Directory
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {organization.name}
              </h1>
              <p className="text-lg text-gray-600">📍 {organization.county}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Staff Size</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization.staffSize || 'Not specified'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Annual Budget</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization.annualBudget || 'Not specified'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Year Established</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization.yearEstablished || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {organization.description || 'No description available'}
            </p>
          </div>

          {organization.sectors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sectors</h2>
              <div className="flex flex-wrap gap-2">
                {organization.sectors.map((sector) => (
                  <span
                    key={sector}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {organization.sdgs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Sustainable Development Goals
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {organization.sdgs.map((sdgId) => {
                  const sdg = SDGS.find((s) => s.id === sdgId);
                  return sdg ? (
                    <div
                      key={sdg.id}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {sdg.id}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{sdg.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">📧 Email:</span>
                <a
                  href={`mailto:${organization.email}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {organization.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">📱 Phone:</span>
                <a
                  href={`tel:${organization.phone}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {organization.phone}
                </a>
              </div>
              {organization.website && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">🌐 Website:</span>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
              {organization.address && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">📍 Address:</span>
                  <span className="text-gray-900">{organization.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          👁️ {organization.viewCount} views
        </div>
      </main>
    </div>
  );
}
