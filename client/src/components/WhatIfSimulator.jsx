import React, { useState } from 'react';
import { Sliders, RotateCcw, Sparkles, HelpCircle, Check, ArrowRight } from 'lucide-react';

export const WhatIfSimulator = ({
  onSimulate,
  onReset,
  isSimulating,
  currentFilters,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [preferenceText, setPreferenceText] = useState('');
  const [wantedCategory, setWantedCategory] = useState('All');
  const [offeringCategory, setOfferingCategory] = useState('All');
  const [offeringTitle, setOfferingTitle] = useState('');
  const [customWeights, setCustomWeights] = useState({
    mutualPreference: 40,
    categoryCompatibility: 20,
    semanticSimilarity: 15,
    locationCompatibility: 10,
    priceCompatibility: 10,
    conditionCompatibility: 5,
  });

  const categories = ['All', 'Clothing', 'Shoes', 'Bags', 'Accessories', 'Books', 'Other'];

  const handleApply = (e) => {
    e?.preventDefault();
    onSimulate({
      simulatedPreferences: {
        preference: preferenceText,
        category: wantedCategory !== 'All' ? wantedCategory : undefined,
        offeringCategory: offeringCategory !== 'All' ? offeringCategory : undefined,
        offeringTitle: offeringTitle.trim() || undefined,
      },
      customWeights,
    });
  };

  const handleReset = () => {
    setPreferenceText('');
    setWantedCategory('All');
    setOfferingCategory('All');
    setOfferingTitle('');
    setCustomWeights({
      mutualPreference: 40,
      categoryCompatibility: 20,
      semanticSimilarity: 15,
      locationCompatibility: 10,
      priceCompatibility: 10,
      conditionCompatibility: 5,
    });
    onReset();
  };

  return (
    <div className="bg-white border border-border rounded-3xl p-6 sm:p-7 shadow-subtle mb-8 transition-all">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-forest-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-dark-900 font-editorial">
                Reciprocal "What-If" Swap Simulator
              </h3>
              {isSimulating && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                  Simulation Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-muted-600">
              Test dynamic preferences & algorithm weights without altering your public profile or saved listings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn-outline text-xs py-1.5 px-3.5"
        >
          {isOpen ? 'Hide Simulator' : 'Open Simulator & Weights'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleApply} className="mt-6 pt-6 border-t border-border space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-900 mb-1">
                What-If Wanted Category (What you want to receive)
              </label>
              <select
                value={wantedCategory}
                onChange={(e) => setWantedCategory(e.target.value)}
                className="select-field text-xs py-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-900 mb-1">
                Wanted Description / Preference Keywords
              </label>
              <input
                type="text"
                value={preferenceText}
                onChange={(e) => setPreferenceText(e.target.value)}
                placeholder="e.g. Nike Air Force sneakers, laptop backpack, or wool sweater"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-900 mb-1">
                What-If Offered Category (Simulate an item you could offer)
              </label>
              <select
                value={offeringCategory}
                onChange={(e) => setOfferingCategory(e.target.value)}
                className="select-field text-xs py-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-900 mb-1">
                Offered Item Name / Description (Optional)
              </label>
              <input
                type="text"
                value={offeringTitle}
                onChange={(e) => setOfferingTitle(e.target.value)}
                placeholder="e.g. Vintage Levi's denim trucker jacket or Patagonia fleece"
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          {/* Configurable Weights Accordion */}
          <div className="bg-ivory-50 border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-dark-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest-800" />
                <span>Adjust Dynamic Weighting Coefficients (Total: 100)</span>
              </span>
              <span className="text-xs font-semibold text-forest-800">
                Sum: {Object.values(customWeights).reduce((a, b) => a + b, 0)} pts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-[11px] text-muted-600 block mb-1 font-medium">
                  Mutual Pref ({customWeights.mutualPreference}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={customWeights.mutualPreference}
                  onChange={(e) => setCustomWeights({ ...customWeights, mutualPreference: Number(e.target.value) })}
                  className="w-full accent-forest-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-600 block mb-1 font-medium">
                  Category ({customWeights.categoryCompatibility}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={customWeights.categoryCompatibility}
                  onChange={(e) => setCustomWeights({ ...customWeights, categoryCompatibility: Number(e.target.value) })}
                  className="w-full accent-forest-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-600 block mb-1 font-medium">
                  Semantic ({customWeights.semanticSimilarity}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={customWeights.semanticSimilarity}
                  onChange={(e) => setCustomWeights({ ...customWeights, semanticSimilarity: Number(e.target.value) })}
                  className="w-full accent-forest-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-600 block mb-1 font-medium">
                  Location ({customWeights.locationCompatibility}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={customWeights.locationCompatibility}
                  onChange={(e) => setCustomWeights({ ...customWeights, locationCompatibility: Number(e.target.value) })}
                  className="w-full accent-forest-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-600 block mb-1 font-medium">
                  Price ({customWeights.priceCompatibility}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={customWeights.priceCompatibility}
                  onChange={(e) => setCustomWeights({ ...customWeights, priceCompatibility: Number(e.target.value) })}
                  className="w-full accent-forest-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-600 block mb-1 font-medium">
                  Condition ({customWeights.conditionCompatibility}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={customWeights.conditionCompatibility}
                  onChange={(e) => setCustomWeights({ ...customWeights, conditionCompatibility: Number(e.target.value) })}
                  className="w-full accent-forest-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recalculate Matches</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

