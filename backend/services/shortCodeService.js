const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const { SHORT_CODE_LENGTH, MAX_COLLISION_RETRIES } = require('../utils/constants');

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
  const exists = await Url.findOne({ shortCode: alias });
  return !exists;
};

module.exports = { generateUniqueShortCode, isAliasAvailable };
