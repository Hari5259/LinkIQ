const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware.
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success, attaches `req.userId` for downstream handlers.
 *
 * Usage: router.get('/protected', auth, controller.handler)
 */
const auth = (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" format
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to request object for route handlers
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = auth;
