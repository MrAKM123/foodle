import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ServerHealthBanner: React.FC = () => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isServerReady, setIsServerReady] = useState(false);

  useEffect(() => {
    let timeout: any;

    const checkServerHealth = async () => {
      // Set a timer: if server hasn't responded within 1.5s, display friendly wake-up banner
      timeout = setTimeout(() => {
        setIsWakingUp(true);
      }, 1500);

      try {
        const res = await apiClient.get('/health', { timeout: 15000 });
        if (res.data?.status === 'healthy') {
          clearTimeout(timeout);
          setIsWakingUp(false);
          setIsServerReady(true);
        }
      } catch (e) {
        setIsWakingUp(true);
      }
    };

    checkServerHealth();

    return () => clearTimeout(timeout);
  }, []);

  if (!isWakingUp) return null;

  return (
    <div className="bg-amber-500 text-charcoal-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-charcoal-900" />
        <span>
          Waking up free-tier backend server (Render spin-up: ~30-45s on cold starts)...
        </span>
      </div>
      <span className="hidden sm:inline bg-amber-400/60 text-charcoal-900 px-2 py-0.5 rounded text-[10px] font-mono">
        Free Tier Notice
      </span>
    </div>
  );
};
