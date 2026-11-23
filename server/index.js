import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Serve built frontend assets if they exist (production / unified mode)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback for non-API routes (serving frontend)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>AeroShield API</title><style>body{font-family:sans-serif;padding:2rem;background:#090d16;color:#f1f5f9;}</style></head>
        <body>
          <h1>AeroShield Clean Air API Server</h1>
          <p>Backend API is active on port ${PORT}.</p>
          <p>To run the frontend UI in development: <code>npm run dev</code> or <code>cd client && npm run dev</code>.</p>
          <p>Health check: <a style="color:#38bdf8;" href="/api/health">/api/health</a></p>
          <p>AQI query: <a style="color:#38bdf8;" href="/api/aqi?city=delhi">/api/aqi?city=delhi</a></p>
        </body>
        </html>
      `);
    }
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[AeroShield Server Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🛡️  AeroShield Smog & Air Intelligence AI`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`⚡ API ready at http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
}
