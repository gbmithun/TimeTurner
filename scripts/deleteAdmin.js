// scripts/deleteAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://127.0.0.1:27017/timeturner')
  .then(async () => {
    await User.deleteOne({ email: 'mithunbhupender@gmail.com' });
    console.log('Admin user deleted');
    mongoose.disconnect();
  });