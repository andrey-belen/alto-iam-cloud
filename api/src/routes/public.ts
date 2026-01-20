import { Router, Request, Response, NextFunction } from 'express';
import { keycloakAdmin } from '../services/keycloak-admin.service.js';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: Public routes that don't require authentication
// Used by the access request form to get property list

const router = Router();

// Get public properties list (for access request form)
router.get(
  '/properties',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const realms = await keycloakAdmin.getRealms();

      // Filter out master realm and return minimal info
      const properties = realms
        .filter((realm) => realm.realm !== 'master' && realm.enabled)
        .map((realm) => ({
          id: realm.realm,
          displayName: realm.displayName || realm.realm,
        }));

      res.json(properties);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch public properties');
      res.json([]); // Return empty array on error to not break the form
    }
  }
);

export default router;
