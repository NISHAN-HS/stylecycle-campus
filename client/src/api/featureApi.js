import api from './axios';

export const featureApi = {
  // 1 & 8: AI Smart Listing & Price Assistant
  analyzeImage: (data) => api.post('/features/analyze-image', data),
  recommendPrice: (data) => api.post('/features/recommend-price', data),

  // 2: Smart Exchange Matching
  getExchangeMatches: () => api.get('/features/exchange-matches'),

  // 3: Verified Student OTP
  requestStudentOtp: (data) => api.post('/features/request-student-otp', data),
  verifyStudentOtp: (data) => api.post('/features/verify-student-otp', data),

  // 5: Campus Meetup Map Spots
  getCampusMeetupSpots: () => api.get('/features/campus-meetup-spots'),

  // 6 & 10: Sustainability Impact & Leaderboard
  getSustainabilityMetrics: () => api.get('/features/sustainability-metrics'),

  // 7: QR Code Physical Handshake Pass
  generateQrPass: (requestId) => api.post(`/features/generate-qr-pass/${requestId}`),
  confirmQrVerification: (qrCode) => api.post('/features/confirm-qr-verification', { qrCode }),
};

