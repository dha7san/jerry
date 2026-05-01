const mongoose = require('mongoose');

const linkedInPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  imageUrl: { type: String }, // Path to local asset or stored image path
  isPublic: { type: Boolean, default: false }, // Only shared with community if true
  tasksSnapshot: { type: Object }, // Store the daily log data at the time of creation
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LinkedInPost', linkedInPostSchema);
