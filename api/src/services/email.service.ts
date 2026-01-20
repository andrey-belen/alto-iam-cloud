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
}

export const emailService = new EmailService();
export default emailService;
