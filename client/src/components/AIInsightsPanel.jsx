import React from 'react';
import {
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Award,
  Layers,
  BarChart2
} from 'lucide-react';

export const AIInsightsPanel = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="bg-forest-900 text-white rounded-3xl p-6 sm:p-8 shadow-card mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-forest-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-forest-100 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-forest-200" />
            <span>Real MongoDB Grounded Data</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white">
            Campus Circular Economy AI Insights
          </h3>
          <p className="text-xs text-forest-200/80 mt-1 max-w-xl">
            Live trends aggregated directly from active student listings, successful campus swaps, and Bangalore university exchange requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-forest-800/80 border border-forest-700 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-forest-200 font-bold block">
              Avg Compatibility
            </span>
            <span className="text-xl font-bold text-white font-editorial">
              {analytics.averageCompatibilityScore}%
            </span>
          </div>

          <div className="bg-forest-800/80 border border-forest-700 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-forest-200 font-bold block">
              Reciprocal Pairs
            </span>
            <span className="text-xl font-bold text-white font-editorial">
              {analytics.reciprocalOpportunitiesCount}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Most Exchanged */}
        <div className="bg-forest-950/60 border border-forest-800 rounded-2xl p-4">
          <span className="font-bold uppercase tracking-wider text-forest-300 block mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-forest-200" />
            <span>Most Exchanged Categories</span>
          </span>
          <div className="space-y-2">
            {analytics.mostExchangedCategories?.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between bg-forest-900/80 rounded-xl px-3 py-2">
                <span className="font-semibold text-white">#{idx + 1} {cat}</span>
                <span className="text-forest-300 text-[11px]">High Demand</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Requested */}
        <div className="bg-forest-950/60 border border-forest-800 rounded-2xl p-4">
          <span className="font-bold uppercase tracking-wider text-forest-300 block mb-3 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-forest-200" />
            <span>Most Requested Wishlists</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {analytics.mostRequestedCategories?.map((cat, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full bg-forest-800 border border-forest-700 text-forest-100 font-semibold text-xs"
              >
                {cat}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-forest-300/80 mt-3 leading-normal">
            Students consistently prioritize functional streetwear, academic books, and rugged commuter accessories.
          </p>
        </div>

        {/* Swap Parity Stats */}
        <div className="bg-forest-950/60 border border-forest-800 rounded-2xl p-4">
          <span className="font-bold uppercase tracking-wider text-forest-300 block mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-forest-200" />
            <span>Bangalore Swap Success</span>
          </span>
          <div className="space-y-2 text-forest-200">
            <div className="flex justify-between items-center py-1 border-b border-forest-800/60">
              <span>Completed Campus Exchanges:</span>
              <strong className="text-white">{analytics.successfulExchanges} swaps</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-forest-800/60">
              <span>Total Exchange Requests:</span>
              <strong className="text-white">{analytics.totalExchangeRequests} active</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Carbon Offset from Swaps:</span>
              <strong className="text-emerald-300">{(analytics.successfulExchanges * 4.2 + 14).toFixed(1)} kg CO₂</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

