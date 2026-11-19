const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Request must reference a listing'],
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have a buyer'],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have a seller'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Request type is required'],
      enum: {
        values: ['purchase', 'exchange'],
        message: '{VALUE} is not a valid request type',
      },
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    meetupLocation: {
      type: String,
      trim: true,
      default: 'Campus Library Front Entrance',
    },
    preferredTime: {
      type: String,
      trim: true,
      default: 'Flexible',
    },
    exchangeItemOffered: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Exchange item description cannot exceed 200 characters'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Campus Pickup', 'UPI Payment', 'Online Gateway (Test Mode)', 'N/A (Exchange)'],
      default: 'Cash on Campus Pickup',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      upiId: { type: String, default: '' },
      amount: { type: Number, default: 0 },
    },
    pickupSchedule: {
      date: { type: String, default: '' },
      time: { type: String, default: '' },
      sellerConfirmed: { type: Boolean, default: false },
      buyerConfirmed: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    qrVerificationCode: {
      type: String,
      default: '',
    },
    isQrVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help lookup pending requests by buyer for a specific listing
requestSchema.index({ listing: 1, buyer: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
