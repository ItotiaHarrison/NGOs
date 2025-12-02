import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateMpesaCallback, extractCallbackData } from '@/lib/mpesa';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate callback structure
        if (!validateMpesaCallback(body)) {
            console.error('Invalid M-PESA callback structure:', body);
            return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
        }

        // Extract callback data
        const callbackData = extractCallbackData(body);
        const { checkoutRequestId, success, transactionId, resultDesc } = callbackData;

        // Find payment by checkout request ID
        const payment = await prisma.payment.findFirst({
            where: {
                metadata: {
                    path: ['checkoutRequestId'],
                    equals: checkoutRequestId,
                },
            },
            include: {
                organization: true,
            },
        });

        if (!payment) {
            console.error('Payment not found for checkout request:', checkoutRequestId);
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (success) {
            // Payment successful - update payment and organization
            await prisma.$transaction([
                // Update payment status
                prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'COMPLETED',
                        transactionId,
                        metadata: {
                            ...(payment.metadata as any),
                            ...callbackData,
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

            console.log('Payment completed successfully:', {
                paymentId: payment.id,
                transactionId,
                organizationId: payment.organizationId,
                tier: payment.tier,
            });
        } else {
            // Payment failed
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'FAILED',
                    metadata: {
                        ...(payment.metadata as any),
                        ...callbackData,
                        failedAt: new Date().toISOString(),
                    },
                },
            });

            console.log('Payment failed:', {
                paymentId: payment.id,
                reason: resultDesc,
            });
        }

        // Return success response to M-PESA
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Accepted',
        });
    } catch (error: any) {
        console.error('M-PESA callback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
