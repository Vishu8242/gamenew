import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Coins, Play, Plus, Trash2, Trophy, Sparkles } from 'lucide-react';
import { Bet } from '../types';

export default function JodiGame() {
  const { profile } = useAuth();
  const { markets, placeMultiBets } = useGame();
  const navigate = useNavigate();

  const [selectedMarket, setSelectedMarket] = useState('');
  const [jodiNumber, setJodiNumber] = useState('');
  const [betCoins, setBetCoins] = useState<number>(100);
  
  // Betting slip for Jodi
  const [betSlip, setBetSlip] = useState<Bet[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto select first open market
  useEffect(() => {
    if (!selectedMarket && markets.length > 0) {
      const openOne = markets.find(m => m.status === 'open');
      if (openOne) setSelectedMarket(openOne.marketName);
    }
  }, [markets, selectedMarket]);

  const addToSlip = () => {
    setError('');
    setSuccess('');

    // Normalize number to have leading zeros if single digits entered (e.g. "5" -> "05")
    let normalized = jodiNumber.trim().replace(/\D/g, '');
    if (normalized.length === 1) {
      normalized = '0' + normalized;
    }

    if (normalized.length !== 2) {
      setError('Please enter a valid 2-digit Jodi number (00 - 99).');
      return;
    }

    if (betCoins <= 0) {
      setError('Enter a valid amount of virtual coins.');
      return;
    }

    // Merge if same number already in slip
    const existingIndex = betSlip.findIndex(b => b.number === normalized);
    if (existingIndex > -1) {
      const updated = [...betSlip];
      updated[existingIndex].coins += betCoins;
      setBetSlip(updated);
    } else {
      setBetSlip([...betSlip, { number: normalized, coins: betCoins }]);
    }

    setJodiNumber('');
    setSuccess(`Jodi pair "${normalized}" added to betting slip!`);
  };

  const removeFromSlip = (index: number) => {
    const updated = [...betSlip];
    updated.splice(index, 1);
    setBetSlip(updated);
  };

  const clearSlip = () => {
    setBetSlip([]);
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profile) {
      setError('You must be logged in to play.');
      return;
    }

    if (!selectedMarket) {
      setError('Please select a market.');
      return;
    }

    if (betSlip.length === 0) {
      setError('Your betting slip is empty. Add some Jodi predictions first.');
      return;
    }

    const totalRequired = betSlip.reduce((total, b) => total + b.coins, 0);
    if (profile.coins < totalRequired) {
      setError(`Insufficient balance. Slip total requires ${totalRequired} coins, but your wallet has ${profile.coins} coins.`);
      return;
    }

    setLoading(true);
    try {
      const res = await placeMultiBets('Jodi', selectedMarket, betSlip);
      if (res.success) {
        setSuccess(`⚜️ Jodi entries applied successfully! Commited total of ${totalRequired} coins inside "${selectedMarket}". Best of luck! ⚜️`);
        setBetSlip([]);
      } else {
        setError(res.msg);
      }
    } catch (err: any) {
      setError(err.message || 'Transaction error.');
    } finally {
      setLoading(false);
    }
  };

  const totalCurrentCoins = betSlip.reduce((sum, b) => sum + b.coins, 0);

  return (
    <div id="jodi-arena" className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Return button */}
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-mono transition-colors border-none outline-none cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> BACK TO GAMES LOBBY
      </button>

      {/* Header Info Card */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-amber-950/10 border-2 border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono uppercase tracking-widest font-bold mb-1">
          <Trophy className="w-4 h-4 text-amber-500 animate-pulse" /> Extreme Payout Multiplier: 90x
        </div>
        <h2 className="font-serif text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500 uppercase tracking-widest leading-none">
          JODI ARENA (00 - 99)
        </h2>
        <p className="text-neutral-405 text-xs mt-1.5 max-w-2xl leading-relaxed">
          Predict the 2-digit Jodi number of the draw (range <strong className="text-amber-400 font-mono text-sm">00 - 99</strong>). Jodi combines both the Open and Close single digits. True masters win <strong className="text-amber-400 font-serif">90x coins</strong> instantly!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Play selectors panel */}
        <div className="lg:col-span-7 bg-zinc-950 border border-amber-500/25 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-6">
          <h3 className="text-amber-400 text-xs font-mono font-bold tracking-widest uppercase border-b border-amber-500/10 pb-2">
            ⚜️ Create Jodi Play Slip
          </h3>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Select Market */}
          <div>
            <label className="block text-[10px] font-mono text-amber-500/80 uppercase tracking-wider mb-2">
              1. Choose Game Market
            </label>
            <select 
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-zinc-900 border border-amber-500/20 text-neutral-200 text-xs py-2 px-3 rounded-lg outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">-- Choose active Market --</option>
              {markets.map((m) => (
                <option key={m.id} value={m.marketName} disabled={m.status === 'closed'}>
                  {m.marketName} ({m.openTime} - {m.closeTime}) {m.status === 'closed' ? '[CLOSED]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Enter Jodi Number */}
          <div>
            <label className="block text-[10px] font-mono text-amber-500/80 uppercase tracking-wider mb-2">
              2. Enter Jodi Pair (00 - 99)
            </label>
            <input 
              type="text"
              maxLength={2}
              value={jodiNumber}
              onChange={(e) => setJodiNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g., 45"
              className="w-full bg-zinc-900 border-2 border-amber-500/20 text-center text-neutral-100 font-serif text-2xl py-3 rounded-lg outline-none focus:border-amber-400 font-black tracking-widest uppercase transition-all"
            />
            
            {/* Quick selectors grid */}
            <div className="grid grid-cols-5 gap-1.5 mt-3">
              {['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setJodiNumber(v)}
                  className="py-1 text-[10.5px] font-mono bg-zinc-900 border border-amber-500/10 hover:border-amber-400 text-neutral-400 hover:text-amber-300 rounded cursor-pointer transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Enter Play coins */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-[10px] font-mono text-amber-500/80 uppercase tracking-wider">
                3. Virtual Coins Amount
              </label>
              {profile && (
                <span className="text-[9px] text-neutral-500 font-mono">
                  Wallet: <strong className="text-amber-400 font-bold">{profile.coins.toLocaleString()} Coins</strong>
                </span>
              )}
            </div>
            <div className="relative bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden flex items-center">
              <span className="pl-3 pr-2"><Coins className="w-4 h-4 text-amber-500" /></span>
              <input 
                type="number" 
                value={betCoins === 0 ? '' : betCoins}
                onChange={(e) => setBetCoins(Math.max(1, Number(e.target.value)))}
                placeholder="100"
                min="1"
                className="w-full bg-transparent py-2 text-sm text-neutral-200 outline-none font-mono"
              />
              <span className="pr-3 text-[10px] text-neutral-500 font-mono">COINS</span>
            </div>

            <div className="flex gap-1.5 mt-2">
              {[50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBetCoins(amt)}
                  className="px-2 py-1 text-[9px] font-mono bg-zinc-900 border border-amber-500/5 hover:border-amber-400/30 text-neutral-400 hover:text-amber-400 rounded cursor-pointer transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addToSlip}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-amber-400 text-amber-400 font-mono font-black tracking-widest text-xs uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
          >
            <Plus className="w-4 h-4 text-amber-400" /> ADD TO SLIP
          </button>
        </div>

        {/* Betting Slip Area */}
        <div className="lg:col-span-5 bg-zinc-950 border border-amber-500/25 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
              <h3 className="text-amber-400 text-xs font-mono font-bold tracking-widest uppercase">
                ⚜️ Active Jodi Slip
              </h3>
              {betSlip.length > 0 && (
                <button 
                  onClick={clearSlip}
                  className="text-neutral-500 hover:text-red-400 font-mono text-[10px] transition-colors cursor-pointer border-none"
                >
                  Clear Slip
                </button>
              )}
            </div>

            {betSlip.length === 0 ? (
              <div className="py-12 text-center text-neutral-600 font-mono text-xs">
                Your slip is empty.<br />Enter a 2-digit Jodi pair and add it to start.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {betSlip.map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/60 border border-amber-500/5 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500">JODI:</span>
                      <span className="text-sm font-black font-serif text-amber-400 underline decoration-amber-500/30">{item.number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{item.coins.toLocaleString()} Coins</span>
                      <button 
                        onClick={() => removeFromSlip(idx)}
                        className="text-neutral-600 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slip totals & final buttons */}
          <div className="mt-6 border-t border-amber-500/10 pt-4 space-y-4">
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Total Pairs:</span>
                <span>{betSlip.length} bet(s)</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Total Coins Committed:</span>
                <span className="text-amber-400 font-bold">{totalCurrentCoins.toLocaleString()} Coins</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Estimated Win Payout (90x):</span>
                <span className="text-emerald-400 font-bold font-serif">+{(totalCurrentCoins * 90).toLocaleString()} Coins</span>
              </div>
            </div>

            <button
              onClick={handleSubmitAll}
              disabled={loading || betSlip.length === 0 || !selectedMarket}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 disabled:opacity-40 disabled:scale-100 text-zinc-950 font-serif font-black tracking-widest text-xs uppercase rounded-xl shadow-lg active:scale-97 transition-transform cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              {loading ? 'PROCESSING JODI...' : `PLACE ARENA ENTRY [${totalCurrentCoins.toLocaleString()} COINS]`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
