'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Trophy, Zap, TrendingUp, Clock, CheckCircle, Flame, ArrowRight,
} from 'lucide-react';
import { authApi, progressApi, coursesApi, lessonsApi } from '@/lib/api';
import type { User, UserStats, Course, Lesson } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    Promise.all([
      authApi.getMe(),
      progressApi.getStats(),
      coursesApi.list({}),
    ])
      .then(([userRes, statsRes, coursesRes]) => {
        setUser(userRes.data);
        setStats(statsRes.data);
        setCourses(coursesRes.data.courses);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!user || !stats) return null;

  const quickStats = [
    { label: 'Total XP', value: stats.total_xp, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Level', value: stats.level, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Streak', value: `${stats.streak} days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Completed', value: `${stats.completed_lessons}/${stats.total_lessons}`, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  const xpProgress = (stats.total_xp % 100);
  const nextLevelXp = 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-dark-400 mt-1">Continue where you left off</p>
        </div>
        <Link href="/courses" className="btn-primary">
          <BookOpen className="w-4 h-4" /> Browse Courses
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-dark-300">Level {user.level}</span>
          <span className="text-sm text-dark-400">{xpProgress}/{nextLevelXp} XP to next level</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-primary-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(xpProgress / nextLevelXp) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-dark-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Your Courses</h2>
          <div className="space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="card-hover flex items-center gap-4"
              >
                {course.icon && (
                  <img src={course.icon} alt="" className="w-10 h-10" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{course.title}</h3>
                  <p className="text-dark-400 text-sm">{course.lesson_count} lessons</p>
                </div>
                <span className={`badge-${course.difficulty}`}>{course.difficulty}</span>
                <ArrowRight className="w-4 h-4 text-dark-500" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/playground" className="card-hover flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Code Playground</p>
                <p className="text-xs text-dark-400">Try any language</p>
              </div>
            </Link>
            <Link href="/leaderboard" className="card-hover flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">Leaderboard</p>
                <p className="text-xs text-dark-400">Compete with others</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
