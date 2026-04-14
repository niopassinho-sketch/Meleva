import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// --- INICIO DA ALTERAÇÃO ---
export function Wallet({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [canUseNegative, setCanUseNegative] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('passageiros')
          .select('wallet_balance, can_use_negative_balance')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data) {
          const walletData = data as any;
          setBalance(walletData.wallet_balance || 0);
          setCanUseNegative(walletData.can_use_negative_balance || false);
        }
      } catch (err) {
        console.error('Erro ao buscar carteira:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [userId]);

  const handleRecharge = (method: string) => {
    alert(`Redirecionando para pagamento via ${method}... (Simulação)`);
    // Aqui integraria com Stripe, MercadoPago, etc.
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando carteira...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-anthracite)] p-6 text-white relative">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <h1 className="text-center text-lg font-medium mb-6">Carteira Digital</h1>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Saldo Disponível</p>
            <h2 className={`text-4xl font-bold ${balance < 0 ? 'text-red-400' : 'text-white'}`}>
              R$ {balance.toFixed(2).replace('.', ',')}
            </h2>
          </div>
        </div>

        {/* Avisos */}
        {balance < 0 && canUseNegative && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 m-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700 font-medium">
                  Você está usando o Saldo Negativo de Confiança.
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Recarregue sua carteira em breve para evitar bloqueios.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[var(--color-anthracite)] mb-4">Adicionar Saldo</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleRecharge('PIX')}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-100 rounded-2xl hover:border-[var(--color-emerald)] hover:bg-emerald-50 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-100 text-[var(--color-emerald)] rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="font-medium text-sm text-gray-700">Pix</span>
            </button>
            <button 
              onClick={() => handleRecharge('Cartão de Crédito')}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-100 rounded-2xl hover:border-[var(--color-emerald)] hover:bg-emerald-50 transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <span className="font-medium text-sm text-gray-700">Cartão</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
