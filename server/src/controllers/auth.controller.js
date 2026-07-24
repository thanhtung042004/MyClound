const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = {};
    if (name) updates.name = name;

    // Handle avatar upload
    if (req.file) {
      const cloudinary = require('../config/cloudinary');
      // Delete old avatar
      if (req.user.avatarPublicId) {
        await cloudinary.uploader.destroy(req.user.avatarPublicId);
      }
      updates.avatar = req.file.path;
      updates.avatarPublicId = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/security-question (protected — update security question in settings)
const updateSecurityQuestion = async (req, res) => {
  try {
    const { securityQuestion, securityAnswer } = req.body;

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu hỏi và câu trả lời bí mật.' });
    }

    const user = await User.findById(req.user._id);
    user.securityQuestion = securityQuestion;
    user.securityAnswer = securityAnswer; // will be hashed by pre-save hook
    await user.save();

    res.status(200).json({ success: true, message: 'Câu hỏi bí mật đã được cập nhật thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/get-security-question (public — step 1 of reset flow)
const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này.' });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này chưa thiết lập câu hỏi bí mật. Vui lòng liên hệ hỗ trợ.',
        noSecurityQuestion: true,
      });
    }

    res.status(200).json({
      success: true,
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/reset-password (public — step 2: verify answer + change password)
const resetPassword = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +securityAnswer');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này.' });
    }

    if (!user.securityAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này chưa thiết lập câu hỏi bí mật.',
      });
    }

    const isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);
    if (!isAnswerCorrect) {
      return res.status(401).json({ success: false, message: 'Câu trả lời bí mật không đúng.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateSecurityQuestion,
  getSecurityQuestion,
  resetPassword,
};
