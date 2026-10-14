const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// 1. Create a new user profile
router.post('/', async (req, res) => {
  try {
    const { fullName, name, email, mobileNumber, phone, avatar, tier, rewardPoints } = req.body;

    const resolvedName = fullName || name;
    const resolvedPhone = mobileNumber || phone;

    // Basic validation
    if (!resolvedName || !email || !resolvedPhone) {
      return res.status(400).json({ error: 'fullName/name, email, and mobileNumber/phone are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = new User({
      fullName: resolvedName,
      name: resolvedName,
      email: email.toLowerCase(),
      mobileNumber: resolvedPhone,
      phone: resolvedPhone,
      avatar: avatar || '',
      tier: tier || 'Royal Member',
      rewardPoints: rewardPoints || 0,
      isVerified: true,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User profile created successfully', user: savedUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Update user profile (avatar, name, phone, tier, etc.)
router.post('/update', async (req, res) => {
  try {
    const { email, avatar, fullName, name, mobileNumber, phone, tier, rewardPoints } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to update profile' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (fullName !== undefined) {
      user.fullName = fullName;
      user.name = fullName;
    }
    if (name !== undefined) {
      user.name = name;
      user.fullName = name;
    }
    if (mobileNumber !== undefined) {
      user.mobileNumber = mobileNumber;
      user.phone = mobileNumber;
    }
    if (phone !== undefined) {
      user.phone = phone;
      user.mobileNumber = phone;
    }
    if (tier !== undefined) user.tier = tier;
    if (rewardPoints !== undefined) user.rewardPoints = rewardPoints;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get all user profiles or filter by email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('-password -otp -otpExpires');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    }

    const users = await User.find().select('-password -otp -otpExpires');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get specific profile by id or email
router.get('/:idOrEmail', async (req, res) => {
  try {
    const { idOrEmail } = req.params;
    let user;

    if (mongoose.Types.ObjectId.isValid(idOrEmail)) {
      user = await User.findById(idOrEmail).select('-password -otp -otpExpires');
    }

    if (!user) {
      user = await User.findOne({ email: idOrEmail.toLowerCase() }).select('-password -otp -otpExpires');
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
