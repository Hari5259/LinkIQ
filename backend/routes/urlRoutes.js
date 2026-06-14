const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createUrl, getUrls, updateUrl, deleteUrl, getStats } = require('../controllers/urlController');
const { createUrlValidation, updateUrlValidation } = require('../validators/urlValidator');

router.post('/', auth, createUrlValidation, createUrl);
router.get('/', auth, getUrls);
router.get('/stats', auth, getStats);
router.put('/:id', auth, updateUrlValidation, updateUrl);
router.delete('/:id', auth, deleteUrl);

module.exports = router;
