import nodemailer from 'nodemailer';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: Email service for sending notifications
// Uses nodemailer with SMTP configuration from environment

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;
  private enabled: boolean;

  constructor() {
    this.from = process.env.SMTP_FROM || 'noreply@alto.com';
    this.enabled = process.env.SMTP_ENABLED === 'true';

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASSWORD
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              }
            : undefined,
      });
    }
  }

  async send(options: EmailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.info({ to: options.to, subject: options.subject }, 'Email sending disabled, skipping');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        ...options,
      });

      logger.info({ to: options.to, subject: options.subject }, 'Email sent successfully');
      return true;
    } catch (error) {
      logger.error({ error, to: options.to }, 'Failed to send email');
      return false;
    }
  }

  async sendAccessRequestConfirmation(
    email: string,
    firstName: string,
    propertyName: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Access Request Received - Alto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Access Request Received</h2>
          <p>Hello ${firstName},</p>
          <p>We have received your access request for <strong>${propertyName}</strong>.</p>
          <p>Your request is currently being reviewed by the property administrator.
             You will receive another email once your request has been processed.</p>
          <p>Thank you for your patience.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message from Alto Access Management.
          </p>
        </div>
      `,
    });
  }

  async sendAccessRequestApproved(
    email: string,
    firstName: string,
    propertyName: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Access Request Approved - Alto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Access Request Approved!</h2>
          <p>Hello ${firstName},</p>
          <p>Great news! Your access request for <strong>${propertyName}</strong> has been approved.</p>
          <p>You can now log in to the Alto CRM Dashboard using your credentials.</p>
          <p>If you haven't received your login credentials, please contact the property administrator.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message from Alto Access Management.
          </p>
        </div>
      `,
    });
  }

  async sendAccessRequestRejected(
    email: string,
    firstName: string,
    propertyName: string,
    reason?: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Access Request Update - Alto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #64748b;">Access Request Update</h2>
          <p>Hello ${firstName},</p>
          <p>We regret to inform you that your access request for <strong>${propertyName}</strong>
             could not be approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you believe this is an error or have questions, please contact the property administrator.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message from Alto Access Management.
          </p>
        </div>
      `,
    });
  }

  async sendNewAccessRequestNotification(
    adminEmail: string,
    requesterName: string,
    propertyName: string,
    requestId: string
  ): Promise<boolean> {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';

    return this.send({
      to: adminEmail,
      subject: `New Access Request - ${propertyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">New Access Request</h2>
          <p>A new access request has been submitted:</p>
          <ul>
            <li><strong>Name:</strong> ${requesterName}</li>
            <li><strong>Property:</strong> ${propertyName}</li>
          </ul>
          <p>
            <a href="${dashboardUrl}/access-queue"
               style="display: inline-block; background-color: #0ea5e9; color: white;
                      padding: 10px 20px; text-decoration: none; border-radius: 8px;">
              Review Request
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message from Alto Access Management.
          </p>
        </div>
      `,
    });
  }

  // AICODE-NOTE: Admin notification with magic links for approve/reject
  async sendAdminApprovalRequest(
    adminEmail: string,
    request: {
      firstName: string;
      lastName: string;
      email: string;
      company: string;
      phone: string;
      rolePreference: string;
      createdAt: Date;
    },
    approveUrl: string,
    rejectUrl: string
  ): Promise<boolean> {
    const submittedDate = request.createdAt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return this.send({
      to: adminEmail,
      subject: `New Access Request: ${request.firstName} ${request.lastName} (${request.company})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8b5cf6; margin-bottom: 24px;">New Access Request</h2>
          <p style="color: #334155; margin-bottom: 20px;">
            Someone has requested access to Alto CERO IAM.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${request.firstName} ${request.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; color: #0f172a;">${request.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Company:</td>
                <td style="padding: 8px 0; color: #0f172a;">${request.company}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Phone:</td>
                <td style="padding: 8px 0; color: #0f172a;">${request.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Role Pref:</td>
                <td style="padding: 8px 0; color: #0f172a; text-transform: capitalize;">${request.rolePreference}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Submitted:</td>
                <td style="padding: 8px 0; color: #0f172a;">${submittedDate}</td>
              </tr>
            </table>
          </div>

          <p style="color: #64748b; margin-bottom: 20px; font-size: 14px;">
            Please verify this person before approving.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${approveUrl}"
               style="display: inline-block; background-color: #10b981; color: white;
                      padding: 14px 32px; text-decoration: none; border-radius: 8px;
                      font-weight: 600; margin-right: 16px;">
              APPROVE
            </a>
            <a href="${rejectUrl}"
               style="display: inline-block; background-color: #ef4444; color: white;
                      padding: 14px 32px; text-decoration: none; border-radius: 8px;
                      font-weight: 600;">
              REJECT
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            This link expires in 24 hours.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Alto CERO IAM - Access Management
          </p>
        </div>
      `,
    });
  }

  // AICODE-NOTE: Welcome email with login credentials
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string,
    loginUrl: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Welcome to Alto CERO IAM - Your Access is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981; margin-bottom: 24px;">Welcome to Alto CERO IAM</h2>
          <p style="color: #334155; margin-bottom: 20px;">
            Hello ${firstName}, your access request has been approved!
          </p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;">Your Role:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 500; text-transform: capitalize;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Username:</td>
                <td style="padding: 8px 0; color: #0f172a;">${email}</td>
              </tr>
            </table>
          </div>

          <p style="color: #334155; margin-bottom: 16px;">
            <strong>Next Steps:</strong>
          </p>
          <ol style="color: #334155; margin-bottom: 24px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Click the login button below</li>
            <li style="margin-bottom: 8px;">Check your email for a password reset link</li>
            <li style="margin-bottom: 8px;">Set your password and complete MFA setup</li>
          </ol>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}"
               style="display: inline-block; background-color: #8b5cf6; color: white;
                      padding: 14px 32px; text-decoration: none; border-radius: 8px;
                      font-weight: 600;">
              LOG IN NOW
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Alto CERO IAM - Access Management
          </p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
