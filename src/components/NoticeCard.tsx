import React from 'react';
import { useGame } from '../context/GameContext';
import { Megaphone } from 'lucide-react';

export const NoticeCard: React.FC = () => {
  const { notices } = useGame();
  
  // Filter active notices
  const activeNotices = notices.filter(n => n.active);

  if (activeNotices.length === 0) return null;

  return (
    <div id="notice-board-card" className="bg-zinc-950 border border-amber-500/20 p-4 rounded-xl shadow-xl mb-8 overflow-hidden relative">
      {/* Glow corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center gap-4">
        {/* Left emblem Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <Megaphone className="w-5 h-5" />
        </div>

        {/* Scrolling notices marquee */}
        <div className="flex-1 overflow-hidden pointer-events-none">
          <div className="text-xs font-mono text-amber-400/60 uppercase tracking-widest font-bold mb-1">
            Official Bulletin / System Announcements
          </div>
          
          <div className="relative w-full h-8 overflow-hidden">
            <div className="absolute flex flex-col space-y-1 animate-[slideUp_15s_infinite_ease-in-out]">
              {activeNotices.map((notice, id) => (
                <div key={notice.id || id} className="text-sm text-neutral-200 font-serif line-clamp-1 py-1">
                  {notice.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
