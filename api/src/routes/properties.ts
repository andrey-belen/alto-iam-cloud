import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import {
  filterPropertiesByClient,
  requirePropertyAccess,
} from '../middleware/client-access.js';
import { keycloakAdmin } from '../services/keycloak-admin.service.js';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: Properties routes - wraps Keycloak realms as "properties"
// Filtered by client_prefix for multi-tenant isolation

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============================================================================
// Validation Schemas
// ============================================================================

const GetPropertiesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

// ============================================================================
// Routes
// ============================================================================

// Get all properties (realms) - filtered by client_prefix
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetPropertiesSchema.parse(req.query);
      const clientPrefix = req.user?.clientPrefix || '*';

      const realms = await keycloakAdmin.getRealms();

      // AICODE-NOTE: Filter realms by client_prefix for client isolation
      // Super admin (*) sees all, client admin sees only their prefix (e.g., marriott-*)
      const filteredRealms = filterPropertiesByClient(
        realms.filter((realm) => realm.realm !== 'master'),
        clientPrefix
      );

      // Map to property format with user counts
      const properties = await Promise.all(
        filteredRealms.map(async (realm) => {
          let userCount = 0;
          try {
            userCount = await keycloakAdmin.getRealmUserCount(realm.realm);
          } catch (error) {
            logger.warn({ realm: realm.realm }, 'Failed to get user count');
          }

          return {
            id: realm.realm,
            realm: realm.realm,
            displayName: realm.displayName,
            enabled: realm.enabled,
            userCount,
          };
        })
      );

      // Apply pagination
      const start = (query.page - 1) * query.pageSize;
      const paginatedProperties = properties.slice(start, start + query.pageSize);

      res.json({
        items: paginatedProperties,
        total: properties.length,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(properties.length / query.pageSize),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single property - with access check
router.get(
  '/:propertyId',
  requirePropertyAccess('propertyId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;

      const realm = await keycloakAdmin.getRealm(propertyId);
      let userCount = 0;

      try {
        userCount = await keycloakAdmin.getRealmUserCount(propertyId);
      } catch (error) {
        logger.warn({ realm: propertyId }, 'Failed to get user count');
      }

      res.json({
        id: realm.realm,
        realm: realm.realm,
        displayName: realm.displayName,
        enabled: realm.enabled,
        userCount,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get property stats - with access check
router.get(
  '/:propertyId/stats',
  requirePropertyAccess('propertyId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = req.params.propertyId as string;

      const userCount = await keycloakAdmin.getRealmUserCount(propertyId);

      // Get active user count (users with enabled=true)
      const { users } = await keycloakAdmin.getUsers(propertyId, { max: 1000 });
      const activeUsers = users.filter((user) => user.enabled).length;

      res.json({
        userCount,
        activeUsers,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
