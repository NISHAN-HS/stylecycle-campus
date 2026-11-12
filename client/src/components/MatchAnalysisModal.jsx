import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Heart,
  EyeOff,
  Send,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Check,
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import UserAvatar from '../components/UserAvatar';
import RequestModal from '../components/RequestModal';
import toast from 'react-hot-toast';

export const MatchAnalysisModal = ({ match, isOpen, onClose, onProposeSwap }) => {
  if (!isOpen || !match) return null;
  const { factorScores, explanation, weights, confidenceScore, confidenceLevel, matchScore } = match;

  const factorDefs = [
    { key: 'mutualPreference', name: 'Mutual Preference Match', desc: 'Evaluates bidirectional desire: You want their item AND they want yours.' },
    { key: 'categoryCompatibility', name: 'Category Compatibility', desc: 'Item taxonomy similarity and complementary wardrobe pairings.' },
    { key: 'semanticSimilarity', name: 'Semantic Description Similarity', desc: 'Vector embedding similarity between descriptions & styling preferences.' },
    { key: 'locationCompatibility', name: 'Location & Campus Proximity', desc: 'Physical proximity across Bangalore university meetup hubs.' },
    { key: 'priceCompatibility', name: 'Item Valuation Symmetry', desc: 'Fair exchange price parity calculation.' },
    { key: 'conditionCompatibility', name: 'Condition Match', desc: 'Consistency between item wear tiers (New / Like New / Good).' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-ivory-50 border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {matchScore}%
            </div>
            <div>
              <h3 className="text-xl font-bold text-dark-900 font-editorial">
                Explainable AI Match Breakdown
              </h3>
              <p className="text-xs text-muted-600">
                Transparent multi-factor audit powered by semantic vector embeddings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 text-dark-900 flex items-center justify-center text-sm font-semibold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Confidence Banner */}
        <div className="bg-white border border-forest-100 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-subtle">
          <ShieldCheck className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-dark-900">Confidence Level:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                confidenceLevel === 'High' ? 'bg-forest-100 text-forest-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {confidenceLevel} ({confidenceScore}%)
              </span>
            </div>
            <p className="text-muted-600 mt-1 leading-relaxed">
              {explanation.confidenceCalculation}
            </p>
          </div>
        </div>

        {/* 6 Transparent Factors */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-600 mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-forest-800" />
            <span>Dynamic Weighted Scoring Criteria (100 Pts Total)</span>
          </h4>
          <div className="space-y-3">
            {factorDefs.map((factor) => {
              const current = factorScores?.[factor.key] || { score: 0, max: 20 };
              const percent = Math.round((current.score / current.max) * 100);
              return (
                <div key={factor.key} className="bg-white border border-border rounded-xl p-3 shadow-subtle">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-dark-900">{factor.name}</span>
                    <span className="font-bold text-forest-800">
                      {current.score} / {current.max} pts ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-forest-800 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-500 leading-normal">{factor.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Explanation Lists */}
        <div className="space-y-4 text-xs mb-6">
          {explanation.matchedPreferences?.length > 0 && (
            <div className="bg-forest-50/70 border border-forest-100 rounded-2xl p-4">
              <h5 className="font-bold text-forest-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>Matched Preferences</span>
              </h5>
              <ul className="space-y-1.5 text-forest-950">
                {explanation.matchedPreferences.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-forest-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation.unmatchedPreferences?.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Unmatched / Open Preferences</span>
              </h5>
              <ul className="space-y-1.5 text-amber-950">
                {explanation.unmatchedPreferences.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation.potentialConcerns?.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
              <h5 className="font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>Potential Swap Considerations</span>
              </h5>
              <ul className="space-y-1.5 text-rose-950">
                {explanation.potentialConcerns.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation.missingInformation?.length > 0 && (
            <div className="bg-ivory-200/80 border border-border rounded-2xl p-4">
              <h5 className="font-bold text-dark-900 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-muted-600" />
                <span>Information Gaps (Handled Safely)</span>
              </h5>
              <ul className="space-y-1.5 text-muted-600">
                {explanation.missingInformation.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="btn-outline text-xs py-2 px-4"
          >
            Close Analysis
          </button>
          <button
            onClick={() => {
              onClose();
              onProposeSwap(match);
            }}
            className="btn-primary text-xs py-2 px-5"
          >
            Propose Swap Now
          </button>
        </div>
      </div>
    </div>
  );
};

