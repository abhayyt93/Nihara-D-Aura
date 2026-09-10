const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user profile
router.post('/', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, avatar } = req.body;

    // Basic validation
    if (!fullName || !email || !mobileNumber) {
      return res.status(400).json({ error: 'fullName, email, and mobileNumber are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = new User({
      fullName,
      email,
      mobileNumber,
      avatar: avatar || ''
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User profile created successfully', user: savedUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user profiles
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
