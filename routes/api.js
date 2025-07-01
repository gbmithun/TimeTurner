// or wherever your /api/explore-search route is

router.get('/api/explore-search', async (req, res) => {
  // ...your filter logic...
  const watches = await Watch.find({ /* ...filters... */ }).lean();

  let userWishlist = [];
  let userCompare = [];
  if (req.session.user) {
    const user = await User.findById(req.session.user._id).lean();
    userWishlist = (user.wishlist || []).map(String);
    userCompare = (user.compare || []).map(String);
  }

  watches.forEach(watch => {
    watch.isInWishlist = userWishlist.includes(String(watch.id));
    watch.isInCompare = userCompare.includes(String(watch.id));
  });

  res.json(watches);
});