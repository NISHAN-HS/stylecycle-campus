import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Sparkles, CheckCircle2, MapPin, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { featureApi } from '../api/featureApi';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

const ExchangeMatching = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await featureApi.getExchangeMatches();
      if (res && res.data) {
        setMatches(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Could not fetch exchange matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Automated Matchmaking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-dark-900 font-editorial">
            Smart Exchange Match Finder
          </h1>
          <p className="text-xs sm:text-sm text-muted-600 mt-1 max-w-2xl">
            Our algorithm scans students' wanted exchange lists against your wardrobe. When two students want what each other has, STYLECYCLE generates a direct match!
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMatches}
          disabled={loading}
          className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Matches</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-500">
          <Loader2 className="w-8 h-8 animate-spin text-forest-800 mb-3" />
          <p className="text-xs font-medium">Scanning peer closets for two-way swap compatibilities...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-12 text-center max-w-xl mx-auto shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-dark-900 font-editorial mb-1">
            No Active Pair Matches Found Yet
          </h3>
          <p className="text-xs text-muted-600 mb-6 leading-relaxed">
            To get automated exchange recommendations, make sure you have listed at least one item marked <strong>"For Exchange"</strong> with your desired item specified in the exchange preference!
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/sell" className="btn-primary text-xs py-2.5 px-5">
              List an Exchange Item
            </Link>
            <Link to="/marketplace?listingType=For+Exchange" className="btn-outline text-xs py-2.5 px-5">
              Browse All Exchange Items
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, idx) => (
            <div
              key={idx}
              className="bg-white border border-border hover:border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-card transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-base shadow-sm">
                    {match.matchScore}%
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                      High Compatibility Match
                    </span>
                    <span className="text-xs text-muted-500">
                      Mutual swap interests detected across campus
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {match.reasons.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-ivory-100 border border-border text-dark-800"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* The Two Sides of the Exchange */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
                {/* Your item */}
                <div className="p-4 rounded-2xl bg-ivory-50 border border-border/80 flex items-center gap-4">
                  <img
                    src={match.myListing.image || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=300&q=80'}
                    alt={match.myListing.title}
                    className="w-20 h-20 rounded-xl object-cover border border-border"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-500 block">
                      You Give (Your Item)
                    </span>
                    <h4 className="text-sm font-bold text-dark-900 truncate mt-0.5">
                      {match.myListing.title}
                    </h4>
                    <p className="text-xs text-muted-600 mt-1 truncate">
                      Looking for: <span className="font-semibold text-emerald-800">{match.myListing.exchangePreference || 'Any suitable clothing/tech'}</span>
                    </p>
                  </div>
                </div>

                {/* Their item */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={match.matchedListing.images?.[0] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80'}
                      alt={match.matchedListing.title}
                      className="w-20 h-20 rounded-xl object-cover border border-emerald-200"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        You Receive (From {match.matchedListing.seller?.name})
                      </span>
                      <h4 className="text-sm font-bold text-dark-900 truncate mt-0.5">
                        {match.matchedListing.title}
                      </h4>
                      <p className="text-xs text-muted-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-400" />
                        <span>{match.matchedListing.seller?.college}</span>
                        {match.matchedListing.seller?.isVerifiedStudent && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-forest-100 text-forest-800 rounded font-bold">
                            Verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/listings/${match.matchedListing._id}`}
                    className="btn-primary text-xs py-2 px-3.5 shrink-0 inline-flex items-center gap-1.5"
                  >
                    <span>Propose Swap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExchangeMatching;

