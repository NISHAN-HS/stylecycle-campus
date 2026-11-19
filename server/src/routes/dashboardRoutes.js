const express = require('express');
const {
  getDashboardStats,
  getDashboardActivity,
  getAdminListings,
  updateListingStatusByAdmin,
  deleteListingByAdmin,
  getAdminUsers,
  exportPlatformData,
  getSellerAnalytics,
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Student Seller Analytics (accessible by any authenticated student)
router.get('/seller-analytics', getSellerAnalytics);

// Admin-only routes
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);
router.get('/listings', getAdminListings);
router.patch('/listings/:id/status', updateListingStatusByAdmin);
router.delete('/listings/:id', deleteListingByAdmin);
router.get('/users', getAdminUsers);
router.get('/export', exportPlatformData);

module.exports = router;
