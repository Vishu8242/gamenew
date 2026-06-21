import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  increment,
  addDoc,
  serverTimestamp,
  writeBatch,
  where
} from 'firebase/firestore';
import { 
  AlertCircle, 
  CheckCircle, 
  Coins, 
  Crown, 
  Hourglass, 
  Megaphone, 
  PlusCircle, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Target, 
  Trash2, 
  TrendingUp, 
  UserMinus, 
  Users, 
  UserX,
  XCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import AdminNumberAnalytics from '../components/AdminNumberAnalytics';

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  // Gamecontext operations
  const { 
    markets, 
    notices, 
    recentResults, 
    addNotice, 
    toggleNotice, 
    deleteNotice, 
    submitResultsAndCalculate,
    addMarket,
    updateMarketStatus,
    deleteMarket
  } = useGame();

  // Selected sub-tab state
  const [activeTab, setActiveTab] = useState<'users' | 'results' | 'notices' | 'markets' | 'withdrawals' | 'analytics'>('users');

  // Interactive statistics state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEntries: 0,
    coinsUsedToday: 0,
    totalWinners: 0,
    pendingWithdrawals: 0
  });

  // Database listings
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbEntries, setDbEntries] = useState<any[]>([]);
  const [pendingWithdrawalsList, setPendingWithdrawalsList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form states: Publish result
  const [resultMarket, setResultMarket] = useState('');
  const [openPanelInput, setOpenPanelInput] = useState('');
  const [closePanelInput, setClosePanelInput] = useState('');
  const [publishing, setPublishing] = useState(false);
  
  // Form states: Create market
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketOpen, setNewMarketOpen] = useState('');
  const [newMarketClose, setNewMarketClose] = useState('');

  // Form states: Add Notice
  const [newNoticeText, setNewNoticeText] = useState('');

  // Form states: Coin adjustments
  const [targetUserUid, setTargetUserUid] = useState('');
  const [adjAmount, setAdjAmount] = useState<number>(1000);

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search filter for user table
  const [userSearch, setUserSearch] = useState('');

  // Gate access control: Only administrators permitted!
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="text-center py-12 p-6 bg-zinc-950 border border-amber-500/15 rounded-xl max-w-md mx-auto mt-12 animate-fadeIn">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-red-400 uppercase">ACCESS FORBIDDEN / GUARD GATE</h3>
        <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed font-mono">
          Administrative security token missing. Standard accounts are forbidden from entering. Elevate your role inside My Profile using 'GOLDEN777' bypass first!
        </p>
      </div>
    );
  }

  // Set default market for results declaration
  useEffect(() => {
    if (markets.length > 0 && !resultMarket) {
      setResultMarket(markets[0].marketName);
    }
  }, [markets, resultMarket]);

  // Read all Users, Entries, and Transactions directly from Firestore
  useEffect(() => {
    setLoadingList(true);
    
    // 1. Listen to All Users
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(qUsers, (snap) => {
      const items: any[] = [];
      let totalWinsCount = 0;
      snap.forEach((docSnap) => {
        const u = { uid: docSnap.id, ...docSnap.data() } as any;
        items.push(u);
        totalWinsCount += (u.totalWins || 0);
      });
      setDbUsers(items);

      // Summarize stats
      setStats(prev => ({
        ...prev,
        totalUsers: items.length,
        totalWinners: totalWinsCount
      }));
    });

    // 2. Read All Entries for totals and charts
    const qEntries = query(collection(db, 'entries'));
    const unsubscribeEntries = onSnapshot(qEntries, (snap) => {
      const entriesItems: any[] = [];
      let coinsToday = 0;
      snap.forEach((docSnap) => {
        const e = docSnap.data();
        entriesItems.push(e);
        coinsToday += (e.coinsUsed || 0);
      });
      setDbEntries(entriesItems);

      setStats(prev => ({
        ...prev,
        totalEntries: entriesItems.length,
        coinsUsedToday: coinsToday
      }));
    });

    // 3. Listen to Pending withdrawals
    const qTxs = query(
      collection(db, 'transactions'), 
      where('type', '==', 'withdrawal'),
      where('status', '==', 'pending')
    );
    const unsubscribeTxs = onSnapshot(qTxs, (snap) => {
      const wlItems: any[] = [];
      snap.forEach((docSnap) => {
        wlItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPendingWithdrawalsList(wlItems);
      setStats(prev => ({
        ...prev,
        pendingWithdrawals: wlItems.length
      }));
      setLoadingList(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeEntries();
      unsubscribeTxs();
    };
  }, []);

  // Action: Publish daily game results and execute payout allocations!
  const handlePublishResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resultMarket) {
      setErrorMsg("Please select a target Game Market session");
      return;
    }

    if (openPanelInput.length !== 3 || isNaN(Number(openPanelInput))) {
      setErrorMsg("Open Panel must be a 3-digit number (e.g., 123)");
      return;
    }

    if (closePanelInput.length !== 3 || isNaN(Number(closePanelInput))) {
      setErrorMsg("Close Panel must be a 3-digit number (e.g., 234)");
      return;
    }

    setPublishing(true);
    try {
      const report = await submitResultsAndCalculate(resultMarket, openPanelInput, closePanelInput);
      if (report.success) {
        setSuccessMsg(`⚜️ RESULT DECLARATION SUCCESSFUL! Settled and paid out ${report.winTotalPaid.toLocaleString()} coins across ${report.winsCount} winning bets for ${resultMarket}!`);
        setOpenPanelInput('');
        setClosePanelInput('');
      } else {
        setErrorMsg(report.msg || "Failed to settle results.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to publish result.");
    } finally {
      setPublishing(false);
    }
  };

  // Action: Add new NOTICE
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;
    try {
      await addNotice(newNoticeText);
      setNewNoticeText('');
      setSuccessMsg("公告 Notice added successfully!");
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Action: Create market
  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketName.trim() || !newMarketOpen.trim() || !newMarketClose.trim()) return;
    try {
      await addMarket(newMarketName, newMarketOpen, newMarketClose);
      setNewMarketName('');
      setNewMarketOpen('');
      setNewMarketClose('');
      setSuccessMsg(`Market room "${newMarketName.toUpperCase()}" launched actively!`);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Action: BLOCK or UNBLOCK users
  const handleToggleBlockUser = async (uid: string, currentBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { blocked: !currentBlocked });
      setSuccessMsg(`User status updated successfully!`);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Action: Add/Deduct Coins from specific user profile
  const handleAdjustCoins = async (mode: 'add' | 'deduct') => {
    if (!targetUserUid) {
      setErrorMsg("Select a target user sequence first");
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    const scale = mode === 'add' ? adjAmount : -adjAmount;
    
    // Check balance bounds if deducting
    const targetUser = dbUsers.find(u => u.uid === targetUserUid);
    if (!targetUser) return;
    
    if (mode === 'deduct' && targetUser.coins < adjAmount) {
      setErrorMsg(`Insufficient coins in user profile. Selected user only has: ${targetUser.coins} coins.`);
      return;
    }

    try {
      const batch = writeBatch(db);
      
      // 1. Update User Document
      batch.update(doc(db, 'users', targetUserUid), {
        coins: increment(scale)
      });

      // 2. Create Transaction Log entry
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: targetUserUid,
        type: mode === 'add' ? 'deposit' : 'withdrawal',
        amount: scale,
        description: `Administrative Adjustment (${mode.toUpperCase()}): ${adjAmount} Coins`,
        status: 'completed',
        createdAt: serverTimestamp()
      });

      await batch.commit();
      setSuccessMsg(`Coins adjusted correctly! ${mode === 'add' ? 'Added' : 'Deducted'} ${adjAmount} coins into user profile: "${targetUser.name}".`);
      setTargetUserUid('');
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Action: Approve user Withdrawal Request
  const handleApproveWithdrawal = async (txId: string, userId: string, amount: number) => {
    try {
      const batch = writeBatch(db);
      // Update transaction status
      batch.update(doc(db, 'transactions', txId), { status: 'completed' });
      await batch.commit();
      setSuccessMsg("Withdrawal request authorized and approved! Virtual coins ledger completed.");
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Action: Reject user Withdrawal Request and REFUND holds
  const handleRejectWithdrawal = async (txId: string, userId: string, amount: number) => {
    try {
      const batch = writeBatch(db);
      // Refund the coins
      batch.update(doc(db, 'users', userId), {
        coins: increment(Math.abs(amount)) // withdrawal recorded with negative amount, refund is positive sum!
      });
      // Mark transacting status as rejected
      batch.update(doc(db, 'transactions', txId), { status: 'rejected' });
      await batch.commit();
      setSuccessMsg(`Withdrawal transaction rejected. Refunded ${Math.abs(amount).toLocaleString()} coins to player account.`);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Filter users by search bar input
  const filteredUsers = dbUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Analytical Chart Data arrays
  const coinsChartData = markets.map(m => ({
    name: m.marketName,
    count: dbEntries.filter(e => e.marketName === m.marketName).reduce((sum, e) => sum + (e.totalCoins || e.coinsUsed || 0), 0)
  }));

  const entriesChartData = [
    { name: 'Single Digit', value: dbEntries.filter(e => e.gameType?.toLowerCase().includes('single')).length },
    { name: 'Jodi (Double)', value: dbEntries.filter(e => e.gameType?.toLowerCase().includes('jodi')).length },
    { name: 'Panel (Triple)', value: dbEntries.filter(e => e.gameType?.toLowerCase().includes('triple')).length }
  ];

  return (
    <div id="admin-command-center" className="space-y-8 pb-12">
      {/* Title block */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-amber-955/15 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 bg-amber-500/10 border border-amber-400 text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest mb-1.5">
              <Crown className="w-3.5 h-3.5 animate-[spin_4s_infinite_linear]" /> MASTER CONSOLE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-amber-500 uppercase tracking-widest leading-none">
              ADMIN CONTROL CENTER
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5">
              Publish daily winning digits, approve transactions ledger, configure announcements notice board, and direct players!
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-955/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2.5 max-w-4xl mx-auto animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-start gap-2.5 max-w-4xl mx-auto animate-fadeIn">
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{successMsg}</span>
        </div>
      )}

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-3 bg-zinc-950 border border-amber-500/15 rounded-xl text-center">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Total Users</span>
          <div className="text-lg font-serif font-black text-amber-400 mt-1">{stats.totalUsers}</div>
        </div>
        {/* Metric 2 */}
        <div className="p-3 bg-zinc-950 border border-amber-500/15 rounded-xl text-center">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Total Entries Blocked</span>
          <div className="text-lg font-serif font-black text-neutral-200 mt-1">{stats.totalEntries}</div>
        </div>
        {/* Metric 3 */}
        <div className="p-3 bg-zinc-950 border border-amber-500/15 rounded-xl text-center">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block font-bold text-amber-500">Coins Ledger (Traffic)</span>
          <div className="text-lg font-serif font-black text-amber-300 mt-1">{stats.coinsUsedToday.toLocaleString()}</div>
        </div>
        {/* Metric 4 */}
        <div className="p-3 bg-zinc-950 border border-amber-500/15 rounded-xl text-center">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">Winning tickets paid</span>
          <div className="text-lg font-serif font-black text-emerald-405 mt-1">{stats.totalWinners}</div>
        </div>
        {/* Metric 5 */}
        <div className="p-3 bg-zinc-950 border border-red-500/20 rounded-xl text-center">
          <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider block font-bold">Pending Withdrawal requests</span>
          <div className="text-lg font-serif font-black text-red-400 mt-1">{stats.pendingWithdrawals}</div>
        </div>
      </div>

      {/* Sub-tab selection row */}
      <div className="flex flex-wrap gap-2 border-b border-amber-500/10 pb-0.5">
        {[
          { key: 'users', label: 'USER MANAGEMENT', icon: Users },
          { key: 'results', label: 'DECLARATIONS OUT', icon: Target },
          { key: 'withdrawals', label: 'FINANCE REQUESTS', icon: Coins },
          { key: 'analytics', label: 'NUMBER ANALYTICS', icon: TrendingUp },
          { key: 'notices', label: 'NOTICES BOARD', icon: Megaphone },
          { key: 'markets', label: 'MARKETS TIMES', icon: PlusCircle }
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-2.5 px-4 font-serif text-xs font-black tracking-widest border-t border-x rounded-t-xl transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-zinc-950 border-amber-500/25 border-b-transparent text-amber-400' 
                  : 'bg-transparent border-transparent text-neutral-500 hover:text-amber-550'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.key === 'withdrawals' && stats.pendingWithdrawals > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab contents wrapper */}
      <div className="p-6 bg-zinc-950 border border-amber-500/20 rounded-b-2xl shadow-2xl relative min-h-[300px]">
        {loadingList && activeTab === 'users' ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-neutral-400 mt-2 font-mono">Syncing lists...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: User Management List & coin adjuster */}
            {activeTab === 'users' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
                  <h3 className="font-serif font-black text-sm text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    User Accounts Directory ({filteredUsers.length})
                  </h3>
                  {/* Search filters */}
                  <input 
                    type="text" 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, phone, or email..."
                    className="px-3 py-1.5 bg-zinc-900 border border-amber-500/10 focus:border-amber-400 rounded-lg text-xs font-mono outline-none text-neutral-300 placeholder-zinc-700 w-full sm:w-64"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        <th className="py-2.5 px-3">Player Detail</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Coins Balances</th>
                        <th className="py-2.5 px-3">Games / Wins</th>
                        <th className="py-2.5 px-3 text-right font-bold">Adjust Keys / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-mono text-neutral-350">
                      {filteredUsers.map((user, idx) => (
                        <tr 
                          key={user.uid || idx}
                          className="border-b border-neutral-900/40 hover:bg-neutral-900/10 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="font-serif font-black text-neutral-200 uppercase">{user.name}</div>
                            <div className="text-[10px] text-neutral-500">{user.email} | Phone: {user.phone || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-3 uppercase">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                              user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-900 text-neutral-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-amber-400 font-bold">
                            {user.coins.toLocaleString()} Coins
                          </td>
                          <td className="py-3 px-3 text-neutral-400">
                            {user.totalGames || 0} G / <strong className="text-emerald-450">{user.totalWins || 0} Wins</strong>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5 font-bold">
                            {/* Coin adjustment shortcut trigger */}
                            <button 
                              onClick={() => {
                                setTargetUserUid(user.uid);
                                setSuccessMsg(`Selected player "${user.name}" to adjust coins. Use form below!`);
                              }}
                              className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 rounded text-[10px] cursor-pointer"
                            >
                              SET COINS
                            </button>

                            {/* Block Toggle */}
                            <button 
                              onClick={() => handleToggleBlockUser(user.uid, !!user.blocked)}
                              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer font-bold ${
                                user.blocked 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                  : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {user.blocked ? 'UNBLOCK' : 'BLOCK'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Inline Coin adjustment Form */}
                {targetUserUid && (
                  <div className="p-4 bg-zinc-900/60 border border-amber-500/15 rounded-xl max-w-md animate-fadeIn mt-6">
                    <h4 className="font-serif font-black text-xs text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      Adjust Selected Player Balance
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 block mb-1">Coin Size adjustment amount</label>
                        <input 
                          type="number"
                          value={adjAmount === 0 ? '' : adjAmount}
                          onChange={(e) => setAdjAmount(Math.max(1, Number(e.target.value)))}
                          placeholder="1000"
                          className="px-2.5 py-1.5 bg-zinc-900 border border-amber-500/10 rounded-lg text-xs text-amber-400 focus:border-amber-400 outline-none w-full"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAdjustCoins('add')}
                          className="py-1.5 px-3 bg-gradient-to-r from-amber-600 to-yellow-405 text-zinc-950 font-serif font-bold text-[11px] rounded transition-all cursor-pointer flex-1"
                        >
                          ADD COINS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustCoins('deduct')}
                          className="py-1.5 px-3 bg-zinc-90 border border-amber-505/20 text-red-400 hover:bg-neutral-800 text-[11px] rounded transition-all cursor-pointer flex-1"
                        >
                          DEDUCT COINS
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetUserUid('')}
                          className="py-1.5 px-3 bg-neutral-900 text-neutral-450 hover:text-neutral-200 text-[11px] rounded cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Declarations of Daily winning digits (payout matching entries instantly!) */}
            {activeTab === 'results' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                {/* Result Input forms */}
                <div className="space-y-4">
                  <h3 className="font-serif font-black text-sm text-yellow-350 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                    Publish Market Declarations & Settlement
                  </h3>

                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Select the active market room, digit model type (Single, Jodi, or Panel), and key in the final winning number. Upon clicking "PUBLISH", the server-side calculations automatically scan pending bets, allocate multiple payouts (9x, 90x, 900x), debit/credit player balances, and declare history results completely! This is an absolute real-time engine.
                  </p>

                  <form onSubmit={handlePublishResult} className="space-y-4 p-5 bg-zinc-900/40 border border-amber-500/10 rounded-xl">
                    {/* Market selection */}
                    <div>
                      <label className="block text-[10px] font-mono text-amber-505 uppercase tracking-wider mb-1.5">1. Target Game Market</label>
                      <select 
                        value={resultMarket}
                        onChange={(e) => setResultMarket(e.target.value)}
                        className="w-full bg-zinc-900 border border-amber-500/20 text-neutral-200 text-xs py-2 px-2 rounded cursor-pointer focus:border-amber-400 font-mono outline-none"
                        required
                      >
                        <option value="">-- Choose active Market --</option>
                        {markets.map((m) => (
                          <option key={m.id} value={m.marketName}>
                            {m.marketName} Result Room
                          </option>
                        ))}
                      </select>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                      {/* Open Panel */}
                      <div>
                        <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5 font-bold">
                          2. Open Panel (3-D, e.g. "123")
                        </label>
                        <input 
                          type="text" 
                          value={openPanelInput}
                          onChange={(e) => setOpenPanelInput(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123"
                          maxLength={3}
                          className="w-full bg-zinc-900 border border-amber-550/25 focus:border-amber-400 text-amber-400 text-center text-lg font-black font-serif px-3 py-2 rounded-lg outline-none placeholder-zinc-800"
                          required
                        />
                      </div>

                      {/* Close Panel */}
                      <div>
                        <label className="block text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-1.5 font-bold">
                          3. Close Panel (3-D, e.g. "456")
                        </label>
                        <input 
                          type="text" 
                          value={closePanelInput}
                          onChange={(e) => setClosePanelInput(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="456"
                          maxLength={3}
                          className="w-full bg-zinc-900 border border-amber-550/25 focus:border-amber-400 text-amber-400 text-center text-lg font-black font-serif px-3 py-2 rounded-lg outline-none placeholder-zinc-800"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={publishing || !resultMarket || openPanelInput.length !== 3 || closePanelInput.length !== 3}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 via-yellow-450 to-amber-600 hover:from-amber-500 hover:to-amber-550 disabled:opacity-50 text-zinc-955 font-serif font-black tracking-widest text-xs uppercase rounded-lg shadow-lg cursor-pointer"
                    >
                      {publishing ? 'SETTLING ALL PLACED ENTRIES...' : 'PUBLISH & SETTLE WIN TICKETS'}
                    </button>
                  </form>
                </div>

                {/* Analytical Charts */}
                <div className="space-y-4">
                  <h3 className="font-serif font-black text-sm text-amber-500 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                    Lobby Live Analytics & Visuals
                  </h3>

                  <div className="p-4 bg-zinc-900/30 border border-amber-550/10 rounded-xl space-y-6">
                    {/* Coin volume split by Market */}
                    <div>
                      <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-3">
                        Volume of Coins committed by Active market rooms:
                      </p>
                      
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={coinsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="name" stroke="#a3a3a3" fontSize={9} />
                            <YAxis stroke="#a3a3a3" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: '#000000', borderColor: '#d4af37' }} />
                            <Bar dataKey="count" fill="#ffd700" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Withdrawal approvals pending authorizations */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="font-serif font-black text-sm text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-3">
                  Pending Withdrawal Request Queues ({pendingWithdrawalsList.length})
                </h3>

                <p className="text-neutral-400 text-xs">
                  Authorize or reject cashouts from sandbox players. Rejecting a withdrawal immediately refunds the player's held balance correctly!
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase">
                        <th className="py-2.5 px-3">Player Wallet ID</th>
                        <th className="py-2.5 px-3">Date Requested</th>
                        <th className="py-2.5 px-3">Amount Required</th>
                        <th className="py-2.5 px-3 text-right">Approval decisions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-mono text-neutral-350">
                      {pendingWithdrawalsList.map((tx, idx) => (
                        <tr 
                          key={tx.id || idx}
                          className="border-b border-neutral-900/40 hover:bg-neutral-900/10 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="font-serif text-neutral-200">ID: {tx.userId.substring(0, 16)}...</div>
                          </td>
                          <td className="py-3 px-3 text-neutral-400">
                            {tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                          </td>
                          <td className="py-3 px-3 font-serif font-bold text-red-400">
                            {Math.abs(tx.amount).toLocaleString()} Coins
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5 font-bold">
                            <button
                              onClick={() => handleApproveWithdrawal(tx.id, tx.userId, tx.amount)}
                              className="px-3 py-1 bg-gradient-to-r from-amber-600 to-yellow-400 text-zinc-955 text-[10px] font-serif rounded uppercase font-bold cursor-pointer"
                            >
                              APPROVE
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(tx.id, tx.userId, tx.amount)}
                              className="px-3 py-1 bg-zinc-90 border border-amber-500/20 text-red-400 hover:bg-neutral-900 text-[10px] font-serif rounded uppercase font-bold cursor-pointer"
                            >
                              REJECT & REFUND
                            </button>
                          </td>
                        </tr>
                      ))}

                      {pendingWithdrawalsList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-neutral-500 italic">
                            No pending withdrawals requested for today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: Configure announcements notice board */}
            {activeTab === 'notices' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Notice creator */}
                  <div className="space-y-4 lg:col-span-1">
                    <h4 className="font-serif font-black text-xs text-amber-500 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                      Create System notice Bulletin
                    </h4>
                    
                    <form onSubmit={handleAddNotice} className="p-4 bg-zinc-900/40 border border-amber-505/10 rounded-xl space-y-4">
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 block mb-1">Bulletin Text</label>
                        <textarea 
                          value={newNoticeText}
                          onChange={(e) => setNewNoticeText(e.target.value)}
                          placeholder="👑 GOLD WIN MULTIPLIERS ARE ACTIVE NOW! 👑"
                          className="w-full h-24 bg-zinc-900 border border-amber-500/20 text-xs py-2 px-3 text-neutral-200 placeholder-zinc-700 outline-none focus:border-amber-400 rounded-lg"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-400 text-zinc-950 font-serif font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
                      >
                        PUBLISH TO SCREEN
                      </button>
                    </form>
                  </div>

                  {/* Notice database listings */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-serif font-black text-xs text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                      Current notice registers list
                    </h4>

                    <div className="space-y-3">
                      {notices.map((notice, id) => (
                        <div 
                          key={notice.id || id}
                          className="p-3.5 bg-zinc-900 border border-neutral-805 rounded-xl flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex-1">
                            <p className="text-neutral-200 font-serif">{notice.text}</p>
                            <p className="text-[10px] text-neutral-500 mt-1 uppercase">CREATED: {notice.id ? 'Cloud server' : 'Initial setup'}</p>
                          </div>

                          <div className="flex items-center gap-2 font-bold flex-shrink-0">
                            {/* Toggle active button */}
                            <button
                              onClick={() => toggleNotice(notice.id!, !notice.active)}
                              className={`px-2 py-0.5 text-[9px] rounded uppercase ${
                                notice.active 
                                  ? 'bg-green-500/15 border border-green-500/35 text-green-450' 
                                  : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                              }`}
                            >
                              {notice.active ? 'ACTIVE' : 'INACTIVE'}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => deleteNotice(notice.id!)}
                              className="p-1 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Market Time configuration */}
            {activeTab === 'markets' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create Market */}
                  <div className="space-y-4">
                    <h4 className="font-serif font-black text-xs text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                      Launch active Market Room session
                    </h4>

                    <form onSubmit={handleCreateMarket} className="p-4 bg-zinc-900/40 border border-amber-505/10 rounded-xl space-y-4">
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 block mb-1">Market Name (capitalized)</label>
                        <input 
                          type="text"
                          value={newMarketName}
                          onChange={(e) => setNewMarketName(e.target.value)}
                          placeholder="e.g. KALYAN MORNING"
                          className="w-full bg-zinc-900 border border-amber-500/20 text-xs py-2 px-2 text-neutral-200 placeholder-zinc-700 outline-none focus:border-amber-400 rounded-lg font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 block mb-1">Open Time</label>
                          <input 
                            type="text"
                            value={newMarketOpen}
                            onChange={(e) => setNewMarketOpen(e.target.value)}
                            placeholder="e.g. 10:00 AM"
                            className="w-full bg-zinc-900 border border-amber-500/20 text-xs py-2 px-2 text-neutral-200 placeholder-zinc-700 outline-none focus:border-amber-400 rounded-lg font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-neutral-400 block mb-1">Close Time</label>
                          <input 
                            type="text"
                            value={newMarketClose}
                            onChange={(e) => setNewMarketClose(e.target.value)}
                            placeholder="e.g. 11:00 AM"
                            className="w-full bg-zinc-900 border border-amber-500/20 text-xs py-2 px-2 text-neutral-200 placeholder-zinc-700 outline-none focus:border-amber-400 rounded-lg font-mono"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-405 text-zinc-950 font-serif font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
                      >
                        CREATE SESSION
                      </button>
                    </form>
                  </div>

                  {/* Listings */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-serif font-black text-xs text-amber-400 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                      Active Market Registrees Roster
                    </h4>

                    <div className="space-y-3">
                      {markets.map((m, idx) => (
                        <div 
                          key={m.id || idx}
                          className="p-3.5 bg-zinc-900 border border-neutral-805 rounded-xl flex items-center justify-between gap-4 text-xs"
                        >
                          <div>
                            <p className="text-neutral-200 font-serif font-bold tracking-wide uppercase text-sm">{m.marketName}</p>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">OPEN: {m.openTime} | CLOSE: {m.closeTime}</p>
                          </div>

                          <div className="flex items-center gap-2 font-bold flex-shrink-0">
                            {/* Toggle status */}
                            <button
                              onClick={() => updateMarketStatus(m.id!, m.status === 'open' ? 'closed' : 'open')}
                              className={`px-2 py-0.5 text-[9px] rounded uppercase ${
                                m.status === 'open' 
                                  ? 'bg-green-500/15 border border-green-500/35 text-green-450' 
                                  : 'bg-red-500/15 border border-red-500/35 text-red-400'
                              }`}
                            >
                              {m.status}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteMarket(m.id!)}
                              className="p-1 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 6: REAL-TIME NUMBER ANALYTICS */}
            {activeTab === 'analytics' && (
              <AdminNumberAnalytics dbEntries={dbEntries} markets={markets} />
            )}

          </>
        )}
      </div>
    </div>
  );
}
