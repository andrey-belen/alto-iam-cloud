import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: Client access control middleware for multi-tenant isolation
// Enforces client separation based on client_prefix from JWT token
// "*" = super admin (Alto operator) - sees all realms
// "marriott" = client admin - sees only marriott-* realms

/**
 * Check if user can access a specific property (realm)
 * Super admin (*) can access all properties
 * Client admin can only access properties matching their prefix
 */
export function canAccessProperty(clientPrefix: string, propertyId: string): boolean {
  if (clientPrefix === '*') {
    return true; // Super admin sees all
  }
  return propertyId.startsWith(`${clientPrefix}-`);
}

/**
 * Middleware to check property access from route param
 * Returns 403 if user's client_prefix doesn't match property
 */
export function requirePropertyAccess(paramName: string = 'propertyId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const propertyId = req.params[paramName] as string;
    if (!propertyId) {
      next(); // No property in route, let route handler decide
      return;
    }

    if (!canAccessProperty(req.user.clientPrefix, propertyId)) {
      logger.warn(
        { userId: req.user.id, propertyId, clientPrefix: req.user.clientPrefix },
        'Unauthorized property access attempt'
      );
      res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this property',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to restrict route to super admins only (client_prefix = "*")
 * Used for Alto-operator-only features like Access Requests
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.clientPrefix !== '*') {
    logger.warn(
      { userId: req.user.id, clientPrefix: req.user.clientPrefix },
      'Super admin access attempt by non-super-admin'
    );
    res.status(403).json({
      error: 'Access denied',
      message: 'This feature is only available to Alto administrators',
    });
    return;
  }

  next();
}

/**
 * Filter array of properties/realms by client_prefix
 * Super admin (*) gets all properties
 * Client admin gets only properties matching their prefix
 */
export function filterPropertiesByClient<T extends { realm: string }>(
  properties: T[],
  clientPrefix: string
): T[] {
  if (clientPrefix === '*') {
    return properties;
  }
  return properties.filter((p) => p.realm.startsWith(`${clientPrefix}-`));
}

export default {
  canAccessProperty,
  requirePropertyAccess,
  requireSuperAdmin,
  filterPropertiesByClient,
};
