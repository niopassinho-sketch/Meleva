import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { playRideAlert } from '../../lib/tts';

export function RideNotificationListener({ motoristaId }: { motoristaId: string }) {
  useEffect(() => {
    if (!motoristaId) return;

    const channel = supabase.channel(`driver:${motoristaId}`);

    channel
      .on('broadcast', { event: 'ride_requested' }, (payload) => {
        const { nome, idade, destino, isFirstRide } = payload.payload;
        playRideAlert(nome, idade, destino, isFirstRide);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [motoristaId]);

  return null;
}
