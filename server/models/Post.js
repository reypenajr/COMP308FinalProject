// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['News/Discussion', 'Help Request', 'Emergency Alert', 'Business'] 
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Location data could be added here
  // location: { type: { type: String }, coordinates: [Number] },
  // Additional fields based on post type
  emergency: {
    severity: { type: String, enum: ['Low', 'Medium', 'High'] },
    resolved: { type: Boolean, default: false }
  },
  helpRequest: {
    status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Fulfilled'] },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  businessInfo: {
    name: { type: String },
    description: { type: String },
    deals: [{ type: String }],
    image: { type: String },
    reviews: [{
      reviewId: { type: String },
      text: { type: String },
      rating: { type: Number, min: 1, max: 5 },
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      authorName: { type: String },
      createdAt: { type: String }
    }]
  }
});

// Add index for quick retrieval by category
PostSchema.index({ category: 1 });
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
