// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

mongoose.connect('mongodb://127.0.0.1:27017/timeturner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const hashedPassword = await bcrypt.hash('Mithun@2937', 10);
  await User.create({
    username: 'timeturner_admin',
    email: 'mithunbhupender@gmail.com',
    password: hashedPassword,
    isAdmin: true,
    wishlist: []
  });
  console.log('Admin user created');
  mongoose.disconnect();
});