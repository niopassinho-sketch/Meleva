import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// --- INICIO DA ALTERAÇÃO ---
const containerStyle = {
  width: '100%',
  height: '100vh',
};

// Coordenadas padrão (São Paulo) caso a geolocalização falhe ou demore
const defaultCenter = {
  lat: -23.55052,
  lng: -46.633308,
};

interface MapViewProps {
  children?: React.ReactNode;
}

export function MapView({ children }: MapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [center, setCenter] = useState(defaultCenter);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Erro ao obter geolocalização:', error);
          setLocationError(true);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError(true);
    }
  }, []);

  if (loadError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-red-50 p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-red-900">Erro ao carregar o mapa</h3>
          <p className="text-sm text-red-700">
            Houve um problema ao carregar a API do Google Maps. Verifique se a chave de API está configurada corretamente e se a "Maps JavaScript API" está habilitada no Google Cloud Console.
          </p>
          <div className="mt-2 p-3 bg-white border border-red-200 rounded-lg text-xs font-mono text-red-500 break-all">
            {loadError.message}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[var(--color-emerald)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-anthracite)] font-medium">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          styles: [
            // Estilo minimalista para focar nos elementos da UI
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        }}
      >
        <Marker 
          position={center} 
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            scale: 8,
            fillColor: '#00A86B', // Emerald
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      </GoogleMap>

      {/* Camada de UI sobreposta ao mapa */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-end p-4 pb-8 z-10">
        <div className="pointer-events-auto w-full max-w-md mx-auto">
          {locationError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-xs text-center shadow-sm">
              Não foi possível obter sua localização exata. Usando localização padrão.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
