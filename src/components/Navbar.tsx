import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Coins, 
  CoinsIcon, 
  Crown, 
  Menu, 
  User, 
  LogOut, 
  UserCheck, 
  UserX, 
  Home as HomeIcon, 
  History, 
  Trophy, 
  Wallet,
  Settings,
  X
} from 'lucide-react';

interface NavbarProps {
  toggleSidebarMobile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebarMobile }) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav id="app-navbar" className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Brand logo block */}
      <div className="flex items-center gap-3">
        {toggleSidebarMobile && (
          <button 
            onClick={toggleSidebarMobile} 
            className="md:hidden text-amber-400 hover:text-amber-300 p-1 cursor-pointer transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-yellow-500/10">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <span className="font-serif font-black text-amber-400 text-sm tracking-tighter">KM</span>
            </div>
          </div>
          <div>
            <span className="font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 text-base sm:text-lg tracking-wider block">
              KHAN MATKA
            </span>
            <span className="text-[9px] text-amber-500/60 uppercase tracking-widest font-mono block -mt-1 font-bold">
              Premium Arena
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Options / Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {profile ? (
          <>
            {/* Quick Coin Wallet Action */}
            <div className="flex items-center bg-zinc-900 border border-amber-500/20 pl-2.5 pr-1.5 py-1 rounded-full text-xs gap-2">
              <div className="flex items-center gap-1.5 text-yellow-300 font-serif font-bold">
                <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-sm font-mono tracking-wide">{profile.coins.toLocaleString()}</span>
                <span className="text-[10px] text-amber-500 font-serif">Coins</span>
              </div>
              
              <Link 
                to="/wallet"
                className="px-2.5 py-0.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-550 hover:to-amber-500 text-neutral-950 text-[10px] font-bold rounded-full transition-all tracking-wider uppercase flex items-center gap-1 cursor-pointer active:scale-95"
              >
                + DEPOSIT
              </Link>
            </div>

            {/* Admin Badge Shortcut */}
            {profile.role === 'admin' && (
              <Link 
                to="/admin" 
                className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-400/20 border border-amber-500/40 text-amber-400 text-xs rounded-full font-serif font-bold tracking-wide transition-all"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse animate-[spin_5s_infinite_linear]" />
                ADMIN PANEL
              </Link>
            )}

            {/* User Dropdown Profile trigger */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-amber-550/20 transition-all outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-500/20 to-yellow-500/5 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold uppercase text-sm">
                  {profile.name.charAt(0)}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-zinc-950 border border-amber-500/25 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-amber-500/10 mb-2">
                    <p className="text-sm text-neutral-200 font-serif font-bold truncate">
                      {profile.name}
                    </p>
                    <p className="text-xs text-amber-500/70 font-mono truncate">
                      {profile.email}
                    </p>
                    <span className="inline-block mt-1.5 text-[9px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {profile.role.toUpperCase()}
                    </span>
                  </div>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-500" />
                    GAMING DASHBOARD
                  </Link>

                  <Link 
                    to="/wallet" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-amber-500" />
                    WALLET & LEDGERS
                  </Link>

                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-500" />
                    MANAGE ACCOUNT
                  </Link>

                  {profile.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex md:hidden items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border-t border-amber-500/10 mt-1"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      ADMIN COMMAND PANEL
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-amber-500/10 mt-2.5 cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    SECURE SIGN OUT
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              to="/login"
              className="px-4 py-1.5 text-xs text-amber-400 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/5 rounded-lg font-serif font-bold tracking-wider transition-all"
            >
              SIGN IN
            </Link>
            <Link 
              to="/signup"
              className="px-4 py-1.5 text-xs text-neutral-950 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-zinc-950 rounded-lg font-serif font-bold tracking-wider transition-all"
            >
              CREATE WALLET
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
