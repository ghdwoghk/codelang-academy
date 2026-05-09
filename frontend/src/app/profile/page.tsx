'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Trophy, Flame, BadgeCheck, BookOpen, TrendingUp,
} from 'lucide-react';
import { authApi, progressApi } from '@/lib/api';
import type { User, UserStats } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    Promise.all([
      authApi.getMe(),
      progressApi.getStats(),
      progressApi.getBadges().catch(() => ({ data: [] })),
    ])
      .then(([userRes, statsRes, badgesRes]) => {
        setUser(userRes.data);
        setStats(statsRes.data);
        setBadges(badgesRes.data);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!user || !stats) return null;

  const xpProgress = stats.total_xp % 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            <p className="text-dark-400">{user.email}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-dark-300">
                <TrendingUp className="w-4 h-4 text-primary-400" /> Level {stats.level}
              </span>
              <span className="flex items-center gap-1 text-dark-300">
                <Zap className="w-4 h-4 text-yellow-400" /> {stats.total_xp} XP
              </span>
              <span className="flex items-center gap-1 text-dark-300">
                <Flame className="w-4 h-4 text-orange-400" /> {stats.streak} day streak
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Level Progress</span>
            <span className="text-sm text-dark-400">{xpProgress}/100 XP</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Completed', value: stats.completed_lessons, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Total Lessons', value: stats.total_lessons, icon: BookOpen, color: 'text-green-400' },
          { label: 'Completion', value: `${stats.completion_percentage}%`, icon: Trophy, color: 'text-yellow-400' },
          { label: 'Badges', value: badges.length, icon: BadgeCheck, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <BadgeCheck className="w-5 h-5 text-primary-400" /> Badges ({badges.length})
        </h2>
        {badges.length === 0 ? (
          <p className="text-dark-500 text-sm text-center py-6">
            No badges yet. Complete lessons and challenges to earn badges!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge: any) => (
              <div key={badge.id} className="text-center p-4 rounded-lg bg-dark-700/50">
                <div className="text-3xl mb-2">{badge.icon_url}</div>
                <p className="text-sm font-medium text-white">{badge.name}</p>
                <p className="text-xs text-dark-400 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
