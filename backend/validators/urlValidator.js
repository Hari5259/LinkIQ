const { body } = require('express-validator');
const { MAX_URL_LENGTH, MAX_ALIAS_LENGTH, ALIAS_REGEX } = require('../utils/constants');

const createUrlValidation = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ require_protocol: true }).withMessage('Please provide a valid URL with http:// or https://')
    .isLength({ max: MAX_URL_LENGTH }).withMessage(`URL cannot exceed ${MAX_URL_LENGTH} characters`),
  body('customAlias')
    .optional()
    .trim()
    .isLength({ min: 3, max: MAX_ALIAS_LENGTH }).withMessage(`Alias must be 3-${MAX_ALIAS_LENGTH} characters`)
    .matches(ALIAS_REGEX).withMessage('Alias can only contain letters, numbers, hyphens, and underscores')
    .custom((value) => {
      const { RESERVED_ALIASES } = require('../services/shortCodeService');
      if (RESERVED_ALIASES.includes(value.toLowerCase())) {
        throw new Error('This alias is a reserved system keyword and cannot be used');
      }
      return true;
    }),
  body('expiryDate')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error('Expiry date must be in the future');
      return true;
    }),
];

const updateUrlValidation = [
  body('originalUrl')
    .optional()
    .trim()
    .isURL({ require_protocol: true }).withMessage('Please provide a valid URL')
    .isLength({ max: MAX_URL_LENGTH }).withMessage(`URL cannot exceed ${MAX_URL_LENGTH} characters`),
  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date format'),
];

module.exports = { createUrlValidation, updateUrlValidation };
