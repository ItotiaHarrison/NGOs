import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateVerificationToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user and organization in a transaction
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                verificationToken,
                organization: {
                    create: {
                        name: validatedData.organizationName,
                        slug: validatedData.organizationName
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '') + '-' + Date.now(),
                        description: '',
                        email: validatedData.email,
                        phone: validatedData.phone,
                        county: validatedData.county,
                        sectors: [],
                        sdgs: [],
                    },
                },
            },
            include: {
                organization: true,
            },
        });

        // Send welcome email
        try {
            const { sendEmail, emailTemplates } = await import('@/lib/email');
            await sendEmail({
                to: user.email,
                subject: 'Welcome to Daraja Directory',
                html: emailTemplates.welcome(validatedData.organizationName),
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        return NextResponse.json(
            {
                message: 'Registration successful. Please check your email to verify your account.',
                userId: user.id,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
