const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      index: true,
    },
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    locationData: {
      name: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    read: {
      type: Boolean,
      default: false,
    },
    negotiation: {
      isOffer: { type: Boolean, default: false },
      offeredPrice: { type: Number, default: null },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'countered', null],
        default: null,
      },
      counterPrice: { type: Number, default: null },
    },
    exchangeProposal: {
      isProposal: { type: Boolean, default: false },
      offeredListingTitle: { type: String, default: '' },
      offeredListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', null],
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
