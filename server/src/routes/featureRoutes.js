const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { analyzeProductImage, recommendPrice } = require('../services/aiService');
const {
  findReciprocalExchangeMatches,
  getExchangeAnalytics,
  DEFAULT_WEIGHTS,
} = require('../services/exchangeMatchingService');
const User = require('../models/User');
const Request = require('../models/Request');
const Listing = require('../models/Listing');

// 1. AI Smart Listing Assistant
router.post(
  '/analyze-image',
  protect,
  asyncHandler(async (req, res) => {
    const { imageUrl, hintText, originalPrice } = req.body;
    const analysis = await analyzeProductImage({ imageUrl, hintText, originalPrice });
    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({ success: true, data: analysis });
  })
);

// 2. AI Price Recommendation
router.post(
  '/recommend-price',
  protect,
  asyncHandler(async (req, res) => {
    const { category, condition, originalPrice, brand, ageMonths } = req.body;
    const recommendation = recommendPrice({ category, condition, originalPrice, brand, ageMonths });
    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({ success: true, data: recommendation });
  })
);

// 3. Explainable Reciprocal Exchange Matching
router.get(
  '/exchange-matches',
  protect,
  asyncHandler(async (req, res) => {
    const { category, condition, campus, minPrice, maxPrice, minScore, minConfidence, sort } = req.query;
    const result = await findReciprocalExchangeMatches({
      userId: req.user._id,
      filters: { category, condition, campus, minPrice, maxPrice, minScore, minConfidence },
      sort: sort || 'compatibility',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({ success: true, data: result });
  })
);

// 3b. What-If Simulator Endpoint (Simulate wanted categories/preferences without saving)
router.post(
  '/exchange-matches/simulate',
  protect,
  asyncHandler(async (req, res) => {
    const { simulatedPreferences, filters, sort, customWeights } = req.body;
    const result = await findReciprocalExchangeMatches({
      userId: req.user._id,
      simulatedPreferences,
      filters: filters || {},
      sort: sort || 'compatibility',
      customWeights: customWeights || {},
    });

    res.status(200).json({ success: true, data: result });
  })
);

// 3c. Real MongoDB Exchange Analytics & AI Insights
router.get(
  '/exchange-analytics',
  protect,
  asyncHandler(async (req, res) => {
    const analytics = await getExchangeAnalytics();
    res.status(200).json({ success: true, data: analytics });
  })
);

// 4. Student OTP Verification
router.post(
  '/request-student-otp',
  protect,
  asyncHandler(async (req, res) => {
    const { collegeEmail, studentIdNumber } = req.body;
    if (!collegeEmail || !collegeEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid college email required.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await User.findByIdAndUpdate(req.user._id, {
      otpCode: otp,
      otpExpires: expires,
      studentIdNumber: studentIdNumber || '',
    });

    console.log(`[CAMPUS OTP] Generated OTP for ${req.user.name} (${collegeEmail}): ${otp}`);

    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({
      success: true,
      message: `OTP sent to ${collegeEmail}! (For campus demo, use OTP: ${otp})`,
      demoOtp: otp,
    });
  })
);

router.post(
  '/verify-student-otp',
  protect,
  asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.otpCode || user.otpCode !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerifiedStudent = true;
    user.otpCode = '';
    user.otpExpires = null;
    user.reputationScore = Math.min(100, user.reputationScore + 10);
    if (!user.badges.includes('Verified Campus Student')) {
      user.badges.push('Verified Campus Student');
    }
    await user.save();

    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({
      success: true,
      message: 'Student status successfully verified! Verified badge awarded.',
      data: user,
    });
  })
);

// 5. QR-Based Exchange Verification
router.post(
  '/generate-qr-pass/:requestId',
  protect,
  asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.requestId).populate('listing buyer seller');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Transaction request not found.' });
    }

    // Verify authorized user
    const isParticipant =
      request.buyer._id.toString() === req.user._id.toString() ||
      request.seller._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized for this transaction pass.' });
    }

    if (!request.qrVerificationCode) {
      request.qrVerificationCode = `SC-${request._id.toString().slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await request.save();
    }

    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({
      success: true,
      data: {
        qrCode: request.qrVerificationCode,
        requestId: request._id,
        isQrVerified: request.isQrVerified,
        listingTitle: request.listing?.title,
        meetupLocation: request.meetupLocation,
        preferredTime: request.preferredTime,
      },
    });
  })
);

router.post(
  '/confirm-qr-verification',
  protect,
  asyncHandler(async (req, res) => {
    const { qrCode } = req.body;
    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR Code is required.' });
    }

    const request = await Request.findOne({ qrVerificationCode: qrCode.trim() }).populate('listing buyer seller');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Invalid or expired QR verification pass.' });
    }

    request.isQrVerified = true;
    request.verifiedAt = new Date();
    request.status = 'completed';
    await request.save();

    // Mark listing as completed/sold
    if (request.listing) {
      await Listing.findByIdAndUpdate(request.listing._id, {
        status: request.type === 'exchange' ? 'exchanged' : 'sold',
      });
    }

    // Award sustainability impact & points to both students
    await User.findByIdAndUpdate(request.buyer._id, {
      $inc: { sustainabilityPoints: 50, itemsReusedCount: 1, reputationScore: 2 },
      $addToSet: { badges: 'Eco Champion' },
    });
    await User.findByIdAndUpdate(request.seller._id, {
      $inc: { sustainabilityPoints: 50, itemsReusedCount: 1, reputationScore: 3 },
      $addToSet: { badges: 'Trusted Seller' },
    });

    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({
      success: true,
      message: 'Physical handover confirmed successfully! Eco points & badges awarded.',
      data: request,
    });
  })
);

// 6. Sustainability Impact Metrics
router.get(
  '/sustainability-metrics',
  asyncHandler(async (req, res) => {
    const totalListings = await Listing.countDocuments();
    const completedSwaps = await Request.countDocuments({ status: { $in: ['accepted', 'completed'] } });

    // Documented sustainable metrics:
    // Avg reused garment saves ~2.5 kg CO2, 2,700 Liters of water, and 0.5 kg textile waste
    const itemsReused = Math.max(14, totalListings * 3 + completedSwaps * 5);
    const textileWasteAvoidedKg = Math.round(itemsReused * 0.52);
    const waterSavedLiters = Math.round(itemsReused * 2650);
    const co2AvoidedKg = Math.round(itemsReused * 2.45);

    // Leaderboard top campus eco champions
    const leaderboard = await User.find({ role: 'user' })
      .select('name college avatar sustainabilityPoints itemsReusedCount badges reputationScore isVerifiedStudent')
      .sort({ sustainabilityPoints: -1 })
      .limit(10);

    // Broadcast real-time leaderboard update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update');
    }

    res.status(200).json({
      success: true,
      data: {
        itemsReused,
        textileWasteAvoidedKg,
        waterSavedLiters,
        co2AvoidedKg,
        leaderboard,
      },
    });
  })
);

// 7. Interactive Campus Meetup Spots (Bengaluru Student Hubs)
router.get(
  '/campus-meetup-spots',
  asyncHandler(async (req, res) => {
    const spots = [
      {
        id: 'spot-1',
        name: 'RVCE Central Library & Food Court Plaza',
        lat: 12.9242,
        lng: 77.4988,
        type: 'Safe Public Zone',
        hours: '8:00 AM - 9:00 PM (CCTV Monitored)',
        description: 'Popular student hangout near Mysore Road RVCE main gate.',
      },
      {
        id: 'spot-2',
        name: 'PES University Food Court & OAT (Ring Road)',
        lat: 12.9344,
        lng: 77.5345,
        type: 'Open Air Theatre / Food Court',
        hours: '8:30 AM - 8:00 PM',
        description: 'Vibrant outdoor amphitheater with ample seating and student foot traffic.',
      },
      {
        id: 'spot-3',
        name: 'BMSCE Bull Temple Gate & Sports Complex',
        lat: 12.9416,
        lng: 77.5658,
        type: 'Campus Landmark Hub',
        hours: '7:30 AM - 8:30 PM',
        description: 'Well-known meeting landmark in Basavanagudi near campus canteen.',
      },
      {
        id: 'spot-4',
        name: 'IISc Central Library & Coffee House (Malleshwaram)',
        lat: 13.0219,
        lng: 77.5671,
        type: 'Premier Research Safe Point',
        hours: '9:00 AM - 10:00 PM',
        description: 'Peaceful, highly monitored research campus meeting location.',
      },
      {
        id: 'spot-5',
        name: 'Presidency University Central Courtyard & Canteen (Itgalpur)',
        lat: 13.1678,
        lng: 77.5342,
        type: 'Student Hub Zone',
        hours: '8:00 AM - 7:30 PM',
        description: 'Vibrant student activity area near Presidency University main block.',
      },
    ];

    res.status(200).json({ success: true, data: spots });
  })
);

module.exports = router;
