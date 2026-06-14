const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  ipAddress: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: 'Unknown',
  },
});

visitSchema.index({ urlId: 1, visitedAt: -1 });
visitSchema.index({ visitedAt: 1 });

module.exports = mongoose.model('Visit', visitSchema);
