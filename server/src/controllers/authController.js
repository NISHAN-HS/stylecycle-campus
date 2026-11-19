const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Helper to issue JWT and set secure HTTP-only cookie
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'reclothing_campus_super_secure_jwt_secret_key_2026_xyz',
    { expiresIn: '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' is required for cross-domain Vercel <-> Render cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const isAdmin =
    user.role === 'admin' ||
    (user.email && user.email.toLowerCase() === 'sanskarbhanderi08@gmail.com');
  const role = isAdmin ? 'admin' : (user.role || 'user');

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      avatar: user.avatar,
      role,
      wishlist: user.wishlist || [],
      token, // Dual authentication support for cross-domain requests
      createdAt: user.createdAt,
    },
  });
};

// @desc    Register a new student user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, college, avatar } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please log in.',
    });
  }

  const isAdmin = email.toLowerCase().trim() === 'sanskarbhanderi08@gmail.com';

  // Check if college email domain (.edu, .ac.in, .edu.in)
  const isCollegeDomain = /\.(edu|ac\.in|edu\.in)$/i.test(email.toLowerCase().trim());

  // Generate initial student verification OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create new user (password hashed in pre-save hook)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    college: college.trim(),
    avatar: avatar || '',
    role: isAdmin ? 'admin' : 'user',
    otpCode: generatedOtp,
    otpExpires,
    isVerifiedStudent: isCollegeDomain, // Auto-verify institutional domains or allow OTP verification
    collegeEmailVerified: isCollegeDomain,
    badges: isCollegeDomain ? ['Active Campus Member', 'Verified Campus Student'] : ['Active Campus Member'],
  });

  const { sendVerificationEmail } = require('../services/emailService');
  sendVerificationEmail(user.email, generatedOtp, user.name).catch((e) => console.log('Mail error:', e.message));

  sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to StyleCycle.');
});

// @desc    Authenticate user & issue HTTP-only cookie
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // Auto-promote designated admin account if role is not set
  if (
    user.email &&
    user.email.toLowerCase() === 'sanskarbhanderi08@gmail.com' &&
    user.role !== 'admin'
  ) {
    user.role = 'admin';
    await user.save();
  }

  sendTokenResponse(user, 200, res, 'Logged in successfully.');
});

// @desc    Log out user & clear HTTP-only cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
    data: {},
  });
});

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title price images condition category');

  if (
    user &&
    user.email &&
    user.email.toLowerCase() === 'sanskarbhanderi08@gmail.com' &&
    user.role !== 'admin'
  ) {
    user.role = 'admin';
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'User session verified.',
    data: user,
  });
});

// @desc    Request OTP for Student Verification
// @route   POST /api/auth/send-otp
// @access  Private
const sendStudentOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = generatedOtp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  const { sendVerificationEmail } = require('../services/emailService');
  await sendVerificationEmail(user.email, generatedOtp, user.name);

  res.status(200).json({
    success: true,
    message: `Verification OTP dispatched to ${user.email}. Valid for 10 minutes.`,
    demoOtp: process.env.NODE_ENV !== 'production' ? generatedOtp : undefined,
  });
});

// @desc    Verify Student OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyStudentOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, message: 'Please provide the 6-digit OTP code.' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (!user.otpCode || user.otpCode !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification OTP code.' });
  }

  if (user.otpExpires && new Date() > user.otpExpires) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
  }

  user.isVerifiedStudent = true;
  user.collegeEmailVerified = true;
  user.otpCode = '';
  user.otpExpires = null;
  user.reputationScore = Math.min(100, (user.reputationScore || 85) + 10);
  if (!user.badges.includes('Verified Campus Student')) {
    user.badges.push('Verified Campus Student');
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Congratulations! Your student identity has been verified.',
    data: user,
  });
});

// @desc    Forgot Password - Send Reset Token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });
  }

  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const { sendPasswordResetEmail } = require('../services/emailService');
  await sendPasswordResetEmail(user.email, resetToken, user.name);

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
    demoResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
  });
});

// @desc    Reset Password with Token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }

  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password successfully updated! You can now log in with your new password.',
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  sendStudentOtp,
  verifyStudentOtp,
  forgotPassword,
  resetPassword,
};
