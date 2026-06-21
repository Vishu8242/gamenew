import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Award, Clock, RefreshCw, Star, Trophy } from 'lucide-react';

export const LiveResult: React.FC = () => {
  const { recentResults, markets, loadingData, seedInitialData } = useGame();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Mimic refresh/re-seed
    await seedInitialData();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  // Find the most recent result overall
  const latestResult = recentResults.length > 0 ? recentResults[0] : null;

  return (
    <div id="live-results-section" className="bg-zinc-950 border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl mb-8">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-zinc-950 animate-bounce" />
          <h2 className="font-serif text-lg font-bold text-zinc-950 uppercase tracking-widest">
            Today's Live Results
          </h2>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 hover:bg-zinc-900 border border-amber-400/40 text-amber-400 text-xs rounded-full font-mono transition-transform duration-200 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'REFRESHING...' : 'LIVE REFRESH'}
        </button>
      </div>

      <div className="p-6">
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-6">
            <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-sm text-amber-400 font-mono mt-2">Loading values...</p>
          </div>
        ) : latestResult ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left side: Golden Main Spotlight */}
            <div className="relative p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/20 text-center flex flex-col items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-400/[0.08] transition-colors duration-500"></div>
              
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] text-amber-400 tracking-wider uppercase mb-3">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Bumper Winning Spotlight
              </div>
              
              <p className="text-xs text-neutral-400 tracking-wider uppercase font-serif">
                {latestResult.marketName} Result (Jodi: {latestResult.jodi})
              </p>
              
              <div className="text-zinc-100 font-serif text-3xl sm:text-4xl font-black mt-2 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                {latestResult.finalResult}
              </div>

              <div className="flex items-center gap-1.5 mt-4 text-xs text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Declared on: {latestResult.resultDate}</span>
              </div>
            </div>

            {/* Right side: Other Recent results summary lists */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2">
                Recent Market Bulletins
              </h3>
              
              {recentResults.slice(1, 5).map((res, idx) => (
                <div 
                  key={res.id || idx} 
                  className="flex items-center justify-between p-3 bg-zinc-900/50 border border-amber-550/10 rounded-lg hover:border-amber-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-semibold text-neutral-200 uppercase">
                        {res.marketName}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Jodi Win: {res.jodi}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-amber-400/15 border border-amber-400/30 text-amber-300 font-serif font-bold rounded text-sm tracking-wider">
                      {res.finalResult}
                    </span>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {res.resultDate}
                    </p>
                  </div>
                </div>
              ))}

              {recentResults.length <= 1 && (
                <p className="text-center text-neutral-500 text-xs py-4 font-mono">
                  No other results declared for today yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-400 font-serif">Wait for admin to publish daily results. Default data seeding available.</p>
          </div>
        )}
      </div>
    </div>
  );
};
