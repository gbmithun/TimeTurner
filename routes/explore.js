router.get('/explore', async (req, res) => {
  let user = null;
  let wishlistIds = [];
  let compareIds = [];
  if (req.user) {
    user = await User.findById(req.user._id).lean();
    wishlistIds = (user.wishlist || []).map(String);
    compareIds = (user.compare || []).map(String);
  }
  const allWatches = await getAllWatches(); // however you get watches
  res.render('explore', {
    watches: allWatches,
    user,
    wishlistIds: wishlistIds || [],
    compareIds: compareIds || []
  });
});