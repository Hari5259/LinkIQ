const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const { SHORT_CODE_LENGTH, MAX_COLLISION_RETRIES } = require('../utils/constants');

// Reserved keywords that cannot be used as custom aliases
const RESERVED_ALIASES = [
  'api', 'auth', 'urls', 'analytics', 'r', 'health', 'static', 
  'admin', 'assets', 'dashboard', 'links', 'login', 'signup',
  'css', 'js', 'favicon', 'index', 'home', 'public'
];

/**
 * Generate a unique short code with collision prevention.
 * Retries up to MAX_COLLISION_RETRIES times if code already exists.
 */
const generateUniqueShortCode = async () => {
  for (let i = 0; i < MAX_COLLISION_RETRIES; i++) {
    const code = nanoid(SHORT_CODE_LENGTH);
    const exists = await Url.findOne({ shortCode: code });
    if (!exists) return code;
  }
  throw new Error('Failed to generate unique short code after maximum retries');
};

/**
 * Check if a custom alias is available.
 */
const isAliasAvailable = async (alias) => {
  const lowerAlias = alias.trim().toLowerCase();
  if (RESERVED_ALIASES.includes(lowerAlias)) {
    return false;
  }
  const exists = await Url.findOne({ shortCode: lowerAlias });
  return !exists;
};

module.exports = { generateUniqueShortCode, isAliasAvailable, RESERVED_ALIASES };
