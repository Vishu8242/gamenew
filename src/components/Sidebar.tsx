import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Crown, 
  Home, 
  Layers, 
  LayoutDashboard, 
  LogOut, 
  Target, 
  Trophy, 
  User, 
  Wallet,
  Gamepad2,
  X 
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside id="app-sidebar" className="h-full bg-zinc-950 border-r border-amber-500/20 py-6 px-4 flex flex-col justify-between w-64">
      <div className="space-y-6">
        {/* Mobile close button space header */}
        <div className="flex md:hidden items-center justify-between border-b border-amber-500/15 pb-4 mb-2">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold">Navigation Core</div>
          <button 
            onClick={onCloseMobile} 
            className="p-1 hover:bg-neutral-800 rounded-lg text-amber-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User profile Summary widget */}
        {profile && (
          <div className="p-3.5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-amber-500/10 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-amber-400 font-serif font-black text-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-serif font-bold text-neutral-200 truncate">{profile.name}</h4>
              <p className="text-[10px] text-amber-500/60 font-mono tracking-wider uppercase font-bold">{profile.role}</p>
            </div>
          </div>
        )}

        {/* Primary Links navigation section */}
        <nav className="space-y-1">
          <p className="text-[10px] font-mono text-amber-500/40 uppercase tracking-widest font-bold px-3 mb-2">Main Lobby</p>
          
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
              isActive('/') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Home className="w-4 h-4 text-amber-500" />
            Lobby Entrance
          </Link>

          {profile && (
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                  : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              Member Dashboard
            </Link>
          )}

          <p className="text-[10px] font-mono text-amber-500/40 uppercase tracking-widest font-bold px-3 pt-4 mb-2">Game Arenas</p>

          <Link
            to="/single-open"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-serif transition-colors ${
              isActive('/single-open') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Single Open Games
          </Link>

          <Link
            to="/single-close"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-serif transition-colors ${
              isActive('/single-close') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-500/70" />
            Single Close Games
          </Link>

          <Link
            to="/jodi"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-serif transition-colors ${
              isActive('/jodi') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-550" />
            Jodi Games (90x)
          </Link>

          <Link
            to="/triple-open"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-serif transition-colors ${
              isActive('/triple-open') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-450 animate-pulse" />
            Triple Open Games
          </Link>

          <Link
            to="/triple-close"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-serif transition-colors ${
              isActive('/triple-close') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-450/70" />
            Triple Close Games
          </Link>

          <p className="text-[10px] font-mono text-amber-500/40 uppercase tracking-widest font-bold px-3 pt-4 mb-2">Finances & Records</p>

          <Link
            to="/wallet"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
              isActive('/wallet') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Wallet className="w-4 h-4 text-amber-500" />
            Wallet & Deposit
          </Link>

          <Link
            to="/bet-history"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
              isActive('/bet-history') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-500" />
            My Betting History
          </Link>

          <Link
            to="/history"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
              isActive('/history') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-500" />
            Result History
          </Link>

          <Link
            to="/leaderboard"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
              isActive('/leaderboard') 
                ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Leaderboard
          </Link>

          {profile && (
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors ${
                isActive('/profile') 
                  ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-400 font-bold' 
                  : 'text-neutral-400 hover:text-amber-400 hover:bg-amber-500/5'
              }`}
            >
              <User className="w-4 h-4 text-amber-500" />
              My Profile Settings
            </Link>
          )}
        </nav>
      </div>

      {profile && (
        <div className="pt-4 border-t border-amber-500/10">
          {profile.role === 'admin' && (
            <Link
              to="/admin"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/20 font-serif font-bold transition-colors mb-2`}
            >
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              Administrative Center
            </Link>
          )}

          <button
            onClick={async () => {
              await logout();
              handleLinkClick();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Logout Securely
          </button>
        </div>
      )}
    </aside>
  );
};
