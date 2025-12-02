import Link from 'next/link';
import { prisma } from '@/lib/db';
import { OrganizationCard } from '@/components/directory/organization-card';
import { SearchFilters } from '@/components/directory/search-filters';

export const dynamic = 'force-dynamic';

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const county = typeof params.county === 'string' ? params.county : '';
  const sector = typeof params.sector === 'string' ? params.sector : '';
  const tier = typeof params.tier === 'string' ? params.tier : '';

  // Build where clause for filtering
  const where: any = {
    verificationStatus: { in: ['APPROVED', 'VERIFIED'] },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (county) {
    where.county = county;
  }

  if (sector) {
    where.sectors = { has: sector };
  }

  if (tier) {
    where.tier = tier;
  }

  const organizations = await prisma.organization.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { tier: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-green-600">Daraja Directory</h1>
            </Link>
            <div className="space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
              >
                List Your Organization
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">NGO & CBO Directory</h2>
          <p className="mt-2 text-gray-600">
            Browse {organizations.length} verified organizations across Kenya
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <SearchFilters />
          </aside>

          <div className="lg:col-span-3">
            {organizations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">No organizations found matching your criteria.</p>
                <Link
                  href="/directory"
                  className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {organizations.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
