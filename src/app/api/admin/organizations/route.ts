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

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        const where: any = {};

        if (filter === 'pending') {
            where.verificationStatus = 'PENDING';
        } else if (filter === 'approved') {
            where.verificationStatus = 'APPROVED';
        } else if (filter === 'rejected') {
            where.verificationStatus = 'REJECTED';
        }

        const organizations = await prisma.organization.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(
            { organizations },
            { status: 200 }
        );
    } catch (error) {
        console.error('Admin organizations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}
