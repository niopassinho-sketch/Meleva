import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabaseClient';
import { playRideAlert } from '../../lib/tts';
import { ActiveRide } from './ActiveRide';

// --- INICIO DA ALTERAÇÃO ---
export function PassengerFlow({ userId }: { userId: string }) {
  const [destination, setDestination] = useState('');
  const [onlyWomen, setOnlyWomen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [activeRide, setActiveRide] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!destination) {
      alert('Por favor, informe o destino.');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    // Mock de coordenadas para origem e destino
    const origin = `POINT(-46.633308 -23.55052)`; 
    const dest = `POINT(-46.65 -23.56)`;

    try {
      // Chamada RPC para a função PostGIS no Supabase
      const { data, error } = await (supabase as any).rpc('find_rides_advanced', {
        p_origin: origin,
        p_destination: dest,
        p_only_women: onlyWomen
      });

      if (error) {
        // Se a função não existir no banco, informamos o erro ao usuário
        console.error('Erro ao buscar caronas:', error);
        throw error;
      } else if (data) {
        const ridesData = data as any[];
        setRides(ridesData);
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao buscar caronas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (ride: any) => {
    // --- INICIO DA ALTERAÇÃO ---
    // Emite o evento de solicitação de corrida para o canal do motorista
    try {
      await supabase.channel(`driver:${ride.motorista_id}`).send({
        type: 'broadcast',
        event: 'ride_requested',
        payload: {
          nome: 'Passageiro',
          idade: 25,
          destino: destination,
          isFirstRide: ride.is_first_ride
        }
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para o motorista:', error);
    }
    // --- FIM DA ALTERAÇÃO ---

    // Simula a criação de um ActiveMatch com um token de embarque
    setActiveRide({
      ...ride,
      destino: destination,
      token: Math.floor(1000 + Math.random() * 9000).toString() // Gera token de 4 dígitos
    });
  };

  if (activeRide) {
    return (
      <ActiveRide 
        role="passageiro" 
        rideDetails={activeRide} 
        onCancel={() => setActiveRide(null)} 
        onComplete={() => {
          alert('Viagem concluída!');
          setActiveRide(null);
          setSearched(false);
          setRides([]);
        }} 
      />
    );
  }

  return (
    <div className="bg-white p-4 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-3 max-h-[70vh]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-anthracite)]">Encontrar Carona</h2>
          <p className="text-xs text-gray-500 mt-0.5">Busque motoristas indo para o mesmo destino.</p>
        </div>
      </div>

      <Input 
        label="Destino" 
        placeholder="Ex: Faculdade, Trabalho..." 
        value={destination} 
        onChange={e => setDestination(e.target.value)}
        className="h-10"
      />
      
      <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-anthracite)] cursor-pointer">
        <div className="relative flex items-center">
          <input 
            type="checkbox" 
            checked={onlyWomen} 
            onChange={e => setOnlyWomen(e.target.checked)} 
            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[var(--color-emerald)] checked:border-[var(--color-emerald)] transition-colors cursor-pointer"
          />
          <svg className="absolute w-3.5 h-3.5 pointer-events-none hidden peer-checked:block text-white left-0.5 top-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        Apenas Motoristas Mulheres
      </label>

      <Button onClick={handleSearch} isLoading={loading} className="w-full mt-1 h-10 text-sm">
        Buscar
      </Button>

      {/* Lista de Resultados */}
      <div className="overflow-y-auto mt-1 pr-2 custom-scrollbar">
        {searched && !loading && rides.length === 0 && (
          <p className="text-center text-gray-500 text-xs py-2">Nenhuma carona encontrada para este trajeto.</p>
        )}

        {rides.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider mt-1">Motoristas Próximos</h3>
            {rides.map((ride, idx) => (
              <div key={idx} className="p-3 border border-gray-100 bg-gray-50 rounded-[12px] flex justify-between items-center transition-all hover:border-[var(--color-emerald)] hover:bg-emerald-50/30">
                <div>
                  <p className="font-bold text-sm text-[var(--color-anthracite)]">{ride.nome}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    <span className="font-medium text-[var(--color-emerald)]">{ride.distancia_metros}m</span> de distância • {ride.vagas} vagas
                  </p>
                </div>
                <Button onClick={() => handleAcceptRide(ride)} className="h-8 px-3 text-xs rounded-[8px]">Pedir</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
