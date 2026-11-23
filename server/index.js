/**
 * @file index.js
 * @description AeroShield Express application bootstrap.
 *
 *   Middleware stack (in registration order):
 *   1. compression        — gzip all responses → ~70% bandwidth reduction
 *   2. cors               — allow cross-origin requests in development
 *   3. express-rate-limit — IP-based sliding window for /api routes
 *   4. express.json       — parse JSON request bodies (10 kb limit)
 *   5. API routes         — /api/*
 *   6. Static assets      — client/dist (immutable, long-lived cache headers)
 *   7. SPA fallback       — serve index.html for all non-API GET routes
 *   8. Central error handler — structured JSON error responses
 */

import express                   from 'express';
import cors                      from 'cors';
import dotenv                    from 'dotenv';
import path                      from 'path';
import { fileURLToPath }         from 'url';
import compression               from 'compression';
import { rateLimit }             from 'express-rate-limit';
import apiRoutes                 from './routes/api.js';
import { AppError }              from './utils/errors.js';
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  STATIC_ASSET_MAX_AGE_SECONDS,
} from './config/constants.js';

dotenv.config();

// ─── Environment Validation ────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
  console.info(
    '[AeroShield] GEMINI_API_KEY not set — Expert Reasoning Engine (autonomous fallback) will be used.'
  );
}

// ─── App & Constants ───────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = Number(process.env.PORT) || 5000;

// ─── 1. Compression ───────────────────────────────────────────────────────────
// Gzip all compressible responses (JSON, HTML, CSS, JS, SVG).
// Skips already-compressed content types (images, video, etc.).
app.use(compression());

// ─── 2. CORS ──────────────────────────────────────────────────────────────────
app.use(cors());

// ─── 3. API Rate Limiting ─────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs:         RATE_LIMIT_WINDOW_MS,
  max:              RATE_LIMIT_MAX_REQUESTS,
  standardHeaders:  true,  // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders:    false,
  message: {
    error: 'Too many requests from this IP. Please slow down and try again shortly.',
    code:  'RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api', apiLimiter);

// ─── 4. Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── 5. Request Logger (Lightweight) ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    const start = Date.now();
    _res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${_res.statusCode} (${ms}ms)`);
    });
    next();
  });
}

// ─── 6. API Routes ────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 7. Static Frontend Assets ────────────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '../client/dist');

app.use(
  express.static(clientBuildPath, {
    maxAge: `${STATIC_ASSET_MAX_AGE_SECONDS}s`,
    immutable: true,
    // Do NOT cache index.html — it must always be fresh for SPA routing
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// ─── 8. SPA Fallback ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (!err) return;
    // Client build not present (dev mode without `npm run build`)
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head><title>AeroShield API</title>
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

// ─── 9. Central Error Handler ─────────────────────────────────────────────────
// Must have exactly 4 parameters so Express recognises it as an error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Operational errors (ValidationError, NotFoundError, etc.) are logged at warn level.
  // Programming errors (bugs) are logged at error level with full stack trace.
  if (err instanceof AppError && err.isOperational) {
    console.warn(`[AeroShield] Operational error: ${err.code} — ${err.message}`);
    return res.status(err.statusCode).json(err.toJSON());
  }

  console.error('[AeroShield] Unexpected error:', err);
  return res.status(500).json({
    error:      'Internal Server Error',
    code:       'INTERNAL_ERROR',
    statusCode: 500,
  });
});

// ─── Export & Boot ────────────────────────────────────────────────────────────
export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('=========================================');
    console.log('🛡️  AeroShield Smog & Air Intelligence AI');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`⚡ API ready at http://localhost:${PORT}/api/health`);
    console.log('=========================================');
  });
}
