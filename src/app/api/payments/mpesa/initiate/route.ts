import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient, OrganizationTier } from '@prisma/client';
import { initiateStkPush } from '@/lib/mpesa';
import { getTierPrice, generatePaymentReference, canUpgradeToTier } from '@/lib/payment-utils';

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
        const { phoneNumber, tier } = body;

        if (!phoneNumber || !tier) {
            return NextResponse.json(
                { error: 'Phone number and tier are required' },
                { status: 400 }
            );
        }

        // Validate tier
        if (!['SELF_ASSESSMENT', 'DARAJA_VERIFIED'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        // Get organization
        const organization = await prisma.organization.findUnique({
            where: { userId: decoded.userId },
        });

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Check if can upgrade
        if (!canUpgradeToTier(organization.tier, tier as OrganizationTier)) {
            return NextResponse.json(
                { error: 'Cannot upgrade to this tier' },
                { status: 400 }
            );
        }

        // Get tier price
        const amount = getTierPrice(tier as OrganizationTier);
        if (amount === 0) {
            return NextResponse.json({ error: 'This tier is free' }, { status: 400 });
        }

        // Generate payment reference
        const accountReference = generatePaymentReference(organization.id, tier as OrganizationTier);

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                organizationId: organization.id,
                amount,
                currency: 'KES',
                paymentMethod: 'MPESA',
                tier: tier as OrganizationTier,
                status: 'PENDING',
                metadata: {
                    phoneNumber,
                    accountReference,
                },
            },
        });

        // Initiate STK Push
        const stkResponse = await initiateStkPush({
            phoneNumber,
            amount,
            accountReference,
            transactionDesc: `Upgrade to ${tier}`,
        });

        // Update payment with checkout request ID
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                metadata: {
                    phoneNumber,
                    accountReference,
                    checkoutRequestId: stkResponse.CheckoutRequestID,
                    merchantRequestId: stkResponse.MerchantRequestID,
                },
            },
        });

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            message: stkResponse.CustomerMessage,
        });
    } catch (error: any) {
        console.error('M-PESA initiate error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
