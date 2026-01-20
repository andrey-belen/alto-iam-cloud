import pino from 'pino';

// AICODE-NOTE: Pino logger configuration for Alto API
// Uses pino-pretty in development for readable logs

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

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
