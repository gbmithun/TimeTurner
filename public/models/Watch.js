const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
  id: Number,
  title: String,
  brand: String,
  model: String,
  movement: String,
  complicationlevel: String,
  complications: [String],
  purpose: String,
  dialColor: String,
  dialStyle: String,
  numerals: String,
  hands: String,
  strap: String,
  strapColor: String,
  quickRelease: String,
  material: String,
  caseSize: String,
  water: String,
  magnetic: String,
  shock: String,
  helium: String,
  price: Number,
  image: String,
  link: String
});

module.exports = mongoose.model('Watch', watchSchema);