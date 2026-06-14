const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { generateUniqueShortCode, isAliasAvailable } = require('../services/shortCodeService');
const memoryDb = require('../utils/memoryDb');

// Create a new short URL
const createUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    }

    const { originalUrl, customAlias, expiryDate } = req.body;
    let shortCode;

    if (global.useMemoryEmulation) {
      if (customAlias) {
        const taken = memoryDb.urls.some(u => u.shortCode === customAlias.toLowerCase());
        if (taken) return res.status(409).json({ success: false, message: 'This alias is already taken' });
        shortCode = customAlias.toLowerCase();
      } else {
        shortCode = Math.random().toString(36).substring(2, 8);
      }

      const url = {
        _id: `url_${Date.now()}`,
        userId: req.userId,
        originalUrl,
        shortCode,
        customAlias: customAlias || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        totalClicks: 0,
        createdAt: new Date(),
        toJSON: function() { return this; },
      };
      memoryDb.urls.push(url);

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.status(201).json({
        success: true,
        data: { url: { ...url, shortUrl: `${baseUrl}/r/${url.shortCode}` } },
      });
    }

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

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    res.status(201).json({
      success: true,
      data: { url: { ...url.toJSON(), shortUrl: `${baseUrl}/r/${url.shortCode}` } },
    });
  } catch (error) { next(error); }
};

// Get all URLs for the authenticated user
const getUrls = async (req, res, next) => {
  try {
    const { search, sort, filter } = req.query;
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (global.useMemoryEmulation) {
      let filtered = memoryDb.urls.filter(u => u.userId === req.userId);

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(u => u.originalUrl.toLowerCase().includes(term) || u.shortCode.toLowerCase().includes(term));
      }

      if (filter === 'active') {
        filtered = filtered.filter(u => !u.expiryDate || new Date(u.expiryDate) > new Date());
      } else if (filter === 'expired') {
        filtered = filtered.filter(u => u.expiryDate && new Date(u.expiryDate) <= new Date());
      }

      if (sort === 'clicks') {
        filtered.sort((a, b) => b.totalClicks - a.totalClicks);
      } else if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      const urlsWithShort = filtered.map(u => ({ ...u, shortUrl: `${baseUrl}/r/${u.shortCode}` }));
      return res.json({ success: true, data: { urls: urlsWithShort, count: filtered.length } });
    }

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
    const urlsWithShort = urls.map(u => ({ ...u.toJSON(), shortUrl: `${baseUrl}/r/${u.shortCode}` }));

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

    const { originalUrl, expiryDate } = req.body;
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (global.useMemoryEmulation) {
      const url = memoryDb.urls.find(u => u._id === req.params.id && u.userId === req.userId);
      if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

      if (originalUrl) url.originalUrl = originalUrl;
      if (expiryDate !== undefined) url.expiryDate = expiryDate ? new Date(expiryDate) : null;

      return res.json({ success: true, data: { url: { ...url, shortUrl: `${baseUrl}/r/${url.shortCode}` } } });
    }

    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ success: false, message: 'URL not found' });

    if (originalUrl) url.originalUrl = originalUrl;
    if (expiryDate !== undefined) url.expiryDate = expiryDate;
    await url.save();

    res.json({ success: true, data: { url: { ...url.toJSON(), shortUrl: `${baseUrl}/r/${url.shortCode}` } } });
  } catch (error) { next(error); }
};

// Delete a URL and its visits
const deleteUrl = async (req, res, next) => {
  try {
    if (global.useMemoryEmulation) {
      const idx = memoryDb.urls.findIndex(u => u._id === req.params.id && u.userId === req.userId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'URL not found' });

      const urlId = memoryDb.urls[idx]._id;
      // Filter out visits
      for (let i = memoryDb.visits.length - 1; i >= 0; i--) {
        if (memoryDb.visits[i].urlId === urlId) {
          memoryDb.visits.splice(i, 1);
        }
      }
      memoryDb.urls.splice(idx, 1);
      return res.json({ success: true, message: 'Link deleted successfully' });
    }

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
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const now = new Date();

    if (global.useMemoryEmulation) {
      const urls = memoryDb.urls.filter(u => u.userId === req.userId);
      const totalLinks = urls.length;
      const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);
      const activeLinks = urls.filter(u => !u.expiryDate || new Date(u.expiryDate) > now).length;

      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const urlIds = urls.map(u => u._id);
      const clicksToday = memoryDb.visits.filter(v => urlIds.includes(v.urlId) && new Date(v.visitedAt) >= todayStart).length;

      const topLinks = [...urls].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5);
      const recentVisits = memoryDb.visits
        .filter(v => urlIds.includes(v.urlId))
        .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))
        .slice(0, 10)
        .map(v => {
          const matchingUrl = urls.find(u => u._id === v.urlId);
          return {
            ...v,
            urlId: {
              shortCode: matchingUrl?.shortCode || '',
              originalUrl: matchingUrl?.originalUrl || '',
            }
          };
        });

      // Aggregate daily trend for last 30 days
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const dailyClicksMap = {};
      memoryDb.visits
        .filter(v => urlIds.includes(v.urlId) && new Date(v.visitedAt) >= thirtyDaysAgo)
        .forEach(v => {
          const dateStr = new Date(v.visitedAt).toISOString().split('T')[0];
          dailyClicksMap[dateStr] = (dailyClicksMap[dateStr] || 0) + 1;
        });

      const dailyClicks = Object.keys(dailyClicksMap).sort().map(date => ({
        _id: date,
        clicks: dailyClicksMap[date]
      }));

      return res.json({
        success: true,
        data: {
          totalLinks, totalClicks, activeLinks, clicksToday,
          topLinks: topLinks.map(u => ({ ...u, shortUrl: `${baseUrl}/r/${u.shortCode}` })),
          recentActivity: recentVisits,
          dailyClicks,
        },
      });
    }

    const urls = await Url.find({ userId: req.userId });
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);
    const activeLinks = urls.filter(u => !u.expiryDate || u.expiryDate > now).length;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const urlIds = urls.map(u => u._id);
    const clicksToday = await Visit.countDocuments({ urlId: { $in: urlIds }, visitedAt: { $gte: todayStart } });

    // Top performing links
    const topLinks = urls.sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5);

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
        topLinks: topLinks.map(u => ({ ...u.toJSON(), shortUrl: `${baseUrl}/r/${u.shortCode}` })),
        recentActivity: recentVisits,
        dailyClicks,
      },
    });
  } catch (error) { next(error); }
};

// Create a new public short URL (no auth required, auto-expires in 24 hours)
const createPublicUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
      });
    }

    const { originalUrl } = req.body;
    let shortCode;
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (global.useMemoryEmulation) {
      shortCode = Math.random().toString(36).substring(2, 8);
      const url = {
        _id: `url_pub_${Date.now()}`,
        userId: null,
        originalUrl,
        shortCode,
        customAlias: null,
        expiryDate,
        totalClicks: 0,
        createdAt: new Date(),
        toJSON: function() { return this; },
      };
      memoryDb.urls.push(url);

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.status(201).json({
        success: true,
        data: { url: { ...url, shortUrl: `${baseUrl}/r/${url.shortCode}` } },
      });
    }

    // MongoDB path
    shortCode = await generateUniqueShortCode();
    
    // Find or create a system user for public links
    const User = require('../models/User');
    let anonUser = await User.findOne({ email: 'anonymous@linkiq.com' });
    if (!anonUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(Math.random().toString(), 10);
      anonUser = await User.create({
        name: 'Anonymous User',
        email: 'anonymous@linkiq.com',
        password: hashedPassword,
      });
    }

    const url = await Url.create({
      userId: anonUser._id,
      originalUrl,
      shortCode,
      customAlias: null,
      expiryDate,
    });

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    res.status(201).json({
      success: true,
      data: { url: { ...url.toJSON(), shortUrl: `${baseUrl}/r/${url.shortCode}` } },
    });
  } catch (error) { next(error); }
};

module.exports = { createUrl, getUrls, updateUrl, deleteUrl, getStats, createPublicUrl };
