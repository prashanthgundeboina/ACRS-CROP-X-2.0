import React, { useState, useEffect } from 'react';
import {
  Activity,
  CloudRain,
  Droplets,
  Satellite,
  Compass,
  TrendingUp,
  RefreshCw,
  Wind,
  ShieldCheck,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { ProviderTelemetryData } from '../../../types';

interface TelemetryViewProps {
  farmerId: string;
  cropName?: string;
  location?: string;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  farmerId,
  cropName = 'Standing Crop',
  location = 'Rural Farm'
}) => {
  const [telemetry, setTelemetry] = useState<ProviderTelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/ai/providers/telemetry?farmerId=${encodeURIComponent(farmerId)}&crop=${encodeURIComponent(
          cropName
        )}&location=${encodeURIComponent(location)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, [farmerId, cropName]);

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center animate-pulse">
        <RefreshCw className="w-6 h-6 text-emerald-400 mx-auto animate-spin mb-2" />
        <p className="text-xs text-slate-400">Connecting to IoT sensors & satellite telemetry streams...</p>
      </div>
    );
  }

  if (!telemetry) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Multi-Source Autonomous Farm Telemetry</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Live ingestion across Remote Sensing Satellites, IoT Micro-Sensors, Agro-Weather & Mandi Feeds.
          </p>
        </div>
        <button
          onClick={loadTelemetry}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of 5 Real Telemetry Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stream 1: Ground IoT Sensors */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
              <Droplets className="w-4 h-4" />
              <span>Ground IoT Soil Moisture & Rhizosphere</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Soil Moisture (15cm)</span>
              <p className="text-xl font-black text-teal-300 mt-1">
                {telemetry.sensors.soilMoisturePercent}%
              </p>
              <span className="text-[10px] text-emerald-400">AWD Threshold Optimal</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Soil Reaction (pH)</span>
              <p className="text-xl font-black text-indigo-300 mt-1">{telemetry.sensors.soilPh}</p>
              <span className="text-[10px] text-slate-400">Neutral Soil Index</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 col-span-2">
              <span className="text-slate-400 text-[11px] block">NPK Sensor Values (kg/ha)</span>
              <p className="text-sm font-mono font-bold text-white mt-1">
                N: {telemetry.sensors.npkStatus?.n} &bull; P: {telemetry.sensors.npkStatus?.p} &bull; K: {telemetry.sensors.npkStatus?.k}
              </p>
            </div>
          </div>
        </div>

        {/* Stream 2: Micro-Weather Station */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <CloudRain className="w-4 h-4" />
              <span>Field Micro-Weather & Spray Window</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">STABLE</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Air Temperature & Humidity</span>
              <p className="text-xl font-black text-amber-300 mt-1">
                {telemetry.weather.temperatureC}°C &bull; {telemetry.weather.humidityPercent}%
              </p>
              <span className="text-[10px] text-slate-400">Wind: {telemetry.weather.windSpeedKmh} km/h</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Precipitation Probability</span>
              <p className="text-xl font-black text-blue-300 mt-1">
                {telemetry.weather.rainProbability}%
              </p>
              <span className="text-[10px] text-emerald-400">
                {telemetry.weather.rainProbability < 40 ? 'Ideal Spray Window' : 'Rain Delayed'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 col-span-2">
              <span className="text-slate-400 text-[11px] block">Agronomic Micro-Advisory</span>
              <p className="text-xs font-medium text-slate-200 mt-1">
                {telemetry.weather.sprayWindowAdvisory}
              </p>
            </div>
          </div>
        </div>

        {/* Stream 3: Satellite Crop Imagery */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Satellite className="w-4 h-4" />
              <span>Sentinel-2 Multispectral Remote Sensing</span>
            </div>
            <span className="text-[10px] text-slate-400">{telemetry.satellite.cloudCoverPercent}% Cloud</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vegetation Vigor Index (NDVI):</span>
              <strong className="text-emerald-400 text-base">{telemetry.satellite.ndviScore}</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                style={{ width: `${(telemetry.satellite.ndviScore || 0.78) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Canopy Status: <strong className="text-emerald-300">{telemetry.satellite.canopyVigor}</strong> &bull; Pass: {new Date(telemetry.satellite.lastPassTimestamp).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stream 4: APMC Mandi Market Prices */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>APMC Mandi Real-Time Spot Price</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-bold">Agmarknet Verified</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Modal Price:</span>
              <strong className="text-emerald-300 text-lg">₹{telemetry.market.currentMandiPrice}/Quintal</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Best Selling Month: {telemetry.market.bestSellingMonth}</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider">
                Trend: {telemetry.market.priceTrend}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Demand Index: {telemetry.market.demandIndex}
            </p>
          </div>
        </div>

        {/* Stream 5: Drone Aerial Survey */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Camera className="w-4 h-4" />
              <span>Autonomous Drone Aerial Multispectral Scouting</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Surveyed: {new Date(telemetry.drone.lastInspectionDate).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Surveyed Acreage</span>
              <p className="text-lg font-bold text-white mt-1">{telemetry.drone.coverageAcres} Acres</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Pest Hotspots Detected</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">{telemetry.drone.pestHotspotsDetected}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Weed Density Category</span>
              <p className="text-lg font-bold text-indigo-400 mt-1 capitalize">{telemetry.drone.weedDensityCategory}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
