'use client';

import { Zap } from 'lucide-react';

interface XPBarProps {
  xp: number;
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function XPBar({ xp, level, size = 'md' }: XPBarProps) {
  const xpInLevel = xp % 100;
  const percentage = (xpInLevel / 100) * 100;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div>
      <div className={`flex items-center justify-between mb-1 ${textSizes[size]}`}>
        <span className="text-dark-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-yellow-400" /> Level {level}
        </span>
        <span className="text-dark-400">{xpInLevel}/100 XP</span>
      </div>
      <div className={`w-full bg-dark-700 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, height: '100%' }}
        />
      </div>
    </div>
  );
}
