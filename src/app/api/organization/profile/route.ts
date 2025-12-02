import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { organizationProfileSchema } from '@/lib/validations';

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = organizationProfileSchema.parse(body);

        // Find user's organization
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: { organization: true },
        });

        if (!user?.organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Update organization
        const updatedOrg = await prisma.organization.update({
            where: { id: user.organization.id },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                email: validatedData.email,
                phone: validatedData.phone,
                county: validatedData.county,
                subCounty: validatedData.subCounty,
                address: validatedData.address,
                website: validatedData.website,
                registrationNumber: validatedData.registrationNumber,
                yearEstablished: validatedData.yearEstablished,
                staffSize: validatedData.staffSize,
                annualBudget: validatedData.annualBudget,
                sectors: validatedData.sectors,
                sdgs: validatedData.sdgs || [],
            },
        });

        return NextResponse.json(
            {
                message: 'Profile updated successfully',
                organization: updatedOrg,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Profile update error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
