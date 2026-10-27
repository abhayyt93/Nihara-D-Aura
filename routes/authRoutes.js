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

// 1. Register: Send OTP to Email (fullName / name + email)
router.post('/register', async (req, res) => {
  try {
    const { fullName, name, email, mobileNumber, phone, avatar } = req.body;

    const resolvedName = fullName || name;
    const resolvedPhone = mobileNumber || phone || '';

    if (!resolvedName || !email) {
      return res.status(400).json({ error: 'fullName (or name) and email are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.isVerified) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      user = new User({
        fullName: resolvedName,
        name: resolvedName,
        email: email.toLowerCase(),
        mobileNumber: resolvedPhone,
        phone: resolvedPhone,
        otp,
        otpExpires,
        avatar: avatar || '',
        isVerified: false,
      });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.fullName = resolvedName;
      user.name = resolvedName;
      if (resolvedPhone) {
        user.mobileNumber = resolvedPhone;
        user.phone = resolvedPhone;
      }
      if (avatar) user.avatar = avatar;
    }
    
    await user.save();

    console.log(`\n========================================`);
    console.log(`[AUTH] Registration OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    // Send Email via Nodemailer
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const mailOptions = {
          from: `"Nihara D'Aura" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your Verification OTP - Nihara D\'Aura',
          text: `Hello ${resolvedName},\n\nYour OTP for registration is: ${otp}\nIt will expire in 10 minutes.\n\nThank you,\nNihara D'Aura Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #333; text-align: center;">Welcome to Nihara D'Aura</h2>
              <p>Hello <strong>${resolvedName}</strong>,</p>
              <p>Thank you for registering. Please use the OTP below to verify your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #d4af37; background: #fafafa; padding: 12px 24px; border: 1px dashed #d4af37; border-radius: 6px;">${otp}</span>
              </div>
              <p style="color: #666; font-size: 13px;">This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (mailErr) {
        console.error('Nodemailer error (Check email credentials/App Password):', mailErr.message);
      }
    }

    res.status(200).json({ 
      message: emailSent ? 'OTP sent successfully to email' : 'OTP generated successfully (check server logs in dev mode)',
      email: email.toLowerCase()
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Verify OTP: Account created & verified, returns token and user
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== String(otp).trim() || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'secret123';
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Account verified and created successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName || user.name,
        name: user.name || user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber || user.phone || '',
        phone: user.phone || user.mobileNumber || '',
        avatar: user.avatar || '',
        tier: user.tier || 'Royal Member',
        rewardPoints: user.rewardPoints || 0,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Create / Set Password (Optional step)
router.post('/create-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: 'User email is not verified' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: 'Password created successfully. You can now login with password.' });
  } catch (error) {
    console.error('Error in create-password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Login with Email & Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

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
      res.status(200).json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName || user.name,
          name: user.name || user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber || user.phone || '',
          phone: user.phone || user.mobileNumber || '',
          avatar: user.avatar || '',
          tier: user.tier || 'Royal Member',
          rewardPoints: user.rewardPoints || 0,
        }
      });
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
