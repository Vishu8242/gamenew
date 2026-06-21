import React from 'react';
import { Award, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export const SchemeCard: React.FC = () => {
  return (
    <div id="game-schemes-card" className="bg-zinc-950 border border-amber-500/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h3 className="font-serif text-lg font-bold text-neutral-100 uppercase tracking-widest">
          Multipliers & Rewards Scheme
        </h3>
      </div>

      <p className="text-neutral-400 text-xs mb-5 leading-relaxed">
        We offer standard, premium payout models for all three mathematical modes. Spend virtual coins to secure your entry. Rewards are instant on result publication.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Single Digit */}
        <div className="p-4 bg-zinc-900 rounded-lg border border-amber-500/10 text-center relative hover:border-amber-500/20 transition-all">
          <div className="text-amber-500 text-xs font-mono uppercase tracking-widest font-semibold mb-1">Single Digit</div>
          <p className="text-neutral-400 text-[10px] uppercase mb-2">No. 0 - 9</p>
          <div className="text-2xl font-serif font-black text-amber-300">9x Payout</div>
          <p className="text-[10px] text-neutral-500 mt-2">10 coins pays 90</p>
        </div>

        {/* Double Digit */}
        <div className="p-4 bg-zinc-900 rounded-lg border border-amber-500/10 text-center relative hover:border-amber-400/20 transition-all">
          <div className="text-amber-500 text-xs font-mono uppercase tracking-widest font-semibold mb-1">Double (Jodi)</div>
          <p className="text-neutral-400 text-[10px] uppercase mb-2">No. 00 - 99</p>
          <div className="text-2xl font-serif font-black text-amber-400">90x Payout</div>
          <p className="text-[10px] text-neutral-500 mt-2">10 coins pays 900</p>
        </div>

        {/* Triple Digit */}
        <div className="p-4 bg-zinc-900 rounded-lg border border-amber-500/10 text-center relative hover:border-amber-400/20 transition-all">
          <div className="text-amber-500 text-xs font-mono uppercase tracking-widest font-semibold mb-1">Triple (Panel)</div>
          <p className="text-neutral-400 text-[10px] uppercase mb-2">No. 000 - 999</p>
          <div className="text-2xl font-serif font-black text-amber-500">900x Payout</div>
          <p className="text-[10px] text-neutral-500 mt-2">10 coins pays 9,000</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[10px] text-amber-400/60 font-mono">
        <ShieldCheck className="w-4 h-4 text-amber-500" />
        <span>Virtual gaming values only. No real fiat currencies placed. Safe sandbox.</span>
      </div>
    </div>
  );
};
