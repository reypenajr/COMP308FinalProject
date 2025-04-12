// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

//Checker for if Resident
const isResident = (req, res, next) => {
  if (req.user.role !== 'Resident') {
    return res.status(403).json({ message: 'Access denied. Only Residents can perform this action.' });
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, isResident, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const post = new Post({
      title,
      content,
      category,
      author: req.user._id,
      authorName: `${req.user.firstName} ${req.user.lastName}`
    });
    
    if (category === 'Emergency Alert' && req.body.severity) {
      post.emergency = { severity: req.body.severity };
    }
    
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    const { title, content, category } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.updatedAt = Date.now();
    
    if (category === 'Emergency Alert' && req.body.severity) {
      post.emergency.severity = req.body.severity;
    }
    
    if (category === 'Emergency Alert' && req.body.resolved !== undefined) {
      post.emergency.resolved = req.body.resolved;
    }
    
    if (category === 'Help Request' && req.body.status) {
      post.helpRequest.status = req.body.status;
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/volunteer', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.category !== 'Help Request') {
      return res.status(400).json({ message: 'Can only volunteer for Help Request posts' });
    }
    
    if (post.helpRequest.volunteers.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already volunteered for this request' });
    }
    
    post.helpRequest.volunteers.push(req.user._id);
    
    if (post.helpRequest.status === 'Open') {
      post.helpRequest.status = 'In Progress';
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
