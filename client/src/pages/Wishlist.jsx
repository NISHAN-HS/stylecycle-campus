import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { user } = useAuth();
  const { currencySymbol } = useCurrency();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await userApi.getWishlist();
      if (res && res.data) {
        setItems(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await userApi.removeFromWishlist(id);
      setItems((prev) => prev.filter((item) => (item._id || item) !== id));
      toast.success('Item removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-forest-800" />
            <span>Saved Campus Finds</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-900 font-editorial">
            My Campus Wishlist
          </h1>
          <p className="text-sm text-muted-600 mt-1">
            Keep track of secondhand clothes, books, and gear you love.
          </p>
        </div>
        <div className="text-sm font-semibold text-forest-800 bg-forest-50 border border-forest-200 px-4 py-2 rounded-2xl w-fit">
          {items.length} {items.length === 1 ? 'item saved' : 'items saved'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-dark-900 font-editorial mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-xs text-muted-600 mb-6">
            Explore listings across campus and click the heart icon on any product to save it here.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((listing) => (
            <div key={listing._id} className="relative group">
              <ProductCard listing={listing} />
              <button
                onClick={(e) => handleRemove(listing._id, e)}
                title="Remove from Wishlist"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md border border-border transition opacity-90 hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
