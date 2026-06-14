/**
 * Logger utility for LinkIQ backend.
 * Simple structured logger with timestamps and levels.
 */
const logger = {
  info: (message, data = {}) => {
    console.log(`[${new Date().toISOString()}] ℹ️  INFO: ${message}`, Object.keys(data).length ? data : '');
  },

  warn: (message, data = {}) => {
    console.warn(`[${new Date().toISOString()}] ⚠️  WARN: ${message}`, Object.keys(data).length ? data : '');
  },

  error: (message, data = {}) => {
    console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`, Object.keys(data).length ? data : '');
  },

  success: (message, data = {}) => {
    console.log(`[${new Date().toISOString()}] ✅ SUCCESS: ${message}`, Object.keys(data).length ? data : '');
  },
};

module.exports = logger;
