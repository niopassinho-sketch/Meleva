/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- INICIO DA ALTERAÇÃO ---
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { MapView } from './components/map/MapView';
import { DriverFlow } from './components/ride/DriverFlow';
import { PassengerFlow } from './components/ride/PassengerFlow';
import { Wallet } from './components/wallet/Wallet';
import { SOSButton } from './components/safety/SOSButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

function Home() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[var(--color-emerald)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-anthracite)] font-medium">Carregando MELEVA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.email === 'niopassinho@gmail.com') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <MapView>
        {role === 'motorista' ? (
          <DriverFlow userId={user.id} />
        ) : (
          <PassengerFlow userId={user.id} />
        )}
      </MapView>
      
      {/* Botão flutuante para acessar a carteira */}
      <button 
        onClick={() => navigate('/wallet')}
        className="fixed top-6 right-6 bg-white p-3 rounded-full shadow-md text-[var(--color-anthracite)] hover:text-[var(--color-emerald)] transition-colors z-50"
        title="Carteira Digital"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
      </button>

      {/* Botão Sair */}
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          navigate('/login');
        }}
        className="fixed top-6 left-6 bg-white p-3 rounded-full shadow-md text-[var(--color-sos)] hover:text-red-700 transition-colors z-50"
        title="Sair"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </button>

      {/* Botão SOS Global */}
      <SOSButton userId={user.id} />
    </>
  );
}

function WalletRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Wallet userId={user.id} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wallet" element={<WalletRoute />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
