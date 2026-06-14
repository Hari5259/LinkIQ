const Url = require('../models/Url');
const Visit = require('../models/Visit');

// Get detailed analytics for a specific URL
const getAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.urlId, userId: req.userId });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

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
        url: { ...url.toJSON(), shortUrl: `${baseUrl}/${url.shortCode}` },
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
    const url = await Url.findOne({ shortCode: req.params.shortCode });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    res.json({
      success: true,
      data: { shortCode: url.shortCode, totalClicks: url.totalClicks, createdAt: url.createdAt },
    });
  } catch (error) { next(error); }
};

module.exports = { getAnalytics, getPublicStats };
