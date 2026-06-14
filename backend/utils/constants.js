/**
 * Application-wide constants for LinkIQ backend.
 */
module.exports = {
  // Short code configuration
  SHORT_CODE_LENGTH: 7,
  SHORT_CODE_ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  MAX_COLLISION_RETRIES: 5,

  // JWT configuration
  JWT_EXPIRY: '7d',

  // Bcrypt configuration
  BCRYPT_SALT_ROUNDS: 12,

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // URL validation
  MAX_URL_LENGTH: 2048,
  MAX_ALIAS_LENGTH: 30,
  ALIAS_REGEX: /^[a-zA-Z0-9_-]+$/,

  // Analytics
  RECENT_VISITS_LIMIT: 20,
  CHART_DAYS_DEFAULT: 30,
};
