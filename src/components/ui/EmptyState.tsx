import React from 'react';
import { type LucideIcon, Sprout, FlaskConical, Radio, MapPin, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { FarmerButton } from './FarmerButton';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  iconEmoji?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'crop' | 'soil' | 'sensor' | 'zone' | 'market';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon: Icon = Sprout,
  iconEmoji,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-dashed border-[#c8e6c9] shadow-xs ${className}`}
    >
      <div className="p-4 bg-[#e8f5e9] text-[#2e7d32] rounded-2xl mb-3 flex items-center justify-center text-3xl">
        {iconEmoji ? (
          <span>{iconEmoji}</span>
        ) : (
          <Icon className="w-8 h-8" />
        )}
      </div>

      <h3 className="font-serif font-bold text-lg text-[#1b2e1b] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed mb-4">
        {subtitle}
      </p>

      {actionText && onAction && (
        <FarmerButton onClick={onAction} variant="primary" size="sm">
          {actionText}
        </FarmerButton>
      )}
    </div>
  );
};

// Standardized Empty State Presets for Phase 4
export const NoCropEmptyState: React.FC<{ onAddCrop: () => void }> = ({ onAddCrop }) => (
  <EmptyState
    iconEmoji="🌱"
    title="Tell CroperX what you're growing"
    subtitle="Add your crop to receive personalized watering, fertilizer, and pest protection advice."
    actionText="Add Crop"
    onAction={onAddCrop}
  />
);

export const NoSoilEmptyState: React.FC<{ onAddSoil: () => void }> = ({ onAddSoil }) => (
  <EmptyState
    iconEmoji="🧪"
    title="Better fertilizer advice starts with your soil"
    subtitle="Enter your soil NPK and pH values or choose regional averages to unlock precise nutrient dosing."
    actionText="Add Soil Data"
    onAction={onAddSoil}
  />
);

export const NoSensorEmptyState: React.FC<{ onConnectSensor?: () => void }> = ({ onConnectSensor }) => (
  <EmptyState
    iconEmoji="📡"
    title="No sensors connected"
    subtitle="You can still use CroperX without sensors. Connect IoT soil probes whenever you're ready for real-time live telemetry."
    actionText={onConnectSensor ? "Connect Sensor" : undefined}
    onAction={onConnectSensor}
  />
);

export const NoFarmZoneEmptyState: React.FC<{ onAddField: () => void }> = ({ onAddField }) => (
  <EmptyState
    iconEmoji="🗺️"
    title="Create your first field"
    subtitle="Divide your land into management zones (e.g. North Plot, Greenhouse) to monitor moisture and crops per sector."
    actionText="Add Field"
    onAction={onAddField}
  />
);

export const NoMarketDataEmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    iconEmoji="💰"
    title="Market information is currently unavailable"
    subtitle="Could not reach Mandi price feeds. Check your network connection or try refreshing market data."
    actionText="Try Again"
    onAction={onRetry}
  />
);
