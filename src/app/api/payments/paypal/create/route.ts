import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient, OrganizationTier } from '@prisma/client';
import { createPayPalOrder, getApprovalUrl } from '@/lib/paypal';
import { getTierPriceUSD, generatePaymentReference, canUpgradeToTier } from '@/lib/payment-utils';

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
        const { tier } = body;

        if (!tier) {
            return NextResponse.json({ error: 'Tier is required' }, { status: 400 });
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

        // Get tier price in USD
        const amount = getTierPriceUSD(tier as OrganizationTier);
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
                currency: 'USD',
                paymentMethod: 'PAYPAL',
                tier: tier as OrganizationTier,
                status: 'PENDING',
                metadata: {
                    accountReference,
                },
            },
        });

        // Create PayPal order
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const paypalOrder = await createPayPalOrder({
            amount,
            currency: 'USD',
            description: `Daraja Directory - Upgrade to ${tier}`,
            returnUrl: `${appUrl}/dashboard/payments/success?paymentId=${payment.id}`,
            cancelUrl: `${appUrl}/dashboard/upgrade?cancelled=true`,
        });

        // Update payment with PayPal order ID
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                transactionId: paypalOrder.id,
                metadata: {
                    accountReference,
                    paypalOrderId: paypalOrder.id,
                },
            },
        });

        // Get approval URL
        const approvalUrl = getApprovalUrl(paypalOrder);

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            orderId: paypalOrder.id,
            approvalUrl,
        });
    } catch (error: any) {
        console.error('PayPal create order error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create PayPal order' },
            { status: 500 }
        );
    }
}
