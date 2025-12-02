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

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                organization: {
                    include: {
                        documents: {
                            orderBy: { uploadedAt: 'desc' },
                        },
                    },
                },
            },
        });

        if (!user?.organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { documents: user.organization.documents },
            { status: 200 }
        );
    } catch (error) {
        console.error('Fetch documents error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                organization: {
                    include: {
                        documents: true,
                    },
                },
            },
        });

        if (!user?.organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Check tier limits
        const tierLimits = {
            BASIC_FREE: 0,
            SELF_ASSESSMENT: 5,
            DARAJA_VERIFIED: 999,
        };

        const maxDocs = tierLimits[user.organization.tier];
        if (user.organization.documents.length >= maxDocs) {
            return NextResponse.json(
                { error: 'Document limit reached for your tier' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Only PDF and image files are allowed' },
                { status: 400 }
            );
        }

        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll just store metadata
        const document = await prisma.document.create({
            data: {
                organizationId: user.organization.id,
                name: file.name,
                type: file.type,
                size: file.size,
                url: `/uploads/${Date.now()}-${file.name}`, // Placeholder URL
            },
        });

        return NextResponse.json(
            {
                message: 'Document uploaded successfully',
                document,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Upload document error:', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}
