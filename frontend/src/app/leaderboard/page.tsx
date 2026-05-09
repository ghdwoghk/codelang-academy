'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Zap, Crown } from 'lucide-react';
import { progressApi } from '@/lib/api';
import type { LeaderboardEntry } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const rankIcons = [Crown, Medal, Medal];
const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.getLeaderboard(100)
      .then((res) => setEntries(res.data.entries))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-dark-400 text-sm mt-1">Top coders by XP earned</p>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        {topThree.map((entry, i) => (
          <div
            key={entry.user_id}
            className={`card text-center w-48 ${
              i === 0 ? 'border-yellow-500/30 scale-105' : ''
            }`}
          >
            <div className="flex justify-center mb-2">
              {i < 3 ? (
                (() => { const Icon = rankIcons[i]; return <Icon className={`w-8 h-8 ${rankColors[i]}`} />; })()
              ) : (
                <span className="text-2xl font-bold text-dark-400">#{i + 1}</span>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">
              {entry.username[0].toUpperCase()}
            </div>
            <p className="text-white font-semibold truncate">{entry.username}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-dark-400 mt-1">
              <Zap className="w-3 h-3 text-yellow-400" /> {entry.xp} XP
            </div>
            <p className="text-xs text-dark-500">Level {entry.level}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700 text-left">
              <th className="px-4 py-3 text-xs font-medium text-dark-400 w-12">#</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400">User</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 text-right">Level</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 text-right">XP</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 text-right">Streak</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.user_id}
                className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-mono text-dark-400">
                  {i < 3 ? (
                    <span className={`text-lg ${rankColors[i]}`}>
                      {['🥇', '🥈', '🥉'][i]}
                    </span>
                  ) : (
                    `#${i + 1}`
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                      {entry.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{entry.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-dark-300 text-right">{entry.level}</td>
                <td className="px-4 py-3 text-sm text-yellow-400 text-right font-medium">{entry.xp.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className="flex items-center justify-end gap-1 text-orange-400">
                    <Flame className="w-3.5 h-3.5" /> {entry.streak}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
