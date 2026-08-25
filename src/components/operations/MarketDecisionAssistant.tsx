import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  IndianRupee, 
  Store, 
  Clock, 
  Warehouse, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Percent,
  Sparkles
} from 'lucide-react';
import { MarketDecisionScenario } from '../../types/operations/farmOperationsTypes';
import { marketDecisionService } from '../../services/operations/marketDecisionService';

interface MarketDecisionAssistantProps {
  cropName: string;
  isExpertMode?: boolean;
  onSelectTab: (tabId: string) => void;
}

export const MarketDecisionAssistant: React.FC<MarketDecisionAssistantProps> = ({
  cropName,
  isExpertMode = false,
  onSelectTab
}) => {
  const [targetPrice, setTargetPrice] = useState<number>(() => marketDecisionService.getTargetPrice(cropName));
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => marketDecisionService.isAlertsEnabled());
  const [estimatedYield, setEstimatedYield] = useState<number>(3500);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState(targetPrice.toString());

  const scenarios = marketDecisionService.evaluateScenarios({
    cropName,
    estimatedYieldKg: estimatedYield
  });

  const benchmark = marketDecisionService.getMarketBenchmark(cropName);

  const handleSaveTarget = () => {
    const p = parseFloat(customPriceInput) || targetPrice;
    setTargetPrice(p);
    marketDecisionService.setTargetPrice(cropName, p);
    setIsEditingTarget(false);
  };

  const handleToggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    marketDecisionService.setAlertsEnabled(next);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2e7d32] shrink-0 border border-emerald-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                Market Decision Assistant
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Current Mandi Rate: ₹{benchmark.current}/kg
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Selling vs Holding vs Storage Analysis
            </h2>
          </div>
        </div>

        {/* Target Price Alert Control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAlerts}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              alertsEnabled
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            {alertsEnabled ? <Bell className="w-3.5 h-3.5 text-amber-600" /> : <BellOff className="w-3.5 h-3.5" />}
            <span>Target Alert: ₹{targetPrice}/kg ({alertsEnabled ? 'Active' : 'Off'})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('market')}
            className="px-3.5 py-2 rounded-xl bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <span>Live Mandi ROI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Yield & Target Price Customizer */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-gray-700">Simulate Crop Quantity:</span>
          <div className="inline-flex rounded-xl bg-white p-1 border border-gray-300">
            {[1500, 3500, 7000].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setEstimatedYield(qty)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  estimatedYield === qty
                    ? 'bg-[#2e7d32] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {qty} kg
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditingTarget ? (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Target ₹:</span>
              <input
                type="number"
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                className="w-16 p-1 rounded-lg border border-gray-300 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={handleSaveTarget}
                className="px-2 py-1 rounded-lg bg-[#2e7d32] text-white font-bold text-xs"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTarget(true)}
              className="text-xs text-[#2e7d32] hover:underline font-semibold"
            >
              Set Custom Price Goal (Current: ₹{targetPrice})
            </button>
          )}
        </div>
      </div>

      {/* 3 Comparison Scenarios: SELL NOW vs WAIT vs STORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isRecommended = sc.recommended;

          return (
            <div
              key={sc.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all relative ${
                isRecommended
                  ? 'bg-emerald-50/60 border-[#2e7d32] ring-2 ring-[#2e7d32]/20 shadow-md'
                  : 'bg-white border-gray-200'
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2e7d32] text-white shadow-xs">
                  ★ RECOMMENDED SCENARIO
                </span>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm uppercase tracking-wider text-gray-900">
                    {sc.label}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                    sc.riskFactor === 'low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sc.riskFactor === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                  }`}>
                    {sc.riskFactor} risk
                  </span>
                </div>

                <h3 className="font-bold text-xs text-gray-800 leading-snug">
                  {sc.headline}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {sc.reason}
                </p>
              </div>

              {/* Financial Breakdown Table */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Gross Value:</span>
                  <span className="font-mono">₹{sc.estimatedGrossRevenue.toLocaleString()}</span>
                </div>
                {sc.estimatedStorageCost > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Est. Storage Rental:</span>
                    <span className="font-mono">-₹{sc.estimatedStorageCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Est. Transport:</span>
                  <span className="font-mono">-₹{sc.estimatedTransportCost.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold text-sm text-gray-900">
                  <span>Estimated Net:</span>
                  <span className="font-mono text-emerald-800 text-base">
                    ₹{sc.estimatedNetReturn.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <p className="text-[11px] text-gray-400 text-center italic">
        * Market scenarios represent econometric projections based on historical mandi trends and regional arrival volumes. Always verify spot rates with local mandi commission agents before dispatching.
      </p>
    </div>
  );
};
