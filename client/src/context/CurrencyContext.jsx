import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Conversion rate: 1 USD = 83 INR
const USD_TO_INR = 83;

export const CurrencyProvider = ({ children }) => {
  // Default currency is INR as requested
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stylecycle_currency') || 'INR';
    }
    return 'INR';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stylecycle_currency', currency);
    }
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'));
  };

  /**
   * Formats a raw price (stored in USD).
   * When currency === 'INR', multiplies by USD_TO_INR and displays ₹.
   * When currency === 'USD', displays $.
   */
  const formatPrice = (price, listingType) => {
    if (listingType === 'For Exchange' || price === 0 || price === null || price === undefined) {
      return 'For Exchange';
    }

    const numPrice = Number(price);
    if (isNaN(numPrice)) return 'For Exchange';

    if (currency === 'INR') {
      const inrAmount = Math.round(numPrice * USD_TO_INR);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(inrAmount);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        currencySymbol,
        rate: USD_TO_INR,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

