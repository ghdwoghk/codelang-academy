'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, X, Terminal, BookOpen, Trophy, User as UserIcon, LogOut, ChevronDown,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/playground', label: 'Playground', icon: Terminal },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="bg-dark-900/80 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Terminal className="w-7 h-7 text-primary-400" />
            <span className="text-xl font-bold text-white">
              Code<span className="text-primary-400">Lang</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-dark-300 hover:text-white transition-colors text-sm font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white leading-tight">{user.username}</p>
                    <p className="text-xs text-dark-400">Lvl {user.level}  {user.xp}XP</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-dark-400" />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-20 py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-dark-700 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-dark-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-dark-700 bg-dark-900 animate-fade-in">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserIcon className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-dark-700 text-sm w-full"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="btn-ghost flex-1 text-center text-sm">Login</Link>
                <Link href="/register" className="btn-primary flex-1 text-center text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
