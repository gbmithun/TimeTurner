const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Watch = require('./models/Watch');

mongoose.connect('mongodb://127.0.0.1:27017/timeturner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'watches.json'), 'utf8'));
  await Watch.deleteMany({});
  await Watch.insertMany(data);
  console.log('Imported watches.json to MongoDB!');
  mongoose.disconnect();
}).catch(err => {
  console.error('Import failed:', err);
});