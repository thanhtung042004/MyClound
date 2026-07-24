const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateSecurityQuestion,
  getSecurityQuestion,
  resetPassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/get-security-question', getSecurityQuestion); // Step 1: get question by email
router.post('/reset-password', resetPassword);              // Step 2: verify answer + new password

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/security-question', protect, updateSecurityQuestion); // Settings page

module.exports = router;
