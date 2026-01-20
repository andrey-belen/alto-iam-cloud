import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

// AICODE-NOTE: Health check endpoint for container orchestration

const router = Router();

router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
        },
      });
    }
  }
);

// Liveness probe (simple check)
router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

// Readiness probe (includes dependencies)
router.get(
  '/ready',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not ready' });
    }
  }
);

export default router;
