import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Search, 
  Filter, 
  Hourglass, 
  Coins, 
  Compass, 
  Percent, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Gamepad2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BetHistory() {
  const { user } = useAuth();
  const { userEntries, loadingData } = useGame();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  
  // Track which entry cards are expanded
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const toggleExpand = (entryId: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  if (!user) {
    return (
      <div id="unauthorized-placeholder" className="text-center py-16 px-6 bg-zinc-950 border border-amber-500/15 rounded-2xl max-w-md mx-auto mt-12 shadow-2xl">
        <ShieldCheck className="w-14 h-14 text-amber-500 mx-auto mb-4" />
        <h3 className="font-serif text-xl font-black text-amber-300 uppercase tracking-widest">AUTHENTICATION REQUIRED</h3>
        <p className="text-xs text-neutral-400 mt-2 mb-6 leading-relaxed">
          Please register or sign in to verify your account balances and view your historical bet records.
        </p>
        <Link 
          to="/login" 
          className="px-6 py-2.5 inline-block text-xs font-serif font-black tracking-widest bg-gradient-to-r from-amber-600 to-yellow-450 hover:from-amber-500 hover:to-yellow-400 text-neutral-955 rounded-lg uppercase shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          LOG IN TO PORTAL
        </Link>
      </div>
    );
  }

  // Extract unique market names from user entries for the dropdown filter
  const uniqueMarkets = Array.from(new Set(userEntries.map(e => e.marketName))).sort();

  // Statistics calculations based on all listed user entries
  const totalRoundsPlayed = userEntries.length;
  const pendingRounds = userEntries.filter(e => e.status === 'pending');
  const wonRounds = userEntries.filter(e => e.status === 'win');
  const lostRounds = userEntries.filter(e => e.status === 'loss');

  const totalCoinsInvested = userEntries.reduce((sum, e) => sum + (e.totalCoins || 0), 0);
  const totalCoinsHarvested = wonRounds.reduce((sum, e) => sum + (e.winAmount || 0), 0);
  const netEarnings = totalCoinsHarvested - totalCoinsInvested;
  
  const winRatio = totalRoundsPlayed > 0 
    ? Math.round((wonRounds.length / (wonRounds.length + lostRounds.length || 1)) * 100) 
    : 0;

  // Applying full search and filters
  const filteredEntries = userEntries.filter((entry) => {
    const matchesSearch = entry.marketName.toLowerCase().includes(search.toLowerCase()) || 
                          entry.bets.some(b => b.number.includes(search));
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesType = typeFilter === 'all' || entry.gameType === typeFilter;
    const matchesMarket = marketFilter === 'all' || entry.marketName === marketFilter;

    return matchesSearch && matchesStatus && matchesType && matchesMarket;
  });

  return (
    <div id="bet-history-view" className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-amber-955/15 border border-amber-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono uppercase tracking-widest font-bold mb-1">
            <Trophy className="w-4 h-4 text-amber-500" /> SECURE ARENA LEDGER
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-250 via-amber-350 to-amber-500 uppercase tracking-wider">
            MY BETTING HISTORY
          </h2>
          <p className="text-xs text-neutral-400">
            Audit your digital entries, multipliers, active predictions, and payouts.
          </p>
        </div>

        <Link 
          to="/dashboard"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-400 text-xs font-serif font-bold rounded-lg uppercase transition-all flex items-center gap-2 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Total Played */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-550/5 rounded-full blur-lg"></div>
          <p className="text-[10px] uppercase font-mono text-neutral-500 font-bold tracking-widest">Total Tickets</p>
          <div className="text-xl sm:text-2xl font-serif font-black text-amber-300 mt-1 flex items-baseline gap-1.5">
            {totalRoundsPlayed}
            <span className="text-[10px] font-mono text-neutral-500 font-normal uppercase">Entries</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-900 text-[10px] font-mono text-neutral-400">
            <span className="text-yellow-400 font-bold">{pendingRounds.length} Pending</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{wonRounds.length} Won</span>
          </div>
        </div>

        {/* Stat 2: Total Coins Spent */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-550/5 rounded-full blur-lg"></div>
          <p className="text-[10px] uppercase font-mono text-neutral-500 font-bold tracking-widest">Spent Coins</p>
          <div className="text-xl sm:text-2xl font-serif font-black text-neutral-200 mt-1 flex items-center gap-1">
            <Coins className="w-4 h-4 text-amber-500/80 mr-1.5" />
            {totalCoinsInvested.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-900 text-[10px] font-mono text-neutral-500">
            LIFETIME INVESTMENT
          </div>
        </div>

        {/* Stat 3: Coins Won */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-550/5 rounded-full blur-lg"></div>
          <p className="text-[10px] uppercase font-mono text-neutral-500 font-bold tracking-widest">Coins Won</p>
          <div className="text-xl sm:text-2xl font-serif font-black text-amber-400 mt-1 flex items-center gap-1">
            <Flame className="w-4.5 h-4.5 text-orange-400 mr-1.5" />
            {totalCoinsHarvested.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-900 text-[10px] font-mono text-emerald-400">
            <Percent className="w-3 h-3" /> {winRatio}% Strike Rate
          </div>
        </div>

        {/* Stat 4: Net Profit / Loss */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/10 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-550/5 rounded-full blur-lg"></div>
          <p className="text-[10px] uppercase font-mono text-neutral-500 font-bold tracking-widest">Net Revenue</p>
          <div className={`text-xl sm:text-2xl font-serif font-black mt-1 flex items-center ${netEarnings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netEarnings >= 0 ? (
              <TrendingUp className="w-4.5 h-4.5 mr-1.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4.5 h-4.5 mr-1.5 text-red-400" />
            )}
            {netEarnings >= 0 ? '+' : ''}
            {netEarnings.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-900 text-[10px] font-mono text-neutral-500">
            TOTAL CURRENT NET RESULT
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-zinc-950 border border-amber-500/15 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-xl">
        {/* Search keyword */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-amber-500/60 font-bold mb-1.5">
            Search No. / Room (e.g. 74)
          </label>
          <div className="relative bg-zinc-90 w-full border border-amber-500/10 hover:border-amber-500/20 rounded-lg flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-neutral-200 outline-none placeholder-zinc-700 font-mono"
            />
          </div>
        </div>

        {/* Filter Status */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-amber-500/60 font-bold mb-1.5">
            Payout Status
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-amber-500/10 text-neutral-300 text-xs py-2 px-2.5 rounded-lg focus:border-amber-400 outline-none cursor-pointer font-mono"
          >
            <option value="all">ALL VERDICTS</option>
            <option value="pending">PENDING SLOTS</option>
            <option value="win">WIN OUTCOMES</option>
            <option value="loss">LOSING SELECTIONS</option>
          </select>
        </div>

        {/* Filter Type */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-amber-500/60 font-bold mb-1.5">
            Game Arena Category
          </label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-amber-500/10 text-neutral-300 text-xs py-2 px-2.5 rounded-lg focus:border-amber-400 outline-none cursor-pointer font-mono"
          >
            <option value="all">ALL GAME TYPES</option>
            <option value="Single Open">SINGLE OPEN (9x)</option>
            <option value="Single Close">SINGLE CLOSE (9x)</option>
            <option value="Jodi">JODI 2D (90x)</option>
            <option value="Triple Open">TRIPLE OPEN PANEL (900x)</option>
            <option value="Triple Close">TRIPLE CLOSE PANEL (900x)</option>
          </select>
        </div>

        {/* Filter Market */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-amber-500/60 font-bold mb-1.5">
            Satta Market Room
          </label>
          <select 
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-amber-500/10 text-neutral-300 text-xs py-2 px-2.5 rounded-lg focus:border-amber-400 outline-none cursor-pointer font-mono"
          >
            <option value="all">ALL ROOMS</option>
            {uniqueMarkets.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bets Ticket Records Grid List */}
      <div className="space-y-4">
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 font-mono text-xs gap-3">
            <div className="w-6 h-6 border-2 border-amber-550 border-t-transparent rounded-full animate-spin"></div>
            Loading security ledgers...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-24 bg-zinc-950 border border-neutral-900 rounded-2xl flex flex-col items-center justify-center p-6">
            <Gamepad2 className="w-12 h-12 text-zinc-800 mb-4 animate-pulse" />
            <h4 className="font-serif text-neutral-400 text-sm font-bold uppercase tracking-widest">No matching bets recorded</h4>
            <p className="text-xs text-neutral-600 font-mono mt-1 mb-6 max-w-sm">
              We couldn't find any historical tickets matching your current search parameters.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link 
                to="/single-open" 
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 text-[11px] font-serif font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-amber-400" /> Play Single
              </Link>
              <Link 
                to="/jodi" 
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-450 text-neutral-955 text-[11px] font-serif font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Let's Play Jodi
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEntries.map((entry, index) => {
              const isExpanded = !!expandedEntries[entry.id || ''];
              const dateObj = entry.createdAt?.seconds ? new Date(entry.createdAt.seconds * 1000) : new Date();
              const dateFormatted = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const timeFormatted = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={entry.id || index}
                  className={`bg-zinc-950 border rounded-xl overflow-hidden transition-all duration-200 ${
                    entry.status === 'win' 
                      ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.02)]' 
                      : entry.status === 'loss'
                      ? 'border-red-500/15'
                      : 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.02)]'
                  }`}
                >
                  {/* Card Header Topline - Clickable to toggle expand */}
                  <div 
                    onClick={() => toggleExpand(entry.id || '')}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-900/15 select-none"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Status indicator Icon badge */}
                      <div className="mt-0.5">
                        {entry.status === 'win' ? (
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : entry.status === 'loss' ? (
                          <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-600">
                            <XCircle className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 animate-pulse">
                            <Hourglass className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Room & Category info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-serif text-base font-black uppercase text-neutral-100 tracking-wide">
                            {entry.marketName}
                          </h3>
                          <span className="px-2 py-0.5 bg-neutral-900 border border-amber-500/15 rounded text-[9px] uppercase tracking-wider font-bold text-amber-400 font-mono">
                            {entry.gameType}
                          </span>
                        </div>
                        
                        {/* Audit timestamps */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateFormatted}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeFormatted}</span>
                        </div>
                      </div>
                    </div>

                    {/* Left Coin amounts and expands details toggle */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-900/60">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold">Invested Coins</p>
                        <p className="text-sm font-serif font-bold text-neutral-200 mt-0.5">
                          {entry.totalCoins.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold">Verdict Payout</p>
                        {entry.status === 'win' ? (
                          <p className="text-base font-serif font-black text-emerald-400 mt-0.5">
                            +{(entry.winAmount || 0).toLocaleString()}
                          </p>
                        ) : entry.status === 'loss' ? (
                          <p className="text-sm font-serif font-normal text-neutral-500 mt-0.5">
                            ---
                          </p>
                        ) : (
                          <p className="text-sm font-mono text-amber-500 font-bold uppercase animate-pulse mt-0.5">
                            Pending
                          </p>
                        )}
                      </div>

                      {/* Expand Action Button */}
                      <button className="p-1 px-2 border border-neutral-900 rounded-lg hover:border-amber-550/20 text-neutral-500 hover:text-amber-400 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Betting Slots breakdown Section */}
                  {isExpanded && (
                    <div className="border-t border-neutral-900/60 bg-zinc-950 p-4 sm:p-5">
                      <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-500/50 mb-3 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Selected Placing Distribution ({entry.bets.length} Slots)
                      </div>
                      
                      {/* Sub bets map */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {entry.bets.map((bet, bIdx) => {
                          // If there's an evaluation list, let's look at it
                          const evaluated = (entry as any).evaluatedBets?.[bIdx];
                          const betIsWinner = evaluated ? evaluated.won : (entry.status === 'win' && (entry as any).winningNumber === bet.number);
                          
                          return (
                            <div 
                              key={bIdx}
                              className={`p-3 rounded-lg border flex items-center justify-between ${
                                entry.status === 'pending'
                                  ? 'bg-neutral-950 border-neutral-900' 
                                  : betIsWinner
                                  ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400'
                                  : 'bg-neutral-900/10 border-neutral-900 text-neutral-500'
                              }`}
                            >
                              <div>
                                <span className="text-[10px] font-mono uppercase text-neutral-550 font-bold block">Slot Digit</span>
                                <span className="font-serif text-lg font-black tracking-wide">
                                  {bet.number}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] font-mono uppercase text-neutral-550 font-bold block">Coins Placed</span>
                                <span className="font-mono text-xs font-black">
                                  {bet.coins.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
