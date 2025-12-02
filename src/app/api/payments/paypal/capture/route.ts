import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { capturePayPalOrder } from '@/lib/paypal';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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

        // Get request body
        const body = await request.json();
        const { paymentId } = body;

        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
        }

        // Get payment
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                organization: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Verify ownership
        if (payment.organization.userId !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if already completed
        if (payment.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
        }

        // Get PayPal order ID
        const paypalOrderId = payment.transactionId;
        if (!paypalOrderId) {
            return NextResponse.json({ error: 'PayPal order ID not found' }, { status: 400 });
        }

        // Capture PayPal payment
        const captureResult = await capturePayPalOrder(paypalOrderId);

        // Check capture status
        const captureStatus = captureResult.status;
        const isCompleted = captureStatus === 'COMPLETED';

        if (isCompleted) {
            // Update payment and organization
            await prisma.$transaction([
                // Update payment status
                prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'COMPLETED',
                        metadata: {
                            ...(payment.metadata as any),
                            captureResult,
                            completedAt: new Date().toISOString(),
                        },
                    },
                }),
                // Upgrade organization tier
                prisma.organization.update({
                    where: { id: payment.organizationId },
                    data: {
                        tier: payment.tier,
                    },
                }),
            ]);

            return NextResponse.json({
                success: true,
                status: 'COMPLETED',
                message: 'Payment completed successfully',
            });
        } else {
            // Payment not completed
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'FAILED',
                    metadata: {
                        ...(payment.metadata as any),
                        captureResult,
                        failedAt: new Date().toISOString(),
                    },
                },
            });

            return NextResponse.json({
                success: false,
                status: captureStatus,
                message: 'Payment could not be completed',
            });
        }
    } catch (error: any) {
        console.error('PayPal capture error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to capture payment' },
            { status: 500 }
        );
    }
}
