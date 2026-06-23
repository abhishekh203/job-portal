import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Gmail SMTP configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '', // Gmail App Password (16 characters)
  },
  tls: {
    rejectUnauthorized: false // For development only
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};

// Generate secure token
export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Email templates
const getEmailTemplate = (type: 'verification' | 'passwordReset' | 'jobApproved' | 'jobRejected' | 'applicationStatusChanged', data: any): { subject: string; html: string } => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 40px 20px; text-align: center; }
    .content { padding: 40px 20px; }
    .button { display: inline-block; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
    .highlight { font-weight: 600; }
  `;

  if (type === 'verification') {
    return {
      subject: '🚀 Verify Your NayaJagir Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Your Email</title><style>${styles}.header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }.header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }.button { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }.highlight { color: #6366f1; }</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>🚀 Welcome to NayaJagir!</h1></div>
            <div class="content">
              <h2>Hey there! 👋</h2>
              <p>Thanks for joining the <span class="highlight">NayaJagir</span> community! We're excited to help you find your dream job.</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${baseUrl}/auth/verify-email?token=${data.token}" class="button">✨ Verify My Email</a>
              </div>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6366f1;">${baseUrl}/auth/verify-email?token=${data.token}</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">If you didn't create an account with NayaJagir, you can safely ignore this email.</p>
            </div>
            <div class="footer"><p>© 2024 NayaJagir. Made with 💜 for Gen Z.</p><p>Disrupting the job market, one opportunity at a time.</p></div>
          </div>
        </body>
        </html>
      `
    };
  }

  if (type === 'passwordReset') {
    return {
      subject: '🔐 Reset Your NayaJagir Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset Your Password</title><style>${styles}.header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); }.header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }.button { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); }.highlight { color: #ef4444; }.warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px; }</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>🔐 Password Reset</h1></div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your <span class="highlight">NayaJagir</span> account.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${baseUrl}/auth/reset-password?token=${data.token}" class="button">🔑 Reset My Password</a>
              </div>
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>You can only use this link once</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #ef4444;">${baseUrl}/auth/reset-password?token=${data.token}</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, someone might be trying to access your account.</p>
            </div>
            <div class="footer"><p>© 2024 NayaJagir. Made with 💜 for Gen Z.</p><p>Keep your account secure!</p></div>
          </div>
        </body>
        </html>
      `
    };
  }

  if (type === 'jobApproved') {
    return {
      subject: '✅ Your Job Posting Has Been Approved!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Job Approved</title><style>${styles}.header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }.header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }.button { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>✅ Job Approved!</h1></div>
            <div class="content">
              <h2>Great news!</h2>
              <p>Your job posting <strong>"${data.jobTitle}"</strong> has been approved and is now live on NayaJagir.</p>
              <p>Job seekers can now find and apply for this position.</p>
              <div style="text-align: center;">
                <a href="${baseUrl}/dashboard/employer/jobs" class="button">View My Jobs</a>
              </div>
            </div>
            <div class="footer"><p>© 2024 NayaJagir. Made with 💜 for Gen Z.</p></div>
          </div>
        </body>
        </html>
      `
    };
  }

  if (type === 'jobRejected') {
    return {
      subject: '❌ Your Job Posting Was Not Approved',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Job Not Approved</title><style>${styles}.header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }.header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }.button { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>❌ Job Not Approved</h1></div>
            <div class="content">
              <h2>Update on your job posting</h2>
              <p>Your job posting <strong>"${data.jobTitle}"</strong> was not approved by the admin team.</p>
              ${data.reason ? `<div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:20px 0;border-radius:8px;"><p style="margin:0;font-weight:600;color:#92400e;">Reason:</p><p style="margin:8px 0 0 0;color:#78350f;">${data.reason}</p></div>` : ''}
              <p>You can edit and resubmit your job after addressing the feedback above.</p>
              <div style="text-align: center;">
                <a href="${baseUrl}/dashboard/employer/jobs" class="button">Manage My Jobs</a>
              </div>
            </div>
            <div class="footer"><p>© 2024 NayaJagir. Made with 💜 for Gen Z.</p></div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Application status changed notification
  const statusConfig: Record<string, { emoji: string; gradient: string; title: string; message: string }> = {
    REVIEWED:    { emoji: '👁️', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', title: 'Application Reviewed', message: 'Your application has been reviewed by the employer.' },
    SHORTLISTED: { emoji: '⭐', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', title: 'You\'ve Been Shortlisted!', message: 'Congratulations! You have been shortlisted for this position.' },
    ACCEPTED:    { emoji: '🎉', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', title: 'Application Accepted!', message: 'Great news! Your application has been accepted.' },
    REJECTED:    { emoji: '💔', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', title: 'Application Update', message: 'Unfortunately, your application was not successful this time.' },
    HIRED:       { emoji: '🥳', gradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)', title: 'You\'re Hired!', message: 'Congratulations! You have been hired for this position.' },
    PENDING:     { emoji: '⏳', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', title: 'Application Pending', message: 'Your application status has been updated to pending.' },
  };

  const cfg = statusConfig[data.status] || statusConfig.PENDING;
  const statusStyles = `.header { background: ${cfg.gradient}; }.header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }.status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 18px; color: #ffffff; background: ${cfg.gradient}; }`;

  return {
    subject: `${cfg.emoji} Application Status: ${data.status} — ${data.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Application Status Update</title><style>${styles}${statusStyles}</style></head>
      <body>
        <div class="container">
          <div class="header"><h1>${cfg.emoji} ${cfg.title}</h1></div>
          <div class="content">
            <h2>Hello ${data.candidateName}! 👋</h2>
            <p>There's an update on your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <span class="status-badge">${data.status}</span>
            </div>
            <p>${cfg.message}</p>
            <div style="text-align: center;">
              <a href="${baseUrl}/dashboard/applications" class="button" style="background: ${cfg.gradient};">View My Applications</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Keep an eye on your dashboard for further updates. Best of luck! 🍀</p>
          </div>
          <div class="footer"><p>© 2024 NayaJagir. Made with 💜 for Gen Z.</p></div>
        </div>
      </body>
      </html>
    `
  };
};

// Send verification email
export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    const { subject, html } = getEmailTemplate('verification', { token });

    await transporter.sendMail({
      from: {
        name: process.env.FROM_NAME || 'NayaJagir Team',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
      },
      to: email,
      subject,
      html,
    });

    console.log(`✅ Verification email sent to ${email}`);
    console.log(`🔑 Verification token: ${token}`); // For development
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    const { subject, html } = getEmailTemplate('passwordReset', { token });

    await transporter.sendMail({
      from: {
        name: process.env.FROM_NAME || 'NayaJagir Team',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
      },
      to: email,
      subject,
      html,
    });

    console.log(`✅ Password reset email sent to ${email}`);
    console.log(`🔑 Reset token: ${token}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
};

// Send job approved email
export const sendJobApprovedEmail = async (email: string, name: string, jobTitle: string): Promise<boolean> => {
  try {
    const { subject, html } = getEmailTemplate('jobApproved', { jobTitle });

    await transporter.sendMail({
      from: {
        name: process.env.FROM_NAME || 'NayaJagir Team',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
      },
      to: email,
      subject,
      html,
    });

    console.log(`✅ Job approved email sent to ${email} for "${jobTitle}"`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send job approved email:', error);
    return false;
  }
};

// Send job rejected email
export const sendJobRejectedEmail = async (email: string, name: string, jobTitle: string, rejectionReason: string): Promise<boolean> => {
  try {
    const { subject, html } = getEmailTemplate('jobRejected', { jobTitle, reason: rejectionReason });

    await transporter.sendMail({
      from: {
        name: process.env.FROM_NAME || 'NayaJagir Team',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
      },
      to: email,
      subject,
      html,
    });

    console.log(`✅ Job rejected email sent to ${email} for "${jobTitle}"`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send job rejected email:', error);
    return false;
  }
};

// Send application status changed email
export const sendApplicationStatusEmail = async (
  email: string,
  candidateName: string,
  jobTitle: string,
  companyName: string,
  status: string
): Promise<boolean> => {
  try {
    const { subject, html } = getEmailTemplate('applicationStatusChanged', { candidateName, jobTitle, companyName, status });

    await transporter.sendMail({
      from: {
        name: process.env.FROM_NAME || 'NayaJagir Team',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER || ''
      },
      to: email,
      subject,
      html,
    });

    console.log(`✅ Application status email sent to ${email} for "${jobTitle}" — ${status}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send application status email:', error);
    return false;
  }
};

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  try {
    console.log('🧪 Testing email configuration...');
    console.log('📧 SMTP Host:', process.env.SMTP_HOST);
    console.log('📧 SMTP Port:', process.env.SMTP_PORT);
    console.log('📧 SMTP User:', process.env.SMTP_USER);
    console.log('📧 From Email:', process.env.FROM_EMAIL);
    console.log('📧 From Name:', process.env.FROM_NAME);

    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return false;
  }
};
