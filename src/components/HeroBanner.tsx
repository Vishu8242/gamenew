import React from 'react';
import { Award, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div 
      id="hero-banner" 
      className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-br from-zinc-950 via-neutral-900 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-yellow-500/5 mb-8"
    >
      {/* Golden Grid Overlay Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.08),rgba(0,0,0,0))]"></div>
      
      {/* Decorative Ornaments */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono tracking-widest uppercase mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> 100% Secure & Provably Fair
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-amber-500 mb-4 leading-tight">
            KHAN MATKA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600">
              PREMIUM ARENA
            </span>
          </h1>
          
          <p className="text-neutral-300 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            Step into the premium, traditional number-based coin game. Experience instant virtual coin settlements with multipliers up to <strong className="text-amber-400 font-serif">900x</strong>! Enter single, double, or triple digits to climb the leaderboards.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-black/60 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs text-amber-200 font-serif">
              <Trophy className="w-4 h-4 text-amber-400" /> Single (9x)
            </div>
            <div className="flex items-center gap-2 bg-black/60 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs text-amber-200 font-serif">
              <Award className="w-4 h-4 text-amber-400" /> Jodi Model (90x)
            </div>
            <div className="flex items-center gap-2 bg-black/60 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs text-amber-200 font-serif">
              <Sparkles className="w-4 h-4 text-amber-400" /> Triple Panel (900x)
            </div>
          </div>
        </div>

        {/* Visual Badge Frame */}
        <div className="relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-md opacity-20 animate-pulse"></div>
          <div className="relative bg-zinc-950 border-2 border-amber-400/80 p-6 sm:p-8 rounded-2xl w-60 sm:w-64 text-center shadow-inner">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-[10px] text-black font-semibold rounded-full uppercase tracking-wider font-serif">
              PROMPT PAYOUTS
            </span>
            <div className="text-amber-400 text-3xl font-bold font-serif mb-1 tracking-wider">
              900x
            </div>
            <div className="text-xs text-amber-300/60 uppercase tracking-widest mb-4">
              Payout Premium Model
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-3"></div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Convert virtual coins to try your luck and win daily results immediately. Multipliers are fully standardized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
