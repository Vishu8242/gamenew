import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Phone, User, AlertCircle, Sparkles, Coins } from 'lucide-react';

export default function Signup() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('Vishu Shrivastava');
  const [email, setEmail] = useState('shrivastavavishu890@gmail.com');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setError('Please fill out all the input fields to secure your registration');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password, phone);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Email might already be claimed or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signup-container" className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/25 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="absolute top-4 left-4 text-[10px] font-mono text-amber-500/30 uppercase tracking-widest">SECURE COIN ESCROW</div>

        <div className="text-center mb-6 mt-4">
          <h2 className="font-serif text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-amber-500 uppercase tracking-wider">
            Create Player Profile
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-mono">
            Register to access the live gaming console
          </p>
        </div>

        {error && (
          <div className="space-y-3 mb-6">
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
            
            {(error.includes('auth/operation-not-allowed') || error.includes('operation-not-allowed')) && (
              <div className="p-4 bg-amber-950/30 border-2 border-amber-500/35 text-amber-200 text-xs rounded-lg space-y-2 font-sans">
                <p className="font-bold text-[13px] flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  Firebase Config Required:
                </p>
                <p className="text-[11px] leading-relaxed text-amber-200/90 text-left">
                  Email/Password sign-in is disabled in your Firebase console. To enable it:
                </p>
                <ol className="list-decimal list-inside text-[11px] space-y-1 text-amber-200/80 text-left">
                  <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-amber-300 font-bold hover:text-amber-200">Firebase Console</a></li>
                  <li>Click <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong></li>
                  <li>Enable the <strong>Email/Password</strong> provider</li>
                </ol>
                <p className="text-[11px] text-amber-300/90 italic pt-1 text-left">
                  Or, click "Continue with Gmail" below to register and log in instantly without any setup!
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
              Player Nickname / Full Name
            </label>
            <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Raja Golden"
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-600 select-none outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
              Mobile Contact Number
            </label>
            <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Phone className="w-4 h-4" />
              </div>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-9002"
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-600 select-none outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="raja@gmail.com"
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-600 select-none outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-amber-500 uppercase tracking-wider mb-1.5">
              Secure Auth Password
            </label>
            <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-600 select-none outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1 text-[10px] text-neutral-450 leading-relaxed font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>I acknowledge we are testing a virtual coin sandbox on the server-side, and we agree to fair play rules.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 disabled:opacity-50 text-neutral-950 font-serif font-black tracking-widest text-xs uppercase rounded-lg shadow-lg shadow-amber-500/15 cursor-pointer active:scale-95 transition-transform"
          >
            {loading ? 'INITIALIZING ARCHIVES...' : 'REGISTER & CLAIM 5,000 COINS'}
          </button>

          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-amber-500/10"></div>
            <span className="px-3 text-[9px] font-mono text-amber-500/40 uppercase tracking-widest">or continue with</span>
            <div className="flex-grow border-t border-amber-500/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 hover:border-amber-400/50 text-amber-300 text-xs font-serif font-black tracking-widest uppercase rounded-lg shadow transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Gmail
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-amber-500/10 text-center">
          <p className="text-xs text-neutral-400">
            Already have a player vault account? <br />
            <Link to="/login" className="text-amber-400 font-bold hover:underline">
              Sign In with current profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
