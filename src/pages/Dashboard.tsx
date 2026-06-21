import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Award, Coins, Flame, Hourglass, Landmark, LayoutGrid, Sparkles, Target, Trophy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const { userEntries, userTransactions } = useGame();
  const navigate = useNavigate();

  if (!profile) {
    return (
      <div className="text-center py-12 p-6 bg-zinc-950 border border-amber-500/15 rounded-xl max-w-md mx-auto mt-12">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-amber-300 uppercase">ACCESS AUTHENTICATION REQUIRED</h3>
        <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed">
          Please register your profile or sign in to verify your starting coin balances and place bets.
        </p>
        <Link to="/login" className="px-5 py-2 inline-block text-xs font-serif font-bold tracking-wider bg-gradient-to-r from-amber-600 to-yellow-450 text-neutral-950 rounded-lg">
          LOG IN SECURELY
        </Link>
      </div>
    );
  }

  // Calculate statistics from local snapshots
  const pendingEntries = userEntries.filter(e => e.status === 'pending');
  const winEntries = userEntries.filter(e => e.status === 'win');
  
  // Total virtual coins won in active session (sum of winAmounts)
  const totalCoinsWon = winEntries.reduce((sum, e) => sum + (e.winAmount || 0), 0);

  return (
    <div id="player-dashboard-page" className="space-y-8 pb-12">
      {/* Dashboard Top Greeting Banner */}
      <div className="bg-gradient-to-br from-zinc-950 via-neutral-900 to-amber-955/20 border border-amber-500/20 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono uppercase tracking-widest font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Welcome Champion Room
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-105 via-amber-305 to-amber-505 uppercase tracking-wide">
            {profile.name}
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Wallet ID: <span className="text-neutral-300 font-bold">{profile.uid.substring(0, 12)}...</span> | Phone: {profile.phone || 'N/A'}
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/wallet')}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-400 hover:from-amber-500 hover:to-amber-500 text-neutral-950 text-xs font-serif font-black tracking-wider rounded-lg uppercase cursor-pointer"
          >
            RECHARGE COINS
          </button>
          
          {profile.role === 'admin' && (
            <Link 
              to="/admin"
              className="px-4 py-2 bg-zinc-90 w-full hover:bg-neutral-800 border border-amber-500/30 text-amber-400 text-xs font-serif font-bold tracking-wider rounded-lg uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              ADMIN PANEL
            </Link>
          )}
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Current wallet coins */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/20 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Wallet Coins</span>
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-amber-300">
            {profile.coins.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-500/60 font-mono tracking-wider font-bold mt-1.5 uppercase">Instant Balance</p>
        </div>

        {/* Metric 2: Total games played */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/20 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Games Played</span>
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-neutral-200">
            {profile.totalGames || userEntries.length}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono tracking-wider font-bold mt-1.5 uppercase">Lifetime Entries</p>
        </div>

        {/* Metric 3: Wins */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/20 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Success Rounds</span>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-amber-400">
            {profile.totalWins || winEntries.length}
          </div>
          <p className="text-[10px] text-amber-500/60 font-mono tracking-wider font-bold mt-1.5 uppercase">Win Certificates</p>
        </div>

        {/* Metric 4: Total winnings */}
        <div className="p-4 sm:p-5 bg-zinc-950 border border-amber-500/20 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Coins Harvested</span>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-amber-400">
            {totalCoinsWon.toLocaleString()}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono tracking-wider font-bold mt-1.5 uppercase">Multiplier Profits</p>
        </div>
      </div>

      {/* Main split: Current Gameplay and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Recent entries list */}
        <div className="lg:col-span-2 bg-zinc-950 border border-amber-500/15 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-amber-500/10 pb-3">
            <h3 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-widest">
              My Active Gameplay Entries
            </h3>
            <Link to="/bet-history" className="text-[11px] text-neutral-400 hover:text-amber-300 font-mono">
              View Personal History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase">
                  <th className="py-2.5 px-2">Market Name</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2 text-center">Selected No.</th>
                  <th className="py-2.5 px-2 text-right">Coins Spent</th>
                  <th className="py-2.5 px-2 text-right">Payouts</th>
                  <th className="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono text-neutral-300">
                {userEntries.slice(0, 10).map((entry, idx) => (
                  <tr 
                    key={entry.id || idx}
                    className="border-b border-neutral-900/50 hover:bg-neutral-900/10 transition-colors"
                  >
                    <td className="py-3 px-2 font-serif font-bold text-neutral-200">
                      {entry.marketName}
                    </td>
                    <td className="py-3 px-2 uppercase text-[10px]">
                      {entry.gameType}
                    </td>
                    <td className="py-3 px-2 max-w-[150px] truncate text-center font-bold text-amber-400" title={entry.bets?.map(b => `${b.number}: ${b.coins}`).join(', ')}>
                      {entry.bets?.map(b => b.number).join(', ') || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-right text-amber-500/90">
                      {entry.totalCoins ? entry.totalCoins.toLocaleString() : '0'}
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-400 font-bold">
                      {entry.status === 'win' ? `+${(entry.winAmount || 0).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                        entry.status === 'win' 
                          ? 'bg-green-500/10 text-green-400 border border-green-550/20' 
                          : entry.status === 'loss'
                          ? 'bg-red-500/10 text-red-400 border border-red-550/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-550/20 animate-pulse'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {userEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-neutral-500 italic">
                      No gameplay records registered. Use the links in the sidebar to play single, double, or triple games!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1/3: Recent transaction logs */}
        <div className="bg-zinc-950 border border-amber-500/15 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-amber-500/10 pb-3">
            <h3 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-widest">
              Secured Wallets & Ledgers
            </h3>
            <Link to="/wallet" className="text-[11px] text-neutral-400 hover:text-amber-300 font-mono">
              All Archives
            </Link>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {userTransactions.slice(0, 8).map((tx, idx) => {
              const isProfit = tx.type === 'win' || tx.type === 'deposit';

              return (
                <div 
                  key={tx.id || idx}
                  className="p-3 bg-zinc-900/50 border border-amber-550/5 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-serif font-bold text-neutral-200 uppercase tracking-tight text-xs">
                      {tx.type}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5 max-w-[150px] truncate leading-tight">
                      {tx.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`font-serif font-black ${isProfit ? 'text-emerald-400' : 'text-amber-500/90'}`}>
                      {isProfit ? '+' : ''}{tx.amount.toLocaleString()}
                    </span>
                    <p className="text-[9px] text-neutral-500 mt-0.5 uppercase">
                      {tx.status}
                    </p>
                  </div>
                </div>
              );
            })}

            {userTransactions.length === 0 && (
              <p className="text-center py-10 text-neutral-500 text-xs italic font-mono">
                No ledger coins transacted yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline fallback for layout import safeguard
import { ShieldCheck } from 'lucide-react';
