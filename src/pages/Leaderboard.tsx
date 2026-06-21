import React from 'react';
import { useGame } from '../context/GameContext';
import { Award, Crown, Star, Trophy, Users } from 'lucide-react';

export default function Leaderboard() {
  const { leaderboard, loadingData } = useGame();

  // Pick top 3 for podium display
  const podium = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div id="leaderboard-page" className="space-y-8 pb-12">
      {/* Title block */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-amber-955/15 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/35 rounded-full text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 animate-spin p-0" /> Championship Arena
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-150 via-amber-350 to-amber-500 uppercase tracking-widest leading-none">
              GLOBAL CHAMPIONS LEAF
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5">
              Glory cards of the highest-profiting players based on standard wins and coin counts.
            </p>
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      {loadingData ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-400 font-mono mt-2">Opening championship rosters...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6 max-w-4xl mx-auto">
              
              {/* 2nd Place: Left side */}
              {podium[1] && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-zinc-900 to-black border border-neutral-800 p-5 rounded-2xl text-center shadow-lg relative min-h-[220px] flex flex-col justify-between">
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-slate-400 text-zinc-955 text-[10px] font-bold rounded-full font-serif font-black">
                     2ND PLACE
                  </span>
                  
                  <div className="pt-2">
                    <div className="w-12 h-12 rounded-full border border-slate-400 bg-slate-500/10 mx-auto flex items-center justify-center text-slate-300 font-black text-lg mb-2">
                      2
                    </div>
                    <h3 className="font-serif font-bold text-neutral-200 truncate px-2">{podium[1].name}</h3>
                    <p className="text-neutral-500 text-[10px] uppercase font-mono tracking-widest mt-0.5">Silver Competitor</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900">
                    <div className="text-xs text-amber-400 font-mono font-bold">
                      {podium[1].coins.toLocaleString()} Coins
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Wins: {podium[1].totalWins || 0} rounds
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place: Center (taller) */}
              {podium[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-neutral-900 to-zinc-950 border-2 border-amber-400/60 p-6 rounded-2xl text-center shadow-2xl relative min-h-[250px] transform md:scale-105 flex flex-col justify-between shadow-yellow-500/5">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-zinc-955 text-xs font-serif font-black rounded-full shadow-md flex items-center gap-1 animate-bounce">
                    <Crown className="w-4 h-4" /> CHAMPION
                  </span>
                  
                  <div className="pt-4">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-400/20 mx-auto flex items-center justify-center text-amber-300 font-serif font-black text-2xl mb-2 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]">
                      1
                    </div>
                    <h3 className="font-serif font-black text-yellow-101 text-base truncate px-2">{podium[0].name}</h3>
                    <p className="text-amber-500 text-[10px] uppercase font-mono tracking-widest mt-0.5 font-bold">Global Master</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900">
                    <div className="text-sm text-yellow-300 font-mono font-black tracking-wide">
                      {podium[0].coins.toLocaleString()} Coins
                    </div>
                    <div className="text-xs text-neutral-350 mt-0.5 font-bold">
                      Wins: {podium[0].totalWins || 0} rounds
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place: Right side */}
              {podium[2] && (
                <div className="order-3 md:order-3 bg-gradient-to-b from-zinc-900 to-black border border-neutral-800 p-5 rounded-2xl text-center shadow-lg relative min-h-[200px] flex flex-col justify-between">
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-700 text-zinc-955 text-[10px] font-bold rounded-full font-serif font-black">
                     3RD PLACE
                  </span>
                  
                  <div className="pt-2">
                    <div className="w-12 h-12 rounded-full border border-amber-700 bg-amber-800/10 mx-auto flex items-center justify-center text-amber-600 font-black text-lg mb-2 animate-pulse">
                      3
                    </div>
                    <h3 className="font-serif font-bold text-neutral-200 truncate px-2">{podium[2].name}</h3>
                    <p className="text-neutral-500 text-[10px] uppercase font-mono tracking-widest mt-0.5">Bronze Contender</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900">
                    <div className="text-xs text-amber-400 font-mono font-bold">
                      {podium[2].coins.toLocaleString()} Coins
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Wins: {podium[2].totalWins || 0} rounds
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Remaining Competitor Database Table */}
          <div className="bg-zinc-950 border border-amber-500/15 rounded-xl p-5 shadow-xl max-w-4xl mx-auto">
            <h3 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-3 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Championship Ladder Rankings (4+)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Position</th>
                    <th className="py-2.5 px-3">Competitor Profile</th>
                    <th className="py-2.5 px-3">Games Entered</th>
                    <th className="py-2.5 px-3 text-right">Rounds Won</th>
                    <th className="py-2.5 px-3 text-right">Coin Vault</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono text-neutral-300">
                  {remaining.map((player, idx) => (
                    <tr 
                      key={player.uid || idx}
                      className="border-b border-neutral-900/40 hover:bg-neutral-900/10 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-serif font-bold text-neutral-400 text-sm">
                        #{idx + 4}
                      </td>
                      <td className="py-3.5 px-3 font-serif font-bold text-neutral-200 uppercase">
                        {player.name}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-450">
                        {player.totalGames || 0} matches
                      </td>
                      <td className="py-3.5 px-3 text-right text-emerald-400 font-bold">
                        {player.totalWins || 0} rounds
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-amber-400">
                        {player.coins.toLocaleString()} Coins
                      </td>
                    </tr>
                  ))}

                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-neutral-500 italic">
                        The championship ladders are empty. Play and win to register first statistics!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
