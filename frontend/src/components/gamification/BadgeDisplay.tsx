'use client';

interface BadgeDisplayProps {
  name: string;
  description: string;
  icon: string;
  earned?: boolean;
}

export default function BadgeDisplay({ name, description, icon, earned = true }: BadgeDisplayProps) {
  return (
    <div className={`text-center p-3 rounded-lg transition-all ${
      earned ? 'bg-dark-700/50 hover:bg-dark-700' : 'bg-dark-800 opacity-40'
    }`}>
      <div className={`text-2xl mb-1 ${earned ? '' : 'grayscale'}`}>{icon}</div>
      <p className={`text-xs font-medium ${earned ? 'text-white' : 'text-dark-500'}`}>{name}</p>
      {earned && (
        <p className="text-[10px] text-dark-400 mt-0.5">{description}</p>
      )}
    </div>
  );
}
