import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import accessRequestsRouter from './routes/access-requests.js';
import propertiesRouter from './routes/properties.js';
import usersRouter from './routes/users.js';
import siteAccessRouter from './routes/site-access.js';
import publicRouter from './routes/public.js';
import healthRouter from './routes/health.js';

// AICODE-NOTE: Alto API Express server
// Handles access requests, property/user management via Keycloak Admin API

const app = express();
const port = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration - allow dashboard and Keycloak origins
// AICODE-NOTE: KEYCLOAK_URL may be internal Docker URL (keycloak:8080), but browser sends
// requests from external URL (localhost:8080), so we include both explicitly
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  process.env.KEYCLOAK_URL || 'http://localhost:8080',
  'http://localhost:8080', // Browser-facing Keycloak URL for registration form
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  })
);

// JSON body parsing
app.use(express.json());

// ============================================================================
// Routes
// ============================================================================

// Health check (no auth)
app.use('/health', healthRouter);

// Public routes (no auth required)
app.use('/public', publicRouter);

// AICODE-NOTE: Routes without /api prefix - Caddy strips /api before forwarding
app.use('/access-requests', accessRequestsRouter);
app.use('/properties', propertiesRouter);
app.use('/site-access', siteAccessRouter);

// Nested user routes under properties
app.use('/properties', usersRouter);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

app.listen(port, () => {
  logger.info({ port }, 'Alto API server started');
});

export default app;
