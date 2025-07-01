const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const sendMail = require('../mailer'); // Adjust path as needed
const User = require('../models/User');
const Watch = require('../models/Watch');

// Setup nodemailer transporter (Brevo example)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: 'your@email.com',
    pass: 'your_smtp_password_here'
  }
});

// Signup
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});
router.post('/signup', async (req, res) => {
  let { username, email, password } = req.body;
  username = username.trim().toLowerCase();

  const usernameRegex = /^[a-z0-9]{3,16}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  if (!username || !email || !password) {
    return res.render('signup', { error: 'All fields required' });
  }
  if (!usernameRegex.test(username)) {
    return res.render('signup', { error: 'Username must be 3-16 lowercase letters or numbers, no spaces.' });
  }
  if (!passwordRegex.test(password)) {
    return res.render('signup', { error: 'Password must be at least 8 characters, with at least 1 letter and 1 number.' });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.render('signup', { error: 'Email or username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashedPassword, wishlist: [] });
  res.redirect('/login');
});

// Login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  });
  if (!user) {
    return res.render('login', { error: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('login', { error: 'Invalid credentials' });
  }
  // THIS IS THE CRUCIAL PART
  req.session.user = {
    email: user.email,
    username: user.username,
    isAdmin: user.isAdmin // <-- DO NOT MISS THIS LINE
  };
  res.redirect('/');
});

// Wishlist (protected)
router.get('/wishlist', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const user = await User.findOne({ email: req.session.user.email });
  const wishlistIds = user?.wishlist || [];
  const compareIds = (req.session.compareIds || []).map(id => String(id));
  const wishlistWatches = await Watch.find({ id: { $in: wishlistIds.map(Number) } });
  res.render('wishlist', {
    user: req.session.user,
    watches: wishlistWatches,
    compareIds
  });
});

// Add to wishlist
router.post('/wishlist/add/:id', async (req, res) => {
  if (!req.session.user) {
    if (req.xhr) return res.status(401).send('Login required');
    return res.redirect('/login');
  }
  const watchId = Number(req.params.id);
  const user = await User.findOne({ email: req.session.user.email });
  if (user && !user.wishlist.includes(watchId)) {
    user.wishlist.push(watchId);
    await user.save();
  }
  if (req.xhr) return res.status(200).send('Added');
  res.redirect('/explore');
});

// Remove from wishlist
router.post('/wishlist/remove/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const watchId = Number(req.params.id);
  const user = await User.findOne({ email: req.session.user.email });
  if (user) {
    user.wishlist = user.wishlist.filter(id => id !== watchId);
    await user.save();
  }
  if (req.xhr) return res.status(200).send('Removed');
  res.redirect('/wishlist');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Show forgot-password page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { message: null, error: null, showOtp: false, email: null });
});

// Handle forgot-password form
router.post('/forgot-password', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    return res.render('forgot-password', {
      message: null,
      error: "No user found with that email.",
      showOtp: false,
      email: null
    });
  }

  // Generate OTP and expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 15 * 60 * 1000;

  user.resetOTP = otp;
  user.resetOTPExpiry = expiry;
  await user.save(); // <-- THIS IS CRUCIAL

  try {
    await sendMail(
      user.email,
      "Your TimeTurner Password Reset Code",
      `<p>Your OTP code is: <b>${otp}</b></p>
       <p>This code expires in 15 minutes.</p>`
    );
    res.render('forgot-password', { message: "OTP sent to your email.", error: null, showOtp: true, email: user.email });
  } catch (err) {
    console.error("Email error:", err);
    res.render('forgot-password', { message: null, error: "Error sending OTP. Try again later.", showOtp: false, email: null });
  }
});

// Verify OTP and show reset-password link
router.post('/verify-otp', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const otp = (req.body.otp || '').trim();
  const user = await User.findOne({ email });

  const submittedOtp = String(otp);
  const storedOtp = String(user?.resetOTP || '').trim();

  // Debug log
  console.log('Submitted:', submittedOtp, 'Stored:', storedOtp, 'Expiry:', user?.resetOTPExpiry, 'Now:', Date.now());

  if (!user || submittedOtp !== storedOtp || Date.now() > user.resetOTPExpiry) {
    return res.render('forgot-password', {
      message: null,
      error: "Invalid or expired OTP.",
      showOtp: true,
      email
    });
  }

  // OTP is valid, clear it and allow password reset
  user.resetOTP = null;
  user.resetOTPExpiry = null;
  await user.save();

  req.session.resetEmail = email;
  res.redirect('/reset-password');
});

// Show reset-password form (session-based)
router.get('/reset-password', (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/forgot-password');
  res.render('reset-password', { error: null, message: null });
});

// Handle reset-password submission (session-based)
router.post('/reset-password', async (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/forgot-password');
  const { password } = req.body;
  const user = await User.findOne({ email: req.session.resetEmail });
  if (!user) return res.redirect('/forgot-password');

  user.password = await bcrypt.hash(password, 12);
  await user.save();
  req.session.resetEmail = null;
  res.redirect('/login');
});

module.exports = router;