import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  PhoneCall, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  IndianRupee,
  Lock
} from 'lucide-react';

export default function CheckoutSimulation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id') || 'ORD-TEST-' + Math.floor(Date.now() / 1000);
  const amount = Number(searchParams.get('amount')) || 1000;

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'qr'>('upi');
  const [upiId, setUpiId] = useState('user@paytm');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(3);

  // Auto-redirect timer on success
  useEffect(() => {
    if (success) {
      if (timer === 0) {
        navigate('/wallet');
        return;
      }
      const interval = setInterval(() => {
        setTimer(p => p - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success, timer, navigate]);

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend to update simulated database status to SUCCESS
      const res = await fetch('/api/pay/simulate-payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        alert("Simulation failed to record: " + data.message);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error contacting the simulation server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="checkout-container" className="min-h-screen bg-zinc-950 text-neutral-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-90 border-2 border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Security / Branding Top bar */}
        <div className="bg-gradient-to-r from-amber-600/10 to-yellow-500/10 border-b border-amber-500/20 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">128-Bit Secure Gateway</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">PROVIDER: RUPAYEX</span>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-6 animate-fadeIn">
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-black text-emerald-400 uppercase tracking-wider">
                PAYMENT SUCCESSFUL!
              </h2>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                INR {amount.toLocaleString()} has been safely captured. Your transaction has been recorded under reference ID <span className="text-white font-mono">{orderId}</span>.
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-neutral-800 rounded-xl max-w-xs mx-auto text-[11px] font-mono text-neutral-500">
              Auto Redirecting to your Dashboard and Refilling Your Wallet balance in <span className="text-amber-400 font-bold">{timer}s</span>...
            </div>

            <button 
              onClick={() => navigate('/wallet')} 
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-serif font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer"
            >
              GO BACK NOW
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Amount details node */}
            <div className="text-center pb-4 border-b border-neutral-900">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">ORDER TRANSACTION ID: {orderId}</p>
              <div className="text-3xl font-serif font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-amber-500 flex items-center justify-center gap-1">
                <IndianRupee className="w-6 h-6 text-amber-400" />
                {amount.toLocaleString()}
              </div>
              <p className="text-[10px] font-mono text-neutral-600 mt-1 uppercase">Satta Matka Virtual refill conversion active (1:1)</p>
            </div>

            {/* Methods Tabs selector */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-3 rounded-lg border text-xs font-serif font-bold transition-all uppercase flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-amber-400 bg-amber-500/5 text-amber-400'
                    : 'border-neutral-800 bg-transparent text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/40'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                UPI ID
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('qr')}
                className={`py-2 px-3 rounded-lg border text-xs font-serif font-bold transition-all uppercase flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'qr'
                    ? 'border-amber-400 bg-amber-500/5 text-amber-400'
                    : 'border-neutral-800 bg-transparent text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/40'
                }`}
              >
                <QrCode className="w-4 h-4" />
                QR Pay
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-lg border text-xs font-serif font-bold transition-all uppercase flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-amber-400 bg-amber-500/5 text-amber-400'
                    : 'border-neutral-800 bg-transparent text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/40'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                CARD
              </button>
            </div>

            {/* Method Forms */}
            <form onSubmit={handleSimulatePayment} className="space-y-4">
              {paymentMethod === 'upi' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Enter UPI ID (GPay / PhonePe / Paytm)
                  </label>
                  <input 
                    type="text" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="shrivastavavishu@ybl"
                    className="w-full bg-zinc-950 border border-neutral-800 focus:border-amber-500 text-neutral-200 text-xs px-3 py-2.5 rounded-lg outline-none font-mono"
                    required
                  />
                  <div className="text-[10px] text-neutral-600 font-mono italic">
                    Example: username@okhdfcbank, username@paytm etc.
                  </div>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-neutral-800 rounded-xl space-y-3">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">SCAN WITH GPAY / PHONEPE / BHIM</span>
                  <div className="p-2.5 bg-white rounded-lg">
                    <QrCode className="w-32 h-32 text-zinc-950" />
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono font-bold animate-pulse">UPI STRING ACTIVATED</span>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3 bg-zinc-950 p-4 border border-neutral-800 rounded-xl">
                  <div>
                    <label className="block text-[9px] font-mono text-neutral-500 mb-1">CARD HOLDER</label>
                    <input type="text" placeholder="SHRIVASTAVA VISHU" className="w-full bg-zinc-90 border border-neutral-900 rounded p-1.5 text-xs outline-none uppercase font-mono" disabled />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-mono text-neutral-500 mb-1">CARD NUMBER</label>
                      <input type="text" placeholder="XXXX XXXX XXXX 4153" className="w-full bg-zinc-90 border border-neutral-900 rounded p-1.5 text-xs outline-none font-mono" disabled />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-neutral-500 mb-1">CVV</label>
                      <input type="text" placeholder="***" className="w-full bg-zinc-90 border border-neutral-900 rounded p-1.5 text-xs outline-none font-mono" disabled />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Simulation execute */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 text-zinc-950 font-serif font-black tracking-widest text-xs uppercase rounded-lg shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    CAPTURING COINS...
                  </>
                ) : (
                  <>
                    SIMULATE SECURE PAYMENT
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer info badge */}
        <div className="p-4 bg-zinc-950 border-t border-neutral-900/60 text-center text-neutral-600 text-[10px] font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500/60" /> Authenticated via Rupayex Sandbox Module
        </div>
      </div>
    </div>
  );
}
