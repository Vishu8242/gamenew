import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { NoticeCard } from '../components/NoticeCard';
import { LiveResult } from '../components/LiveResult';
import { SchemeCard } from '../components/SchemeCard';
import { ResultBoard } from '../components/ResultBoard';
import { useAuth } from '../context/AuthContext';
import { Crown, Sparkles, Star, Target, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { profile } = useAuth();

  return (
    <div id="home-lobby" className="space-y-8 pb-12">
      {/* Premium Hero Banner */}
      <HeroBanner />

      {/* Marquee bullet bulletins */}
      <NoticeCard />

      {/* Main Grid: Live results and schemes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LiveResult />
        </div>
        <div>
          <SchemeCard />
        </div>
      </div>

      {/* General Information or quick play banners if not logged in */}
      {!profile && (
        <div className="bg-gradient-to-r from-amber-600/10 via-yellow-400/5 to-amber-600/10 border border-amber-500/20 p-6 rounded-2xl text-center">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-pulse" />
          <h3 className="font-serif text-lg font-bold text-amber-200 uppercase tracking-widest mb-1">
            Join the Premium Khan Matka Arena!
          </h3>
          <p className="text-neutral-300 text-xs max-w-xl mx-auto mb-4 leading-relaxed">
            Create an account today to access our live digital gaming lobby. Dive right into single, double, or triple digit games with standard automated payouts on verified winning markets.
          </p>
          <div className="flex justify-center gap-3">
            <Link 
              to="/signup" 
              className="px-6 py-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 text-neutral-950 rounded-lg text-xs font-serif font-bold tracking-wider transition-all"
            >
              CREATE YOUR PROFILE
            </Link>
          </div>
        </div>
      )}

      {/* Digital Market Rooms Boards */}
      <ResultBoard />

      {/* Bottom informational guidelines block */}
      <div className="p-6 bg-zinc-950 border border-amber-500/10 rounded-xl">
        <h4 className="font-serif text-amber-400/80 font-bold mb-2 uppercase text-xs tracking-wider">
          Traditional Khan Matka Arena Rules & Disclaimers
        </h4>
        <p className="text-[11px] text-neutral-400 leading-relaxed mb-2">
          1. Khan Matka Arena is a virtual sandboxed game using imaginary virtual coins. There are no real fiat currencies or credit involved. It is designed entirely for educational demonstration, interface testing, and math calculation exercises.
        </p>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          2. Multipliers are fully authorized: Single game numbers 0-9 evaluate at 9x. Jodi double-digit options 00-99 evaluate at 90x. Panel triple-digit options 000-999 evaluate at 900x. Winnings are processed immediately on results published.
        </p>
      </div>
    </div>
  );
}
