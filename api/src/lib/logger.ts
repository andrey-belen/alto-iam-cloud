import pino from 'pino';

// AICODE-NOTE: Pino logger configuration for Alto API
// JSON output in production, pretty output in development (if pino-pretty installed)

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // No transport in production - use default JSON output
  // In dev, pino-pretty can be piped: npm run dev | pino-pretty

  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  base: {
    service: 'alto-api',
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
  },
});

export default logger;
