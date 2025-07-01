const express = require('express');
const router = express.Router();
const Watch = require('../models/Watch');

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  console.log('Session user:', req.session.user);
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Forbidden');
  }
  next();
}
router.use(requireAdmin);

// Add Watch
router.get('/add-watch', (req, res) => {
  res.render('admin-add-watch');
});
router.post('/add-watch', async (req, res) => {
  if (req.body.complications) {
    req.body.complications = req.body.complications.split(',').map(s => s.trim());
  }
  const newWatch = new Watch(req.body);
  await newWatch.save();
  res.redirect('/admin/watch-list');
});

// Edit Watch (GET)
router.get('/edit-watch/:id', async (req, res) => {
  const watch = await Watch.findById(req.params.id);
  if (!watch) return res.status(404).send('Watch not found');
  res.render('admin-edit-watch', { watch });
});
// Edit Watch (POST)
router.post('/edit-watch/:id', async (req, res) => {
  if (req.body.complications) {
    req.body.complications = req.body.complications.split(',').map(s => s.trim());
  }
  // Remove id from req.body if present
  delete req.body.id;
  await Watch.updateOne({ _id: req.params.id }, req.body);
  res.redirect('/admin/watch-list');
});

// Delete Watch
router.post('/delete-watch/:id', async (req, res) => {
  await Watch.deleteOne({ _id: req.params.id }); // <-- use _id, not id
  res.redirect('/admin/watch-list');
});

// Watch List
router.get('/watch-list', async (req, res) => {
  const watches = await Watch.find();
  res.render('admin-watch-list', { watches });
});

module.exports = router;