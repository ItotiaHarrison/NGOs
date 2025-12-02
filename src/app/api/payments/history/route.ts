import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get organization
        const organization = await prisma.organization.findUnique({
            where: { userId: decoded.userId },
        });

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Get payments
        const payments = await prisma.payment.findMany({
            where: {
                organizationId: organization.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                amount: true,
                currency: true,
                paymentMethod: true,
                transactionId: true,
                status: true,
                tier: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ payments });
    } catch (error: any) {
        console.error('Payment history error:', error);
        return NextResponse.json(
            { error: 'Failed to get payment history' },
            { status: 500 }
        );
    }
}
