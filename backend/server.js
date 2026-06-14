const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (Development) ───────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health Check ───────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LinkIQ API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Route Registration ─────────────────────────
// Routes will be added in subsequent commits:
// app.use('/api/auth', authRoutes);
// app.use('/api/urls', urlRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.get('/:shortCode', redirectController.redirect);

// ── 404 Handler ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Start Server ───────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🔗 LinkIQ API Server                    ║
║   Running on http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
