const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  avatarPublicId: {
    type: String,
    default: null,
  },
  storageUsed: {
    type: Number,
    default: 0, // bytes
  },
  storageLimit: {
    type: Number,
    default: 25 * 1024 * 1024 * 1024, // 25GB (Cloudinary free plan)
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Security question for password reset (no email service needed)
  securityQuestion: {
    type: String,
    default: null,
  },
  securityAnswer: {
    type: String,
    default: null,
    select: false, // never return in queries by default
  },
}, { timestamps: true });

// Hash password and securityAnswer before saving
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('securityAnswer') && this.securityAnswer) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), 12);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare security answer method
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  if (!this.securityAnswer) return false;
  return await bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.securityAnswer;
  return user;
};

module.exports = mongoose.model('User', userSchema);
