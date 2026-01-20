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

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
app.use('/api/public', publicRouter);

// Protected routes
app.use('/api/access-requests', accessRequestsRouter);
app.use('/api/properties', propertiesRouter);

// Nested user routes under properties
app.use('/api/properties', usersRouter);

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
