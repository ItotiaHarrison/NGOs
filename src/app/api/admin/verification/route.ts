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

        // Get organizations with DARAJA_VERIFIED tier that are APPROVED but not yet VERIFIED
        const requests = await prisma.organization.findMany({
            where: {
                tier: 'DARAJA_VERIFIED',
                verificationStatus: 'APPROVED',
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
                documents: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json(
            { requests },
            { status: 200 }
        );
    } catch (error) {
        console.error('Verification queue error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verification requests' },
            { status: 500 }
        );
    }
}
