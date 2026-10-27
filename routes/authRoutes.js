const express = require('express');
const router = express.Router();
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

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: Send OTP Email
const sendOTPEmail = async (email, name, otp, purpose = 'registration') => {
  console.log(`\n========================================`);
  console.log(`[AUTH] ${purpose.toUpperCase()} OTP for ${email}: ${otp}`);
  console.log(`========================================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return false;
  }

  try {
    const mailOptions = {
      from: `"Nihara D'Aura" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your OTP for Nihara D'Aura`,
      text: `Hello ${name || 'User'},\n\nYour OTP is: ${otp}\nIt is valid for 10 minutes.\n\nThank you,\nNihara D'Aura Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #f0e6d2; border-radius: 10px; background-color: #fffdfa;">
          <h2 style="color: #2b1f14; text-align: center; margin-bottom: 8px;">Nihara D'Aura</h2>
          <p style="color: #6d5b45; text-align: center; font-size: 14px; margin-top: 0;">Luxury Bridal, Jewellery & Self-Care</p>
          <hr style="border: 0; border-top: 1px solid #ebdcc5; margin: 20px 0;" />
          <p style="color: #333; font-size: 15px;">Hello <strong>${name || 'Valued Guest'}</strong>,</p>
          <p style="color: #555; font-size: 14px; line-height: 1.5;">Please use the one-time password (OTP) below to complete your authentication:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b38728; background: #faf4e8; padding: 14px 28px; border: 1px dashed #b38728; border-radius: 8px; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Nodemailer error (Check EMAIL_USER and EMAIL_PASS in .env):', err.message);
    return false;
  }
};

// 1. Register: Create Account with Name & Email -> Send OTP
router.post('/register', async (req, res) => {
  try {
    const { fullName, name, email, mobileNumber, phone, avatar } = req.body;

    const resolvedName = fullName || name;
    const resolvedPhone = mobileNumber || phone || '';

    if (!resolvedName || !email) {
      return res.status(400).json({ error: 'fullName (or name) and email are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.status(400).json({ error: 'User with this email already exists. Please login instead.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      user = new User({
        fullName: resolvedName.trim(),
        name: resolvedName.trim(),
        email: normalizedEmail,
        mobileNumber: resolvedPhone.trim(),
        phone: resolvedPhone.trim(),
        otp,
        otpExpires,
        avatar: avatar || '',
        isVerified: false,
      });
    } else {
      user.fullName = resolvedName.trim();
      user.name = resolvedName.trim();
      if (resolvedPhone) {
        user.mobileNumber = resolvedPhone.trim();
        user.phone = resolvedPhone.trim();
      }
      user.otp = otp;
      user.otpExpires = otpExpires;
      if (avatar) user.avatar = avatar;
    }

    await user.save();

    const emailSent = await sendOTPEmail(normalizedEmail, resolvedName, otp, 'Registration');

    res.status(200).json({
      message: emailSent ? 'OTP sent successfully to your email' : 'OTP generated successfully (check server logs in dev)',
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Login: Existing user requests OTP via Email (No password required)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please register first.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const userName = user.fullName || user.name || 'User';
    const emailSent = await sendOTPEmail(normalizedEmail, userName, otp, 'Login');

    res.status(200).json({
      message: emailSent ? 'Login OTP sent successfully to your email' : 'Login OTP generated successfully (check server logs in dev)',
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Verify OTP: Verifies OTP, activates account & returns JWT auth token + user profile
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== String(otp).trim() || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'secret123';
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Account verified successfully',
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

module.exports = router;
