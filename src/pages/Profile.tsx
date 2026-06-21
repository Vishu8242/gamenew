import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { AlertCircle, Award, Coins, Crown, Sparkles, ShieldCheck, Target, User } from 'lucide-react';

export default function Profile() {
  const { profile, elevateToAdmin } = useAuth();
  const { userEntries } = useGame();

  const [bypassCode, setBypassCode] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const handleElevation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (bypassCode.toUpperCase() === 'GOLDEN777') {
      setLoading(true);
      try {
        await elevateToAdmin();
        setSuccess("⚜️ SYSTEM ELEVATION SUCCESSFUL! Your account is now upgraded to Administrator level. Standard market declarations are unlocked in the sidebar menu! ⚜️");
      } catch (err: any) {
        setError(err.message || "Failed to upgrade account");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Incorrect administrative elevation passkey. Enter 'GOLDEN777'!");
    }
  };

  const pendingGamesCount = userEntries.filter(e => e.status === 'pending').length;
  const wonGamesCount = userEntries.filter(e => e.status === 'win').length;

  return (
    <div id="player-profile-view" className="space-y-8 pb-12 max-w-3xl mx-auto">
      {/* Profile Header card */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-amber-955/15 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar sphere */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-600 p-[1.5px] items-center justify-center flex shadow-xl">
            <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-amber-400 font-serif font-black text-3xl">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="text-center sm:text-left overflow-hidden">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500 uppercase tracking-widest leading-tight truncate">
              {profile.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-1.5 text-xs font-mono">
              <span className="text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25 uppercase">
                {profile.role.toUpperCase()}
              </span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-400">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-955/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-start gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{success}</span>
        </div>
      )}

      {/* Profile Details bento content grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Account summary Card */}
        <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-amber-500 uppercase tracking-widest text-sm border-b border-amber-500/10 pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4" /> Account Identification values
          </h3>

          <div className="space-y-3 pt-1 text-xs font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Profile Name:</span>
              <span className="text-neutral-200 font-bold">{profile.name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Primary Email:</span>
              <span className="text-neutral-200 truncate max-w-[150px]">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Contact mobile:</span>
              <span className="text-neutral-200">{profile.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Coin balance:</span>
              <span className="text-amber-400 font-bold">{profile.coins.toLocaleString()} Coins</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Account Status:</span>
              <span className={`font-bold ${profile.blocked ? 'text-red-400' : 'text-emerald-400'}`}>
                {profile.blocked ? 'BLOCKED/LOCK' : 'SECURE ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-amber-400 uppercase tracking-widest text-sm border-b border-amber-500/10 pb-2 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-500" /> Gameplay achievements stats
          </h3>

          <div className="space-y-3 pt-1 text-xs font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Total Rounds Entered:</span>
              <span className="text-neutral-200 font-bold">{profile.totalGames || 0} rounds</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Active/Pending bets:</span>
              <span className="text-amber-405 font-bold animate-pulse">{pendingGamesCount} rounds</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Championship matches won:</span>
              <span className="text-emerald-400 font-bold">{wonGamesCount || profile.totalWins} rounds</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Win Ratio / Accuracy:</span>
              <span className="text-amber-400 font-bold">
                {profile.totalGames > 0 ? `${Math.round(((profile.totalWins || wonGamesCount) / profile.totalGames) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-neutral-900">
              <span className="text-neutral-400 uppercase">Championship Rank:</span>
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Player Class
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secret admin elevation bypass drawer */}
      {profile.role !== 'admin' && (
        <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl text-center space-y-4 max-w-md mx-auto">
          <div className="inline-flex w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-lg items-center justify-center text-amber-400 mb-1 animate-pulse">
            <Crown className="w-5 h-5 text-amber-400 animate-[spin_5s_infinite_linear]" />
          </div>
          
          <h3 className="font-serif font-black text-amber-300 uppercase tracking-wider text-base">
            ADMINISTRATIVE ELEVATION BYPASS
          </h3>
          
          <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
            Are you reviewing the application features? Upgrade your role instantly! Key in the secret bypass code <strong className="text-amber-400 font-bold font-serif uppercase">GOLDEN777</strong> to unlock full statistics and result declarations!
          </p>

          <form onSubmit={handleElevation} className="flex gap-2 justify-center">
            <input 
              type="text" 
              value={bypassCode}
              onChange={(e) => setBypassCode(e.target.value)}
              placeholder="GOLDEN777"
              className="px-3 py-2 bg-zinc-900 border border-amber-500/30 rounded-lg text-xs font-mono uppercase text-center outline-none text-amber-400 focus:border-amber-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-zinc-955 text-xs font-serif font-bold uppercase rounded-lg shadow-md cursor-pointer active:scale-95"
            >
              {loading ? 'ELEVATING...' : 'UPGRADE PROFILE'}
            </button>
          </form>

          <p className="text-[10px] text-neutral-500 leading-none">
            Sandbox feature only. Restricted on production files.
          </p>
        </div>
      )}

      {profile.role === 'admin' && (
        <div className="p-4 bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-amber-400 bg-zinc-950 rounded-r-xl max-w-xl mx-auto flex items-center gap-3">
          <Crown className="w-6 h-6 text-yellow-400 animate-[spin_6s_infinite_linear]" />
          <div className="text-xs">
            <strong className="text-yellow-350 block font-serif uppercase tracking-wider mb-0.5">Admin authorization active!</strong>
            <span className="text-neutral-400 font-mono">You can manage users, publish results, and toggle markets directly from the sidebar.</span>
          </div>
        </div>
      )}

    </div>
  );
}
