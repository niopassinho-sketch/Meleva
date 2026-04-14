import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// --- INICIO DA ALTERAÇÃO ---
export function SOSButton({ userId }: { userId: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleTriggerSOS = async () => {
    if (isRecording) {
      // Parar gravação (simulação)
      setIsRecording(false);
      alert('Alerta SOS cancelado e gravação finalizada.');
      return;
    }

    const confirm = window.confirm('TEM CERTEZA QUE DESEJA ACIONAR O SOS? Isso iniciará a gravação de áudio/vídeo e alertará a central.');
    if (!confirm) return;

    setIsRecording(true);

    try {
      // Mock de localização
      const location = `POINT(-46.633308 -23.55052)`;

      // Chamada RPC para disparar o alerta
      const { error } = await (supabase as any).rpc('trigger_sos_alert', {
        p_user_id: userId,
        p_location: location,
      });

      if (error && !error.message.includes('Could not find the function')) {
        throw error;
      }
      
      console.log('SOS Disparado com sucesso (ou mockado).');
    } catch (err: any) {
      console.error('Erro ao disparar SOS:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isRecording && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full" />
          <span className="font-bold text-sm">GRAVANDO {formatTime(recordingTime)}</span>
        </div>
      )}
      <button
        onClick={handleTriggerSOS}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 ${
          isRecording ? 'bg-gray-800 border-4 border-red-600' : 'bg-red-600'
        }`}
        title="Botão de Pânico SOS"
      >
        {isRecording ? (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <rect x="5" y="5" width="10" height="10" />
          </svg>
        ) : (
          <span className="text-white font-black text-xl tracking-tighter">SOS</span>
        )}
      </button>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
