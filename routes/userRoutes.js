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

// Update user profile (like avatar)
router.post('/update', async (req, res) => {
  try {
    const { email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to update profile' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
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
