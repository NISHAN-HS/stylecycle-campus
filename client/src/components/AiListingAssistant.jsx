import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, DollarSign, CheckCircle2 } from 'lucide-react';
import { featureApi } from '../api/featureApi';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

const AiListingAssistant = ({ onApplySuggestion, currentImageUrl }) => {
  const { currency, currencySymbol } = useCurrency();
  const [hint, setHint] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await featureApi.analyzeImage({
        imageUrl: currentImageUrl || '',
        hintText: hint,
        originalPrice: originalPrice ? Number(originalPrice) : null,
      });

      if (res && res.data) {
        setSuggestion(res.data);
        toast.success('AI successfully analyzed your item!');
      }
    } catch (err) {
      toast.error(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApplySuggestion({
      title: suggestion.title,
      category: suggestion.category,
      condition: suggestion.condition,
      size: suggestion.size,
      price: currency === 'INR' ? suggestion.suggestedPriceInr : suggestion.suggestedPriceUsd,
      description: suggestion.description,
      exchangePreference: suggestion.exchangePreference,
    });
    toast.success('AI recommendations applied to form!');
  };

  return (
    <div className="bg-gradient-to-br from-forest-50 via-emerald-50/40 to-ivory-100 border border-forest-200/80 rounded-2xl p-5 mb-8 shadow-subtle relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-forest-950 flex items-center gap-1.5">
              AI Smart Listing & Pricing Assistant
              <span className="text-[10px] uppercase tracking-wider bg-forest-200/80 text-forest-800 px-2 py-0.5 rounded-full font-bold">
                Gemini Vision
              </span>
            </h3>
            <p className="text-xs text-forest-800/80">
              Upload an image URL or enter a brief keyword (e.g. "Nike sneakers", "denim jacket"). AI will autofill category, condition, price, and description.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Quick hint (e.g. Nike Air Force 1, Levi's Jacket, CLRS Book)..."
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="input-field text-xs py-2 bg-white"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Original retail price (optional)"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="input-field text-xs py-2 bg-white"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 shadow-sm"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing product image & specs...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Generate Smart Listing</span>
            </>
          )}
        </button>

        {suggestion && (
          <button
            type="button"
            onClick={handleApply}
            className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply to Listing Form</span>
          </button>
        )}
      </div>

      {suggestion && (
        <div className="mt-4 p-4 rounded-xl bg-white border border-forest-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-fade-in">
          <div>
            <span className="text-muted-500 block text-[10px] uppercase font-bold">Suggested Title</span>
            <span className="font-semibold text-dark-900 truncate block">{suggestion.title}</span>
          </div>
          <div>
            <span className="text-muted-500 block text-[10px] uppercase font-bold">Category & Size</span>
            <span className="font-semibold text-dark-900">{suggestion.category} ({suggestion.size})</span>
          </div>
          <div>
            <span className="text-muted-500 block text-[10px] uppercase font-bold">Condition</span>
            <span className="font-semibold text-emerald-800">{suggestion.condition}</span>
          </div>
          <div>
            <span className="text-muted-500 block text-[10px] uppercase font-bold">Recommended Resale Price</span>
            <span className="font-bold text-forest-900 text-sm">
              {currency === 'INR' ? `₹${suggestion.suggestedPriceInr}` : `$${suggestion.suggestedPriceUsd}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiListingAssistant;

