export interface AppUser {
  uid: string;
  name: string;
  phone: string;
  email: string;
  coins: number;
  totalWins: number;
  totalGames: number;
  blocked: boolean;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Market {
  id?: string;
  marketName: string;
  openTime: string;
  closeTime: string;
  status: 'open' | 'closed';
}

export interface Bet {
  number: string;
  coins: number;
}

export interface GameEntry {
  id?: string;
  userId: string;
  userName: string;
  marketName: string;
  gameType: 'Single Open' | 'Single Close' | 'Jodi' | 'Triple Open' | 'Triple Close';
  bets: Bet[];
  totalCoins: number;
  status: 'pending' | 'win' | 'loss';
  createdAt: any;
  winAmount?: number;
}

export interface GameResult {
  id?: string;
  marketName: string;
  openPanel: string;
  closePanel: string;
  openSingle: string;
  closeSingle: string;
  jodi: string;
  finalResult: string;
  resultDate: string; // YYYY-MM-DD
  createdAt: any;
}

export interface Transaction {
  id?: string;
  userId: string;
  type: 'play' | 'deposit' | 'withdrawal' | 'win';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: any;
}

export interface DepositRequest {
  id?: string;
  userId: string;
  userName: string;
  amount: number;
  utr: string;
  screenshot: string; // text/URL or base64 placeholder
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface WithdrawalRequest {
  id?: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Notice {
  id?: string;
  text: string;
  active: boolean;
  createdAt: any;
}
