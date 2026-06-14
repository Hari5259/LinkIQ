const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { generateUniqueShortCode, isAliasAvailable } = require('../services/shortCodeService');

// Create a new short URL
const createUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    }

    const { originalUrl, customAlias, expiryDate } = req.body;
    let shortCode;

    if (customAlias) {
      if (!(await isAliasAvailable(customAlias))) {
        return res.status(409).json({ success: false, message: 'This alias is already taken' });
      }
      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    const url = await Url.create({
      userId: req.userId,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiryDate: expiryDate || null,
    });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    res.status(201).json({
      success: true,
      data: { url: { ...url.toJSON(), shortUrl: `${baseUrl}/${url.shortCode}` } },
    });
  } catch (error) { next(error); }
};

// Get all URLs for the authenticated user
const getUrls = async (req, res, next) => {
  try {
    const { search, sort, filter } = req.query;
    const query = { userId: req.userId };

    // Search filter
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    // Active/expired filter
    if (filter === 'active') {
      query.$or = [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }];
    } else if (filter === 'expired') {
      query.expiryDate = { $lte: new Date(), $ne: null };
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'clicks') sortOption = { totalClicks: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const urls = await Url.find(query).sort(sortOption);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const urlsWithShort = urls.map(u => ({ ...u.toJSON(), shortUrl: `${baseUrl}/${u.shortCode}` }));

    res.json({ success: true, data: { urls: urlsWithShort, count: urls.length } });
  } catch (error) { next(error); }
};

// Update a URL
const updateUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    const { originalUrl, expiryDate } = req.body;
    if (originalUrl) url.originalUrl = originalUrl;
    if (expiryDate !== undefined) url.expiryDate = expiryDate;
    await url.save();

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    res.json({ success: true, data: { url: { ...url.toJSON(), shortUrl: `${baseUrl}/${url.shortCode}` } } });
  } catch (error) { next(error); }
};

// Delete a URL and its visits
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    await Visit.deleteMany({ urlId: url._id });
    await url.deleteOne();

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) { next(error); }
};

// Get dashboard stats
const getStats = async (req, res, next) => {
  try {
    const urls = await Url.find({ userId: req.userId });
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);

    const now = new Date();
    const activeLinks = urls.filter(u => !u.expiryDate || u.expiryDate > now).length;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const urlIds = urls.map(u => u._id);
    const clicksToday = await Visit.countDocuments({ urlId: { $in: urlIds }, visitedAt: { $gte: todayStart } });

    // Top performing links
    const topLinks = urls.sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    // Recent activity
    const recentVisits = await Visit.find({ urlId: { $in: urlIds } })
      .sort({ visitedAt: -1 }).limit(10).populate('urlId', 'shortCode originalUrl');

    // Daily clicks for last 30 days
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const dailyClicks = await Visit.aggregate([
      { $match: { urlId: { $in: urlIds }, visitedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalLinks, totalClicks, activeLinks, clicksToday,
        topLinks: topLinks.map(u => ({ ...u.toJSON(), shortUrl: `${baseUrl}/${u.shortCode}` })),
        recentActivity: recentVisits,
        dailyClicks,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { createUrl, getUrls, updateUrl, deleteUrl, getStats };
