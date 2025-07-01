const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  wishlist: [Number],
  isAdmin: { type: Boolean, default: false },
  resetOTP: { type: String },
  resetOTPExpiry: { type: Number }
});

module.exports = mongoose.model('User', userSchema);