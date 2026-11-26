/**
 * @file index.js
 * @description AeroShield Express application bootstrap.
 *
 * Middleware pipeline (in registration order):
 * 1. helmet           — sets secure HTTP defense headers
 * 2. compression      — gzip compression for ~70% network payload reduction
 * 3. cors             — cross-origin resource sharing configuration
 * 4. rateLimit        — sliding-window DDoS & API brute-force protection
 * 5. express.json     — payload parsing with 10kb ceiling
 * 6. requestLogger    — structured performance & request tracing
 * 7. apiRoutes        — modular REST API endpoints under /api/*
 * 8. staticAssets     — pre-compiled client assets with immutable caching
 * 9. spaFallback      — SPA routing support for client-side navigation
 * 10. errorHandler    — centralized typed error handler
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { AppError } from './utils/errors.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  STATIC_ASSET_MAX_AGE_SECONDS,
} from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = env.PORT;

// ─── 1. Security Defense Headers ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible SPA styling, SVGs, and inline icons
    crossOriginEmbedderPolicy: false,
  })
);

// ─── 2. Response Compression ──────────────────────────────────────────────────
app.use(compression());

// ─── 3. CORS Configuration ────────────────────────────────────────────────────
app.use(cors());

// ─── 4. API Rate Limiting ─────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please slow down and try again shortly.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api', apiLimiter);

// ─── 5. Body Parsing with Safe Ceiling ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── 6. Structured Request Logging ───────────────────────────────────────────
if (!env.isTest) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      logger.info('HTTP', `${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
    });
    next();
  });
}

// ─── 7. Modular API Routes ────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 8. Static Client Asset Delivery ──────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '../client/dist');

app.use(
  express.static(clientBuildPath, {
    maxAge: `${STATIC_ASSET_MAX_AGE_SECONDS}s`,
    immutable: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// ─── 9. Single Page Application (SPA) Fallback ────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (!err) return;
    // Development mode fallback when client has not been pre-built
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>AeroShield API</title>
        <style>body{font-family:sans-serif;padding:2rem;background:#090d16;color:#f1f5f9;}</style>
      </head>
      <body>
        <h1>🛡️ AeroShield Clean Air API Server</h1>
        <p>Backend API is active on port ${PORT}.</p>
        <p>To run the full UI: <code>npm run dev</code></p>
        <p>Health check: <a style="color:#38bdf8;" href="/api/health">/api/health</a></p>
        <p>AQI query: <a style="color:#38bdf8;" href="/api/aqi?city=delhi">/api/aqi?city=delhi</a></p>
      </body>
      </html>
    `);
  });
});

// ─── 10. Centralized Error Handler ────────────────────────────────────────────
// Express requires exactly 4 parameters to bind error-handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err instanceof AppError && err.isOperational) {
    logger.warn('AeroShield', `Operational error [${err.code}]: ${err.message}`);
    return res.status(err.statusCode).json(err.toJSON());
  }

  logger.error('AeroShield', 'Unhandled application exception:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  });
});

export default app;

// ─── Server Startup & Graceful Shutdown ───────────────────────────────────────
if (!env.isTest) {
  const server = app.listen(PORT, () => {
    logger.info('AeroShield', '=========================================');
    logger.info('AeroShield', '🛡️  AeroShield Smog & Air Intelligence AI');
    logger.info('AeroShield', `🚀 Server running on http://localhost:${PORT}`);
    logger.info('AeroShield', `⚡ API ready at http://localhost:${PORT}/api/health`);
    logger.info('AeroShield', '=========================================');
  });

  const handleShutdown = (signal) => {
    logger.info('AeroShield', `Received ${signal}. Shutting down HTTP server gracefully...`);
    server.close(() => {
      logger.info('AeroShield', 'HTTP server closed. Exiting process.');
      process.exit(0);
    });

    // Force close if graceful shutdown stalls
    setTimeout(() => {
      logger.error('AeroShield', 'Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}
