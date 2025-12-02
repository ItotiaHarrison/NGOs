import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        const body = await request.json();
        const { status } = body;

        if (!['PENDING', 'APPROVED', 'REJECTED', 'VERIFIED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const organization = await prisma.organization.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Update organization status
        const updatedOrg = await prisma.organization.update({
            where: { id },
            data: {
                verificationStatus: status,
                verifiedAt: status === 'VERIFIED' ? new Date() : null,
            },
        });

        // Send email notification
        try {
            await sendEmail({
                to: organization.user.email,
                subject: `Organization Status Update - ${organization.name}`,
                html: getEmailTemplate(status, organization.name),
            });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json(
            {
                message: 'Status updated successfully',
                organization: updatedOrg,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}

function getEmailTemplate(status: string, orgName: string): string {
    const templates = {
        APPROVED: `
      <h2>Congratulations! Your organization has been approved</h2>
      <p>Dear ${orgName} team,</p>
      <p>We're pleased to inform you that your organization profile has been approved and is now visible in the Daraja Directory.</p>
      <p>Your organization can now be discovered by funders and partners across Kenya.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Visit your dashboard</a></p>
      <p>Best regards,<br>Daraja Directory Team</p>
    `,
        REJECTED: `
      <h2>Organization Profile Review</h2>
      <p>Dear ${orgName} team,</p>
      <p>Thank you for your interest in listing on Daraja Directory. Unfortunately, we need more information before we can approve your profile.</p>
      <p>Please review your profile and ensure all required information is complete and accurate.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile">Update your profile</a></p>
      <p>If you have questions, please contact our support team.</p>
      <p>Best regards,<br>Daraja Directory Team</p>
    `,
        VERIFIED: `
      <h2>🎉 Your organization is now Daraja Verified!</h2>
      <p>Dear ${orgName} team,</p>
      <p>Congratulations! Your organization has completed the verification process and earned the Daraja Verified badge.</p>
      <p>Benefits of verification:</p>
      <ul>
        <li>Premium verified badge on your profile</li>
        <li>Featured in search results</li>
        <li>Increased visibility to funders</li>
        <li>Priority support</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your verified profile</a></p>
      <p>Best regards,<br>Daraja Directory Team</p>
    `,
        PENDING: `
      <h2>Organization Profile Under Review</h2>
      <p>Dear ${orgName} team,</p>
      <p>Your organization profile is currently under review by our team.</p>
      <p>We'll notify you once the review is complete.</p>
      <p>Best regards,<br>Daraja Directory Team</p>
    `,
    };

    return templates[status as keyof typeof templates] || templates.PENDING;
}
