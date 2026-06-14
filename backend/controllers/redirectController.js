const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const memoryDb = require('../utils/memoryDb');

// Handle /:shortCode redirects with analytics tracking
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    let url;

    if (global.useMemoryEmulation) {
      url = memoryDb.urls.find(u => u.shortCode === shortCode.toLowerCase());
    } else {
      url = await Url.findOne({ shortCode });
    }

    if (!url) {
      return res.status(404).json({ success: false, message: 'Short link not found' });
    }

    // Check expiry
    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired' });
    }

    // Parse user agent for device/browser info
    const ua = new UAParser(req.headers['user-agent']);
    const device = ua.getDevice().type || 'desktop';
    const browser = ua.getBrowser().name || 'Unknown';

    // Resolve IP to country
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection?.remoteAddress || '';
    const cleanIp = ip.replace('::ffff:', '');
    const geo = geoip.lookup(cleanIp);
    const country = geo?.country || 'Unknown';

    if (global.useMemoryEmulation) {
      // Record visit
      memoryDb.visits.push({
        _id: `visit_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        urlId: url._id,
        visitedAt: new Date(),
        device,
        browser,
        ipAddress: cleanIp,
        country,
      });
      // Increment clicks
      url.totalClicks += 1;
    } else {
      // Record visit (fire and forget)
      Visit.create({ urlId: url._id, device, browser, ipAddress: cleanIp, country }).catch(() => {});
      // Increment click count atomically
      Url.updateOne({ _id: url._id }, { $inc: { totalClicks: 1 } }).catch(() => {});
    }

    // 302 redirect
    res.redirect(302, url.originalUrl);
  } catch (error) { next(error); }
};

module.exports = { redirect };
