const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  wishlist: [Number], // array of watch IDs
  isAdmin: { type: Boolean, default: false }, // <-- ADD THIS LINE
  resetOTP: { type: String },
  resetOTPExpiry: { type: Number }
});

module.exports = mongoose.model('User', userSchema);