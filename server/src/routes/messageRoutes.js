const express = require('express');
const {
  sendMessage,
  getConversations,
  getMessagesWithUser,
  respondToOffer,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:otherUserId', getMessagesWithUser);
router.patch('/:id/respond-offer', respondToOffer);

module.exports = router;
