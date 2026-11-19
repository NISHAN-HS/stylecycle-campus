const express = require('express');
const {
  getMyNotifications,
  markAllAsRead,
  markOneAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/mark-read', markAllAsRead);
router.patch('/:id/read', markOneAsRead);

module.exports = router;
