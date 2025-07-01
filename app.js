const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require('express-session');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const adminBlogRoutes = require('./routes/admin-blog');
const Fuse = require('fuse.js');
const mongoose = require('mongoose');
const Watch = require('./models/Watch');
const Blog = require('./models/Blog');

const app = express();

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Set res.locals.user for all EJS templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/timeturner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed", err));

// Utility: Extract adaptive filter options
function extractFilterOptions(watches, selected = {}) {
  let filtered = watches;
  if (selected.brand) filtered = filtered.filter(w => w.brand === selected.brand);
  if (selected.model) filtered = filtered.filter(w => w.model === selected.model);

  const unique = (arr, field) =>
    [...new Set(arr.map(w => w[field]).filter(Boolean))].sort();
  const uniqueComplications = arr =>
    [...new Set(arr.flatMap(w => Array.isArray(w.complications) ? w.complications : []).filter(Boolean))].sort();

  return {
    brand: unique(watches, 'brand'),
    model: unique(filtered, 'model'),
    movement: unique(filtered, 'movement'),
    complicationlevel: unique(filtered, 'complicationlevel'),
    complications: uniqueComplications(filtered),
    purpose: unique(filtered, 'purpose'),
    dialStyle: unique(filtered, 'dialStyle'),
    numerals: unique(filtered, 'numerals'),
    hands: unique(filtered, 'hands'),
    strap: unique(filtered, 'strap'),
    material: unique(filtered, 'material'),
    caseSize: unique(filtered, 'caseSize'),
    water: unique(filtered, 'water'),
    magnetic: unique(filtered, 'magnetic'),
    shock: unique(filtered, 'shock'),
    helium: unique(filtered, 'helium'),
  };
}

// Utility to get all filterable fields from watches
function getAllFilterFieldsFromSchema() {
  // List all fields you want as filters
  return [
    'brand', 'model', 'movement', 'complicationlevel', 'complications', 'purpose',
    'dialStyle', 'numerals', 'hands', 'strap', 'material', 'caseSize', 'water',
    'magnetic', 'shock', 'helium'
  ];
}

// Utility to build adaptive filter options
function buildFiltersAvailable(watches, selected) {
  let filterBase = watches;
  if (selected.brand) filterBase = filterBase.filter(w => w.brand === selected.brand);
  if (selected.model) filterBase = filterBase.filter(w => w.model === selected.model);

  const unique = (arr, field) =>
    [...new Set(arr.map(w => w[field]).filter(Boolean))].sort();
  const uniqueComplications = arr =>
    [...new Set(arr.flatMap(w => Array.isArray(w.complications) ? w.complications : []).filter(Boolean))].sort();

  const filtersAvailable = {};
  const allFields = getAllFilterFieldsFromSchema();

  allFields.forEach(field => {
    if (field === 'complications') {
      filtersAvailable.complications = uniqueComplications(filterBase);
    } else {
      filtersAvailable[field] = unique(filterBase, field);
    }
  });

  // Always show all brands as options
  filtersAvailable.brand = unique(watches, 'brand');

  return filtersAvailable;
}

// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// Explore page (all watches with filters)
app.get("/explore", async (req, res) => {
  // Build a filter object from query parameters
  const filter = {};
  const filterFields = [
    'brand', 'model', 'movement', 'complicationlevel', 'complications', 'purpose',
    'dialStyle', 'numerals', 'hands', 'strap', 'material', 'caseSize', 'water',
    'magnetic', 'shock', 'helium', 'quickRelease'
  ];

  filterFields.forEach(field => {
    if (req.query[field] && req.query[field] !== '') {
      // For array fields (like complications), use $in or $all as needed
      if (Array.isArray(req.query[field])) {
        filter[field] = { $in: req.query[field] };
      } else {
        filter[field] = req.query[field];
      }
    }
  });

  // Optional: handle price range
  if (req.query.price) {
    filter.price = { $lte: Number(req.query.price) };
  }

  let watches = await Watch.find(filter);

  const selected = {
    brand: req.query.brand || '',
    model: req.query.model || '',
    movement: req.query.movement || '',
    complicationlevel: req.query.complicationlevel || '',
    complications: req.query.complications || '',
    purpose: req.query.purpose || '',
    dialStyle: req.query.dialStyle || '',
    numerals: req.query.numerals || '',
    hands: req.query.hands || '',
    strap: req.query.strap || '',
    material: req.query.material || '',
    caseSize: req.query.caseSize || '',
    water: req.query.water || '',
    magnetic: req.query.magnetic || '',
    shock: req.query.shock || '',
    helium: req.query.helium || '',
    search: req.query.search || ''
  };

  // Fuzzy search if search param is present
  if (selected.search) {
    const fuse = new Fuse(watches, {
      keys: ['brand', 'model', 'title'],
      threshold: 0.4,
    });
    watches = fuse.search(selected.search).map(r => r.item);
  }

  // Build filtersAvailable from watches
  function getUnique(field) {
    return [...new Set(watches.map(w => w[field]).filter(Boolean))];
  }
  const filtersAvailable = {
    brand: getUnique('brand'),
    model: getUnique('model'),
    movement: getUnique('movement'),
    complicationlevel: getUnique('complicationlevel'),
    complications: getUnique('complications'),
    purpose: getUnique('purpose'),
    dialStyle: getUnique('dialStyle'),
    numerals: getUnique('numerals'),
    hands: getUnique('hands'),
    strap: getUnique('strap'),
    material: getUnique('material'),
    caseSize: getUnique('caseSize'),
    water: getUnique('water'),
    magnetic: getUnique('magnetic'),
    shock: getUnique('shock'),
    helium: getUnique('helium')
  };

  res.render("explore", {
    watches,
    selected,
    filtersAvailable,
    user: req.session.user
  });
});

// Customize page
app.get("/customize", async (req, res) => {
  const selected = {};
  getAllFilterFieldsFromSchema().forEach(field => {
    selected[field] = req.query[field] || '';
  });

  const watches = await Watch.find({});
  const filtersAvailable = buildFiltersAvailable(watches, selected);

  // Ensure all expected filter arrays exist, even if empty
  const filterKeys = [
    'brand', 'model', 'movement', 'complicationlevel', 'complications', 'purpose',
    'dialStyle', 'numerals', 'hands', 'strap', 'material', 'caseSize', 'water',
    'magnetic', 'shock', 'helium', 'quickRelease'
  ];
  filterKeys.forEach(key => {
    if (!Array.isArray(filtersAvailable[key])) filtersAvailable[key] = [];
  });

  res.render("customize", { filtersAvailable, selected });
});

// Watch detail page
app.get("/watch/:id", async (req, res) => {
  const watch = await Watch.findOne({ id: Number(req.params.id) });
  if (!watch) {
    return res.status(404).render('404', { message: 'Watch not found' });
  }
  res.render('watch', { watch });
});

// Auth routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use(adminBlogRoutes);

// Add to compare
app.post('/compare/add/:id', (req, res) => {
  if (!req.session.compareIds) req.session.compareIds = [];
  const id = String(req.params.id);
  if (!req.session.compareIds.includes(id)) {
    req.session.compareIds.push(id);
  }
  if (req.xhr) return res.sendStatus(200);
  res.redirect('/explore');
});

// Remove from compare
app.post('/compare/remove/:id', (req, res) => {
  if (!req.session.compareIds) req.session.compareIds = [];
  req.session.compareIds = req.session.compareIds.filter(watchId => watchId !== String(req.params.id));
  if (req.xhr) return res.sendStatus(200);
  res.redirect('/compare');
});

// Compare page
app.get('/compare', async (req, res) => {
  const compareIds = req.session.compareIds || [];
  const compareWatches = await Watch.find({ id: { $in: compareIds.map(Number) } });
  res.render('compare', { watches: compareWatches });
});

// Blog page
app.get("/blog", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.render('blog', { blogs, user: req.session.user });
});

// Wishlist page
app.get('/wishlist', async (req, res) => {
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  const user = users.find(u => u.email === req.session.user?.email);

  const wishlistIds = user?.wishlist || [];
  const compareIds = (req.session.compareIds || []).map(id => String(id));
  const wishlistWatches = await Watch.find({ id: { $in: wishlistIds.map(Number) } });

  res.render('wishlist', { watches: wishlistWatches, compareIds });
});

// API endpoint for filter options
app.get('/api/filter-options', async (req, res) => {
  const selected = {};
  getAllFilterFieldsFromSchema().forEach(field => {
    selected[field] = req.query[field] || '';
  });
  const watches = await Watch.find({});
  const filtersAvailable = buildFiltersAvailable(watches, selected);
  res.json(filtersAvailable);
});

// API endpoint for customize filter options
app.get('/api/customize-filter-options', async (req, res) => {
  const selected = {};
  getAllFilterFieldsFromSchema().forEach(field => {
    selected[field] = req.query[field] || '';
  });
  const watches = await Watch.find({});
  const filtersAvailable = buildFiltersAvailable(watches, selected);
  res.json(filtersAvailable);
});

// API: Explore search (live filter)
app.get('/api/explore-search', async (req, res) => {
  const selected = {};
  getAllFilterFieldsFromSchema().forEach(field => {
    selected[field] = req.query[field] || '';
  });
  let watches = await Watch.find({});
  // Fuzzy search
  if (selected.search) {
    const fuse = new Fuse(watches, {
      keys: ['brand', 'model', 'title'],
      threshold: 0.4,
    });
    watches = fuse.search(selected.search).map(r => r.item);
  }
  // Apply other filters
  watches = watches.filter(watch => {
    for (let key in selected) {
      if (key === 'search') continue;
      if (
        selected[key] &&
        watch[key] !== selected[key] &&
        !(Array.isArray(watch[key]) && watch[key].includes(selected[key]))
      ) {
        return false;
      }
    }
    return true;
  });

  // --- Add this block to include isInWishlist and isInCompare ---
  let wishlistIds = [];
  let compareIds = [];
  if (req.session.user) {
    try {
      const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
      const user = users.find(u => u.email === req.session.user.email);
      wishlistIds = user?.wishlist?.map(String) || [];
    } catch (e) {
      wishlistIds = [];
    }
  }
  compareIds = (req.session.compareIds || []).map(String);

  watches = watches.map(watch => ({
    ...watch.toObject ? watch.toObject() : watch,
    isInWishlist: wishlistIds.includes(String(watch._id)),
    isInCompare: compareIds.includes(String(watch._id)),
  }));
  // --- End block ---

  res.json(watches);
});

// Autocomplete suggestions (fuzzy)
app.get('/search/suggest', async (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) return res.json([]);
  const watches = await Watch.find({});
  const fuse = new Fuse(watches, {
    keys: ['brand', 'model', 'title'],
    threshold: 0.4,
  });
  const results = fuse.search(q, { limit: 10 });
  const suggestions = [];
  results.forEach(r => {
    ['brand', 'model', 'title'].forEach(key => {
      if (r.item[key] && r.item[key].toLowerCase().includes(q)) {
        suggestions.push(r.item[key]);
      }
    });
  });
  res.json([...new Set(suggestions)].slice(0, 10));
});

// Live filter HTML injection (fuzzy, with filters)
app.get('/search/live', async (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const selected = {};
  getAllFilterFieldsFromSchema().forEach(field => {
    if (req.query[field]) selected[field] = req.query[field];
  });
  let watches = await Watch.find({});
  if (q) {
    const fuse = new Fuse(watches, {
      keys: ['brand', 'model', 'title'],
      threshold: 0.4,
    });
    watches = fuse.search(q).map(r => r.item);
  }
  // Apply other filters
  watches = watches.filter(watch => {
    for (let key in selected) {
      if (
        selected[key] &&
        watch[key] !== selected[key] &&
        !(Array.isArray(watch[key]) && watch[key].includes(selected[key]))
      ) {
        return false;
      }
    }
    return true;
  });

  res.render('partials/watchGrid', { watches, user: req.session.user, layout: false });
});

// Add test watch (for admin)
app.get('/add-watch', async (req, res) => {
  const newWatch = new Watch({
    id: 100,
    title: "Test Watch",
    brand: "TestBrand",
    model: "Model X",
    movement: "Automatic",
    complicationlevel: "Basic",
    complications: ["Date"],
    purpose: "Dress",
    dialColor: "#ffffff",
    dialStyle: "Closed",
    numerals: "Index",
    hands: "Dauphine",
    strap: "Leather",
    strapColor: "#000000",
    quickRelease: "Yes",
    material: "Stainless Steel",
    caseSize: "Modern (40–42mm)",
    water: "50m",
    magnetic: "No",
    shock: "Yes",
    helium: "No",
    price: 3000,
    link: "https://example.com/watch-link",
    image: "/images/test-watch.png"
  });

  try {
    await newWatch.save();
    res.send("Watch added to MongoDB");
  } catch (err) {
    res.status(500).send("Failed to add watch: " + err.message);
  }
});

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/terms', (req, res) => {
  res.render('terms');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
