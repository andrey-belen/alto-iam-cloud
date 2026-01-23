import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/client-access.js';
import { emailService } from '../services/email.service.js';
import { keycloakAdmin } from '../services/keycloak-admin.service.js';
import { logger } from '../lib/logger.js';
import { AccessRequestStatus } from '@prisma/client';

// AICODE-NOTE: Admin email for notifications - set in environment
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'andrey.b@altotech.net';

// AICODE-NOTE: Access requests CRUD routes
// Public route for submitting, authenticated routes for management
// Protected routes require super admin (client_prefix = "*") - clients cannot access

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

// AICODE-NOTE: Access request schema matches Prisma model and frontend form
// company = client organization name (will be matched to /clients/{company} group)
// rolePreference = requested role (operator or viewer)
const CreateAccessRequestSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  rolePreference: z.enum(['operator', 'viewer']),
});

const GetAccessRequestsSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  company: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================================
// Public Route: Submit Access Request
// ============================================================================

router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = CreateAccessRequestSchema.parse(req.body);

      // Generate approval token (valid for 24 hours)
      const approvalToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Create access request with approval token
      const accessRequest = await prisma.accessRequest.create({
        data: {
          company: data.company,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          rolePreference: data.rolePreference,
          approvalToken,
          tokenExpiresAt,
        },
      });

      // Send confirmation email to requester
      await emailService.sendAccessRequestConfirmation(
        data.email,
        data.firstName,
        data.company
      );

      // AICODE-NOTE: Send notification to admin with approve/reject links
      const dashboardUrl = process.env.DASHBOARD_URL || 'https://alto-auth.altotech.ai';
      const approveUrl = `${dashboardUrl}/approve/${approvalToken}`;
      const rejectUrl = `${dashboardUrl}/reject/${approvalToken}`;

      await emailService.sendAdminApprovalRequest(
        ADMIN_EMAIL,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          company: data.company,
          phone: data.phone,
          rolePreference: data.rolePreference,
          createdAt: accessRequest.createdAt,
        },
        approveUrl,
        rejectUrl
      );

      logger.info(
        { requestId: accessRequest.id, email: data.email, company: data.company },
        'Access request created'
      );

      res.status(201).json(accessRequest);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Public Token-Based Routes (Magic Links from Email)
// ============================================================================

// AICODE-NOTE: Get access request by token (for magic link approval page)
router.get(
  '/token/:token',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params.token as string;

      const request = await prisma.accessRequest.findUnique({
        where: { approvalToken: token },
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found or link expired' });
        return;
      }

      // Check if token has expired
      if (request.tokenExpiresAt && new Date() > request.tokenExpiresAt) {
        res.status(400).json({ error: 'Link has expired', status: 'expired' });
        return;
      }

      // Check if already processed
      if (request.status !== 'pending') {
        res.status(400).json({ error: `Request already ${request.status}`, status: request.status });
        return;
      }

      res.json(request);
    } catch (error) {
      next(error);
    }
  }
);

// AICODE-NOTE: Approve access request by token (magic link)
router.post(
  '/token/:token/approve',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params.token as string;
      const { role } = req.body;

      const request = await prisma.accessRequest.findUnique({
        where: { approvalToken: token },
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found or link expired' });
        return;
      }

      if (request.tokenExpiresAt && new Date() > request.tokenExpiresAt) {
        res.status(400).json({ error: 'Link has expired' });
        return;
      }

      if (request.status !== 'pending') {
        res.status(400).json({ error: 'Request has already been processed' });
        return;
      }

      const finalRole = role || request.rolePreference;
      const realmName = 'alto';

      // Create user in Keycloak
      try {
        const userId = await keycloakAdmin.createUser(realmName, {
          username: request.email,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          enabled: true,
          emailVerified: false,
        });

        // Pre-create email-authenticator credential for immediate MFA (non-blocking)
        try {
          await keycloakAdmin.createEmailAuthenticatorCredential(
            realmName,
            userId,
            request.email
          );
        } catch (credError) {
          logger.warn({ error: credError, userId }, 'Could not pre-create MFA credential');
        }

        // Send password reset email (non-blocking - user can use "forgot password" if this fails)
        try {
          await keycloakAdmin.sendPasswordResetEmail(realmName, userId);
          logger.info({ userId }, 'Password reset email sent');
        } catch (emailError) {
          logger.warn({ error: emailError, userId }, 'Could not send password reset email');
        }

        logger.info(
          { requestId: request.id, userId, role: finalRole },
          'User created via magic link approval'
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ error: errorMessage, requestId: request.id }, 'Failed to create Keycloak user');
        res.status(500).json({ error: errorMessage || 'Failed to create user account' });
        return;
      }

      // Update request status
      const updatedRequest = await prisma.accessRequest.update({
        where: { id: request.id },
        data: {
          status: 'approved',
          processedBy: 'magic-link',
          processedAt: new Date(),
        },
      });

      // Send welcome email
      const dashboardUrl = process.env.DASHBOARD_URL || 'https://alto-auth.altotech.ai';
      await emailService.sendWelcomeEmail(
        request.email,
        request.firstName,
        finalRole,
        dashboardUrl
      );

      logger.info({ requestId: request.id }, 'Access request approved via magic link');

      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  }
);

// AICODE-NOTE: Reject access request by token (magic link)
router.post(
  '/token/:token/reject',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params.token as string;
      const { reason } = req.body;

      const request = await prisma.accessRequest.findUnique({
        where: { approvalToken: token },
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found or link expired' });
        return;
      }

      if (request.tokenExpiresAt && new Date() > request.tokenExpiresAt) {
        res.status(400).json({ error: 'Link has expired' });
        return;
      }

      if (request.status !== 'pending') {
        res.status(400).json({ error: 'Request has already been processed' });
        return;
      }

      // Update request status
      const updatedRequest = await prisma.accessRequest.update({
        where: { id: request.id },
        data: {
          status: 'rejected',
          processedBy: 'magic-link',
          processedAt: new Date(),
        },
      });

      // Send rejection email
      await emailService.sendAccessRequestRejected(
        request.email,
        request.firstName,
        request.company,
        reason
      );

      logger.info({ requestId: request.id }, 'Access request rejected via magic link');

      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Protected Routes - ALTO ADMINS ONLY (client_prefix = "*")
// ============================================================================

// Get all access requests (with filtering) - ALTO ADMIN ONLY
router.get(
  '/',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetAccessRequestsSchema.parse(req.query);

      const where: {
        status?: AccessRequestStatus;
        company?: string;
      } = {};

      if (query.status) {
        where.status = query.status as AccessRequestStatus;
      }

      if (query.company) {
        where.company = query.company;
      }

      const [items, total] = await Promise.all([
        prisma.accessRequest.findMany({
          where,
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.accessRequest.count({ where }),
      ]);

      res.json({
        items,
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get access request stats - ALTO ADMIN ONLY
router.get(
  '/stats',
  authMiddleware,
  requireSuperAdmin,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [pending, approved, rejected, total] = await Promise.all([
        prisma.accessRequest.count({ where: { status: 'pending' } }),
        prisma.accessRequest.count({ where: { status: 'approved' } }),
        prisma.accessRequest.count({ where: { status: 'rejected' } }),
        prisma.accessRequest.count(),
      ]);

      res.json({ pending, approved, rejected, total });
    } catch (error) {
      next(error);
    }
  }
);

// Get single access request - ALTO ADMIN ONLY
router.get(
  '/:id',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const request = await prisma.accessRequest.findUnique({
        where: { id },
      });

      if (!request) {
        res.status(404).json({ error: 'Access request not found' });
        return;
      }

      res.json(request);
    } catch (error) {
      next(error);
    }
  }
);

// AICODE-NOTE: Approval schema for assigning user to client/sites
// Admin must specify clientId (group name) when approving
const ApproveRequestSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  siteIds: z.array(z.string()).optional(), // Optional site assignments
  role: z.enum(['operator', 'viewer']).optional(), // Override requested role
});

// Approve access request - ALTO ADMIN ONLY
router.post(
  '/:id/approve',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const approvalData = ApproveRequestSchema.parse(req.body);

      const request = await prisma.accessRequest.findUnique({
        where: { id },
      });

      if (!request) {
        res.status(404).json({ error: 'Access request not found' });
        return;
      }

      if (request.status !== 'pending') {
        res.status(400).json({ error: 'Request has already been processed' });
        return;
      }

      // AICODE-NOTE: All users created in single 'alto' realm
      const realmName = 'alto';
      const finalRole = approvalData.role || request.rolePreference;

      // Create user in Keycloak and send password reset email
      try {
        const userId = await keycloakAdmin.createUser(realmName, {
          username: request.email,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          enabled: true,
          emailVerified: false,
        });

        // AICODE-TODO: Assign user to client group (/clients/{clientId})
        // AICODE-TODO: Assign user to site groups (/clients/{clientId}/sites/{siteId})
        // AICODE-TODO: Assign realm role (operator or viewer)
        // These require additional Keycloak Admin API methods for group/role assignment

        // AICODE-NOTE: Pre-create email-authenticator credential for immediate MFA
        // Without this, user sees "Set up Email Authenticator" screen on first login
        // With credential, user goes directly to OTP input after password
        await keycloakAdmin.createEmailAuthenticatorCredential(
          realmName,
          userId,
          request.email
        );

        // Send password reset email so user can set their password
        await keycloakAdmin.sendPasswordResetEmail(realmName, userId);

        logger.info(
          {
            requestId: request.id,
            userId,
            clientId: approvalData.clientId,
            role: finalRole,
          },
          'User created with MFA credential and password reset email sent'
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ error: errorMessage, requestId: request.id }, 'Failed to create Keycloak user');
        res.status(500).json({ error: errorMessage || 'Failed to create user account' });
        return;
      }

      // Update request status
      const updatedRequest = await prisma.accessRequest.update({
        where: { id },
        data: {
          status: 'approved',
          processedBy: req.user?.id,
          processedAt: new Date(),
        },
      });

      // Send approval email
      await emailService.sendAccessRequestApproved(
        request.email,
        request.firstName,
        request.company
      );

      logger.info(
        { requestId: request.id, approvedBy: req.user?.id },
        'Access request approved'
      );

      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  }
);

// Reject access request - ALTO ADMIN ONLY
router.post(
  '/:id/reject',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;

      const request = await prisma.accessRequest.findUnique({
        where: { id },
      });

      if (!request) {
        res.status(404).json({ error: 'Access request not found' });
        return;
      }

      if (request.status !== 'pending') {
        res.status(400).json({ error: 'Request has already been processed' });
        return;
      }

      // Update request status
      const updatedRequest = await prisma.accessRequest.update({
        where: { id },
        data: {
          status: 'rejected',
          processedBy: req.user?.id,
          processedAt: new Date(),
        },
      });

      // Send rejection email
      await emailService.sendAccessRequestRejected(
        request.email,
        request.firstName,
        request.company,
        reason
      );

      logger.info(
        { requestId: request.id, rejectedBy: req.user?.id },
        'Access request rejected'
      );

      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  }
);

// Delete access request - ALTO ADMIN ONLY
router.delete(
  '/:id',
  authMiddleware,
  requireSuperAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const request = await prisma.accessRequest.findUnique({
        where: { id },
      });

      if (!request) {
        res.status(404).json({ error: 'Access request not found' });
        return;
      }

      await prisma.accessRequest.delete({
        where: { id },
      });

      logger.info(
        { requestId: id, deletedBy: req.user?.id },
        'Access request deleted'
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
