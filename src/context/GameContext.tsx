import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  increment,
  writeBatch,
  limit,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { Market, Notice, GameResult, GameEntry, Transaction, DepositRequest, WithdrawalRequest, AppUser, Bet } from '../types';

interface GameContextType {
  markets: Market[];
  notices: Notice[];
  recentResults: GameResult[];
  userEntries: GameEntry[];
  userTransactions: Transaction[];
  leaderboard: AppUser[];
  
  // Realtime lists for Admin pages
  allDeposits: DepositRequest[];
  allWithdrawals: WithdrawalRequest[];
  allEntries: GameEntry[];
  allUsers: AppUser[];
  
  loadingData: boolean;
  
  // Custom operations
  placeMultiBets: (
    gameType: 'Single Open' | 'Single Close' | 'Jodi' | 'Triple Open' | 'Triple Close', 
    marketName: string, 
    bets: Bet[]
  ) => Promise<{ success: boolean; msg: string }>;
  
  submitDeposit: (amount: number, utr: string, screenshot: string) => Promise<{ success: boolean; msg: string }>;
  submitWithdrawal: (amount: number, upiId: string) => Promise<{ success: boolean; msg: string }>;
  
  // Rupayex Payment Gateway API integrations
  initiateRupayexDeposit: (amount: number, customerMobile: string) => Promise<{ success: boolean; paymentUrl?: string; orderId?: string; msg: string }>;
  verifyRupayexPayment: (orderId: string) => Promise<{ success: boolean; currentStatus?: string; msg: string }>;
  initiateRupayexPayout: (amount: number, upiId?: string, bankDetails?: { accountHolder: string; accountNumber: string; ifscCode: string; bankName: string }) => Promise<{ success: boolean; payoutId?: string; msg: string }>;
  
  // Admin functions
  addMarket: (marketName: string, openTime: string, closeTime: string) => Promise<void>;
  updateMarketStatus: (id: string, status: 'open' | 'closed') => Promise<void>;
  deleteMarket: (id: string) => Promise<void>;
  seedInitialData: () => Promise<void>;
  
  addNotice: (text: string) => Promise<void>;
  toggleNotice: (id: string, active: boolean) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  
  // Settle engine
  submitResultsAndCalculate: (marketName: string, openPanel: string, closePanel: string) => Promise<{ success: boolean; msg: string; winsCount: number; winTotalPaid: number }>;
  submitOpenResult: (marketName: string, openPanel: string) => Promise<{ success: boolean; msg: string; winsCount: number; winTotalPaid: number }>;
  submitCloseResult: (marketName: string, closePanel: string) => Promise<{ success: boolean; msg: string; winsCount: number; winTotalPaid: number }>;
  deleteResult: (resultId: string) => Promise<{ success: boolean; msg: string }>;
  
  approveDeposit: (id: string) => Promise<void>;
  rejectDeposit: (id: string) => Promise<void>;
  
  approveWithdrawal: (id: string) => Promise<void>;
  rejectWithdrawal: (id: string) => Promise<void>;
  
  toggleUserBlock: (uid: string, currentBlocked: boolean) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, user } = useAuth();
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [recentResults, setRecentResults] = useState<GameResult[]>([]);
  const [userEntries, setUserEntries] = useState<GameEntry[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<AppUser[]>([]);
  
  // Admin-specific lists
  const [allDeposits, setAllDeposits] = useState<DepositRequest[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [allEntries, setAllEntries] = useState<GameEntry[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);

  // 1. Listen to Markets (Alphabetical/Order)
  useEffect(() => {
    const q = query(collection(db, 'markets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Market[] = [];
      snapshot.forEach((snap) => {
        const m = { id: snap.id, ...snap.data() } as Market;
        if (m.marketName === 'KHAN MATKA') {
          items.push(m);
        }
      });
      setMarkets(items);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to Notices
  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Notice[] = [];
      snapshot.forEach((snap) => {
        items.push({ id: snap.id, ...snap.data() } as Notice);
      });
      setNotices(items);
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen to Recent Results
  useEffect(() => {
    const q = query(collection(db, 'results'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: GameResult[] = [];
      snapshot.forEach((snap) => {
        items.push({ id: snap.id, ...snap.data() } as GameResult);
      });
      setRecentResults(items);
    });
    return () => unsubscribe();
  }, []);

  // 4. Listen to Current User Entries
  useEffect(() => {
    if (!user) {
      setUserEntries([]);
      return;
    }
    // Query without orderBy to completely bypass the need for custom composite database indexes in sandbox
    const q = query(
      collection(db, 'entries'), 
      where('userId', '==', user.uid), 
      limit(200)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: GameEntry[] = [];
      snapshot.forEach((snap) => {
        items.push({ id: snap.id, ...snap.data() } as GameEntry);
      });
      // Sort client-side descending by createdAt
      items.sort((a, b) => {
        const tA = a.createdAt ? (a.createdAt.seconds * 1000 + (a.createdAt.nanoseconds || 0) / 1000050) : Date.now();
        const tB = b.createdAt ? (b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000050) : Date.now();
        return tB - tA;
      });
      setUserEntries(items);
    }, (err) => {
      console.warn("User entries listener error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // 5. Listen to Current User Transactions
  useEffect(() => {
    if (!user) {
      setUserTransactions([]);
      return;
    }
    // Query without orderBy to completely bypass the need for custom composite database indexes in sandbox
    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid), 
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((snap) => {
        items.push({ id: snap.id, ...snap.data() } as Transaction);
      });
      // Sort client-side descending by createdAt
      items.sort((a, b) => {
        const tA = a.createdAt ? (a.createdAt.seconds * 1000 + (a.createdAt.nanoseconds || 0) / 1000050) : Date.now();
        const tB = b.createdAt ? (b.createdAt.seconds * 1000 + (b.createdAt.nanoseconds || 0) / 1000050) : Date.now();
        return tB - tA;
      });
      setUserTransactions(items);
    }, (err) => {
      console.warn("User transactions listener:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // 6. Listen to Leaderboard (wins desc, then coins desc)
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('totalWins', 'desc'),
      limit(30)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: AppUser[] = [];
      snapshot.forEach((snap) => {
        items.push({ uid: snap.id, ...snap.data() } as AppUser);
      });
      
      if (items.length === 0) {
        // fall back to coins order
        const fbQ = query(collection(db, 'users'), orderBy('coins', 'desc'), limit(20));
        getDocs(fbQ).then((snap) => {
          const list: AppUser[] = [];
          snap.forEach(d => list.push({ uid: d.id, ...d.data() } as AppUser));
          setLeaderboard(list);
        });
      } else {
        setLeaderboard(items);
      }
      setLoadingData(false);
    }, (err) => {
      console.warn("Leaderboard error, loading raw users:", err);
      // Fallback query
      getDocs(query(collection(db, 'users'), limit(50))).then((snap) => {
        const list: AppUser[] = [];
        snap.forEach(d => list.push({ uid: d.id, ...d.data() } as AppUser));
        setLeaderboard(list.sort((a,b) => b.totalWins - a.totalWins || b.coins - a.coins));
        setLoadingData(false);
      });
    });
    return () => unsubscribe();
  }, []);

  // ===== Realtime Admin Subscriptions (Enabled when profile is admin) =====
  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      setAllDeposits([]);
      setAllWithdrawals([]);
      setAllEntries([]);
      setAllUsers([]);
      return;
    }

    // Deposits
    const qDeps = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'), limit(150));
    const unsubDeps = onSnapshot(qDeps, (snap) => {
      const list: DepositRequest[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as DepositRequest));
      setAllDeposits(list);
    });

    // Withdrawals
    const qWits = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'), limit(150));
    const unsubWits = onSnapshot(qWits, (snap) => {
      const list: WithdrawalRequest[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as WithdrawalRequest));
      setAllWithdrawals(list);
    });

    // Entries
    const qEnts = query(collection(db, 'entries'), orderBy('createdAt', 'desc'), limit(200));
    const unsubEnts = onSnapshot(qEnts, (snap) => {
      const list: GameEntry[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as GameEntry));
      setAllEntries(list);
    });

    // Users
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const list: AppUser[] = [];
      snap.forEach(d => list.push({ uid: d.id, ...d.data() } as AppUser));
      setAllUsers(list);
    });

    return () => {
      unsubDeps();
      unsubWits();
      unsubEnts();
      unsubUsers();
    };
  }, [profile]);

  // ===== Seed Data helper =====
  const seedInitialData = async () => {
    try {
      const mSnap = await getDocs(collection(db, 'markets'));
      let hasKhanMatka = false;
      
      for (const docSnap of mSnap.docs) {
        const data = docSnap.data();
        if (data.marketName === 'KHAN MATKA') {
          hasKhanMatka = true;
        }
      }

      if (!hasKhanMatka) {
        console.log("Seeding KHAN MATKA market...");
        await addDoc(collection(db, 'markets'), {
          marketName: 'KHAN MATKA',
          openTime: '10:00 AM',
          closeTime: '10:00 PM',
          status: 'open'
        });
      }

      const nSnap = await getDocs(collection(db, 'notices'));
      if (nSnap.empty) {
        await addDoc(collection(db, 'notices'), {
          text: "⚜️ WELCOME TO KHAN MATKA ARENA! Participate in Single (9x), Jodi (90x), and Triple Panel (900x) Arenas with live results. Fast withdrawals! ⚜️",
          active: true,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Error seeding initial arena data:", e);
    }
  };

  useEffect(() => {
    seedInitialData();
  }, []);

  // ===== Multiple Betting Logic =====
  const placeMultiBets = async (
    gameType: 'Single Open' | 'Single Close' | 'Jodi' | 'Triple Open' | 'Triple Close', 
    marketName: string, 
    bets: Bet[]
  ): Promise<{ success: boolean; msg: string }> => {
    if (!user || !profile) {
      return { success: false, msg: "You must be logged in to play." };
    }

    if (profile.blocked) {
      return { success: false, msg: "Your account is blocked by admin." };
    }

    if (!bets || bets.length === 0) {
      return { success: false, msg: "Please add at least one bet." };
    }

    const totalCoins = bets.reduce((total, b) => total + b.coins, 0);
    if (totalCoins <= 0) {
      return { success: false, msg: "Total bet amount must be greater than 0." };
    }

    if (profile.coins < totalCoins) {
      return { success: false, msg: `Insufficient balance. Total required: ${totalCoins} coins but you have only ${profile.coins} coins.` };
    }

    const activeMarket = markets.find(m => m.marketName === marketName);
    if (activeMarket && activeMarket.status === 'closed') {
      return { success: false, msg: `Market ${marketName} is currently closed. Bets rejected.` };
    }

    try {
      const batch = writeBatch(db);

      // Create Entry Document
      const entryRef = doc(collection(db, 'entries'));
      const newEntry: GameEntry = {
        userId: user.uid,
        userName: profile.name,
        marketName,
        gameType,
        bets,
        totalCoins,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      batch.set(entryRef, newEntry);

      // Create Transaction Log
      const txRef = doc(collection(db, 'transactions'));
      const newTx: Transaction = {
        userId: user.uid,
        type: 'play',
        amount: -totalCoins,
        description: `Placed ${bets.length} bet(s) on ${marketName} [${gameType}]`,
        status: 'completed',
        createdAt: serverTimestamp()
      };
      batch.set(txRef, newTx);

      // Deduct User Wallet Coins
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        coins: increment(-totalCoins),
        totalGames: increment(bets.length)
      });

      await batch.commit();
      return { success: true, msg: "Multiple bets applied successfully!" };
    } catch (err: any) {
      console.error(err);
      return { success: false, msg: err.message || "Something went wrong. Please try again." };
    }
  };

  // ===== User Deposit Form =====
  const submitDeposit = async (amount: number, utr: string, screenshot: string): Promise<{ success: boolean; msg: string }> => {
    if (!user || !profile) {
      return { success: false, msg: "Must be logged in to deposit." };
    }
    if (amount <= 0 || !utr) {
      return { success: false, msg: "Please enter valid amount and UTR number." };
    }
    try {
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        userName: profile.name,
        amount,
        utr,
        screenshot: screenshot || 'screenshot_attached_or_simulated',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Also list transaction log starting as pending
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'deposit',
        amount: amount,
        description: `Deposit request of ${amount} coins (UTR: ${utr})`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      return { success: true, msg: "Deposit request submitted successfully! Pending admin approval." };
    } catch (e: any) {
      return { success: false, msg: e.message || "Failed to submit deposit request." };
    }
  };

  // ===== User Withdrawal Form =====
  const submitWithdrawal = async (amount: number, upiId: string): Promise<{ success: boolean; msg: string }> => {
    if (!user || !profile) {
      return { success: false, msg: "Must be logged in to withdraw." };
    }
    if (amount <= 0 || !upiId) {
      return { success: false, msg: "Please enter valid amount and UPI ID." };
    }
    if (profile.coins < amount) {
      return { success: false, msg: `Insufficient wallet balance to request withdrawal. Balance: ${profile.coins} coins.` };
    }

    try {
      // Create request in withdrawals collection
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userName: profile.name,
        amount,
        upiId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Also create transaction log (pending)
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'withdrawal',
        amount: -amount,
        description: `Withdrawal request of ${amount} coins to UPI: ${upiId}`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      return { success: true, msg: "Withdrawal request submitted successfully! Waiting for admin review." };
    } catch (e: any) {
      return { success: false, msg: e.message || "Failed to submit withdrawal request." };
    }
  };

  // ===== Rupayex Payment Gateway deposit =====
  const initiateRupayexDeposit = async (amount: number, customerMobile: string): Promise<{ success: boolean; paymentUrl?: string; orderId?: string; msg: string }> => {
    if (!user || !profile) {
      return { success: false, msg: "Must be logged in." };
    }
    if (amount < 1) {
      return { success: false, msg: "Minimum amount for Rupayex deposit is ₹1." };
    }
    
    const orderId = "RXP-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    // Dynamic redirect URL pointing back to our wallet page
    const redirectUrl = `${window.location.origin}/#/wallet?verify_order_id=${orderId}`;

    try {
      // 1. Create a pending transaction record of type deposit 
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        userName: profile.name,
        amount,
        utr: orderId, // use orderId as temporary UTR
        screenshot: 'rupayex_gateway_initiated',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Add to transaction log
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'deposit',
        amount: amount,
        description: `Rupayex payment ordered (ID: ${orderId})`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 3. Request the backend proxy to create Rupayex order
      const response = await fetch('/api/pay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          order_id: orderId,
          redirect_url: redirectUrl,
          customer_mobile: customerMobile || '',
          remark1: 'Satta Play Wallet Refill'
        })
      });

      const data = await response.json();
      if (data && data.status) {
        return {
          success: true,
          paymentUrl: data.payment_url,
          orderId,
          msg: "Rupayex deposit order created! Opening checkout gateway..."
        };
      } else {
        return { success: false, msg: data?.message || "Rupayex gateway rejected order creation." };
      }
    } catch (e: any) {
      return { success: false, msg: e.message || "Failed to contact proxy server." };
    }
  };

  // ===== Rupayex Payment Gateway status check & credit =====
  const verifyRupayexPayment = async (orderId: string): Promise<{ success: boolean; currentStatus?: string; msg: string }> => {
    if (!user || !profile) {
      return { success: false, msg: "Must be logged in." };
    }

    try {
      // Call backend order status endpoint
      const response = await fetch(`/api/pay/order-status?order_id=${orderId}`);
      if (!response.ok) {
        throw new Error("Could not fetch payment status from verification server.");
      }
      const data = await response.json();

      if (data && data.status && data.payment_status === 'SUCCESS') {
        // Query to check if the deposit was already approved previously to avoid double credentialing!
        const dSnap = await getDocs(query(collection(db, 'deposits'), where('utr', '==', orderId)));
        
        if (dSnap.empty) {
          return { success: false, msg: "Deposit record matching this payment not found in database." };
        }

        const depDoc = dSnap.docs[0];
        const depData = depDoc.data();

        if (depData.status === 'approved') {
          return { success: true, currentStatus: 'SUCCESS', msg: "Order already authenticated and credited previously." };
        }

        // Atomically approve the deposit and charge coins
        const batch = writeBatch(db);
        
        // 1. Mark deposit as approved
        batch.update(doc(db, 'deposits', depDoc.id), { status: 'approved' });

        // 2. Retrieve corresponding transaction doc and update status
        const txSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid), where('status', '==', 'pending')));
        const matchedTx = txSnap.docs.find(tx => tx.data().description?.includes(orderId));
        if (matchedTx) {
          batch.update(doc(db, 'transactions', matchedTx.id), { 
            status: 'approved',
            description: `Rupayex Deposit Approved (Ref: ${orderId})`
          });
        }

        // 3. Add coins to user's wallet
        batch.update(doc(db, 'users', user.uid), {
          coins: increment(data.amount || depData.amount)
        });

        await batch.commit();

        return { 
          success: true, 
          currentStatus: 'SUCCESS', 
          msg: `Authenticating payment order succeeded! Added ${data.amount || depData.amount} coins successfully.` 
        };
      } else {
        return { 
          success: false, 
          currentStatus: data?.payment_status || 'PENDING', 
          msg: `Payment order status is currently: ${data?.payment_status || 'PENDING'}. Please complete payment.` 
        };
      }
    } catch (err: any) {
      return { success: false, msg: err.message || "Failed verifying payment gateway status." };
    }
  };

  // ===== Rupayex Payment Gateway payout =====
  const initiateRupayexPayout = async (
    amount: number, 
    upiId?: string, 
    bankDetails?: { accountHolder: string; accountNumber: string; ifscCode: string; bankName: string }
  ): Promise<{ success: boolean; payoutId?: string; msg: string }> => {
    if (!user || !profile) {
      return { success: false, msg: "Must be logged in to withdraw." };
    }
    if (amount < 1) {
      return { success: false, msg: "Minimum withdrawal limit is ₹1." };
    }
    if (profile.coins < amount) {
      return { success: false, msg: "Insufficient balance for withdrawal request." };
    }

    const payoutId = "PO-" + Math.floor(Date.now() / 1000) + "-" + Math.floor(Math.random() * 1000);

    try {
      // 1. Deduct coins and record initial pending doc
      const batch = writeBatch(db);
      
      batch.update(doc(db, 'users', user.uid), {
        coins: increment(-amount)
      });

      // Create draft withdrawal
      const withRef = doc(collection(db, 'withdrawals'));
      batch.set(withRef, {
        userId: user.uid,
        userName: profile.name,
        amount,
        upiId: upiId || 'Bank Payout',
        payoutId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Create transaction log
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: user.uid,
        type: 'withdrawal',
        amount: -amount,
        description: `Rupayex payout initiated (ID: ${payoutId})`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await batch.commit();

      // 2. Post to backend proxy to trigger payout creation in Rupayex
      const bodyPayload = {
        amount,
        method: upiId ? 'upi' : 'bank',
        account_holder: bankDetails?.accountHolder || profile.name,
        account_number: bankDetails?.accountNumber || '',
        ifsc_code: bankDetails?.ifscCode || '',
        bank_name: bankDetails?.bankName || '',
        upi_id: upiId || '',
        payout_id: payoutId
      };

      const response = await fetch('/api/pay/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();

      if (data && data.status) {
         // Auto-completes the logs if the payment succeeded/approved
         if (data.data?.status === 'SUCCESS' || data.data?.status === 'APPROVED') {
           const finalBatch = writeBatch(db);
           finalBatch.update(withRef, { status: 'approved' });
           // Update transaction of same payoutId to accomplished
           const txSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid), where('status', '==', 'pending')));
           const matchedTx = txSnap.docs.find(tx => tx.data().description?.includes(payoutId));
           if (matchedTx) {
             finalBatch.update(doc(db, 'transactions', matchedTx.id), { status: 'approved' });
           }
           await finalBatch.commit();
         }
         return {
           success: true,
           payoutId: data.data?.payout_id || payoutId,
           msg: `Rupayex payout initiated successfully! Transaction id: ${payoutId}.`
         };
      } else {
        // If Rupayex rejected payout, let's reverse coins!
        const reverseBatch = writeBatch(db);
        reverseBatch.update(doc(db, 'users', user.uid), {
          coins: increment(amount)
        });
        reverseBatch.update(withRef, { status: 'rejected', remark: data?.message || 'Gateway Rejected' });
        await reverseBatch.commit();

        return { success: false, msg: data?.message || "Gateway rejected withdrawal." };
      }
    } catch (e: any) {
       return { success: false, msg: e.message || "Failed creating withdrawal payout." };
    }
  };

  // ===== Admin: Notice management =====
  const addNotice = async (text: string) => {
    await addDoc(collection(db, 'notices'), {
      text,
      active: true,
      createdAt: serverTimestamp()
    });
  };

  const toggleNotice = async (id: string, active: boolean) => {
    await updateDoc(doc(db, 'notices', id), { active });
  };

  const deleteNotice = async (id: string) => {
    await deleteDoc(doc(db, 'notices', id));
  };

  // ===== Admin: Markets managements =====
  const addMarket = async (marketName: string, openTime: string, closeTime: string) => {
    await addDoc(collection(db, 'markets'), {
      marketName: marketName.toUpperCase(),
      openTime,
      closeTime,
      status: 'open'
    });
  };

  const updateMarketStatus = async (id: string, status: 'open' | 'closed') => {
    await updateDoc(doc(db, 'markets', id), { status });
  };

  const deleteMarket = async (id: string) => {
    await deleteDoc(doc(db, 'markets', id));
  };

  // ===== Settle Engine (Calculates result digits & settles all active bets) =====
  /**
   * Open Single = (sum of digits of Open Panel) % 10
   * Close Single = (sum of digits of Close Panel) % 10
   * Jodi = Open Single + Close Single
   * Final Result = openPanel-Jodi-closePanel (e.g. 479-09-568)
   */
  const submitResultsAndCalculate = async (
    marketName: string, 
    openPanel: string, 
    closePanel: string
  ): Promise<{ success: boolean; msg: string; winsCount: number; winTotalPaid: number }> => {
    try {
      // 1. Inputs cleanups and checks
      const opDigits = openPanel.replace(/\D/g, '');
      const clDigits = closePanel.replace(/\D/g, '');

      if (opDigits.length !== 3 || clDigits.length !== 3) {
        return { success: false, msg: "Open and Close panels must contain exactly 3 digits.", winsCount: 0, winTotalPaid: 0 };
      }

      // Calculations
      const opSum = opDigits.split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
      const openSingleVal = (opSum % 10).toString();

      const clSum = clDigits.split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
      const closeSingleVal = (clSum % 10).toString();

      const jodiVal = openSingleVal + closeSingleVal;
      const finalResultStr = `${openPanel}-${jodiVal}-${closePanel}`;

      // Insert result record
      const resultDateStr = new Date().toISOString().split('T')[0];
      const resultDoc: Omit<GameResult, 'id'> = {
        marketName,
        openPanel,
        closePanel,
        openSingle: openSingleVal,
        closeSingle: closeSingleVal,
        jodi: jodiVal,
        finalResult: finalResultStr,
        resultDate: resultDateStr,
        createdAt: serverTimestamp()
      };
      
      const resDocRef = await addDoc(collection(db, 'results'), resultDoc);

      // Get all pending entries for this market
      const qPending = query(
        collection(db, 'entries'),
        where('marketName', '==', marketName),
        where('status', '==', 'pending')
      );
      
      const snap = await getDocs(qPending);
      let winsCount = 0;
      let winTotalPaid = 0;

      // Settle entries sequentially or with batches
      for (const entrySn of snap.docs) {
        const entryId = entrySn.id;
        const entry = entrySn.data() as GameEntry;
        
        let totalEntryWinCoins = 0;
        
        // Loop through each bet in multiple bets
        const evaluatedBets = entry.bets.map((bet) => {
          let isWin = false;
          let payoutFactor = 1;

          if (entry.gameType === 'Single Open') {
            isWin = bet.number === openSingleVal;
            payoutFactor = 9;
          } else if (entry.gameType === 'Single Close') {
            isWin = bet.number === closeSingleVal;
            payoutFactor = 9;
          } else if (entry.gameType === 'Jodi') {
            isWin = bet.number === jodiVal;
            payoutFactor = 90;
          } else if (entry.gameType === 'Triple Open') {
            isWin = bet.number === openPanel;
            payoutFactor = 900;
          } else if (entry.gameType === 'Triple Close') {
            isWin = bet.number === closePanel;
            payoutFactor = 900;
          }

          if (isWin) {
            totalEntryWinCoins += bet.coins * payoutFactor;
          }
          return {
            ...bet,
            won: isWin,
            winPayout: isWin ? bet.coins * payoutFactor : 0
          };
        });

        const batchSett = writeBatch(db);

        if (totalEntryWinCoins > 0) {
          winsCount++;
          winTotalPaid += totalEntryWinCoins;

          // 1. Update entry
          batchSett.update(doc(db, 'entries', entryId), {
            status: 'win',
            winAmount: totalEntryWinCoins,
            evaluatedBets
          });

          // 2. Add Coins to the user
          batchSett.update(doc(db, 'users', entry.userId), {
            coins: increment(totalEntryWinCoins),
            totalWins: increment(1)
          });

          // 3. Create Transaction Log for user
          batchSett.set(doc(collection(db, 'transactions')), {
            userId: entry.userId,
            type: 'win',
            amount: totalEntryWinCoins,
            description: `Won multiplier payout in ${marketName} [${entry.gameType}] with result: ${finalResultStr}`,
            status: 'completed',
            createdAt: serverTimestamp()
          });

        } else {
          // No winners
          batchSett.update(doc(db, 'entries', entryId), {
            status: 'loss',
            winAmount: 0,
            evaluatedBets
          });
        }

        await batchSett.commit();
      }

      return { success: true, msg: `Result ${finalResultStr} published and applied to entries!`, winsCount, winTotalPaid };
    } catch (e: any) {
      console.error(e);
      return { success: false, msg: e.message || "Failed to calculate results.", winsCount: 0, winTotalPaid: 0 };
    }
  };

  const submitOpenResult = async (
    marketName: string,
    openPanel: string
  ): Promise<{ success: boolean; msg: string; winsCount: number; winTotalPaid: number }> => {
    try {
      const opDigits = openPanel.replace(/\D/g, '');
      if (opDigits.length !== 3) {
        return { success: false, msg: "Open panel must contain exactly 3 digits.", winsCount: 0, winTotalPaid: 0 };
      }

      const opSum = opDigits.split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
      const openSingleVal = (opSum % 10).toString();

      const resultDateStr = new Date().toISOString().split('T')[0];
      
      const qRes = query(
        collection(db, 'results'),
        where('marketName', '==', marketName)
      );
      const resSnap = await getDocs(qRes);

      let existingDoc = null;
      let existingData = null;

      if (!resSnap.empty) {
        const docs = resSnap.docs.map(d => ({ id: d.id, data: d.data() as GameResult }));
        const matchByDate = docs.find(d => d.data.resultDate === resultDateStr);
        if (matchByDate) {
          existingDoc = matchByDate;
          existingData = matchByDate.data;
        } else {
          docs.sort((a, b) => {
            const tA = a.data.createdAt ? (a.data.createdAt.seconds || 0) : 0;
            const tB = b.data.createdAt ? (b.data.createdAt.seconds || 0) : 0;
            return tB - tA;
          });
          const mostRecent = docs[0];
          if (mostRecent) {
            const createdSecs = mostRecent.data.createdAt ? (mostRecent.data.createdAt.seconds || 0) : 0;
            const currentSecs = Math.floor(Date.now() / 1000);
            if (currentSecs - createdSecs < 18 * 60 * 60) {
              existingDoc = mostRecent;
              existingData = mostRecent.data;
            }
          }
        }
      }

      let finalResultStr = '';
      let currentCloseSingle = '?';
      let currentClosePanel = '???';

      if (existingDoc && existingData) {
        currentCloseSingle = existingData.closeSingle || '?';
        currentClosePanel = existingData.closePanel || '???';
        
        const newJodi = openSingleVal + currentCloseSingle;
        finalResultStr = `${openPanel}-${newJodi}-${currentClosePanel}`;

        await updateDoc(doc(db, 'results', existingDoc.id), {
          openPanel,
          openSingle: openSingleVal,
          jodi: newJodi,
          finalResult: finalResultStr
        });
      } else {
        const newJodi = openSingleVal + currentCloseSingle;
        finalResultStr = `${openPanel}-${newJodi}-${currentClosePanel}`;
        const resultDoc: Omit<GameResult, 'id'> = {
          marketName,
          openPanel,
          closePanel: currentClosePanel,
          openSingle: openSingleVal,
          closeSingle: currentCloseSingle,
          jodi: newJodi,
          finalResult: finalResultStr,
          resultDate: resultDateStr,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'results'), resultDoc);
      }

      const qPending = query(
        collection(db, 'entries'),
        where('marketName', '==', marketName),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(qPending);
      let winsCount = 0;
      let winTotalPaid = 0;

      for (const entrySn of snap.docs) {
        const entryId = entrySn.id;
        const entry = entrySn.data() as GameEntry;

        if (entry.gameType !== 'Single Open' && entry.gameType !== 'Triple Open') {
          continue;
        }

        let totalEntryWinCoins = 0;

        const evaluatedBets = entry.bets.map((bet) => {
          let isWin = false;
          let payoutFactor = 1;

          if (entry.gameType === 'Single Open') {
            isWin = bet.number === openSingleVal;
            payoutFactor = 9;
          } else if (entry.gameType === 'Triple Open') {
            isWin = bet.number === openPanel;
            payoutFactor = 900;
          }

          if (isWin) {
            totalEntryWinCoins += bet.coins * payoutFactor;
          }
          return {
            ...bet,
            won: isWin,
            winPayout: isWin ? bet.coins * payoutFactor : 0
          };
        });

        const batchSett = writeBatch(db);

        if (totalEntryWinCoins > 0) {
          winsCount++;
          winTotalPaid += totalEntryWinCoins;

          batchSett.update(doc(db, 'entries', entryId), {
            status: 'win',
            winAmount: totalEntryWinCoins,
            evaluatedBets
          });

          batchSett.update(doc(db, 'users', entry.userId), {
            coins: increment(totalEntryWinCoins),
            totalWins: increment(1)
          });

          batchSett.set(doc(collection(db, 'transactions')), {
            userId: entry.userId,
            type: 'win',
            amount: totalEntryWinCoins,
            description: `Won multiplier payout in ${marketName} [${entry.gameType}] with result: ${finalResultStr}`,
            status: 'completed',
            createdAt: serverTimestamp()
          });
        } else {
          batchSett.update(doc(db, 'entries', entryId), {
            status: 'loss',
            winAmount: 0,
            evaluatedBets
          });
        }

        await batchSett.commit();
      }

      return { success: true, msg: `Open Panel winning digits published! Paid out ${winTotalPaid.toLocaleString()} coins for ${winsCount} winning entries!`, winsCount, winTotalPaid };
    } catch (e: any) {
      console.error(e);
      return { success: false, msg: e.message || "Failed to submit Open result.", winsCount: 0, winTotalPaid: 0 };
    }
  };

  const submitCloseResult = async (
    marketName: string,
    closePanel: string
  ): Promise<{ success: boolean; msg: string; winsCount: number; winTotalPaid: number }> => {
    try {
      const clDigits = closePanel.replace(/\D/g, '');
      if (clDigits.length !== 3) {
        return { success: false, msg: "Close panel must contain exactly 3 digits.", winsCount: 0, winTotalPaid: 0 };
      }

      const clSum = clDigits.split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
      const closeSingleVal = (clSum % 10).toString();

      const resultDateStr = new Date().toISOString().split('T')[0];
      
      const qRes = query(
        collection(db, 'results'),
        where('marketName', '==', marketName)
      );
      const resSnap = await getDocs(qRes);

      let existingDoc = null;
      let existingData = null;

      if (!resSnap.empty) {
        const docs = resSnap.docs.map(d => ({ id: d.id, data: d.data() as GameResult }));
        const matchByDate = docs.find(d => d.data.resultDate === resultDateStr);
        if (matchByDate) {
          existingDoc = matchByDate;
          existingData = matchByDate.data;
        } else {
          docs.sort((a, b) => {
            const tA = a.data.createdAt ? (a.data.createdAt.seconds || 0) : 0;
            const tB = b.data.createdAt ? (b.data.createdAt.seconds || 0) : 0;
            return tB - tA;
          });
          const mostRecent = docs[0];
          if (mostRecent) {
            const createdSecs = mostRecent.data.createdAt ? (mostRecent.data.createdAt.seconds || 0) : 0;
            const currentSecs = Math.floor(Date.now() / 1000);
            if (currentSecs - createdSecs < 18 * 60 * 60) {
              existingDoc = mostRecent;
              existingData = mostRecent.data;
            }
          }
        }
      }

      let finalResultStr = '';
      let currentOpenSingle = '0';
      let currentOpenPanel = '???';

      if (existingDoc && existingData) {
        currentOpenSingle = existingData.openSingle && existingData.openSingle !== '?' ? existingData.openSingle : '0';
        currentOpenPanel = existingData.openPanel || '???';
        
        const newJodi = currentOpenSingle + closeSingleVal;
        finalResultStr = `${currentOpenPanel}-${newJodi}-${closePanel}`;

        await updateDoc(doc(db, 'results', existingDoc.id), {
          closePanel,
          closeSingle: closeSingleVal,
          jodi: newJodi,
          finalResult: finalResultStr
        });
      } else {
        const newJodi = '?' + closeSingleVal;
        finalResultStr = `???-${newJodi}-${closePanel}`;
        const resultDoc: Omit<GameResult, 'id'> = {
          marketName,
          closePanel,
          openPanel: currentOpenPanel,
          openSingle: '?',
          closeSingle: closeSingleVal,
          jodi: newJodi,
          finalResult: finalResultStr,
          resultDate: resultDateStr,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'results'), resultDoc);
      }

      const qPending = query(
        collection(db, 'entries'),
        where('marketName', '==', marketName),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(qPending);
      let winsCount = 0;
      let winTotalPaid = 0;

      for (const entrySn of snap.docs) {
        const entryId = entrySn.id;
        const entry = entrySn.data() as GameEntry;

        if (entry.gameType !== 'Single Close' && entry.gameType !== 'Jodi' && entry.gameType !== 'Triple Close') {
          continue;
        }

        let totalEntryWinCoins = 0;

        const evaluatedBets = entry.bets.map((bet) => {
          let isWin = false;
          let payoutFactor = 1;

          if (entry.gameType === 'Single Close') {
            isWin = bet.number === closeSingleVal;
            payoutFactor = 9;
          } else if (entry.gameType === 'Jodi') {
            const calculatedJodi = currentOpenSingle + closeSingleVal;
            isWin = bet.number === calculatedJodi;
            payoutFactor = 90;
          } else if (entry.gameType === 'Triple Close') {
            isWin = bet.number === closePanel;
            payoutFactor = 900;
          }

          if (isWin) {
            totalEntryWinCoins += bet.coins * payoutFactor;
          }
          return {
            ...bet,
            won: isWin,
            winPayout: isWin ? bet.coins * payoutFactor : 0
          };
        });

        const batchSett = writeBatch(db);

        if (totalEntryWinCoins > 0) {
          winsCount++;
          winTotalPaid += totalEntryWinCoins;

          batchSett.update(doc(db, 'entries', entryId), {
            status: 'win',
            winAmount: totalEntryWinCoins,
            evaluatedBets
          });

          batchSett.update(doc(db, 'users', entry.userId), {
            coins: increment(totalEntryWinCoins),
            totalWins: increment(1)
          });

          batchSett.set(doc(collection(db, 'transactions')), {
            userId: entry.userId,
            type: 'win',
            amount: totalEntryWinCoins,
            description: `Won multiplier payout in ${marketName} [${entry.gameType}] with result: ${finalResultStr}`,
            status: 'completed',
            createdAt: serverTimestamp()
          });
        } else {
          batchSett.update(doc(db, 'entries', entryId), {
            status: 'loss',
            winAmount: 0,
            evaluatedBets
          });
        }

        await batchSett.commit();
      }

      return { success: true, msg: `Close Panel winning digits published! Paid out ${winTotalPaid.toLocaleString()} coins for ${winsCount} winning entries!`, winsCount, winTotalPaid };
    } catch (e: any) {
      console.error(e);
      return { success: false, msg: e.message || "Failed to submit Close result.", winsCount: 0, winTotalPaid: 0 };
    }
  };

  const deleteResult = async (resultId: string): Promise<{ success: boolean; msg: string }> => {
    try {
      const resRef = doc(db, 'results', resultId);
      const resSnap = await getDoc(resRef);
      if (!resSnap.exists()) {
        return { success: false, msg: "Result document not found." };
      }
      const resData = resSnap.data() as GameResult;
      const { marketName, resultDate } = resData;

      const qEntries = query(
        collection(db, 'entries'),
        where('marketName', '==', marketName)
      );
      const entriesSnap = await getDocs(qEntries);

      let resetCount = 0;
      let totalDeducted = 0;

      for (const entrySn of entriesSnap.docs) {
        const entryId = entrySn.id;
        const entry = entrySn.data() as GameEntry;

        if (entry.status === 'pending') {
          continue;
        }

        let isSameDate = false;
        if (entry.createdAt) {
          const entryDateStr = new Date(entry.createdAt.seconds * 1000).toISOString().split('T')[0];
          if (entryDateStr === resultDate) {
            isSameDate = true;
          }
        }

        if (!isSameDate) {
          continue;
        }

        const batchReset = writeBatch(db);

        batchReset.update(doc(db, 'entries', entryId), {
          status: 'pending',
          winAmount: 0,
          evaluatedBets: []
        });

        if (entry.status === 'win' && entry.winAmount && entry.winAmount > 0) {
          totalDeducted += entry.winAmount;
          batchReset.update(doc(db, 'users', entry.userId), {
            coins: increment(-entry.winAmount),
            totalWins: increment(-1)
          });

          const qTx = query(
            collection(db, 'transactions'),
            where('userId', '==', entry.userId),
            where('type', '==', 'win')
          );
          const txSnap = await getDocs(qTx);
          for (const txSn of txSnap.docs) {
            const txData = txSn.data();
            if (txData.description && txData.description.includes(marketName)) {
              batchReset.delete(doc(db, 'transactions', txSn.id));
            }
          }
        }

        await batchReset.commit();
        resetCount++;
      }

      await deleteDoc(resRef);

      return { 
        success: true, 
        msg: `Successfully deleted result and reset ${resetCount} entries back to "pending"! Deducted a total of ${totalDeducted.toLocaleString()} mistakenly rewarded coins.` 
      };
    } catch (e: any) {
      console.error(e);
      return { success: false, msg: e.message || "Failed to delete result." };
    }
  };

  // ===== Deposits approver =====
  // "Approve: coins += amount"
  const approveDeposit = async (id: string) => {
    const depRef = doc(db, 'deposits', id);
    const snap = await getDocs(query(collection(db, 'transactions'), limit(1))); // utility fallback
    
    // Read current data
    const dSnap = await getDocs(query(collection(db, 'deposits')));
    const depDoc = dSnap.docs.find(d => d.id === id);
    if (!depDoc) return;
    const depData = depDoc.data() as DepositRequest;
    if (depData.status !== 'pending') return;

    const batch = writeBatch(db);
    
    // Set Deposit to Approved
    batch.update(depRef, { status: 'approved' });

    // "Approve: coins += amount"
    const userRef = doc(db, 'users', depData.userId);
    batch.update(userRef, {
      coins: increment(depData.amount)
    });

    // Create a real transaction logs approval
    const txRef = doc(collection(db, 'transactions'));
    batch.set(txRef, {
      userId: depData.userId,
      type: 'deposit',
      amount: depData.amount,
      description: `Deposit approved (UTR: ${depData.utr})`,
      status: 'approved',
      createdAt: serverTimestamp()
    });

    await batch.commit();
  };

  const rejectDeposit = async (id: string) => {
    const depRef = doc(db, 'deposits', id);
    await updateDoc(depRef, { status: 'rejected' });
  };

  // ===== Withdrawals approver =====
  // "Approve: coins -= amount"
  const approveWithdrawal = async (id: string) => {
    const witRef = doc(db, 'withdrawals', id);
    
    // Read current data
    const wDocs = await getDocs(query(collection(db, 'withdrawals')));
    const witDoc = wDocs.docs.find(w => w.id === id);
    if (!witDoc) return;
    const witData = witDoc.data() as WithdrawalRequest;
    if (witData.status !== 'pending') return;

    // Read user coins
    const uDoc = await getDocs(query(collection(db, 'users')));
    const usInfo = uDoc.docs.find(u => u.id === witData.userId);
    if (!usInfo) return;
    const userCoinsCurrent = usInfo.data().coins || 0;

    const batch = writeBatch(db);
    batch.update(witRef, { status: 'approved' });

    // Since we didn't deduct wallet coins at request time (to follow "Approve: coins -= amount"),
    // let's do "Approve: coins -= amount" here.
    const userRef = doc(db, 'users', witData.userId);
    batch.update(userRef, {
      coins: increment(-witData.amount)
    });

    // Save transaction
    const txRef = doc(collection(db, 'transactions'));
    batch.set(txRef, {
      userId: witData.userId,
      type: 'withdrawal',
      amount: -witData.amount,
      description: `Withdrawal of ${witData.amount} approved to UPI: ${witData.upiId}`,
      status: 'approved',
      createdAt: serverTimestamp()
    });

    await batch.commit();
  };

  const rejectWithdrawal = async (id: string) => {
    const witRef = doc(db, 'withdrawals', id);
    await updateDoc(witRef, { status: 'rejected' });
  };

  // ===== User Block / Unblock =====
  const toggleUserBlock = async (uid: string, currentBlocked: boolean) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { blocked: !currentBlocked });
  };

  return (
    <GameContext.Provider value={{
      markets,
      notices,
      recentResults,
      userEntries,
      userTransactions,
      leaderboard,
      
      // Admin lists
      allDeposits,
      allWithdrawals,
      allEntries,
      allUsers,
      
      loadingData,
      placeMultiBets,
      submitDeposit,
      submitWithdrawal,
      initiateRupayexDeposit,
      verifyRupayexPayment,
      initiateRupayexPayout,
      
      // Admin functions
      addMarket,
      updateMarketStatus,
      deleteMarket,
      seedInitialData,
      
      addNotice,
      toggleNotice,
      deleteNotice,
      
      submitResultsAndCalculate,
      submitOpenResult,
      submitCloseResult,
      deleteResult,
      
      approveDeposit,
      rejectDeposit,
      approveWithdrawal,
      rejectWithdrawal,
      toggleUserBlock
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
