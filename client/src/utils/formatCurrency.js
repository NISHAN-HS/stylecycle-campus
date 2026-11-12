/**
 * Helper formatCurrency
 * Reads saved currency from localStorage if outside React context,
 * with default fallback to INR (₹).
 */
const USD_TO_INR = 83;

export const formatCurrency = (price, listingType) => {
  if (listingType === 'For Exchange' || price === 0 || price === null || price === undefined) {
    return 'For Exchange';
  }

  const numPrice = Number(price);
  if (isNaN(numPrice)) return 'For Exchange';

  const currency = typeof window !== 'undefined'
    ? localStorage.getItem('stylecycle_currency') || 'INR'
    : 'INR';

  if (currency === 'INR') {
    const inr = Math.round(numPrice * USD_TO_INR);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inr);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numPrice);
};
