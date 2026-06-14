/**
 * Global error handler middleware for Express.
 * Catches all errors thrown in route handlers and middleware.
 *
 * Usage: app.use(errorHandler) — must be registered LAST.
 */
const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('❌ Error:', {
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
