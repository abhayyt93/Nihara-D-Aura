const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  password: {
    type: String,
  },
  tier: {
    type: String,
    default: 'Royal Member',
  },
  rewardPoints: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  }
}, { timestamps: true });

// Sync name <-> fullName and phone <-> mobileNumber before validation
userSchema.pre('validate', function() {
  if (this.name && !this.fullName) {
    this.fullName = this.name;
  }
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  if (this.phone && !this.mobileNumber) {
    this.mobileNumber = this.phone;
  }
  if (this.mobileNumber && !this.phone) {
    this.phone = this.mobileNumber;
  }
});

module.exports = mongoose.model('User', userSchema);
