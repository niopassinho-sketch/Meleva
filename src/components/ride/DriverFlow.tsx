import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabaseClient';

// --- INICIO DA ALTERAÇÃO ---
export function DriverFlow({ userId }: { userId: string }) {
  const [destination, setDestination] = useState('');
  const [vagas, setVagas] = useState(4);
  const [onlyWomen, setOnlyWomen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!destination) {
      alert('Por favor, informe o destino.');
      return;
    }

    setLoading(true);
    
    // Mock de coordenadas para origem e destino (em produção, usaríamos a API do Google Maps Places)
    const origin_point = `POINT(-46.633308 -23.55052)`; // Ex: Centro SP
    const destination_point = `POINT(-46.65 -23.56)`; // Ex: Av Paulista
    const route_path = `LINESTRING(-46.633308 -23.55052, -46.65 -23.56)`;

    try {
      const { error } = await supabase.from('user_routes').insert({
        driver_id: userId,
        origin_point,
        destination_point,
        route_path,
        status: 'active',
        vagas,
      } as any);

      if (error) throw error;

      setPublished(true);
      alert('Rota publicada com sucesso! Aguardando passageiros...');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao publicar rota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (published) {
    return (
      <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-[var(--color-emerald)] rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-anthracite)]">Rota Ativa</h2>
        <p className="text-sm text-gray-500">Procurando passageiros no seu trajeto para <strong>{destination}</strong>.</p>
        <Button variant="outline" onClick={() => setPublished(false)} className="mt-4">Cancelar Rota</Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-anthracite)]">Para onde vamos?</h2>
        <p className="text-sm text-gray-500 mt-1">Publique sua rota e encontre passageiros.</p>
      </div>

      <Input 
        label="Destino" 
        placeholder="Ex: Shopping Metrópole" 
        value={destination} 
        onChange={e => setDestination(e.target.value)} 
      />
      
      <div className="flex gap-4 items-end">
        <Input 
          label="Vagas Disponíveis" 
          type="number" 
          min={1} 
          max={8} 
          value={vagas} 
          onChange={e => setVagas(Number(e.target.value))} 
          className="w-1/3" 
        />
        
        <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-anthracite)] h-[56px] px-2 cursor-pointer">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              checked={onlyWomen} 
              onChange={e => setOnlyWomen(e.target.checked)} 
              className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-[var(--color-emerald)] checked:border-[var(--color-emerald)] transition-colors cursor-pointer"
            />
            <svg className="absolute w-4 h-4 pointer-events-none hidden peer-checked:block text-white left-1 top-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          Apenas Mulheres
        </label>
      </div>

      <Button onClick={handlePublish} isLoading={loading} className="w-full mt-2">
        Publicar Rota
      </Button>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
