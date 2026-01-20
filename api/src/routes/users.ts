import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { keycloakAdmin } from '../services/keycloak-admin.service.js';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: User management routes - wraps Keycloak user operations
// Nested under /properties/:propertyId/users

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============================================================================
// Validation Schemas
// ============================================================================

const GetUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

const CreateUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  enabled: z.boolean().default(true),
  password: z.string().min(8).optional(),
});

const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  enabled: z.boolean().optional(),
});

const ResetPasswordSchema = z.object({
  password: z.string().min(8),
  temporary: z.boolean().default(true),
});

// ============================================================================
// Routes
// ============================================================================

// Get users for a property
router.get(
  '/:propertyId/users',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const query = GetUsersSchema.parse(req.query);

      const { users, total } = await keycloakAdmin.getUsers(propertyId, {
        first: (query.page - 1) * query.pageSize,
        max: query.pageSize,
        search: query.search,
      });

      res.json({
        items: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          enabled: user.enabled,
          emailVerified: user.emailVerified,
          createdTimestamp: user.createdTimestamp,
        })),
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

// Get single user
router.get(
  '/:propertyId/users/:userId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;

      const user = await keycloakAdmin.getUser(propertyId, userId);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
        createdTimestamp: user.createdTimestamp,
        attributes: user.attributes,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create user
router.post(
  '/:propertyId/users',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const data = CreateUserSchema.parse(req.body);

      const userId = await keycloakAdmin.createUser(propertyId, {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        enabled: data.enabled,
        credentials: data.password
          ? [{ type: 'password', value: data.password, temporary: true }]
          : undefined,
      });

      const user = await keycloakAdmin.getUser(propertyId, userId);

      logger.info(
        { propertyId, userId, createdBy: req.user?.id },
        'User created'
      );

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update user
router.put(
  '/:propertyId/users/:userId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;
      const data = UpdateUserSchema.parse(req.body);

      await keycloakAdmin.updateUser(propertyId, userId, data);

      const user = await keycloakAdmin.getUser(propertyId, userId);

      logger.info(
        { propertyId, userId, updatedBy: req.user?.id },
        'User updated'
      );

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete user
router.delete(
  '/:propertyId/users/:userId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;

      await keycloakAdmin.deleteUser(propertyId, userId);

      logger.info(
        { propertyId, userId, deletedBy: req.user?.id },
        'User deleted'
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Enable user
router.post(
  '/:propertyId/users/:userId/enable',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;

      await keycloakAdmin.enableUser(propertyId, userId);

      const user = await keycloakAdmin.getUser(propertyId, userId);

      logger.info(
        { propertyId, userId, enabledBy: req.user?.id },
        'User enabled'
      );

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Disable user
router.post(
  '/:propertyId/users/:userId/disable',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;

      await keycloakAdmin.disableUser(propertyId, userId);

      const user = await keycloakAdmin.getUser(propertyId, userId);

      logger.info(
        { propertyId, userId, disabledBy: req.user?.id },
        'User disabled'
      );

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reset user password
router.post(
  '/:propertyId/users/:userId/reset-password',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;
      const data = ResetPasswordSchema.parse(req.body);

      await keycloakAdmin.resetUserPassword(
        propertyId,
        userId,
        data.password,
        data.temporary
      );

      logger.info(
        { propertyId, userId, resetBy: req.user?.id },
        'User password reset'
      );

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Send password reset email
router.post(
  '/:propertyId/users/:userId/send-password-reset',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = req.params.userId as string;

      await keycloakAdmin.sendPasswordResetEmail(propertyId, userId);

      logger.info(
        { propertyId, userId, sentBy: req.user?.id },
        'Password reset email sent'
      );

      res.json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
