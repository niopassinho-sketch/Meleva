import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// --- INICIO DA ALTERAÇÃO ---
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Se sucesso, o hook useAuth (em App) cuidará do redirecionamento
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-emerald)] to-[var(--color-anthracite)] p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[var(--color-emerald)] tracking-tighter">MELEVA</h1>
          <p className="text-gray-600 mt-2 font-medium">Sua mobilidade urbana, descomplicada.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-[var(--color-sos)] text-[var(--color-sos)] rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <Input
            label="Senha"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full mt-6" isLoading={loading}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-[var(--color-emerald)] font-semibold hover:underline">
            Cadastre-se
          </Link>
        </div>
        
        {/* --- INICIO DA ALTERAÇÃO --- */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <button 
            onClick={() => window.open('/admin', '_blank', 'width=1000,height=800')}
            className="hover:text-[var(--color-emerald)] transition-colors underline"
          >
            Painel Administrativo
          </button>
        </div>
        {/* --- FIM DA ALTERAÇÃO --- */}
      </div>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
