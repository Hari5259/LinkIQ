const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires JWT)
 */
router.get('/me', auth, getMe);

module.exports = router;
