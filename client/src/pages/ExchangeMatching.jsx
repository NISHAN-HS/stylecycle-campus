import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Loader2,
  RefreshCw,
  Filter,
  Sliders,
  ShieldCheck,
  Heart,
  EyeOff,
  Send,
  BarChart3,
  Check,
  ChevronRight,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { featureApi } from '../api/featureApi';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import UserAvatar from '../components/UserAvatar';
import RequestModal from '../components/RequestModal';
import { MatchAnalysisModal } from '../components/MatchAnalysisModal';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import toast from 'react-hot-toast';

const ExchangeMatching = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // State
  const [data, setData] = useState({
    overview: {
      totalMatches: 0,
      highCompatibilityCount: 0,
      mutualMatchesCount: 0,
      averageCompatibility: 0,
    },
    mutualMatches: [],
    partialMatches: [],
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [filters, setFilters] = useState({
    minScore: 0,
    category: 'All',
    campus: 'All',
    condition: 'All',
    minPrice: '',
    maxPrice: '',
    minConfidence: 0,
  });
  const [sort, setSort] = useState('compatibility');
  const [showFilters, setShowFilters] = useState(false);

  // Active Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSimulationData, setActiveSimulationData] = useState(null);

  // Modals & User actions
  const [selectedMatchForAnalysis, setSelectedMatchForAnalysis] = useState(null);
  const [proposingSwapMatch, setProposingSwapMatch] = useState(null);
  const [savedMatchIds, setSavedMatchIds] = useState(new Set());
  const [hiddenMatchIds, setHiddenMatchIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('mutual'); // 'mutual' or 'partial'

  // Fetch initial matches & analytics
  const fetchMatches = async (customParams = null) => {
    try {
      setLoading(true);
      const queryParams = customParams || {
        ...filters,
        sort,
      };

      const [resMatches, resAnalytics] = await Promise.all([
        featureApi.getExchangeMatches(queryParams),
        featureApi.getExchangeAnalytics(),
      ]);

      if (resMatches?.data) {
        setData(resMatches.data);
      }
      if (resAnalytics?.data) {
        setAnalytics(resAnalytics.data);
      }
    } catch (err) {
      toast.error(err.message || 'Could not fetch exchange matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [sort]);

  const handleFilterApply = (e) => {
    e?.preventDefault();
    if (isSimulating && activeSimulationData) {
      handleSimulate({ ...activeSimulationData, filters });
    } else {
      fetchMatches({ ...filters, sort });
    }
  };

  const handleFilterReset = () => {
    const defaultFilters = {
      minScore: 0,
      category: 'All',
      campus: 'All',
      condition: 'All',
      minPrice: '',
      maxPrice: '',
      minConfidence: 0,
    };
    setFilters(defaultFilters);
    fetchMatches({ ...defaultFilters, sort });
  };

  const handleSimulate = async ({ simulatedPreferences, customWeights, filters: simFilters }) => {
    try {
      setLoading(true);
      setIsSimulating(true);
      setActiveSimulationData({ simulatedPreferences, customWeights });

      const res = await featureApi.simulateExchangeMatches({
        simulatedPreferences,
        customWeights,
        filters: simFilters || filters,
        sort,
      });

      if (res?.data) {
        setData(res.data);
        toast.success('Simulation active! Recalculated matches with what-if preferences.');
      }
    } catch (err) {
      toast.error(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActiveSimulationData(null);
    fetchMatches();
    toast.success('Reset to standard profile listings.');
  };

  const handleToggleSaveMatch = (id) => {
    setSavedMatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast('Removed from saved matches.', { icon: '🗑️' });
      } else {
        next.add(id);
        toast.success('Match saved to your swap wishlist!');
      }
      return next;
    });
  };

  const handleHideMatch = (id) => {
    setHiddenMatchIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast('Match hidden from recommendations.', { icon: '🙈' });
  };

  // Filter visible matches (excluding hidden)
  const currentList = activeTab === 'mutual' ? (data.mutualMatches || []) : (data.partialMatches || []);
  const visibleMatches = currentList.filter((m) => !hiddenMatchIds.has(m._id));

  const campuses = [
    'All',
    'RV College of Engineering (RVCE)',
    'PES University',
    'BMS College of Engineering (BMSCE)',
    'IISc Bangalore',
    'Presidency University',
  ];

  const categories = ['All', 'Clothing', 'Shoes', 'Bags', 'Accessories', 'Books', 'Other'];
  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>Explainable AI Reciprocal Match Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-dark-900 font-editorial">
            Smart Exchange Match Finder
          </h1>
          <p className="text-xs sm:text-sm text-muted-600 mt-1 max-w-2xl leading-relaxed">
            Multi-dimensional reciprocal algorithm with semantic vector embeddings. Evaluates bidirectional desire, campus proximity, valuation symmetry, and category compatibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Filters & Scoring'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchMatches()}
            disabled={loading}
            className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* AI Grounded Insights Banner */}
      <AIInsightsPanel analytics={analytics} />

      {/* What-If Simulator */}
      <WhatIfSimulator
        onSimulate={handleSimulate}
        onReset={handleResetSimulation}
        isSimulating={isSimulating}
        currentFilters={filters}
      />

      {/* Advanced Match Filters Drawer */}
      {showFilters && (
        <form onSubmit={handleFilterApply} className="bg-white border border-border rounded-3xl p-6 sm:p-7 shadow-subtle mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-dark-900 font-editorial flex items-center gap-2">
              <Filter className="w-4 h-4 text-forest-800" />
              <span>Filter Candidate Swaps</span>
            </h3>
            <span className="text-xs text-muted-500">Live MongoDB filter execution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-dark-900 mb-1">Product Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="select-field text-xs py-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-dark-900 mb-1">Campus Hub</label>
              <select
                value={filters.campus}
                onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
                className="select-field text-xs py-2"
              >
                {campuses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-dark-900 mb-1">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                className="select-field text-xs py-2"
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-dark-900 mb-1">
                Min Compatibility Score ({filters.minScore}%)
              </label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
                className="w-full accent-forest-800 mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleFilterReset}
              className="btn-outline text-xs py-2 px-4"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5"
            >
              Apply Filter Criteria
            </button>
          </div>
        </form>
      )}

      {/* 5. AI Match Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-500 block mb-1">
            Total Potential Matches
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-dark-900">
            {data.overview?.totalMatches || 0}
          </div>
          <span className="text-[11px] text-muted-500 mt-1 block">Across active campus wardrobe</span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700 block mb-1">
            Mutual Two-Way Swaps
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-forest-800">
            {data.overview?.mutualMatchesCount || 0}
          </div>
          <span className="text-[11px] text-muted-500 mt-1 block">Direction A ↔ Direction B satisfied</span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            High Compatibility (80%+)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-emerald-800">
            {data.overview?.highCompatibilityCount || 0}
          </div>
          <span className="text-[11px] text-muted-500 mt-1 block">Immediate swap recommendation</span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-900 block mb-1">
            Average Compatibility
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-editorial text-dark-900">
            {data.overview?.averageCompatibility || 0}%
          </div>
          <span className="text-[11px] text-muted-500 mt-1 block">Weighted 6-factor aggregate</span>
        </div>
      </div>

      {/* Tabs & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mutual')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'mutual'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white text-dark-900 border border-border hover:bg-ivory-100'
            }`}
          >
            Mutual Reciprocal Matches ({data.mutualMatches?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('partial')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'partial'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white text-dark-900 border border-border hover:bg-ivory-100'
            }`}
          >
            Partial / One-Way Matches ({data.partialMatches?.length || 0})
          </button>
        </div>

        {/* Sorting dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-600 font-medium">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="select-field text-xs py-1.5 px-3 w-auto"
          >
            <option value="compatibility">Highest Compatibility Score</option>
            <option value="newest">Newest Peer Listing</option>
            <option value="price">Valuation Symmetry Parity</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-500">
          <Loader2 className="w-9 h-9 animate-spin text-forest-800 mb-3" />
          <p className="text-sm font-medium text-dark-900">Computing reciprocal embeddings across campus peers...</p>
          <p className="text-xs text-muted-500 mt-1">Analyzing bidirectional desire, campus proximity, and price parity.</p>
        </div>
      ) : visibleMatches.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-12 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-dark-900 font-editorial mb-1">
            {activeTab === 'mutual' ? 'No Two-Way Mutual Matches Found' : 'No Partial Matches Available'}
          </h3>
          <p className="text-xs text-muted-600 mb-6 leading-relaxed">
            {activeTab === 'mutual'
              ? 'Try relaxing your filter criteria or use the What-If Simulator above to explore matches for items you plan to list.'
              : 'All active listings have strong reciprocal alignment with your active closet!'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={handleFilterReset} className="btn-outline text-xs py-2 px-4">
              Clear All Filters
            </button>
            <Link to="/sell" className="btn-primary text-xs py-2 px-5">
              List an Exchange Item
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleMatches.map((match) => {
            const isSaved = savedMatchIds.has(match._id);
            const { factorScores, explanation, matchedListing, myListing, matchScore, confidenceLevel, confidenceScore } = match;

            return (
              <div
                key={match._id}
                className="bg-white border border-border hover:border-forest-700/40 rounded-3xl p-6 sm:p-8 shadow-card transition-all"
              >
                {/* Match Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="w-14 h-14 rounded-2xl bg-forest-800 text-white flex flex-col items-center justify-center font-bold text-lg shadow-sm">
                      <span>{matchScore}%</span>
                      <span className="text-[9px] font-normal uppercase tracking-wider text-forest-200">Match</span>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider block ${
                          match.isMutualMatch ? 'text-forest-800' : 'text-amber-800'
                        }`}>
                          {match.isMutualMatch ? 'Mutual Two-Way Exchange' : 'Partial / Single-Direction Swap'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          confidenceLevel === 'High' ? 'bg-forest-100 text-forest-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {confidenceLevel} Confidence ({confidenceScore}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-600">
                        <span>Offered by:</span>
                        <span className="font-semibold text-dark-900">{matchedListing.seller?.name || 'Campus Student'}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-forest-700" />
                          <span>{matchedListing.seller?.college || 'Bangalore Campus'}</span>
                        </span>
                        {matchedListing.seller?.isVerifiedStudent && (
                          <span className="inline-flex items-center gap-1 text-forest-800 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Save & Hide */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSaveMatch(match._id)}
                      className={`btn-ghost text-xs p-2 rounded-full border ${
                        isSaved ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-border text-muted-600'
                      }`}
                      title={isSaved ? 'Saved to swap list' : 'Save this match'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHideMatch(match._id)}
                      className="btn-ghost text-xs p-2 rounded-full border border-border text-muted-600 hover:text-rose-700"
                      title="Not interested (hide match)"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 5. Product Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center">
                  {/* Your Item */}
                  <div className="bg-ivory-50 border border-border rounded-2xl p-4 flex gap-4">
                    <img
                      src={myListing.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80'}
                      alt={myListing.title}
                      className="w-24 h-24 object-cover rounded-xl border border-border flex-shrink-0"
                    />
                    <div className="text-xs flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full inline-block mb-1">
                        You Offer
                      </span>
                      <h4 className="font-bold text-dark-900 truncate text-sm" title={myListing.title}>
                        {myListing.title}
                      </h4>
                      <p className="text-muted-500 mt-0.5">
                        {myListing.category} • Size: {myListing.size || 'N/A'} • {myListing.condition}
                      </p>
                      <p className="text-forest-900 font-semibold mt-1">
                        Estimated Value: {formatPrice(myListing.price || 15)}
                      </p>
                      <div className="mt-2 text-[11px] text-muted-600 line-clamp-1">
                        <strong>Your Desired Item:</strong> {myListing.exchangePreference || 'Open to all reasonable swaps'}
                      </div>
                    </div>
                  </div>

                  {/* Their Item */}
                  <div className="bg-forest-50/50 border border-forest-100 rounded-2xl p-4 flex gap-4">
                    <img
                      src={matchedListing.images?.[0] || 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=400&q=80'}
                      alt={matchedListing.title}
                      className="w-24 h-24 object-cover rounded-xl border border-border flex-shrink-0"
                    />
                    <div className="text-xs flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-forest-800 bg-white border border-forest-200 px-2 py-0.5 rounded-full inline-block mb-1">
                          You Receive
                        </span>
                        <Link
                          to={`/listing/${matchedListing._id}`}
                          className="text-forest-800 hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <h4 className="font-bold text-dark-900 truncate text-sm" title={matchedListing.title}>
                        {matchedListing.title}
                      </h4>
                      <p className="text-muted-500 mt-0.5">
                        {matchedListing.category} • Size: {matchedListing.size || 'N/A'} • {matchedListing.condition}
                      </p>
                      <p className="text-forest-900 font-semibold mt-1">
                        Estimated Value: {formatPrice(matchedListing.price || 15)}
                      </p>
                      <div className="mt-2 text-[11px] text-muted-600 line-clamp-1">
                        <strong>Peer Seeks:</strong> {matchedListing.exchangePreference || 'Open to campus circular swaps'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Compatibility Progress Bars (Top 3 Key Drivers) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-ivory-50/60 p-3.5 rounded-2xl border border-border">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-dark-900 mb-1">
                      <span>Mutual Preference</span>
                      <span className="font-bold text-forest-800">
                        {factorScores.mutualPreference.score} / {factorScores.mutualPreference.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-forest-800 h-full rounded-full"
                        style={{ width: `${(factorScores.mutualPreference.score / factorScores.mutualPreference.max) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-dark-900 mb-1">
                      <span>Semantic Similarity</span>
                      <span className="font-bold text-forest-800">
                        {factorScores.semanticSimilarity.score} / {factorScores.semanticSimilarity.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-forest-800 h-full rounded-full"
                        style={{ width: `${(factorScores.semanticSimilarity.score / factorScores.semanticSimilarity.max) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-dark-900 mb-1">
                      <span>Valuation Parity</span>
                      <span className="font-bold text-forest-800">
                        {factorScores.priceCompatibility.score} / {factorScores.priceCompatibility.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-forest-800 h-full rounded-full"
                        style={{ width: `${(factorScores.priceCompatibility.score / factorScores.priceCompatibility.max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. AI Explanation Panel Preview */}
                <div className="bg-forest-50/60 border border-forest-100 rounded-2xl p-4 text-xs mb-6">
                  <div className="flex items-center gap-2 mb-2 font-bold text-forest-900">
                    <Sparkles className="w-4 h-4 text-forest-700" />
                    <span>Explainable Recommendation Rationale:</span>
                  </div>
                  <ul className="space-y-1 text-forest-950">
                    {explanation.reasons?.map((reason, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="text-forest-600 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedMatchForAnalysis(match)}
                    className="btn-outline text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-forest-800" />
                    <span>View Full 6-Factor Analysis</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleHideMatch(match._id)}
                      className="btn-ghost text-xs py-2 px-3 text-muted-600 hover:text-dark-900"
                    >
                      Not Interested
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSaveMatch(match._id)}
                      className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'text-rose-600 fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save Match'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposingSwapMatch(match)}
                      className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Propose Swap</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full 6-Factor Explainability Modal */}
      <MatchAnalysisModal
        isOpen={!!selectedMatchForAnalysis}
        match={selectedMatchForAnalysis}
        onClose={() => setSelectedMatchForAnalysis(null)}
        onProposeSwap={(m) => setProposingSwapMatch(m)}
      />

      {/* Propose Swap Request Modal */}
      {proposingSwapMatch && (
        <RequestModal
          listing={proposingSwapMatch.matchedListing}
          initialType="exchange"
          isOpen={!!proposingSwapMatch}
          onClose={() => setProposingSwapMatch(null)}
          onSuccess={() => {
            setProposingSwapMatch(null);
            toast.success('Swap proposal transmitted to student peer!');
            fetchMatches();
          }}
        />
      )}
    </div>
  );
};

export default ExchangeMatching;
