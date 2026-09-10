const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Register: Send OTP to Email
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, avatar } = req.body;

    if (!fullName || !email || !mobileNumber) {
      return res.status(400).json({ error: 'fullName, email, and mobileNumber are required' });
    }

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ error: 'User with this email already exists and is verified' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      user = new User({ fullName, email, mobileNumber, otp, otpExpires, avatar: avatar || '' });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.fullName = fullName;
      user.mobileNumber = mobileNumber;
      if (avatar) user.avatar = avatar;
    }
    
    await user.save();

    console.log(`[DEV TEST] OTP for ${email} is: ${otp}`); // For testing without email

    // Send Email (Will only work if EMAIL_USER and EMAIL_PASS are set in .env)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Nihara D Aura',
        text: `Hello ${fullName},\n\nYour OTP for registration is: ${otp}\nIt will expire in 10 minutes.`,
      };
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully. You can now create a password.' });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Create Password
router.post('/create-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'User email is not verified' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: 'Password created successfully. You can now login.' });
  } catch (error) {
    console.error('Error in create-password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: 'Invalid credentials or user not verified' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Password not set. Please create a password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'secret123';
    const payload = { user: { id: user.id } };

    jwt.sign(payload, jwtSecret, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
