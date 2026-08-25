import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { FarmerButton } from './FarmerButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onWorkOffline?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "We Couldn't Update Your Farm Information",
  message = "Please check your network connection. Your previously saved farm records are still safe and accessible offline.",
  onRetry,
  onWorkOffline,
}) => {
  return (
    <div className="p-6 bg-rose-50/80 backdrop-blur-md rounded-3xl border border-rose-200 text-center space-y-4 my-4 max-w-lg mx-auto">
      <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl w-fit mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="font-serif font-bold text-lg text-rose-950">{title}</h3>
        <p className="text-xs sm:text-sm text-rose-800 leading-relaxed font-sans">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {onRetry && (
          <FarmerButton
            onClick={onRetry}
            variant="danger"
            size="sm"
            icon={RefreshCw}
          >
            Try Again
          </FarmerButton>
        )}

        {onWorkOffline && (
          <FarmerButton
            onClick={onWorkOffline}
            variant="outline"
            size="sm"
            icon={WifiOff}
          >
            Continue Offline
          </FarmerButton>
        )}
      </div>
    </div>
  );
};
