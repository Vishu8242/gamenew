import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SingleOpenGame from './pages/SingleOpenGame';
import SingleCloseGame from './pages/SingleCloseGame';
import JodiGame from './pages/JodiGame';
import TripleOpenGame from './pages/TripleOpenGame';
import TripleCloseGame from './pages/TripleCloseGame';
import ResultHistory from './pages/ResultHistory';
import Leaderboard from './pages/Leaderboard';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import BetHistory from './pages/BetHistory';
import CheckoutSimulation from './pages/CheckoutSimulation';
import AdminDashboard from './pages/AdminDashboard';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Loading } from './components/Loading';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Admin Protected Route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) return <Loading />;
  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main Layout shell with conditional and responsive sidebar drawers
const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div id="layout-shell" className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Upper Navigation Bar */}
      <Navbar toggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex flex-1 relative">
        {/* Desktop permanent Sidebar */}
        <div id="desktop-sidebar" className="hidden md:block w-64 flex-shrink-0 h-[calc(100vh-68px)] sticky top-[68px]">
          <Sidebar />
        </div>

        {/* Mobile slide-out drawer sidebar overlay */}
        {mobileSidebarOpen && (
          <div 
            id="mobile-sidebar-backdrop"
            className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all flex"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div 
              id="mobile-drawer"
              className="w-64 h-full bg-zinc-950 animate-slideRight"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Primary Page Canvas Area */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Aesthetic Footer rail */}
      <footer id="developer-footer" className="bg-zinc-950/40 border-t border-amber-500/10 py-5 text-center text-xs font-mono text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Khan Matka Arena. Registered Virtual Assets Sandbox Ledger. All Rights Reserved.</p>
          <p className="text-amber-500/60 uppercase font-black tracking-widest text-[9px]">
            ❇️ Premium Traditional Gold Theme ❇️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <HashRouter>
          <LayoutShell>
            <Routes>
              {/* Public/Member lobby */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/history" element={<ResultHistory />} />

              {/* Protected Member games/dashboards */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/single-open" 
                element={
                  <ProtectedRoute>
                    <SingleOpenGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/single-close" 
                element={
                  <ProtectedRoute>
                    <SingleCloseGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jodi" 
                element={
                  <ProtectedRoute>
                    <JodiGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/triple-open" 
                element={
                  <ProtectedRoute>
                    <TripleOpenGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/triple-close" 
                element={
                  <ProtectedRoute>
                    <TripleCloseGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bet-history" 
                element={
                  <ProtectedRoute>
                    <BetHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout-simulation" 
                element={
                  <ProtectedRoute>
                    <CheckoutSimulation />
                  </ProtectedRoute>
                } 
              />

              {/* Administrative Protected routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* Catch all fallback redirects */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LayoutShell>
        </HashRouter>
      </GameProvider>
    </AuthProvider>
  );
}
