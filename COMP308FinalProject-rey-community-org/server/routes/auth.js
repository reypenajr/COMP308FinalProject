// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();


// Authentication middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    // Log the token being received to debug
    console.log("Received Token:", token);

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);  // Log the decoded token

    // Attach user information to the request
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log("User not found");
      throw new Error('User not found');
    }

    req.token = token;
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};


// Register a new user
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create new user
  const user = new User({ firstName, lastName, email, password, role });

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user and return JWT token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

module.exports = { router, auth };
