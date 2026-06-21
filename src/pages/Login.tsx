import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Key, AlertCircle, Sparkles, User, Crown } from 'lucide-react';

export default function Login() {
  const { login, register, elevateToAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('shrivastavavishu890@gmail.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign In handler
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

  // Auto register or login helper for shrivastavavishu890@gmail.com
  const handleUserEmailBypass = async () => {
    setLoading(true);
    setError('');
    const targetEmail = 'shrivastavavishu890@gmail.com';
    const targetPassword = password || 'password123';
    const targetName = 'Vishu Shrivastava';

    try {
      await login(targetEmail, targetPassword);
      navigate('/');
    } catch (err: any) {
      console.log("No profile registered for this email yet. Creating automatically...");
      try {
        await register(targetName, targetEmail, targetPassword, '9876543210');
        navigate('/');
      } catch (regErr: any) {
        console.error("Auto-registration for shrivastavavishu890 failed:", regErr);
        setError(`Failed to create account: ${regErr.message || 'Verify credentials'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Account Bypass buttons for sandbox testing
  const handleQuickSandboxBypass = async (role: 'user' | 'admin') => {
    setLoading(true);
    setError('');
    
    // Select default accounts to seed or login
    const targetEmail = role === 'admin' ? 'admin@gmail.com' : 'player@gmail.com';
    const targetPassword = 'password123';
    const targetName = role === 'admin' ? 'Admin Master' : 'Sandbox Player';
    
    try {
      await login(targetEmail, targetPassword);
      if (role === 'admin') {
        try {
          await elevateToAdmin();
        } catch (elevateErr) {
          console.error("Elevation failed during bypass login:", elevateErr);
        }
      }
      navigate('/');
    } catch (err: any) {
      console.log("No default sandbox account yet, trying to auto-register...");
      try {
        await register(targetName, targetEmail, targetPassword, '1234567890');
        if (role === 'admin') {
          await elevateToAdmin();
        }
        navigate('/');
      } catch (regErr: any) {
        console.error("Auto-registration failed:", regErr);
        setError(`Auto-registration bypass failed: ${regErr.message || 'Could not auto-create account'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your login credentials');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Incorrect email or password combination.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/25 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Decorative Golden Ornaments */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-amber-500/30 uppercase tracking-widest">SECURE PORTAL</div>
        <div className="absolute top-4 right-4 text-[10px] font-mono text-amber-500/30 uppercase tracking-widest">v1.2.0</div>

        <div className="text-center mb-8 mt-4">
          <div className="inline-flex w-12 h-12 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-600 rounded-xl p-[1.5px] items-center justify-center shadow-lg shadow-amber-500/10 mb-3">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h2 className="font-serif text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-amber-500 uppercase tracking-wider">
            Sign In to Wallet
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-mono">
            Enter your credentials or click a testing bypass below
          </p>
        </div>

        {error && (
          <div className="space-y-3 mb-6">
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
            
            {(error.includes('auth/operation-not-allowed') || error.includes('operation-not-allowed') || error.includes('bypass failed')) && (
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
                  Or, click "Continue with Gmail" below to log in instantly without any setup!
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="player@gmail.com"
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 select-none outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono text-amber-500 uppercase tracking-wider">
                Access Password
              </label>
              {/* Reset Password flow triggers reset alert */}
              <button 
                type="button"
                onClick={() => alert("Password reset emails are disabled in sandbox. Simply create a new user profile or use Bypass!")}
                className="text-[10px] text-amber-400/60 hover:text-amber-400 font-mono"
              >
                Forgot?
              </button>
            </div>
            <div className="relative bg-zinc-900 border border-amber-500/20 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 select-none outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 hover:from-amber-500 hover:to-amber-550 disabled:opacity-50 text-neutral-950 font-serif font-black tracking-widest text-xs uppercase rounded-lg shadow-lg shadow-amber-500/15 cursor-pointer active:scale-95 transition-transform"
          >
            {loading ? 'LOGGING IN...' : 'SECURE SIGN IN'}
          </button>

          <div className="flex items-center my-4">
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

        {/* Sandbox Bypass Shortcuts */}
        <div className="mt-8 pt-6 border-t border-amber-500/10 text-center">
          <p className="text-[10px] font-mono text-amber-500/50 uppercase tracking-widest font-bold mb-3.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Sandbox Quick Testing Tools
          </p>

          <button
            type="button"
            onClick={handleUserEmailBypass}
            disabled={loading}
            className="w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-amber-500/25 via-yellow-405/20 to-amber-500/25 hover:from-amber-400/30 hover:to-yellow-400/30 border-2 border-amber-400/50 text-amber-200 text-xs font-mono font-bold rounded-lg tracking-wide transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-305 animate-pulse" />
            Auto-Create / Login: shrivastavavishu890@gmail.com
          </button>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => handleQuickSandboxBypass('user')}
              disabled={loading}
              className="py-2.5 px-3 bg-zinc-90 w-full hover:bg-amber-400/15 border border-amber-500/20 hover:border-amber-400/40 text-amber-400 text-[11px] font-serif font-bold rounded-lg tracking-wider transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-amber-400" /> Bypass Player
            </button>
            <button
              type="button"
              onClick={() => handleQuickSandboxBypass('admin')}
              disabled={loading}
              className="py-2.5 px-3 bg-zinc-90 w-full hover:bg-yellow-400/15 border border-amber-500/20 hover:border-amber-400/40 text-amber-300 text-[11px] font-serif font-bold rounded-lg tracking-wider transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Bypass Admin
            </button>
          </div>
          
          <p className="text-[10px] text-neutral-400">
            Don't have an account or bypassed profile? <br />
            <Link to="/signup" className="text-amber-400 font-bold hover:underline">
              Create your dynamic profile (Gift 5K Coins)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
