import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// --- INICIO DA ALTERAÇÃO ---
interface ActiveRideProps {
  role: 'motorista' | 'passageiro';
  rideDetails: any;
  onCancel: () => void;
  onComplete: () => void;
}

export function ActiveRide({ role, rideDetails, onCancel, onComplete }: ActiveRideProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0); // Em segundos
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Simula o tempo decorrido desde o aceite da corrida
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelClick = () => {
    // Se passou de 2 minutos (120 segundos) e é passageiro, mostra aviso de taxa
    if (role === 'passageiro' && timeElapsed > 120) {
      setShowCancelWarning(true);
    } else {
      onCancel();
    }
  };

  const confirmCancelWithFee = () => {
    alert('Corrida cancelada. A taxa de desistência será cobrada na sua próxima viagem.');
    onCancel();
  };

  const handleVerifyToken = () => {
    if (tokenInput === rideDetails.token) {
      alert('Token verificado com sucesso! Boa viagem.');
      onComplete();
    } else {
      alert('Token inválido. Tente novamente.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-5 max-h-[70vh]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--color-anthracite)]">Corrida em Andamento</h2>
        <div className="bg-emerald-100 text-[var(--color-emerald)] px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          AO VIVO
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">
          {role === 'motorista' ? 'Passageiro:' : 'Motorista:'}
        </p>
        <p className="font-bold text-lg text-[var(--color-anthracite)]">{rideDetails.nome}</p>
        <p className="text-xs text-gray-400 mt-1">Destino: {rideDetails.destino}</p>
      </div>

      {/* Segurança de Embarque: Token */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-sm text-[var(--color-anthracite)] mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Segurança de Embarque
        </h3>
        
        {role === 'passageiro' ? (
          <div className="bg-[var(--color-anthracite)] text-white p-4 rounded-xl text-center">
            <p className="text-xs text-gray-400 mb-2">Informe este PIN ao motorista antes de embarcar:</p>
            <p className="text-4xl font-mono font-bold tracking-[0.5em]">{rideDetails.token}</p>
          </div>
        ) : (
          <div className="flex gap-3 items-end">
            <Input 
              label="Digite o PIN do Passageiro" 
              placeholder="0000" 
              value={tokenInput} 
              onChange={(e) => setTokenInput(e.target.value)}
              maxLength={4}
              className="font-mono text-center text-xl tracking-widest"
            />
            <Button onClick={handleVerifyToken} className="h-[56px] px-6">Validar</Button>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="mt-4 flex flex-col gap-3">
        {showCancelWarning ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <p className="text-sm text-red-800 font-medium mb-2">
              Atenção: Como já se passaram mais de 2 minutos desde o aceite, será cobrada uma taxa de desistência de R$ 5,00.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => setShowCancelWarning(false)} className="flex-1">Voltar</Button>
              <Button onClick={confirmCancelWithFee} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none">Confirmar</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={handleCancelClick} className="w-full text-red-600 border-red-200 hover:bg-red-50">
            Cancelar Corrida
          </Button>
        )}
      </div>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
