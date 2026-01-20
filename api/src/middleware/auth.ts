import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { logger } from '../lib/logger.js';

// AICODE-NOTE: JWT authentication middleware using Keycloak JWKS
// Validates bearer tokens and extracts user info from Keycloak

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// JWKS client for Keycloak token verification
const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const keycloakRealm = process.env.KEYCLOAK_REALM || 'master';

const client = jwksClient({
  jwksUri: `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

function getKey(
  header: jwt.JwtHeader,
  callback: (err: Error | null, key?: string) => void
) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

interface KeycloakTokenPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = await new Promise<KeycloakTokenPayload>((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as KeycloakTokenPayload);
        }
      });
    });

    // Extract roles from both realm and resource access
    const realmRoles = decoded.realm_access?.roles || [];
    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'alto-crm';
    const clientRoles = decoded.resource_access?.[clientId]?.roles || [];
    const roles = [...new Set([...realmRoles, ...clientRoles])];

    req.user = {
      id: decoded.sub,
      username: decoded.preferred_username || '',
      email: decoded.email,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      roles,
    };

    next();
  } catch (error) {
    logger.warn({ error }, 'Token verification failed');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to check for specific role
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!req.user.roles.includes(role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

// Optional auth - doesn't fail if no token provided
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  // Try to authenticate, but don't fail if it doesn't work
  try {
    await authMiddleware(req, res, () => {
      next();
    });
  } catch {
    next();
  }
}

export default authMiddleware;
