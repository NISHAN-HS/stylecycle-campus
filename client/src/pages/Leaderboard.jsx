import React, { useEffect, useState, useRef } from 'react';
import { Trophy, ShieldCheck, Flame, RefreshCw, Sparkles, Medal } from 'lucide-react';
import { io } from 'socket.io-client';
import { featureApi } from '../api/featureApi';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import LoadingSpinner from '../components/LoadingSpinner';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const socketRef = useRef(null);

  const fetchLeaderboard = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await featureApi.getSustainabilityMetrics();
      if (res && res.data && res.data.leaderboard) {
        setLeaderboard(res.data.leaderboard);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Setup Socket.IO for real-time live rank updates
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5001';

    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    // Listen for real-time ranking and transaction updates
    socketRef.current.on('leaderboard_update', () => {
      fetchLeaderboard(true);
    });

    // Also poll every 10 seconds for real-time synchronization
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading live campus leaderboard..." />
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Live Campus Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 font-editorial">
            Campus Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-600 mt-1">
            Real-time standings for campus students based on successful exchanges, trust scores, and community activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-500 hidden sm:inline">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={() => fetchLeaderboard(false)}
            className="btn-outline text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-end">
          {/* #2 Rank */}
          <div className="bg-white border border-border rounded-3xl p-6 text-center shadow-card relative order-2 md:order-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-dark-900 font-bold text-xs flex items-center justify-center mb-3">
              🥈 2
            </div>
            <UserAvatar name={topThree[1].name} avatar={topThree[1].avatar} size="lg" className="mb-3" />
            <h3 className="font-bold text-dark-900 text-sm truncate">{topThree[1].name}</h3>
            <p className="text-xs text-muted-500 truncate">{topThree[1].college}</p>
            <div className="mt-3 py-1.5 px-3 bg-ivory-100 rounded-xl inline-block">
              <span className="text-sm font-extrabold text-forest-900">{topThree[1].sustainabilityPoints || 50} pts</span>
            </div>
          </div>

          {/* #1 Rank (Center, Elevated) */}
          <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-7 text-center shadow-lg relative order-1 md:order-2 transform md:-translate-y-4 flex flex-col items-center">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-xs shadow-sm flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> #1 Champion
            </div>
            <UserAvatar name={topThree[0].name} avatar={topThree[0].avatar} size="xl" className="mb-3 border-2 border-amber-400" />
            <h3 className="font-bold text-dark-900 text-base truncate">{topThree[0].name}</h3>
            <p className="text-xs text-muted-600 truncate">{topThree[0].college}</p>
            <div className="mt-3 py-2 px-4 bg-amber-100/70 border border-amber-200 rounded-2xl inline-block">
              <span className="text-base font-extrabold text-amber-900">{topThree[0].sustainabilityPoints || 50} pts</span>
            </div>
          </div>

          {/* #3 Rank */}
          <div className="bg-white border border-border rounded-3xl p-6 text-center shadow-card relative order-3 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center mb-3">
              🥉 3
            </div>
            <UserAvatar name={topThree[2].name} avatar={topThree[2].avatar} size="lg" className="mb-3" />
            <h3 className="font-bold text-dark-900 text-sm truncate">{topThree[2].name}</h3>
            <p className="text-xs text-muted-500 truncate">{topThree[2].college}</p>
            <div className="mt-3 py-1.5 px-3 bg-ivory-100 rounded-xl inline-block">
              <span className="text-sm font-extrabold text-forest-900">{topThree[2].sustainabilityPoints || 50} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="bg-white border border-border rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-ivory-50/80 border-b border-border text-muted-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Rank</th>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">College / Campus</th>
                <th className="py-3.5 px-5">Trust Score</th>
                <th className="py-3.5 px-5">Badges</th>
                <th className="py-3.5 px-5 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard.map((student, idx) => {
                const isCurrentUser = user?._id === student._id;
                return (
                  <tr
                    key={student._id}
                    className={`transition-colors ${
                      isCurrentUser ? 'bg-forest-50/70 font-semibold' : 'hover:bg-ivory-50'
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-dark-900">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={student.name} avatar={student.avatar} size="xs" />
                        <div className="min-w-0">
                          <span className="font-semibold text-dark-900 flex items-center gap-1.5 truncate">
                            {student.name}
                            {isCurrentUser && (
                              <span className="text-[10px] bg-forest-800 text-white px-1.5 py-0.2 rounded font-bold">
                                You
                              </span>
                            )}
                            {student.isVerifiedStudent && (
                              <ShieldCheck className="w-3.5 h-3.5 text-forest-700 shrink-0" title="Verified Campus Student" />
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-muted-600 font-medium truncate max-w-[180px]">
                      {student.college}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {student.reputationScore || 85}/100
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1">
                        {(student.badges || ['Active Campus Member']).slice(0, 2).map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-2 py-0.5 rounded-md bg-ivory-100 border border-border text-[10px] font-semibold text-dark-800"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-extrabold text-forest-900 text-sm">
                      {student.sustainabilityPoints || 50} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

