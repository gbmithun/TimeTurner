const express = require('express');
const watches = require('../watches.json');
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Show wishlist
router.get('/wishlist', requireLogin, (req, res) => {
  const user = req.session.user;
  const wishlistWatches = watches.filter(w => user.wishlist.includes(w.id));
  res.render('wishlist', { watches: wishlistWatches });
});

// Add to wishlist
router.post('/wishlist/add/:id', async (req, res) => {
  const userId = req.user._id;
  const watchId = req.params.id;

  await User.updateOne({ _id: userId }, { $addToSet: { wishlist: watchId } });

  // 🔄 Refresh session user
  const updatedUser = await User.findById(userId).lean();
  req.session.user = updatedUser;

  res.sendStatus(200);
});

// Remove from wishlist
router.post('/wishlist/remove/:id', async (req, res) => {
  const userId = req.user._id;
  const watchId = req.params.id;

  await User.updateOne({ _id: userId }, { $pull: { wishlist: watchId } });

  // 🔄 Refresh session user
  const updatedUser = await User.findById(userId).lean();
  req.session.user = updatedUser;

  res.sendStatus(200);
});

module.exports = router;