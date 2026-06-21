import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { 
  AlertCircle, 
  ArrowUpRight, 
  Coins, 
  Hourglass, 
  Landmark, 
  HelpCircle, 
  History, 
  Sparkles, 
  CreditCard, 
  PhoneCall, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  RefreshCw,
  TrendingUp,
  CornerDownRight
} from 'lucide-react';

export default function Wallet() {
  const { profile } = useAuth();
  const { 
    userTransactions, 
    submitDeposit,
    submitWithdrawal,
    initiateRupayexDeposit,
    verifyRupayexPayment,
    initiateRupayexPayout
  } = useGame();

  const [searchParams, setSearchParams] = useSearchParams();
  const verifyOrderId = searchParams.get('verify_order_id');

  // Page level parameters
  const [activeTab, setActiveTab] = useState<'gateway' | 'sandbox'>('gateway');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Verification states
  const [verifyingOrder, setVerifyingOrder] = useState(false);

  // Rupayex Deposit Gateway states
  const [rupayexAmount, setRupayexAmount] = useState<number>(1000);
  const [customerMobile, setCustomerMobile] = useState('');

  // Rupayex Payout Gateway states
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [payoutUpiId, setPayoutUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');

  // Manual Deposit states
  const [manualAmount, setManualAmount] = useState<number>(1000);
  const [manualUtr, setManualUtr] = useState('');
  const [manualScreenshot, setManualScreenshot] = useState('');

  // Auto verify if coming from gateway return redirect
  useEffect(() => {
    if (verifyOrderId) {
      const runVerification = async () => {
        setVerifyingOrder(true);
        setActionLoading(true);
        setSuccess('');
        setError('');
        try {
          console.log(`[Auto Verify] Detecting redirected verifyOrderId: ${verifyOrderId}`);
          const res = await verifyRupayexPayment(verifyOrderId);
          if (res.success) {
            setSuccess(`⚜️ Rupayex Checkout Success: ${res.msg} ⚜️`);
          } else {
            setError(`Payment Gateway Sync: ${res.msg}`);
          }
          // Remove query params smoothly so back-tracking won't loop
          setSearchParams({});
        } catch (err: any) {
          setError(err.message || 'Payment authentication failed');
        } finally {
          setVerifyingOrder(false);
          setActionLoading(false);
        }
      };
      runVerification();
    }
  }, [verifyOrderId, verifyRupayexPayment, setSearchParams]);

  if (!profile) return null;

  // Manual generic ord checking
  const handleManualVerify = async (orderId: string) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await verifyRupayexPayment(orderId);
      if (res.success) {
        setSuccess(`⚜️ Payment Succeeded: ${res.msg} ⚜️`);
      } else {
        setError(`Verify Audit Result: ${res.msg}`);
      }
    } catch (err: any) {
      setError(err.message || 'Audit sync failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Rupayex Deposit handler
  const handleRupayexDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (rupayexAmount < 100) {
      setError("Minimum limit for payment gateway deposit is ₹100.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await initiateRupayexDeposit(rupayexAmount, customerMobile);
      if (res.success && res.paymentUrl) {
        setSuccess("Redirecting you securely to Rupayex Gateway Checkout card now...");
        // Fast redirect window popup or direct load
        window.open(res.paymentUrl, '_blank') || (window.location.href = res.paymentUrl);
      } else {
        setError(res.msg);
      }
    } catch (err: any) {
      setError(err.message || 'Deposit initiation crashed');
    } finally {
      setActionLoading(false);
    }
  };

  // Rupayex Payout/Withdrawal handler
  const handleRupayexPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (payoutAmount < 100) {
      setError("Minimum requested payout amount is ₹100.");
      return;
    }
    if (profile.coins < payoutAmount) {
      setError(`Insufficient wallet balance. Current: ${profile.coins.toLocaleString()} Coins.`);
      return;
    }

    setActionLoading(true);
    try {
      let res;
      if (payoutMethod === 'upi') {
        if (!payoutUpiId) {
          setError("UPI address is required for UPI payout request.");
          setActionLoading(false);
          return;
        }
        res = await initiateRupayexPayout(payoutAmount, payoutUpiId, {
          accountHolder: accountHolder || profile.name,
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        });
      } else {
        if (!accountNumber || !ifscCode || !bankName || !accountHolder) {
          setError("All bank details (Holder Name, Account No, IFSC, Bank Name) are mandatory.");
          setActionLoading(false);
          return;
        }
        res = await initiateRupayexPayout(payoutAmount, undefined, {
          accountHolder,
          accountNumber,
          ifscCode,
          bankName
        });
      }

      if (res && res.success) {
        setSuccess(res.msg);
        // Clear forms
        setPayoutUpiId('');
        setAccountHolder('');
        setAccountNumber('');
        setIfscCode('');
        setBankName('');
      } else if (res) {
        setError(res.msg);
      }
    } catch (err: any) {
      setError(err.message || 'Payout settlement crashed');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual deposit submission handler
  const handleManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (manualAmount < 100) {
      setError("Minimum limit for manual deposit is ₹100.");
      return;
    }
    if (!manualUtr.trim()) {
      setError("Please key in a valid bank transaction UTR Reference Code.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await submitDeposit(manualAmount, manualUtr, manualScreenshot);
      if (res.success) {
        setSuccess(`⚜️ REQUEST SUBMITTED: ${res.msg} ⚜️`);
        setManualAmount(1000);
        setManualUtr('');
        setManualScreenshot('');
      } else {
        setError(res.msg);
      }
    } catch (err: any) {
      setError(err.message || 'Direct Deposit request failed to transmit.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div id="wallet-ledger-page" className="space-y-8 pb-12">
      {/* Title banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-90 to-amber-955/15 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider mb-2">
              <Landmark className="w-3.5 h-3.5" /> Fast Gateway Refill Engine
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-250 via-amber-300 to-amber-500 uppercase tracking-widest leading-none">
              COIN RECHARGES & LEDGERS
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5">
              Securely Deposit INR cash via the secure Rupayex Gateway or request real-time direct payouts.
            </p>
          </div>
          
          {/* Main big balance node */}
          <div className="bg-zinc-900/40 border-2 border-amber-400/80 p-4 rounded-xl text-center min-w-[200px] shadow-inner">
            <span className="text-[10px] font-mono text-amber-500/50 uppercase tracking-widest block font-bold mb-1">YOUR WALLET BALANCE</span>
            <div className="text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-250 to-amber-450 drop-shadow-[0_2px_6px_rgba(251,191,36,0.2)]">
              ₹ {profile.coins.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {verifyingOrder && (
        <div className="p-4 bg-amber-500/10 border border-amber-450/30 text-amber-400 text-xs rounded-xl flex items-center justify-center gap-2.5 max-w-4xl mx-auto animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span className="font-mono">Verifying payment order {verifyOrderId} against Rupayex gateway... Please wait.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-955/40 border border-red-500/30 text-red-000 text-xs rounded-lg flex items-start gap-2.5 max-w-4xl mx-auto animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-start gap-2.5 max-w-4xl mx-auto animate-fadeIn">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{success}</span>
        </div>
      )}

      {/* Mode navigation trigger tabs */}
      <div className="flex items-center justify-center max-w-4xl mx-auto border-b border-neutral-900">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`px-6 py-3 text-xs uppercase tracking-widest font-serif font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'gateway'
              ? 'border-amber-400 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-350'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Live Rupayex Payment API
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-6 py-3 text-xs uppercase tracking-widest font-serif font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sandbox'
              ? 'border-amber-400 text-amber-400 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-350'
          }`}
        >
          <Landmark className="w-4 h-4" /> Direct UPI / Manual Deposit
        </button>
      </div>

      {activeTab === 'gateway' ? (
        /* Rupayex Payment Integrations layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fadeIn">
          
          {/* Rupayex deposit gateway Card */}
          <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/10">
                <h3 className="font-serif font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" /> INR Payment Deposit
                </h3>
                <span className="text-[10px] text-green-400 font-mono font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  LIVE GATEWAY
                </span>
              </div>

              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                Generate dynamic checkout links via our integrated <span className="text-amber-400 font-bold">Rupayex Gateway</span>. Support real-time GPay, PhonePe, Paytm, and card. ₹1 = 1 Coin.
              </p>

              <form onSubmit={handleRupayexDeposit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">
                    Enter Deposit Amount (INR)
                  </label>
                  <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-amber-400/50 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <span className="text-amber-500 font-serif font-bold text-sm">₹</span>
                    </div>
                    <input 
                      type="number" 
                      value={rupayexAmount === 0 ? '' : rupayexAmount}
                      onChange={(e) => setRupayexAmount(Math.max(1, Number(e.target.value)))}
                      placeholder="1000"
                      min="100"
                      max="100000"
                      className="w-full bg-transparent pl-10 pr-20 py-2.5 text-sm text-neutral-200 outline-none font-mono"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 text-[10px] font-mono uppercase font-bold text-zinc-650">MIN: ₹100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
                    Customer Mobile Number (Optional)
                  </label>
                  <input 
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 text-neutral-200 text-xs px-3 py-2.5 rounded-lg outline-none font-mono"
                  />
                </div>

                {/* Quick selectors */}
                <div className="flex gap-2">
                  {[200, 500, 1000, 5000].map((v) => (
                    <button 
                      key={v}
                      type="button"
                      onClick={() => setRupayexAmount(v)}
                      className="px-2.5 py-1 text-[10px] font-mono rounded bg-zinc-90 border border-amber-500/10 hover:border-amber-400/40 text-neutral-450 hover:text-amber-400 cursor-pointer"
                    >
                      ₹{v.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 mt-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 text-zinc-950 font-serif font-black tracking-widest text-xs uppercase rounded-lg shadow-lg shadow-amber-500/15 cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-950" /> : <Loader2 className="w-4 h-4" />}
                  {actionLoading ? 'CONNECTING RUPAYEX...' : 'GENERATE WALLET DEPOSIT'}
                </button>
              </form>
            </div>
          </div>

          {/* Rupayex payout/withdrawal Card */}
          <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/10">
                <h3 className="font-serif font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-500" /> INR Withdrawal Payout
                </h3>
                <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  API PAYOUT
                </span>
              </div>

              {/* Method choice tab buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4 bg-zinc-900/60 p-1 rounded-lg border border-neutral-900">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('upi')}
                  className={`py-1.5 text-[10px] uppercase font-mono rounded cursor-pointer transition-all ${
                    payoutMethod === 'upi' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-neutral-500'
                  }`}
                >
                  UPI Payout
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  className={`py-1.5 text-[10px] uppercase font-mono rounded cursor-pointer transition-all ${
                    payoutMethod === 'bank' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-neutral-500'
                  }`}
                >
                  Bank Transfer
                </button>
              </div>

              <form onSubmit={handleRupayexPayout} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">
                    Enter Payout Amount (₹/Coins)
                  </label>
                  <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-amber-400/50 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <ArrowUpRight className="w-4 h-4 text-amber-500" />
                    </div>
                    <input 
                      type="number" 
                      value={payoutAmount === 0 ? '' : payoutAmount}
                      onChange={(e) => setPayoutAmount(Math.max(1, Number(e.target.value)))}
                      placeholder="1000"
                      min="100"
                      className="w-full bg-transparent pl-10 pr-20 py-2.5 text-sm text-neutral-200 outline-none font-mono"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 text-xs font-mono">COINS</span>
                    </div>
                  </div>
                </div>

                {payoutMethod === 'upi' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                        Recipient UPI ID
                      </label>
                      <input 
                        type="text"
                        value={payoutUpiId}
                        onChange={(e) => setPayoutUpiId(e.target.value)}
                        placeholder="e.g. upi_address@okhdfc"
                        className="w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 text-neutral-200 text-xs px-3 py-2.5 rounded-lg outline-none font-mono"
                        required={payoutMethod === 'upi'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                        UPI Account Holder Name
                      </label>
                      <input 
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="e.g. Raushan Kumar"
                        className="w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 text-neutral-200 text-xs px-3 py-2.5 rounded-lg outline-none font-mono"
                        required={payoutMethod === 'upi'}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono text-neutral-500 mb-1">Bank Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. State Bank of India" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-zinc-90 w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 rounded-lg p-2 text-xs outline-none font-mono"
                        required={payoutMethod === 'bank'}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono text-neutral-500 mb-1">Account Holder Name</label>
                      <input 
                        type="text" 
                        placeholder="Raushan Kumar" 
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full bg-zinc-90 w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 rounded-lg p-2 text-xs outline-none font-mono"
                        required={payoutMethod === 'bank'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 mb-1">Account Number</label>
                      <input 
                        type="text" 
                        placeholder="1234567890" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-zinc-90 w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 rounded-lg p-2 text-xs outline-none font-mono"
                        required={payoutMethod === 'bank'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 mb-1">IFSC Code</label>
                      <input 
                        type="text" 
                        placeholder="SBIN0001234" 
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full bg-zinc-90 w-full bg-zinc-900 border border-amber-500/20 focus:border-amber-400 rounded-lg p-2 text-xs outline-none font-mono"
                        required={payoutMethod === 'bank'}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 mt-4 bg-zinc-90 hover:bg-neutral-850 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 font-serif font-bold tracking-widest text-xs uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Landmark className="w-4 h-4" />}
                  {actionLoading ? 'SUBMITTING TO GATEWAY...' : 'SUBMIT DIRECT PAYOUT'}
                </button>
              </form>
            </div>
          </div>

        </div>
      ) : (
        /* Manual direct UPI deposit claim forms */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fadeIn col-span-2">
          
          {/* Direct Transfer Instructions card */}
          <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/10">
                <h3 className="font-serif font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" /> 1. Direct UPI Transfer
                </h3>
                <span className="text-[10px] text-green-400 font-mono font-bold bg-green-500/10 px-2 py-0.5 rounded-full uppercase">MANUAL RECHARGE</span>
              </div>

              <p className="text-neutral-400 text-xs leading-relaxed mb-4 text-justify">
                Please transfer the desired amount directly to our verified, high-escrow merchant UPI address. Your payment will be audited and authorized manually by administrators.
              </p>

              {/* Mock QR display */}
              <div className="bg-zinc-900 border border-amber-500/10 p-4 rounded-lg text-center flex flex-col items-center justify-center my-4">
                <div className="w-32 h-32 bg-white p-2 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=paytm.rupayexpress@upi&pn=Khan%20Matka%20Arena&am=1000.00&cu=INR"
                    alt="UPI payment QR Code"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">VERIFIED UPI ID</span>
                  <span className="text-xs font-mono text-amber-400 font-bold select-all">paytm.rupayexpress@upi</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 space-y-1 bg-zinc-90 w-full bg-zinc-900/50 border border-neutral-900 rounded-lg p-3">
                <p className="text-xs font-serif font-bold text-amber-400/85 mb-1 uppercase tracking-wider">Instructions:</p>
                <p>1. Open any UPI application (GPay, Paytm, PhonePe, Bhim).</p>
                <p>2. Scan the QR code above or key in the UPI ID manually.</p>
                <p>3. Complete your payment and write down/copy the 12-digit transaction UTR reference.</p>
                <p>4. Input the amount and UTR code in the claim form on the right.</p>
              </div>
            </div>
          </div>

          {/* Manual Deposit claim form Card */}
          <div className="bg-zinc-950 border border-amber-500/15 p-6 rounded-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/10">
                <h3 className="font-serif font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-500" /> 2. Submit Deposit Receipt
                </h3>
                <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">CLAIM REQUEST</span>
              </div>

              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                Notify our financial ledger department of your completed deposit. Winnings and wallet status compile immediately once audited by admins.
              </p>

              <form onSubmit={handleManualDeposit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">
                    Enter Deposited Amount (INR / Coins)
                  </label>
                  <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <span className="text-amber-500 font-serif font-bold text-sm">₹</span>
                    </div>
                    <input 
                      type="number" 
                      value={manualAmount === 0 ? '' : manualAmount}
                      onChange={(e) => setManualAmount(Math.max(1, Number(e.target.value)))}
                      placeholder="1000"
                      min="100"
                      className="w-full bg-transparent pl-10 pr-20 py-2.5 text-sm text-neutral-200 outline-none font-mono"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 text-xs font-mono">COINS</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">
                    12-Digit Transaction UTR Number
                  </label>
                  <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <input 
                      type="text" 
                      value={manualUtr}
                      onChange={(e) => setManualUtr(e.target.value)}
                      placeholder="e.g. 320495830912"
                      className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-neutral-200 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">
                    Payment Attachment description or note
                  </label>
                  <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <input 
                      type="text" 
                      value={manualScreenshot}
                      onChange={(e) => setManualScreenshot(e.target.value)}
                      placeholder="e.g. Paytm checkout reference screenshot description"
                      className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-neutral-200 outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 mt-4 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 text-zinc-950 font-serif font-black tracking-widest text-xs uppercase rounded-lg shadow-lg shadow-amber-500/15 cursor-pointer active:scale-95 transition-transform"
                >
                  {actionLoading ? 'TRANSMITTING CLAIM...' : 'SUBMIT DEPOSIT CLAIM'}
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* Manual order checking panel for luxury audit operations */}
      <div className="bg-zinc-950 border border-amber-500/15 p-5 rounded-xl shadow-xl max-w-4xl mx-auto space-y-4">
        <div>
          <h3 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-amber-500" /> Manual Payment Order Synchronization
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
            If your browser redirect failed or a payment was captured but did not credit automatically, key in your Rupayex Payment Order ID below to trigger an automated API verification against Rupayex.
          </p>
        </div>
        
        <div className="flex gap-3.5">
          <input 
            type="text" 
            id="manual-sync-input"
            placeholder="e.g. RXP-17188390884-129"
            className="flex-1 bg-zinc-900 border border-amber-500/25 rounded-lg px-3 py-2 text-xs font-mono text-neutral-250 outline-none focus:border-amber-400"
          />
          <button
            onClick={() => {
              const el = document.getElementById('manual-sync-input') as HTMLInputElement;
              if (el && el.value) {
                handleManualVerify(el.value);
              }
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-zinc-950 font-serif font-extrabold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
          >
            Verify Order
          </button>
        </div>
      </div>

      {/* Complete Transactions Ledger Table */}
      <div className="bg-zinc-950 border border-amber-500/15 p-5 rounded-xl shadow-xl max-w-4xl mx-auto">
        <h3 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-3 mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          My Private Transaction Archives
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                <th className="py-2.5 px-3">Date / Timestamp</th>
                <th className="py-2.5 px-3">Transaction Type</th>
                <th className="py-2.5 px-3">Ledger Descriptions / reference</th>
                <th className="py-2.5 px-3">Action status</th>
                <th className="py-2.5 px-3 text-right">Sum balance</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono text-neutral-300">
              {userTransactions.map((tx, idx) => {
                const isGain = tx.type === 'win' || tx.type === 'deposit';
                const isPending = tx.status === 'pending';
                const isRXP = tx.description?.includes('RXP-');

                return (
                  <tr 
                    key={tx.id || idx}
                    className="border-b border-neutral-900/40 hover:bg-neutral-900/10 transition-colors"
                  >
                    <td className="py-3 px-3 text-neutral-500">
                      {tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold">
                      <span className={`px-1.5 py-0.5 rounded ${
                        isGain 
                          ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-505/20'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-400">
                      <div className="flex flex-col">
                        <span>{tx.description}</span>
                        {isRXP && isPending && (
                          <button 
                            onClick={() => {
                              const match = tx.description.match(/RXP-\d+-\d+/);
                              if (match) {
                                handleManualVerify(match[0]);
                              }
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline text-left mt-1 cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Re-trigger status verification
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded ${
                        tx.status === 'approved' || tx.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : tx.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400 font-bold animate-pulse'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-serif font-bold text-sm ${isGain ? 'text-emerald-400' : 'text-neutral-350'}`}>
                      {isGain ? '+' : ''}{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              {userTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-500 italic">
                    No transactions have been processed on this profile yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
