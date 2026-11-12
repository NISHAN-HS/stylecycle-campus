import React, { useEffect, useState } from 'react';
import { Leaf, Droplets, Wind, Sparkles, Award, Trophy, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { featureApi } from '../api/featureApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const SustainabilityDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await featureApi.getSustainabilityMetrics();
        if (res && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Impact Header */}
      <div className="relative overflow-hidden rounded-3xl bg-forest-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-emerald-300 text-xs font-semibold mb-4 border border-forest-700">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campus Circular Fashion & Textile Waste Reduction</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-editorial tracking-tight">
            Sustainability Impact & Campus Leaderboard
          </h1>
          <p className="text-forest-200 text-xs sm:text-sm mt-3 leading-relaxed">
            Every garment, backpack, or textbook passed on through STYLECYCLE keeps valuable materials out of landfills and reduces freshwater consumption. Below are verified campus ecological savings based on peer circular reuse.
          </p>
        </div>
      </div>

      {/* 4 Environmental KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-border p-6 rounded-3xl shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs uppercase font-bold text-muted-500 tracking-wider">
            Total Items Reused
          </span>
          <p className="text-3xl font-extrabold text-dark-900 mt-1 font-editorial">
            {data?.itemsReused?.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-muted-600 mt-2">
            Campus pre-loved items successfully circulating
          </p>
        </div>

        <div className="bg-white border border-border p-6 rounded-3xl shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-forest-700" />
          </div>
          <span className="text-xs uppercase font-bold text-muted-500 tracking-wider">
            Textile Waste Avoided
          </span>
          <p className="text-3xl font-extrabold text-forest-900 mt-1 font-editorial">
            {data?.textileWasteAvoidedKg?.toLocaleString() || 0} kg
          </p>
          <p className="text-[11px] text-muted-600 mt-2">
            Fabrics prevented from entering local municipal waste
          </p>
        </div>

        <div className="bg-white border border-border p-6 rounded-3xl shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs uppercase font-bold text-muted-500 tracking-wider">
            Freshwater Saved
          </span>
          <p className="text-3xl font-extrabold text-blue-900 mt-1 font-editorial">
            {data?.waterSavedLiters?.toLocaleString() || 0} L
          </p>
          <p className="text-[11px] text-muted-600 mt-2">
            Equivalent to thousands of daily student water cycles
          </p>
        </div>

        <div className="bg-white border border-border p-6 rounded-3xl shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
            <Wind className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-xs uppercase font-bold text-muted-500 tracking-wider">
            CO₂ Emissions Avoided
          </span>
          <p className="text-3xl font-extrabold text-amber-900 mt-1 font-editorial">
            {data?.co2AvoidedKg?.toLocaleString() || 0} kg
          </p>
          <p className="text-[11px] text-muted-600 mt-2">
            Supply chain and fast-fashion production footprint saved
          </p>
        </div>
      </div>

      {/* Gamification & Leaderboard Table */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-900 font-editorial">
                Campus Sustainability Leaderboard
              </h2>
              <p className="text-xs text-muted-500">
                Top student changemakers recognized for eco-positive swaps and secondhand exchanges
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-forest-50 text-forest-800 border border-forest-100">
            Monthly Eco Challenge: Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Campus / College</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Badges & Honors</th>
                <th className="py-3 px-4 text-right">Eco Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.leaderboard?.map((s, idx) => (
                <tr key={s._id} className="hover:bg-ivory-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-dark-900">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={s.name}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                      <div>
                        <div className="font-semibold text-dark-900 flex items-center gap-1.5">
                          {s.name}
                          {s.isVerifiedStudent && (
                            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" title="Verified Campus Student" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-600 font-medium">
                    {s.college}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      {s.reputationScore || 90}/100
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(s.badges || ['Eco Champion']).map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 rounded-md bg-ivory-100 border border-border text-[10px] font-semibold text-dark-800"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-forest-900 text-sm">
                    {s.sustainabilityPoints || 50} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;

