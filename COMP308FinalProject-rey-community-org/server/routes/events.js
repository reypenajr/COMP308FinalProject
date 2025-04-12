const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('./auth'); // <== import your auth middleware

// Protect this route with auth middleware
router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, location, date } = req.body;

    // Validate input
    if (!title || !description || !location || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEvent = new Event({
      title,
      description,
      location,
      date,
      createdBy: req.user._id, // From token
      createdByName: `${req.user.firstName} ${req.user.lastName}`, // From token
    });

    await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
});

module.exports = router;
