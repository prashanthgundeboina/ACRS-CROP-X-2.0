import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Legend } from 'recharts';
import { calculateMandiArbitrage, generate30DayPriceForecast, HEDGING_OPTIONS } from '../../services/agriArbitrageService';
import { MandiMarketQuote } from '../../types/arbitrageTypes';

interface AgriCommodityArbitrageProps {
  cropName: string;
  onOpenCallModal?: () => void;
}

export const AgriCommodityArbitrage: React.FC<AgriCommodityArbitrageProps> = ({
  cropName = 'Rice',
  onOpenCallModal
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(cropName || 'Rice');
  const [quantityQtl, setQuantityQtl] = useState<number>(100); // 100 quintals = 10 metric tons
  const [dieselPrice, setDieselPrice] = useState<number>(0.45);
  const [storageDays, setStorageDays] = useState<number>(30);
  const [selectedHedgingId, setSelectedHedgingId] = useState<string | null>(null);

  const quotes: MandiMarketQuote[] = useMemo(() => {
    return calculateMandiArbitrage(selectedCrop, quantityQtl, dieselPrice);
  }, [selectedCrop, quantityQtl, dieselPrice]);

  const bestQuote = quotes.find(q => q.isBestArbitrage) || quotes[0];
  const localQuote = quotes.find(q => q.id === 'mandi-local') || quotes[quotes.length - 1];
  const arbitrageGain = Math.max(0, bestQuote.netRevenueTotal - localQuote.netRevenueTotal);

  const forecastData = useMemo(() => {
    return generate30DayPriceForecast(bestQuote?.wholesalePricePerQtl || 3200);
  }, [bestQuote]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b2e1b] via-[#1a3320] to-[#122416] rounded-3xl p-6 text-white shadow-xl border border-amber-400/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/20 rounded-xl text-amber-300 border border-amber-400/30">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
              Real-Time APMC Mandi & Wholesale Arbitrage Optimizer
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">
            Commodity Market Arbitrage & Hedging Desk
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl">
            Compare regional wholesale mandi terminal prices, factor freight transit & storage shrinkage, and capture optimal peak-window realized profit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-right">
            <span className="text-[10px] text-gray-300 uppercase font-mono block">Max Arbitrage Delta</span>
            <span className="text-xl font-bold font-mono text-amber-300">
              +${arbitrageGain.toLocaleString()} <span className="text-xs text-white">Net Gain</span>
            </span>
          </div>
        </div>
      </div>

      {/* Commodity Selector and Harvest Lot Inputs */}
      <div className="bg-white rounded-3xl p-5 border border-[#c8e6c9] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">
            Select Commodity Crop
          </label>
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="farming-input text-sm py-2 font-bold text-gray-800"
          >
            <option value="Rice">Rice / Paddy</option>
            <option value="Wheat">Wheat (Durum & Sharbati)</option>
            <option value="Maize">Maize / Yellow Corn</option>
            <option value="Tomato">Tomatoes (Fresh Produce)</option>
            <option value="Chickpea">Chickpea / Bengal Gram</option>
            <option value="Coffee">Arabica Coffee Beans</option>
            <option value="Cotton">Cotton (Medium Staple)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">
            Harvest Volume Lot Size (Quintals / 100kg)
          </label>
          <input
            type="number"
            min="10"
            max="2000"
            step="10"
            value={quantityQtl}
            onChange={e => setQuantityQtl(Math.max(1, Number(e.target.value)))}
            className="farming-input text-sm py-2 font-bold text-gray-800"
          />
          <span className="text-[9px] text-gray-400 block mt-1">Equivalent to {(quantityQtl / 10).toFixed(1)} Metric Tons</span>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">
            Freight Diesel Index ($ / ton-km)
          </label>
          <input
            type="number"
            min="0.1"
            max="1.5"
            step="0.05"
            value={dieselPrice}
            onChange={e => setDieselPrice(Number(e.target.value))}
            className="farming-input text-sm py-2 font-bold text-gray-800"
          />
          <span className="text-[9px] text-gray-400 block mt-1">Trucking rate based on regional diesel fuel rates</span>
        </div>
      </div>

      {/* Multi-Terminal Market Arbitrage Matrix Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2e7d32]" />
            <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
              Live Multi-Mandi Terminal Price & Cost Arbitrage Matrix
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Ranked by Net Realized Profit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                <th className="pb-2 font-bold">Mandi / Terminal Market</th>
                <th className="pb-2 font-bold">Distance & Transit</th>
                <th className="pb-2 font-bold">Wholesale Bid</th>
                <th className="pb-2 font-bold">Freight Deduct</th>
                <th className="pb-2 font-bold">APMC & Shrinkage</th>
                <th className="pb-2 font-bold">Net Price / Qtl</th>
                <th className="pb-2 font-bold text-right">Total Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map(quote => (
                <tr
                  key={quote.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    quote.isBestArbitrage ? 'bg-emerald-50/60 font-medium' : ''
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {quote.isBestArbitrage && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[9px] font-bold">
                          BEST ROUTE
                        </span>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block">{quote.name}</span>
                        <span className="text-[10px] text-gray-500">{quote.location} • {quote.dailyArrivalTons}t arrival</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 font-mono">
                    <span className="text-gray-900 block font-bold">{quote.distanceKm} km</span>
                    <span className="text-[10px] text-gray-500">~{quote.transitHours}h road transit</span>
                  </td>

                  <td className="py-3 font-mono">
                    <span className="font-bold text-gray-900">${quote.wholesalePricePerQtl}</span>
                    <span className={`text-[10px] ml-1 font-bold ${
                      quote.priceDeltaPct >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {quote.priceDeltaPct >= 0 ? `+${quote.priceDeltaPct}%` : `${quote.priceDeltaPct}%`}
                    </span>
                  </td>

                  <td className="py-3 font-mono text-red-600">
                    -${quote.freightCostPerQtl} / qtl
                  </td>

                  <td className="py-3 font-mono text-gray-500">
                    -{quote.apmcMandiFeePct}% APMC + {quote.coldChainLossPct}% loss
                  </td>

                  <td className="py-3 font-mono font-bold text-emerald-800 text-sm">
                    ${quote.netRealizedPricePerQtl}
                  </td>

                  <td className="py-3 font-mono font-black text-right text-sm text-[#1b2e1b]">
                    ${quote.netRevenueTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30-Day Peak Price Window Forecast & Hedging Contracts (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Forecast Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-base text-[#1b2e1b]">
                30-Day Projected Price Seasonality Curve
              </h4>
              <span className="text-[10px] text-gray-500">Correlated with national buffer procurement & port vessel queues</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Hold vs Sell Strategy
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" fontSize={10} stroke="#64748b" />
                <YAxis fontSize={10} stroke="#64748b" domain={['auto', 'auto']} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #c8e6c9', fontSize: 11 }}
                  formatter={(val: any) => [`$${val}`, 'Projected Rate']}
                />
                <Line type="monotone" dataKey="projectedPrice" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="upperConfidence" stroke="#a7f3d0" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="lowerConfidence" stroke="#fecdd3" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[#1b2e1b] block">Warehouse Holding Recommendation</span>
              <span className="text-gray-500 text-[11px]">Storage for 25-30 days delivers +$180/qtl after silo rental costs.</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white font-mono font-bold rounded-xl text-[10px]">
              HOLD TO DAY 28
            </span>
          </div>
        </div>

        {/* Forward Contract Hedging & Pledge Loans */}
        <div className="bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-[#1b2e1b]">
                  Contract Forward Hedging & e-NWR Silo Loans
                </h4>
                <span className="text-[10px] text-gray-500">Lock guaranteed floor prices and avoid distress post-harvest sales</span>
              </div>
              <Coins className="w-5 h-5 text-amber-600" />
            </div>

            <div className="space-y-2.5">
              {HEDGING_OPTIONS.map(option => (
                <div
                  key={option.id}
                  onClick={() => setSelectedHedgingId(option.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedHedgingId === option.id
                      ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-gray-50/60 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {option.status}
                    </span>
                    <span className="font-mono font-bold text-sm text-[#1b2e1b]">
                      ${option.lockInPricePerQtl} / Qtl
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-gray-900">{option.buyerName}</h5>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>{option.contractType}</span>
                    <span className="text-emerald-700 font-semibold">{option.paymentEscrowBank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                alert(`Contract agreement initiated for ${selectedCrop}. Confirmation sent to farmer profile.`);
              }}
              className="w-full py-2.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Lock Hedged Contract for {quantityQtl} Quintals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
