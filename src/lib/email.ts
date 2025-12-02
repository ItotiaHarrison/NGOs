// Email utility for sending notifications
// In production, integrate with services like:
// - Resend (https://resend.com)
// - SendGrid
// - AWS SES
// - Mailgun

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
    // For development, just log the email
    if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Body:', html);
        return;
    }

    // Production email sending
    // Example with Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.SMTP_FROM || 'noreply@daraja.org',
      to,
      subject,
      html,
    });
    */

    // Example with nodemailer (SMTP):
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    */

    console.log('Email sent to:', to);
}

// Email templates
export const emailTemplates = {
    welcome: (name: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Welcome to Daraja Directory!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering your organization with Daraja Directory.</p>
      <p>Your profile is currently under review. We'll notify you once it's approved.</p>
      <p>In the meantime, you can complete your profile and upload documents.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Go to Dashboard</a></p>
      <p>Best regards,<br>Daraja Directory Team</p>
    </div>
  `,

    verification: (email: string, token: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Verify Your Email</h2>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Verify Email</a></p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>Daraja Directory Team</p>
    </div>
  `,

    passwordReset: (email: string, token: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Reset Your Password</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Best regards,<br>Daraja Directory Team</p>
    </div>
  `,

    tierUpgrade: (orgName: string, tier: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Tier Upgrade Successful!</h2>
      <p>Dear ${orgName} team,</p>
      <p>Your organization has been successfully upgraded to <strong>${tier}</strong>.</p>
      <p>You now have access to additional features and benefits.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">View Dashboard</a></p>
      <p>Best regards,<br>Daraja Directory Team</p>
    </div>
  `,
};
