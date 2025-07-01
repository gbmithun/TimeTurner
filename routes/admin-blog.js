const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// Blog List
router.get('/admin/blog-list', async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.render('admin-blog-list', { blogs });
});

// Add Blog (GET)
router.get('/admin/add-blog', (req, res) => {
  res.render('admin-add-blog');
});

// Add Blog (POST)
router.post('/admin/add-blog', async (req, res) => {
  const { image, title, content, href } = req.body;
  await Blog.create({ image, title, content, href });
  res.redirect('/admin/blog-list');
});

// Edit Blog (GET)
router.get('/admin/edit-blog/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render('admin-edit-blog', { blog });
});

// Edit Blog (POST)
router.post('/admin/edit-blog/:id', async (req, res) => {
  const { image, title, content, href } = req.body;
  await Blog.findByIdAndUpdate(req.params.id, { image, title, content, href });
  res.redirect('/admin/blog-list');
});

// Delete Blog
router.post('/admin/delete-blog/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/admin/blog-list');
});

module.exports = router;