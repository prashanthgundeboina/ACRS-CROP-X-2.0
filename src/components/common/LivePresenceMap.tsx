import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Radio, Siren, UserCheck, PhoneCall, RefreshCw,
  Search, Eye, ShieldCheck, Compass, Filter, ZoomIn, ZoomOut
} from 'lucide-react';
import { UserLivePresence, UserRole, EmergencyIncident } from '../../types';
import { presenceService } from '../../services/presenceService';

interface LivePresenceMapProps {
  currentUserId?: string;
  currentUserRole?: UserRole;
  userLat?: number;
  userLon?: number;
  onCallUser?: (user: UserLivePresence) => void;
  className?: string;
}

export const LivePresenceMap: React.FC<LivePresenceMapProps> = ({
  currentUserId,
  currentUserRole,
  userLat = 30.9010,
  userLon = 75.8573,
  onCallUser,
  className = ''
}) => {
  const [users, setUsers] = useState<UserLivePresence[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'farmer_adviser' | 'emergency'>('all');
  const [selectedUser, setSelectedUser] = useState<UserLivePresence | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();

    const unsubPresence = presenceService.onPresenceChange((list) => {
      setUsers(list);
    });

    const unsubEmergencies = presenceService.onEmergencyChange((list) => {
      setEmergencies(list.filter(i => i.status !== 'Resolved'));
    });

    return () => {
      unsubPresence();
      unsubEmergencies();
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [uList, eList] = await Promise.all([
        presenceService.fetchLivePresence(),
        presenceService.fetchActiveEmergencies()
      ]);
      setUsers(uList);
      setEmergencies(eList.filter(i => i.status !== 'Resolved'));
    } catch (e) {
      console.warn('LivePresenceMap fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Center reference
  const centerLat = userLat;
  const centerLon = userLon;

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter === 'farmer' && u.role !== 'farmer') return false;
      if (roleFilter === 'farmer_adviser' && u.role !== 'farmer_adviser') return false;
      if (roleFilter === 'emergency' && u.state !== 'emergency') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          (u.crop && u.crop.toLowerCase().includes(q)) ||
          (u.farmName && u.farmName.toLowerCase().includes(q)) ||
          (u.specialization && u.specialization.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Coordinate projection to SVG 800x500 box
  const projectCoords = (lat?: number, lon?: number) => {
    if (lat === undefined || lon === undefined) {
      return { x: 400, y: 250, visible: false };
    }

    const scale = 3000 * zoomLevel;
    const dx = (lon - centerLon) * scale;
    const dy = (centerLat - lat) * scale;

    const x = 400 + dx;
    const y = 250 + dy;

    return { x, y, visible: x >= 20 && x <= 780 && y >= 20 && y <= 480 };
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      
      {/* Controls Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Role Filter & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                roleFilter === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Online ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('farmer')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                roleFilter === 'farmer' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Farmers ({users.filter(u => u.role === 'farmer').length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('farmer_adviser')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                roleFilter === 'farmer_adviser' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Advisers ({users.filter(u => u.role === 'farmer_adviser').length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('emergency')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                roleFilter === 'emergency' ? 'bg-red-600 text-white shadow' : 'text-red-400 hover:text-red-300'
              }`}
            >
              <Siren className="w-3 h-3" />
              Emergency ({emergencies.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, crop, zone..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
            />
          </div>
        </div>

        {/* Right: Refresh & Zoom */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.3))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.3))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={fetchData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh Map Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Map Surface */}
      <div className="relative w-full h-[460px] bg-slate-950 overflow-hidden select-none">
        
        {/* SVG Base Map */}
        <svg viewBox="0 0 800 500" className="w-full h-full">
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
            </radialGradient>
          </defs>

          <rect width="800" height="500" fill="url(#grid)" />

          {/* Concentric Proximity Distance Rings (5km, 15km, 30km) */}
          <circle cx="400" cy="250" r={80 * zoomLevel} fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="405" y={250 - 80 * zoomLevel + 12} fill="rgba(16, 185, 129, 0.5)" fontSize="9" fontWeight="bold">5 km</text>

          <circle cx="400" cy="250" r={160 * zoomLevel} fill="none" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="405" y={250 - 160 * zoomLevel + 12} fill="rgba(14, 165, 233, 0.5)" fontSize="9" fontWeight="bold">15 km</text>

          <circle cx="400" cy="250" r={260 * zoomLevel} fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" strokeDasharray="5 5" />
          <text x="405" y={250 - 260 * zoomLevel + 12} fill="rgba(148, 163, 184, 0.4)" fontSize="9" fontWeight="bold">30 km</text>

          {/* Center Point (You / Operations Base) */}
          <circle cx="400" cy="250" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="400" cy="250" r="14" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping opacity-50" />
          <text x="410" y="254" fill="#10b981" fontSize="10" fontWeight="bold">Your Center Fix</text>

          {/* User Pins */}
          {filteredUsers.map((u) => {
            const { x, y, visible } = projectCoords(u.latitude, u.longitude);
            if (!visible) return null;

            const isEmergency = u.state === 'emergency';
            const isAdviser = u.role === 'farmer_adviser';
            const isSelected = selectedUser?.userId === u.userId;

            const pinColor = isEmergency ? '#ef4444' : isAdviser ? '#0284c7' : '#10b981';

            return (
              <g
                key={u.userId}
                transform={`translate(${x}, ${y})`}
                onClick={() => setSelectedUser(u)}
                className="cursor-pointer hover:opacity-100 transition duration-150"
              >
                {/* Ping wave for emergency */}
                {isEmergency && (
                  <circle cx="0" cy="0" r="22" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
                )}

                {/* Outer shadow / selection ring */}
                {isSelected && (
                  <circle cx="0" cy="0" r="18" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 2" />
                )}

                {/* Base Marker */}
                <circle cx="0" cy="0" r="10" fill={pinColor} stroke="#ffffff" strokeWidth="1.5" />

                {/* Center dot / indicator */}
                <circle cx="0" cy="0" r="3.5" fill="#ffffff" />

                {/* User Name Label */}
                <text
                  x="14"
                  y="4"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="bold"
                  className="select-none filter drop-shadow-md"
                >
                  {isEmergency ? '🚨 ' : ''}{u.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected User Popover Card */}
        {selectedUser && (
          <div className="absolute bottom-4 left-4 right-4 max-w-sm bg-slate-900/95 border border-slate-700/90 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm">{selectedUser.name}</h4>
                    {selectedUser.verifiedLiveness && (
                      <span title="Verified Liveness">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {selectedUser.role === 'farmer_adviser' ? (
                      <span className="text-sky-400">Agricultural Adviser ({selectedUser.specialization || 'Agronomy'})</span>
                    ) : (
                      <span className="text-emerald-400">Farmer • {selectedUser.farmName || 'Cultivation Farm'}</span>
                    )}
                  </p>
                  {selectedUser.crop && (
                    <p className="text-[11px] text-slate-400 mt-0.5">🌾 Crop: {selectedUser.crop}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400">
                {selectedUser.latitude && selectedUser.longitude ? (
                  `${presenceService.calculateDistanceKm(centerLat, centerLon, selectedUser.latitude, selectedUser.longitude).toFixed(1)} km away`
                ) : (
                  'Distance Ready'
                )}
              </span>

              {onCallUser && selectedUser.userId !== currentUserId && (
                <button
                  type="button"
                  onClick={() => onCallUser(selectedUser)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Connect Call
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
