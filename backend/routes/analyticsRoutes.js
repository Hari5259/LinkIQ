const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAnalytics, getPublicStats } = require('../controllers/analyticsController');

router.get('/public/:shortCode', getPublicStats);
router.get('/:urlId', auth, getAnalytics);

module.exports = router;
