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

        const [
            totalOrganizations,
            pendingApproval,
            verified,
            totalUsers,
            recentRegistrations,
        ] = await Promise.all([
            prisma.organization.count(),
            prisma.organization.count({
                where: { verificationStatus: 'PENDING' },
            }),
            prisma.organization.count({
                where: { verificationStatus: 'VERIFIED' },
            }),
            prisma.user.count(),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);

        return NextResponse.json(
            {
                stats: {
                    totalOrganizations,
                    pendingApproval,
                    verified,
                    totalUsers,
                    recentRegistrations,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
