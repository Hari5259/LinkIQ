const Url = require('../models/Url');
const Visit = require('../models/Visit');
const memoryDb = require('../utils/memoryDb');

// Get detailed analytics for a specific URL
const getAnalytics = async (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    if (global.useMemoryEmulation) {
      const url = memoryDb.urls.find(u => u._id === req.params.urlId && u.userId === req.userId);
      if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

      const urlVisits = memoryDb.visits.filter(v => v.urlId === url._id);

      // Last visit
      const sortedVisits = [...urlVisits].sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt));
      const lastVisit = sortedVisits[0];

      // Daily Trend
      const dailyTrendMap = {};
      urlVisits
        .filter(v => new Date(v.visitedAt) >= thirtyDaysAgo)
        .forEach(v => {
          const dateStr = new Date(v.visitedAt).toISOString().split('T')[0];
          dailyTrendMap[dateStr] = (dailyTrendMap[dateStr] || 0) + 1;
        });

      const dailyTrend = Object.keys(dailyTrendMap).sort().map(date => ({
        _id: date,
        clicks: dailyTrendMap[date],
      }));

      // Device breakdown
      const deviceMap = {};
      urlVisits.forEach(v => { deviceMap[v.device] = (deviceMap[v.device] || 0) + 1; });
      const devices = Object.keys(deviceMap).map(k => ({ name: k || 'Unknown', value: deviceMap[k] }));

      // Browser breakdown
      const browserMap = {};
      urlVisits.forEach(v => { browserMap[v.browser] = (browserMap[v.browser] || 0) + 1; });
      const browsers = Object.keys(browserMap).map(k => ({ name: k || 'Unknown', value: browserMap[k] }));

      // Country breakdown
      const countryMap = {};
      urlVisits.forEach(v => { countryMap[v.country] = (countryMap[v.country] || 0) + 1; });
      const countries = Object.keys(countryMap).map(k => ({ name: k || 'Unknown', value: countryMap[k] }))
        .sort((a, b) => b.value - a.value).slice(0, 10);

      return res.json({
        success: true,
        data: {
          url: { ...url, shortUrl: `${baseUrl}/r/${url.shortCode}` },
          totalClicks: url.totalClicks,
          lastVisited: lastVisit?.visitedAt || null,
          dailyTrend,
          devices,
          browsers,
          countries,
          recentVisits: sortedVisits.slice(0, 20),
        },
      });
    }

    const url = await Url.findOne({ _id: req.params.urlId, userId: req.userId });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    // All aggregations in parallel for performance
    const [dailyTrend, devices, browsers, countries, recentVisits, lastVisit] = await Promise.all([
      // Daily click trend (30 days)
      Visit.aggregate([
        { $match: { urlId: url._id, visitedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } }, clicks: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Device breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Browser breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Country breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Recent visits
      Visit.find({ urlId: url._id }).sort({ visitedAt: -1 }).limit(20),
      // Last visit
      Visit.findOne({ urlId: url._id }).sort({ visitedAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        url: { ...url.toJSON(), shortUrl: `${baseUrl}/r/${url.shortCode}` },
        totalClicks: url.totalClicks,
        lastVisited: lastVisit?.visitedAt || null,
        dailyTrend,
        devices: devices.map(d => ({ name: d._id || 'Unknown', value: d.count })),
        browsers: browsers.map(b => ({ name: b._id || 'Unknown', value: b.count })),
        countries: countries.map(c => ({ name: c._id || 'Unknown', value: c.count })),
        recentVisits,
      },
    });
  } catch (error) { next(error); }
};

// Public stats (no auth required)
const getPublicStats = async (req, res, next) => {
  try {
    if (global.useMemoryEmulation) {
      const url = memoryDb.urls.find(u => u.shortCode === req.params.shortCode.toLowerCase());
      if (!url) return res.status(404).json({ success: false, message: 'URL not found' });
      return res.json({
        success: true,
        data: { shortCode: url.shortCode, totalClicks: url.totalClicks, createdAt: url.createdAt },
      });
    }

    const url = await Url.findOne({ shortCode: req.params.shortCode });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    res.json({
      success: true,
      data: { shortCode: url.shortCode, totalClicks: url.totalClicks, createdAt: url.createdAt },
    });
  } catch (error) { next(error); }
};

module.exports = { getAnalytics, getPublicStats };
