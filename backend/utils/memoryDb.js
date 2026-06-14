/**
 * Shared in-memory data store for LinkIQ.
 * Used automatically when no MongoDB connection is available.
 */
const users = [];
const urls = [];
const visits = [];

// Seed demo user so they can login out-of-the-box in emulation mode
// password is hashed version of 'password123' (bcrypt)
users.push({
  _id: '648c66e2c39e2c6cfb2f0a1c',
  name: 'Demo User',
  email: 'demo@linkiq.com',
  password: '$2a$10$X03F7KmgHw8m14c6X2B4Eu9tN6Z6V0h8A/K0O7G7e6E1E2f3g4h5i', // pre-hashed password123
  createdAt: new Date(),
});

// Seed mock links
urls.push({
  _id: '648c66e2c39e2c6cfb2f0a2d',
  userId: '648c66e2c39e2c6cfb2f0a1c',
  originalUrl: 'https://github.com/Hari5259/LinkIQ',
  shortCode: 'linkiq-repo',
  customAlias: 'linkiq-repo',
  totalClicks: 24,
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
});

urls.push({
  _id: '648c66e2c39e2c6cfb2f0a3e',
  userId: '648c66e2c39e2c6cfb2f0a1c',
  originalUrl: 'https://katomaran.com',
  shortCode: 'katomaran',
  customAlias: 'katomaran',
  totalClicks: 15,
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
});

// Seed visits
const devices = ['desktop', 'mobile', 'tablet'];
const browsers = ['Chrome', 'Safari', 'Firefox'];
const countries = ['IN', 'US', 'GB', 'DE'];

// Add 24 mock visits for first link
for (let i = 0; i < 24; i++) {
  visits.push({
    _id: `visit1_${i}`,
    urlId: '648c66e2c39e2c6cfb2f0a2d',
    visitedAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
    device: devices[i % devices.length],
    browser: browsers[i % browsers.length],
    ipAddress: `192.168.1.${10 + i}`,
    country: countries[i % countries.length],
  });
}

// Add 15 mock visits for second link
for (let i = 0; i < 15; i++) {
  visits.push({
    _id: `visit2_${i}`,
    urlId: '648c66e2c39e2c6cfb2f0a3e',
    visitedAt: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
    device: devices[i % devices.length],
    browser: browsers[i % browsers.length],
    ipAddress: `192.168.2.${20 + i}`,
    country: countries[i % countries.length],
  });
}

module.exports = {
  users,
  urls,
  visits,
};
