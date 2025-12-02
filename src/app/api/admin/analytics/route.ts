import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Fetch all analytics data
        const [
            organizations,
            totalUsers,
            tierStats,
            countyStats,
            sectorStats,
        ] = await Promise.all([
            prisma.organization.findMany({
                select: {
                    id: true,
                    name: true,
                    county: true,
                    tier: true,
                    sectors: true,
                    viewCount: true,
                },
            }),
            prisma.user.count(),
            prisma.organization.groupBy({
                by: ['tier'],
                _count: true,
            }),
            prisma.organization.groupBy({
                by: ['county'],
                _count: true,
                orderBy: {
                    _count: {
                        county: 'desc',
                    },
                },
            }),
            // Get sector counts (flatten array and count)
            prisma.organization.findMany({
                select: {
                    sectors: true,
                },
            }),
        ]);

        // Calculate overview stats
        const totalOrganizations = organizations.length;
        const totalViews = organizations.reduce((sum, org) => sum + org.viewCount, 0);
        const avgViewsPerOrg = totalOrganizations > 0
            ? Math.round(totalViews / totalOrganizations)
            : 0;

        // Process tier stats
        const byTier = tierStats.map((stat) => ({
            tier: stat.tier,
            count: stat._count,
            percentage: Math.round((stat._count / totalOrganizations) * 100),
        }));

        // Process county stats
        const byCounty = countyStats.map((stat) => ({
            county: stat.county,
            count: stat._count,
        }));

        // Process sector stats
        const sectorCounts: Record<string, number> = {};
        sectorStats.forEach((org) => {
            org.sectors.forEach((sector) => {
                sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
            });
        });

        const bySector = Object.entries(sectorCounts)
            .map(([sector, count]) => ({ sector, count }))
            .sort((a, b) => b.count - a.count);

        // Get top organizations by views
        const topOrganizations = organizations
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, 10)
            .map((org) => ({
                id: org.id,
                name: org.name,
                county: org.county,
                viewCount: org.viewCount,
            }));

        const analytics = {
            overview: {
                totalOrganizations,
                totalUsers,
                totalViews,
                avgViewsPerOrg,
            },
            byTier,
            byCounty,
            bySector,
            recentActivity: [], // Can be implemented with time-series data
            topOrganizations,
        };

        return NextResponse.json(
            { analytics },
            { status: 200 }
        );
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
