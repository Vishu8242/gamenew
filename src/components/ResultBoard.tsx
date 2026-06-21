import React from 'react';
import { useGame } from '../context/GameContext';
import { Clock, PlayCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ResultBoard: React.FC = () => {
  const { markets, recentResults } = useGame();
  const navigate = useNavigate();

  // Helper to find today's result for a specific market
  const getMarketResultString = (marketName: string): { displayText: string; winNo: string } => {
    const marketResultObj = recentResults.find(
      r => r.marketName.toUpperCase() === marketName.toUpperCase()
    );
    
    if (!marketResultObj) {
      return { displayText: '--- - -- - ---', winNo: 'PENDING' };
    }

    return {
      displayText: marketResultObj.finalResult || `${marketResultObj.openPanel || '???'}-${marketResultObj.jodi || '??'}-${marketResultObj.closePanel || '???'}`,
      winNo: marketResultObj.jodi || 'PENDING'
    };
  };

  return (
    <div id="results-dashboard-grid" className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Game Markets & Live Entries
        </h3>
        <p className="text-neutral-400 text-xs font-mono">
          Total Rooms: {markets.length}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {markets.map((market) => {
          const { displayText, winNo } = getMarketResultString(market.marketName);
          const isClosed = market.status === 'closed';

          return (
            <div 
              key={market.id} 
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                isClosed 
                  ? 'bg-zinc-950/40 border-neutral-800 opacity-70' 
                  : 'bg-gradient-to-b from-zinc-900 to-black border-amber-500/20 hover:border-amber-400/50 shadow-lg shadow-amber-500/[0.02]'
              }`}
            >
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none"></div>

              {/* Status Ribbon */}
              <span className={`absolute top-4 right-4 px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded-full ${
                isClosed 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse'
              }`}>
                {market.status}
              </span>

              {/* Title Header */}
              <h4 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500 uppercase tracking-wider mb-1">
                {market.marketName}
              </h4>

              {/* Time displays */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500/60" />
                <span>{market.openTime}</span>
                <span className="text-neutral-600">|</span>
                <span>{market.closeTime}</span>
              </div>

              {/* Live Numbers Output Display */}
              <div className="my-5 py-4 px-4 bg-zinc-900/80 border border-amber-500/10 rounded-xl text-center">
                <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">TODAY'S SCORE</p>
                <div className="text-2xl sm:text-3xl font-serif font-black text-amber-400 tracking-widest drop-shadow-[0_2px_8px_rgba(251,191,36,0.2)]">
                  {displayText}
                </div>
                <div className="text-xs text-neutral-400 mt-1 uppercase font-serif font-semibold">
                  Result Value: {winNo}
                </div>
              </div>

              {/* Direct Play Actions */}
              <div className="space-y-2 mt-4 pt-4 border-t border-amber-500/10">
                <div className="text-[10px] text-amber-400/40 font-mono uppercase tracking-widest mb-2 font-bold text-center">
                  Quick Access Rooms
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => navigate('/single-open', { state: { market: market.marketName } })}
                    disabled={isClosed}
                    className="py-2 px-1.5 bg-amber-500/10 hover:bg-amber-400/20 disabled:hover:bg-amber-500/10 disabled:opacity-50 text-amber-300 text-[11px] font-serif font-bold tracking-wide rounded-lg border border-amber-500/25 transition-all outline-none cursor-pointer"
                  >
                    SINGLE OPEN
                  </button>
                  <button 
                    onClick={() => navigate('/jodi', { state: { market: market.marketName } })}
                    disabled={isClosed}
                    className="py-2 px-1.5 bg-amber-500/15 hover:bg-amber-400/30 disabled:hover:bg-amber-500/15 disabled:opacity-50 text-amber-200 text-[11px] font-serif font-bold tracking-wide rounded-lg border border-amber-400/25 transition-all outline-none cursor-pointer"
                  >
                    JODI (2D)
                  </button>
                  <button 
                    onClick={() => navigate('/triple-open', { state: { market: market.marketName } })}
                    disabled={isClosed}
                    className="py-2 px-1.5 bg-amber-500/20 hover:bg-amber-400/45 disabled:hover:bg-amber-500/20 disabled:opacity-50 text-amber-100 text-[11px] font-serif font-bold tracking-wide rounded-lg border border-yellow-400/30 transition-all outline-none cursor-pointer"
                  >
                    PANEL (3D)
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {markets.length === 0 && (
          <div className="col-span-full text-center py-12 bg-zinc-950 border border-neutral-900 rounded-xl">
            <PlayCircle className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm font-serif">No game markets created yet. The system is auto-seeding defaults.</p>
          </div>
        )}
      </div>
    </div>
  );
};
