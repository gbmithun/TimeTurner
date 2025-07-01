const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  href: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);