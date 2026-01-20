import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { emailService } from '../services/email.service.js';
import { keycloakAdmin } from '../services/keycloak-admin.service.js';
import { logger } from '../lib/logger.js';
import { AccessRequestStatus } from '@prisma/client';

// AICODE-NOTE: Access requests CRUD routes
// Public route for submitting, authenticated routes for management

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateAccessRequestSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  unit: z.string().optional(),
  reason: z.string().optional(),
});

const GetAccessRequestsSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  propertyId: z.string().optional(),
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

      // Get property name from Keycloak
      let propertyName = data.propertyId;
      try {
        const realm = await keycloakAdmin.getRealm(data.propertyId);
        propertyName = realm.displayName || realm.realm;
      } catch (error) {
        logger.warn({ propertyId: data.propertyId }, 'Could not fetch realm name');
      }

      // Create access request
      const accessRequest = await prisma.accessRequest.create({
        data: {
          propertyId: data.propertyId,
          propertyName,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          unit: data.unit,
          reason: data.reason,
        },
      });

      // Send confirmation email to requester
      await emailService.sendAccessRequestConfirmation(
        data.email,
        data.firstName,
        propertyName
      );

      // TODO: Send notification to property admin

      logger.info(
        { requestId: accessRequest.id, email: data.email },
        'Access request created'
      );

      res.status(201).json(accessRequest);
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// Protected Routes
// ============================================================================

// Get all access requests (with filtering)
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetAccessRequestsSchema.parse(req.query);

      const where: {
        status?: AccessRequestStatus;
        propertyId?: string;
      } = {};

      if (query.status) {
        where.status = query.status as AccessRequestStatus;
      }

      if (query.propertyId) {
        where.propertyId = query.propertyId;
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

// Get access request stats
router.get(
  '/stats',
  authMiddleware,
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

// Get single access request
router.get(
  '/:id',
  authMiddleware,
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

// Approve access request
router.post(
  '/:id/approve',
  authMiddleware,
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

      if (request.status !== 'pending') {
        res.status(400).json({ error: 'Request has already been processed' });
        return;
      }

      // Create user in Keycloak
      try {
        await keycloakAdmin.createUser(request.propertyId, {
          username: request.email,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          enabled: true,
          emailVerified: false,
        });

        // Send password reset email so user can set their password
        // Note: This requires the user ID, which we'd need to look up
      } catch (error) {
        logger.error({ error, requestId: request.id }, 'Failed to create Keycloak user');
        res.status(500).json({ error: 'Failed to create user account' });
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
        request.propertyName
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

// Reject access request
router.post(
  '/:id/reject',
  authMiddleware,
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
        request.propertyName,
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

// Delete access request
router.delete(
  '/:id',
  authMiddleware,
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
