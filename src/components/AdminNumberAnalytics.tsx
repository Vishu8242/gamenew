import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Users, 
  Coins, 
  Target, 
  Award, 
  ArrowUpDown, 
  X, 
  CheckCircle,
  HelpCircle,
  Calendar,
  Layers,
  BarChart3
} from 'lucide-react';
import { Market, GameEntry } from '../types';

interface AdminNumberAnalyticsProps {
  dbEntries: GameEntry[];
  markets: Market[];
}

export default function AdminNumberAnalytics({ dbEntries, markets }: AdminNumberAnalyticsProps) {
  // State variables for analytics
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  
  // Sorting state for the main table
  const [sortField, setSortField] = useState<'number' | 'totalCoins' | 'totalBets' | 'totalUsers'>('totalCoins');
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  // Time reference
  const now = new Date();
  const todayStr = now.toDateString();

  // Helper: check if Firestore date or seconds Timestamp falls on "today"
  const isToday = (createdAt: any) => {
    if (!createdAt) return false;
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000);
    return date.toDateString() === todayStr;
  };

  // Convert Indian rupee or display coin currency cleanly
  const formatCoins = (coins: number) => {
    return `₹${coins.toLocaleString('en-IN')}`;
  };

  // 1. Calculate TOTAL COINS SUMMARY (Real-time updates)
  const totalCoinsOverall = dbEntries.reduce((sum, e) => sum + (e.totalCoins || 0), 0);
  
  const totalCoinsToday = dbEntries.reduce((sum, e) => {
    return isToday(e.createdAt) ? sum + (e.totalCoins || 0) : sum;
  }, 0);

  const selectedMarketTotal = marketFilter === 'all' 
    ? totalCoinsOverall 
    : dbEntries
        .filter(e => e.marketName === marketFilter)
        .reduce((sum, e) => sum + (e.totalCoins || 0), 0);

  // 2. Process dbEntries to produce NUMBER WISE ANALYTICS
  // Aggregate stats per number based on current marketFilter
  interface NumberStat {
    number: string;
    totalCoins: number;
    totalBets: number;
    users: Set<string>;
    playersMap: { [userId: string]: { userName: string; coins: number } };
  }

  const numberStatsMap: { [num: string]: NumberStat } = {};

  dbEntries.forEach(entry => {
    // If market filter is applied and is not 'all', skip other markets
    if (marketFilter !== 'all' && entry.marketName !== marketFilter) {
      return;
    }

    if (entry.bets && Array.isArray(entry.bets)) {
      entry.bets.forEach(b => {
        const numStr = String(b.number).trim();
        if (!numStr) return; // safeguard
        const coins = Number(b.coins) || 0;

        if (!numberStatsMap[numStr]) {
          numberStatsMap[numStr] = {
            number: numStr,
            totalCoins: 0,
            totalBets: 0,
            users: new Set<string>(),
            playersMap: {}
          };
        }

        const stat = numberStatsMap[numStr];
        stat.totalCoins += coins;
        stat.totalBets += 1;
        
        if (entry.userId) {
          stat.users.add(entry.userId);
          
          if (!stat.playersMap[entry.userId]) {
            stat.playersMap[entry.userId] = {
              userName: entry.userName || 'Anonymous Player',
              coins: 0
            };
          }
          stat.playersMap[entry.userId].coins += coins;
        }
      });
    }
  });

  // Convert map to list representation
  const rawNumberStatsList = Object.values(numberStatsMap).map(item => {
    return {
      number: item.number,
      totalCoins: item.totalCoins,
      totalBets: item.totalBets,
      totalUsers: item.users.size,
      players: Object.values(item.playersMap).sort((a, b) => b.coins - a.coins)
    };
  });

  // Handle manual column sorting
  const sortedNumberStats = [...rawNumberStatsList].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'number') {
      // Natural sorting numerically if possible
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortAscending ? numA - numB : numB - numA;
      }
      return sortAscending ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    }

    return sortAscending ? valA - valB : valB - valA;
  });

  // Filter list by main search pattern if typed
  const filteredNumberStats = sortedNumberStats.filter(item => 
    item.number.includes(searchNumber.trim())
  );

  // 3. TOP NUMBERS BOARD (Global or filtered by selected Market)
  const topNumbersList = [...rawNumberStatsList]
    .sort((a, b) => b.totalCoins - a.totalCoins)
    .slice(0, 3);

  // 4. MARKET ANALYTICS (Show Coins and Bets for each registered Market session)
  const marketAnalyticsList = markets.map(market => {
    const marketEntries = dbEntries.filter(e => e.marketName === market.marketName);
    const coins = marketEntries.reduce((sum, e) => sum + (e.totalCoins || 0), 0);
    const bets = marketEntries.reduce((sum, e) => sum + (e.bets?.length || 0), 0);
    return {
      marketName: market.marketName,
      totalCoins: coins,
      totalBets: bets
    };
  }).sort((a, b) => b.totalCoins - a.totalCoins); // Heavy volume markets first

  // Handle column header clicks
  const toggleSort = (field: 'number' | 'totalCoins' | 'totalBets' | 'totalUsers') => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(false); // default to descending on first click (largest values first)
    }
  };

  // Currently focused object (from custom details selection or exact model match search)
  // Let's obtain the detailed statistics block for the currently active/selected number
  const activeDetailNumber = selectedNumber || (searchNumber.trim() && rawNumberStatsList.some(i => i.number === searchNumber.trim()) ? searchNumber.trim() : null);
  const activeDetailData = activeDetailNumber ? rawNumberStatsList.find(i => i.number === activeDetailNumber) : null;

  return (
    <div id="analytics-dashboard-v3" className="space-y-6 animate-fadeIn text-neutral-200">
      
      {/* 1. Header Information & Filter Control */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/10 pb-5">
        <div>
          <h3 className="font-serif font-black text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            REALtime Coins & Numbers Analytics
          </h3>
          <p className="text-[11px] text-neutral-400 mt-1 font-mono">
            Directly monitoring active sandboxed entries and aggregated exposure ratios.
          </p>
        </div>
        
        {/* Market Filter Selection */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-neutral-400">Target Session:</span>
          <select 
            value={marketFilter}
            onChange={(e) => {
              setMarketFilter(e.target.value);
              setSelectedNumber(null); // Reset detail view on filter swap
            }}
            className="bg-zinc-900 border border-amber-500/20 text-neutral-200 text-xs py-1.5 px-3 rounded-lg font-serif outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">👑 All Games combined</option>
            {markets.map(m => (
              <option key={m.id} value={m.marketName}>
                ❇️ {m.marketName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* A. TOTAL COINS SUMMARY */}
        <div className="bg-zinc-950 border border-amber-500/10 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-3 text-amber-500/5">
            <Coins className="w-16 h-16 pointer-events-none" />
          </div>
          <h4 className="font-serif font-bold text-amber-400 uppercase text-xs tracking-wider mb-4 border-b border-amber-500/5 pb-2 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            Total Coins Summary
          </h4>
          
          <div className="space-y-4">
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-neutral-900">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block">Total Coins Played Today</span>
              <p className="text-xl font-serif font-black text-amber-300 mt-0.5">
                {formatCoins(totalCoinsToday)}
              </p>
            </div>
            
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-yellow-500/5">
              <span className="text-[9px] font-mono text-neutral-405 uppercase block">
                {marketFilter === 'all' ? 'All Combined Markets Total' : `Total Coins: ${marketFilter.toUpperCase()}`}
              </span>
              <p className="text-xl font-serif font-black text-amber-400 mt-0.5">
                {formatCoins(selectedMarketTotal)}
              </p>
            </div>

            <div className="bg-zinc-900/50 p-3 rounded-lg border border-neutral-900">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block">Total Coins Played Overall</span>
              <p className="text-xl font-serif font-black text-neutral-300 mt-0.5">
                {formatCoins(totalCoinsOverall)}
              </p>
            </div>
          </div>
        </div>

        {/* B. TOP 3 NUMBERS PODIUM */}
        <div className="bg-zinc-950 border border-amber-500/10 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-3 text-amber-500/5">
            <Award className="w-16 h-16 pointer-events-none" />
          </div>
          <h4 className="font-serif font-bold text-amber-400 uppercase text-xs tracking-wider mb-4 border-b border-amber-500/5 pb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            Top Numbers exposure
          </h4>

          <div className="space-y-3.5">
            {topNumbersList.map((item, idx) => {
              const bgClassName = idx === 0 
                ? 'bg-amber-500/5 border-amber-505/20' 
                : idx === 1 
                ? 'bg-neutral-900 border-zinc-800' 
                : 'bg-zinc-900/30 border-neutral-900';
              
              const rankColor = idx === 0 ? 'text-yellow-405' : idx === 1 ? 'text-neutral-400' : 'text-amber-600/70';

              return (
                <div 
                  key={item.number} 
                  onClick={() => setSelectedNumber(item.number)}
                  className={`p-3 border rounded-xl flex items-center justify-between transition-all cursor-pointer hover:border-amber-500/30 ${bgClassName}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-serif font-black text-sm ${rankColor}`}>
                      Rank #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-neutral-805 flex items-center justify-center font-bold text-amber-450 font-serif">
                      {item.number}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-serif font-black text-amber-450">{formatCoins(item.totalCoins)}</p>
                    <p className="text-[9px] font-mono text-neutral-500 uppercase">{item.totalBets} bets ({item.totalUsers} players)</p>
                  </div>
                </div>
              );
            })}

            {topNumbersList.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-500 italic font-mono">
                No tickets placed yet.
              </div>
            )}
          </div>
        </div>

        {/* C. MARKET-WISE TRANSACTION ANALYTICS */}
        <div className="bg-zinc-950 border border-amber-500/10 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-3 text-amber-500/5">
            <BarChart3 className="w-16 h-16 pointer-events-none" />
          </div>
          <h4 className="font-serif font-bold text-amber-400 uppercase text-xs tracking-wider mb-4 border-b border-amber-500/5 pb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            Market Wise Totals
          </h4>

          <div className="space-y-2.5 max-h-[195px] overflow-y-auto pr-1">
            {marketAnalyticsList.map(m => (
              <div 
                key={m.marketName}
                onClick={() => setMarketFilter(m.marketName)}
                className={`p-2.5 bg-zinc-900 border transition-all cursor-pointer rounded-lg flex items-center justify-between text-xs ${
                  marketFilter === m.marketName ? 'border-amber-500/40 bg-zinc-900/80 shadow-lg' : 'border-neutral-900 hover:border-zinc-800'
                }`}
              >
                <div>
                  <span className="font-serif font-bold text-neutral-200 uppercase tracking-tight block">
                    {m.marketName}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 block">
                    Bets Count: <strong className="text-neutral-400">{m.totalBets}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-500 text-xs">
                    {formatCoins(m.totalCoins)}
                  </span>
                </div>
              </div>
            ))}

            {markets.length === 0 && (
              <p className="text-xs text-neutral-500 italic text-center font-mono py-12">No market rooms active.</p>
            )}
          </div>
        </div>

      </div>

      {/* Main Grid: Analytical Table & Detail Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table layout block */}
        <div className="lg:col-span-8 bg-zinc-950 border border-amber-500/10 rounded-xl p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4 mb-4">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Layers className="w-4 h-4 text-amber-500" />
              Number Wise Analytics ({filteredNumberStats.length})
            </h4>

            {/* Admin Number Search Target */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-500" />
              <input 
                type="text"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Search specific number..."
                maxLength={4}
                className="w-full pl-8 pr-7 py-1 bg-zinc-900 border border-amber-500/10 focus:border-amber-500 text-xs text-neutral-200 font-mono outline-none rounded-lg placeholder-zinc-700"
              />
              {searchNumber && (
                <button 
                  onClick={() => setSearchNumber('')}
                  className="absolute right-2 top-2 p-0.5 bg-neutral-800 text-neutral-400 hover:text-white rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-zinc-900/20">
                  <th 
                    onClick={() => toggleSort('number')}
                    className="py-3 px-3 cursor-pointer hover:text-amber-500 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Number
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('totalCoins')}
                    className="py-3 px-3 cursor-pointer hover:text-amber-500 select-none transition-colors font-bold text-amber-400"
                  >
                    <div className="flex items-center gap-1">
                      Total Coins
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('totalUsers')}
                    className="py-3 px-3 cursor-pointer hover:text-amber-500 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Total Users
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('totalBets')}
                    className="py-3 px-3 cursor-pointer hover:text-amber-500 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Total Bets
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono text-neutral-350">
                {filteredNumberStats.map((item) => {
                  const isMatch = activeDetailNumber === item.number;
                  return (
                    <tr 
                      key={item.number}
                      className={`border-b border-neutral-900/45 hover:bg-neutral-900/20 transition-all ${
                        isMatch ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center justify-center font-serif text-sm font-black tracking-tighter bg-zinc-900 border border-amber-500/30 text-amber-400 rounded-lg py-0.5 px-2.5">
                          {item.number}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-amber-450 font-serif">
                        {formatCoins(item.totalCoins)}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300">
                        {item.totalUsers} Unique Player(s)
                      </td>
                      <td className="py-2.5 px-3 text-neutral-450">
                        {item.totalBets} Bets placed
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedNumber(item.number);
                            // Scroll helper if needed or focus
                          }}
                          className={`py-1 px-3 rounded text-[10px] font-serif font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isMatch 
                              ? 'bg-amber-500 text-zinc-950 font-black scale-[1.03]' 
                              : 'bg-zinc-900 border border-amber-500/10 text-amber-400 hover:bg-amber-500/10'
                          }`}
                        >
                          Details VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredNumberStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-neutral-500 italic">
                      {searchNumber ? 'No matching number is currently backed by any players.' : 'No bets registered under this filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details Panel representing target segment */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Detailed Box */}
          <div className="bg-zinc-950 border border-amber-500/10 rounded-xl p-5 sticky top-4">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-400 border-b border-amber-500/5 pb-2 mb-4 flex items-center justify-between">
              <span>🎯 Number Wise Details</span>
              {activeDetailNumber && (
                <button 
                  onClick={() => {
                    setSelectedNumber(null);
                    setSearchNumber('');
                  }}
                  className="p-1 text-neutral-500 hover:text-white rounded hover:bg-zinc-900"
                  title="Clear view selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </h4>

            {activeDetailData ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between bg-zinc-900/50 border border-neutral-900 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">Target Number</span>
                    <span className="font-serif text-3xl font-black text-amber-400">{activeDetailData.number}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-450 block uppercase">Exposure Total</span>
                    <span className="font-serif text-lg font-black text-amber-300">{formatCoins(activeDetailData.totalCoins)}</span>
                  </div>
                </div>

                {/* Users Count Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/20 border border-neutral-900 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-neutral-550 uppercase block">Total Users</span>
                    <span className="font-serif text-base font-black text-neutral-200 mt-1 block">{activeDetailData.totalUsers}</span>
                  </div>
                  <div className="bg-zinc-900/20 border border-neutral-900 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-mono text-neutral-550 uppercase block">Total Bets</span>
                    <span className="font-serif text-base font-black text-neutral-200 mt-1 block">{activeDetailData.totalBets}</span>
                  </div>
                </div>

                {/* Player Breakdown list */}
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-2 border-b border-neutral-900/60 pb-1.5">
                    🙋‍♂️ Player Contributions
                  </span>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {activeDetailData.players.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-zinc-900/30 border border-neutral-900 hover:border-zinc-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-serif text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-serif font-black text-neutral-200 uppercase truncate max-w-[130px]">
                            {item.userName}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">
                          {formatCoins(item.coins)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-xs">
                    <span className="font-serif text-neutral-400 uppercase font-black">Total:</span>
                    <span className="font-serif font-black text-amber-400 text-sm">
                      {activeDetailData.totalCoins.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-neutral-550 italic font-mono space-y-2">
                <HelpCircle className="w-8 h-8 text-neutral-600 mx-auto mb-1 opacity-40 animate-pulse" />
                <p className="text-[11px] leading-relaxed max-w-[180px] mx-auto">
                  Click <strong className="text-amber-500">Details VIEW</strong> on any item in the table or search a number above to see breakdown logs!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
