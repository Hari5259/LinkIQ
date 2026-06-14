const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

// Handle /:shortCode redirects with analytics tracking
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ success: false, message: 'Short link not found' });
    }

    // Check expiry
    if (url.expiryDate && url.expiryDate < new Date()) {
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

    // Record visit (fire and forget — don't block the redirect)
    Visit.create({ urlId: url._id, device, browser, ipAddress: cleanIp, country }).catch(() => {});

    // Increment click count atomically
    Url.updateOne({ _id: url._id }, { $inc: { totalClicks: 1 } }).catch(() => {});

    // 302 redirect (temporary so browsers don't cache, ensuring analytics on every visit)
    res.redirect(302, url.originalUrl);
  } catch (error) { next(error); }
};

module.exports = { redirect };
