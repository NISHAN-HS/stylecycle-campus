const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Send a message to another campus student
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, listingId, text, imageUrl, negotiation, exchangeProposal } = req.body;

  if (!recipientId || (!text && !imageUrl && !negotiation && !exchangeProposal)) {
    return res.status(400).json({
      success: false,
      message: 'Recipient and message content are required.',
    });
  }

  if (recipientId.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot message yourself.',
    });
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: 'Recipient student not found.',
    });
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    listing: listingId || undefined,
    text: text ? text.trim() : (negotiation ? `Price Offer: ₹${negotiation.offeredPrice}` : (exchangeProposal ? `Exchange Proposal: ${exchangeProposal.offeredListingTitle}` : 'Image sent')),
    imageUrl: imageUrl || '',
    negotiation: negotiation || undefined,
    exchangeProposal: exchangeProposal || undefined,
  });

  // Create notification for recipient
  try {
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      title: negotiation ? `Offer from ${req.user.name}` : `New message from ${req.user.name}`,
      message: message.text.substring(0, 80),
      link: `/messages?user=${req.user._id}`,
      type: 'message',
    });
  } catch (err) {
    console.error('Failed to create message notification:', err.message);
  }

  const populated = await Message.findById(message._id)
    .populate('sender', 'name avatar college')
    .populate('recipient', 'name avatar college')
    .populate('listing', 'title price images');

  // Emit real-time message via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to(recipientId.toString()).emit('message_received', populated);
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully.',
    data: populated,
  });
});

// @desc    Respond to Price Offer or Exchange Proposal inside chat
// @route   PATCH /api/messages/:id/respond-offer
// @access  Private
const respondToOffer = asyncHandler(async (req, res) => {
  const { action, counterPrice } = req.body; // action: 'accept' | 'reject' | 'counter'
  const message = await Message.findById(req.params.id).populate('sender recipient listing');

  if (!message) {
    return res.status(404).json({ success: false, message: 'Offer message not found.' });
  }

  // Only the recipient can accept/reject/counter
  if (message.recipient._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to respond to this offer.' });
  }

  if (message.negotiation && message.negotiation.isOffer) {
    if (action === 'accept') {
      message.negotiation.status = 'accepted';
    } else if (action === 'reject') {
      message.negotiation.status = 'rejected';
    } else if (action === 'counter') {
      message.negotiation.status = 'countered';
      message.negotiation.counterPrice = Number(counterPrice);
    }
  }

  if (message.exchangeProposal && message.exchangeProposal.isProposal) {
    if (action === 'accept') {
      message.exchangeProposal.status = 'accepted';
    } else if (action === 'reject') {
      message.exchangeProposal.status = 'rejected';
    }
  }

  await message.save();

  // Notify sender
  try {
    await Notification.create({
      recipient: message.sender._id,
      sender: req.user._id,
      title: `Offer ${action}ed by ${req.user.name}`,
      message: `${req.user.name} has ${action}ed your offer for ${message.listing?.title || 'item'}.`,
      link: `/messages?user=${req.user._id}`,
      type: 'message',
    });
  } catch (err) {}

  res.status(200).json({
    success: true,
    message: `Offer ${action}ed successfully.`,
    data: message,
  });
});

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all messages involving this user
  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar college')
    .populate('recipient', 'name avatar college')
    .populate('listing', 'title price images');

  // Group by conversation partner
  const conversationsMap = new Map();

  for (const msg of messages) {
    const isSender = msg.sender._id.toString() === userId.toString();
    const partner = isSender ? msg.recipient : msg.sender;
    const partnerId = partner._id.toString();

    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, {
        partner,
        lastMessage: msg,
        listing: msg.listing,
        unreadCount: !isSender && !msg.read ? 1 : 0,
      });
    } else if (!isSender && !msg.read) {
      const conv = conversationsMap.get(partnerId);
      conv.unreadCount += 1;
    }
  }

  const conversations = Array.from(conversationsMap.values());

  res.status(200).json({
    success: true,
    message: 'Conversations retrieved.',
    data: conversations,
  });
});

// @desc    Get message thread with a specific student
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessagesWithUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar college')
    .populate('recipient', 'name avatar college')
    .populate('listing', 'title price images');

  // Mark incoming messages as read
  await Message.updateMany(
    { sender: otherUserId, recipient: userId, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'Message thread fetched.',
    data: messages,
  });
});

module.exports = {
  sendMessage,
  getConversations,
  getMessagesWithUser,
  respondToOffer,
};
