import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/client-access.js';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: Site access management routes
// Allows Alto admins to grant/revoke property-level access for users
// Super admin only - clients cannot manage site access
// This is more granular than client_prefix - controls specific property access

const router = Router();

// All routes require authentication and super admin status
router.use(authMiddleware);
router.use(requireSuperAdmin);

// ============================================================================
// Validation Schemas
// ============================================================================

const GrantAccessSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userEmail: z.string().email('Valid email is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
});

// ============================================================================
// Routes
// ============================================================================

// Get site access for a specific user
router.get(
  '/users/:userId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;

      const siteAccess = await prisma.userSiteAccess.findMany({
        where: {
          userId,
          revokedAt: null, // Only active access
        },
        orderBy: { grantedAt: 'desc' },
      });

      res.json({
        items: siteAccess,
        total: siteAccess.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all users with access to a specific property
router.get(
  '/properties/:propertyId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;

      const siteAccess = await prisma.userSiteAccess.findMany({
        where: {
          propertyId,
          revokedAt: null, // Only active access
        },
        orderBy: { grantedAt: 'desc' },
      });

      res.json({
        items: siteAccess,
        total: siteAccess.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Grant site access to a user
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = GrantAccessSchema.parse(req.body);

      // Upsert - re-grant if previously revoked
      const siteAccess = await prisma.userSiteAccess.upsert({
        where: {
          userId_propertyId: {
            userId: data.userId,
            propertyId: data.propertyId,
          },
        },
        update: {
          revokedAt: null, // Re-grant if previously revoked
          grantedBy: req.user?.id || 'unknown',
          grantedAt: new Date(),
        },
        create: {
          userId: data.userId,
          userEmail: data.userEmail,
          propertyId: data.propertyId,
          grantedBy: req.user?.id || 'unknown',
        },
      });

      logger.info(
        { userId: data.userId, propertyId: data.propertyId, grantedBy: req.user?.id },
        'Site access granted'
      );

      res.status(201).json(siteAccess);
    } catch (error) {
      next(error);
    }
  }
);

// Bulk grant site access (multiple properties for one user)
router.post(
  '/bulk',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schema = z.object({
        userId: z.string().min(1),
        userEmail: z.string().email(),
        propertyIds: z.array(z.string().min(1)).min(1),
      });

      const data = schema.parse(req.body);

      // Grant access to all specified properties
      const results = await Promise.all(
        data.propertyIds.map((propertyId) =>
          prisma.userSiteAccess.upsert({
            where: {
              userId_propertyId: {
                userId: data.userId,
                propertyId,
              },
            },
            update: {
              revokedAt: null,
              grantedBy: req.user?.id || 'unknown',
              grantedAt: new Date(),
            },
            create: {
              userId: data.userId,
              userEmail: data.userEmail,
              propertyId,
              grantedBy: req.user?.id || 'unknown',
            },
          })
        )
      );

      logger.info(
        { userId: data.userId, propertyCount: data.propertyIds.length, grantedBy: req.user?.id },
        'Bulk site access granted'
      );

      res.status(201).json({ items: results, total: results.length });
    } catch (error) {
      next(error);
    }
  }
);

// Revoke site access
router.delete(
  '/:accessId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessId = req.params.accessId as string;

      const existing = await prisma.userSiteAccess.findUnique({
        where: { id: accessId },
      });

      if (!existing) {
        res.status(404).json({ error: 'Site access record not found' });
        return;
      }

      // Soft delete - set revokedAt
      const siteAccess = await prisma.userSiteAccess.update({
        where: { id: accessId },
        data: { revokedAt: new Date() },
      });

      logger.info(
        { accessId, userId: existing.userId, propertyId: existing.propertyId, revokedBy: req.user?.id },
        'Site access revoked'
      );

      res.json(siteAccess);
    } catch (error) {
      next(error);
    }
  }
);

// Revoke all site access for a user
router.delete(
  '/users/:userId/all',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;

      const result = await prisma.userSiteAccess.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      logger.info(
        { userId, revokedCount: result.count, revokedBy: req.user?.id },
        'All site access revoked for user'
      );

      res.json({ success: true, revokedCount: result.count });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
