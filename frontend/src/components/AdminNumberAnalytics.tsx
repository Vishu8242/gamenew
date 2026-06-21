import React, { useState } from 'react';
import { 
  TrendingUp, 
  Coins, 
  PieChart, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { Market, GameEntry } from '../types';

interface AdminNumberAnalyticsProps {
  dbEntries: GameEntry[];
  markets: Market[];
}

export default function AdminNumberAnalytics({ dbEntries, markets }: AdminNumberAnalyticsProps) {
  // State variables for analytics
  const [marketFilter, setMarketFilter] = useState<string>('all');

  // Convert Indian rupee or display coin currency cleanly
  const formatCoins = (coins: number) => {
    return `₹${coins.toLocaleString('en-IN')}`;
  };

  // 1. Calculate Live Active Market Numbers & Money Invested (pending status only)
  const activeEntries = dbEntries.filter(entry => {
    // ONLY display active (pending) entries. Once resolved/settled, they automatically clear!
    if (entry.status !== 'pending') return false;
    
    if (marketFilter !== 'all' && entry.marketName !== marketFilter) return false;
    return true;
  });

  const activeNumbersSummaryMap: { [number: string]: number } = {};
  let activeGrandTotalAmount = 0;

  activeEntries.forEach(entry => {
    if (entry.bets && Array.isArray(entry.bets)) {
      entry.bets.forEach(b => {
        const numStr = String(b.number).trim();
        if (!numStr) return;
        const coins = Number((b as any).coins) || Number((b as any).amount) || 0;
        activeNumbersSummaryMap[numStr] = (activeNumbersSummaryMap[numStr] || 0) + coins;
        activeGrandTotalAmount += coins;
      });
    }
  });

  // Convert the map to an array of objects and sort by highest bet amount descending
  const activeNumbersSummaryList = Object.entries(activeNumbersSummaryMap)
    .map(([number, amount]) => ({ number, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Realtime Active Dashboard Header */}
      <div className="bg-zinc-950/95 border border-amber-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-amber-500/5">
          <TrendingUp className="w-24 h-24 pointer-events-none" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="font-serif font-black text-xl text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              REALTIME COINS & NUMBERS ANALYTICS
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Directly monitoring active market entries and real-time aggregated exposure.
            </p>
          </div>

          {/* Market Selection Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Target Session:</span>
            <select 
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="bg-zinc-900 border border-amber-500/20 text-neutral-200 text-xs py-2 px-4 rounded-xl font-serif outline-none focus:border-amber-450 focus:ring-1 focus:ring-amber-500/50 cursor-pointer transition-all"
            >
              <option value="all">👑 All active games combined</option>
              {markets.map(m => (
                <option key={m.id} value={m.marketName}>
                  ❇️ {m.marketName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Exposure Panel */}
      <div className="bg-zinc-950/90 border border-amber-500/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-amber-400/5">
          <PieChart className="w-32 h-32 pointer-events-none" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <h4 className="font-serif font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                Live Active Market Numbers & Money Summary
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Tracks real-time active investments. On result declaration, these automatically clear.
              </p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3.5 rounded-xl text-right">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider leading-none">Grand Total Active</span>
              <p className="text-base font-mono font-black text-emerald-400 mt-1 leading-none">
                {formatCoins(activeGrandTotalAmount)}
              </p>
            </div>
          </div>

          {activeNumbersSummaryList.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-805 bg-zinc-900/10 flex flex-col items-center justify-center space-y-4">
              <div className="bg-zinc-900/40 p-4.5 rounded-full border border-zinc-800">
                <AlertCircle className="w-8 h-8 text-zinc-650 animate-pulse" />
              </div>
              <div className="space-y-1 font-mono">
                <p className="text-xs text-zinc-500">🏝️ All active market data has been evaluated / cleared.</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Dashboard is currently empty.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Live Terminal Invoice / Ledger Layout */}
              <div className="bg-black/95 border border-zinc-900 p-5 rounded-xl font-mono text-neutral-400 shadow-inner">
                <div className="flex justify-between text-[10px] uppercase text-zinc-500 border-b border-zinc-900 pb-2 mb-3.5 tracking-wider">
                  <span>Number Item</span>
                  <span>Total Bet Amount Summary</span>
                </div>
                
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 divide-y divide-zinc-900/40">
                  {activeNumbersSummaryList.map(({ number, amount }, i) => (
                    <div key={number} className="flex justify-between items-center py-2 text-xs">
                      <span className="text-zinc-200 font-bold flex items-center gap-2">
                        <span className="text-[10px] text-zinc-600">#{i + 1}</span>
                        Number {number}
                      </span>
                      <span className="text-emerald-400 font-bold font-mono">
                        → {formatCoins(amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-zinc-800 my-4 pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-400 uppercase tracking-wider">Total Amount</span>
                  <span className="text-amber-400 font-serif font-black text-base">
                    → {formatCoins(activeGrandTotalAmount)}
                  </span>
                </div>
                
                <div className="text-[9px] text-zinc-650 text-center mt-4 uppercase tracking-widest leading-none">
                  *** End of Active Exposure Sheet ***
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
