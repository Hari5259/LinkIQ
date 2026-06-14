const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { BCRYPT_SALT_ROUNDS } = require('../utils/constants');

dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing database...');
    await User.deleteMany({});
    await Url.deleteMany({});
    await Visit.deleteMany({});

    // Create user
    console.log('Seeding mock user...');
    const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@linkiq.com',
      password: hashedPassword,
    });

    console.log('Seeding mock URLs...');
    const urlsData = [
      {
        userId: user._id,
        originalUrl: 'https://github.com/Hari5259/LinkIQ',
        shortCode: 'linkiq-repo',
        customAlias: 'linkiq-repo',
        totalClicks: 120,
      },
      {
        userId: user._id,
        originalUrl: 'https://katomaran.com',
        shortCode: 'katomaran',
        customAlias: 'katomaran',
        totalClicks: 85,
      },
      {
        userId: user._id,
        originalUrl: 'https://react.dev/reference/react',
        shortCode: 'react-docs',
        customAlias: 'react-docs',
        totalClicks: 45,
      },
    ];

    const seededUrls = await Url.insertMany(urlsData);

    console.log('Seeding mock visits (last 30 days)...');
    const visits = [];
    const devices = ['desktop', 'mobile', 'tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const countries = ['IN', 'US', 'GB', 'DE', 'CA', 'SG'];
    const now = new Date();

    for (const url of seededUrls) {
      for (let i = 0; i < url.totalClicks; i++) {
        // Random date within last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const visitedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);

        visits.push({
          urlId: url._id,
          visitedAt,
          device: devices[Math.floor(Math.random() * devices.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          country: countries[Math.floor(Math.random() * countries.length)],
        });
      }
    }

    await Visit.insertMany(visits);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
