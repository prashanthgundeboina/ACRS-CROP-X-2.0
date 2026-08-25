import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trees,
  Coins,
  ShieldCheck,
  TrendingUp,
  Award,
  Download,
  Share2,
  CheckCircle2,
  Leaf,
  Sun,
  Flame,
  Globe,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell } from 'recharts';
import QRCode from 'qrcode';
import { FarmCarbonPractices, CarbonCreditEstimate } from '../../types/carbonTypes';
import { SoilData } from '../../types';
import { DEFAULT_CARBON_PRACTICES, calculateCarbonCredits, CARBON_BUYERS, HISTORICAL_AUDIT_LOG } from '../../services/carbonCreditService';

interface CarbonCreditLedgerProps {
  soilData: SoilData;
  cropName: string;
  farmAreaHa?: number;
  farmerName?: string;
  onOpenCallModal?: () => void;
}

export const CarbonCreditLedger: React.FC<CarbonCreditLedgerProps> = ({
  soilData,
  cropName,
  farmAreaHa = 12.5,
  farmerName = 'Chief Farmer',
  onOpenCallModal
}) => {
  const [practices, setPractices] = useState<FarmCarbonPractices>({
    ...DEFAULT_CARBON_PRACTICES,
    farmAreaHa: farmAreaHa || 12.5
  });

  const [estimate, setEstimate] = useState<CarbonCreditEstimate>(() =>
    calculateCarbonCredits(practices, soilData)
  );

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedBuyerOffer, setSelectedBuyerOffer] = useState<string | null>(null);

  // Recalculate when practices change
  useEffect(() => {
    const newEst = calculateCarbonCredits(practices, soilData);
    setEstimate(newEst);
  }, [practices, soilData]);

  // Generate cryptographic ESG Passport QR code
  useEffect(() => {
    const passportData = JSON.stringify({
      passportId: 'CROPERX-ESG-2026',
      farmer: farmerName,
      crop: cropName,
      creditsTons: estimate.netAnnualCarbonCredits,
      verraCompliance: `${estimate.verraProtocolComplianceScore}%`,
      auditStandard: 'Verra VM0042 / Gold Standard Agri-MRV',
      hash: '0x7e8b9410ca31dfa689b14c3309e1'
    });

    QRCode.toDataURL(passportData, { width: 220, margin: 1 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.warn('QR gen error:', err));
  }, [estimate, farmerName, cropName]);

  const chartData = [
    { name: 'Soil Carbon', tCO2e: estimate.sequestrationBreakdown.soilOrganicCarbon, fill: '#059669' },
    { name: 'Cover Crop', tCO2e: estimate.sequestrationBreakdown.coverCropBiomass, fill: '#10b981' },
    { name: 'No-Till Fuel', tCO2e: estimate.sequestrationBreakdown.reducedTillageImpact, fill: '#34d399' },
    { name: 'N2O Avoid', tCO2e: estimate.sequestrationBreakdown.nitrogenN2oAvoidance, fill: '#6ee7b7' },
    { name: 'Solar Pump', tCO2e: estimate.sequestrationBreakdown.solarEnergyOffset, fill: '#f59e0b' },
    { name: 'Agroforestry', tCO2e: estimate.sequestrationBreakdown.agroforestrySequestration, fill: '#047857' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] rounded-3xl p-6 text-white shadow-xl border border-emerald-400/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-400/20 rounded-xl text-emerald-300 border border-emerald-400/30">
              <Leaf className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
              Verra VM0042 & Gold Standard Carbon Accounting
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">
            Regenerative Soil Carbon & Climate Offset Ledger
          </h2>
          <p className="text-xs text-emerald-100 max-w-2xl">
            Monetize sustainable farming practices, calculate verified annual tCO2e soil sequestration, and generate cryptographic ESG certificates for institutional voluntary carbon credit markets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-white/20"
          >
            <Award className="w-4 h-4" />
            <span>View ESG Carbon Passport</span>
          </button>
        </div>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>Net Annual Credits</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1b2e1b]">
            {estimate.netAnnualCarbonCredits} <span className="text-xs font-bold text-gray-400">tCO₂e / yr</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block pt-1">
            After 15% Verra Permanence Buffer
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>Market Spot Price</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1b2e1b]">
            ${estimate.currentMarketPricePerTonUsd} <span className="text-xs font-bold text-gray-400">/ ton</span>
          </div>
          <span className="text-[10px] text-teal-700 font-bold block pt-1">
            Voluntary Carbon Market (VCM) Index
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>Projected Annual Revenue</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-700">
            ${estimate.projectedAnnualRevenueUsd.toLocaleString()} <span className="text-xs font-bold text-gray-400">USD</span>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block pt-1">
            Direct farmer bank payout eligible
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>MRV Verification Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1b2e1b]">
            {estimate.verraProtocolComplianceScore}% <span className="text-xs font-bold text-emerald-600">Grade A</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block pt-1">
            High Additionality & Satellite Ground-Truthed
          </span>
        </div>
      </div>

      {/* Interactive Practices Configuration & Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Controls (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
              Regenerative Practice Configurator
            </h3>
            <p className="text-xs text-gray-500">
              Adjust farm practices to simulate real-time carbon yield potential.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Tillage System */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700 uppercase font-mono text-[10px] block">
                Tillage Regime
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'conventional', label: 'Conventional' },
                  { id: 'reduced', label: 'Reduced' },
                  { id: 'no_till', label: 'Zero-Till' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPractices(p => ({ ...p, tillageType: t.id as any }))}
                    className={`py-2 px-2 rounded-xl font-bold text-center transition-all cursor-pointer ${
                      practices.tillageType === t.id
                        ? 'bg-[#1b2e1b] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Crop Toggle */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 block">Cover Cropping Strategy</span>
                <span className="text-[10px] text-gray-500">Multi-species biomass incorporation</span>
              </div>
              <button
                onClick={() => setPractices(p => ({ ...p, coverCropping: !p.coverCropping }))}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  practices.coverCropping ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {practices.coverCropping ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Nitrogen Reduction Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-[10px] font-mono uppercase text-gray-600">Precision Nitrogen Optimization</span>
                <span className="text-emerald-700 font-mono">-{practices.precisionNitrogenReductionPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={practices.precisionNitrogenReductionPct}
                onChange={e => setPractices(p => ({ ...p, precisionNitrogenReductionPct: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[9px] text-gray-400 block">Eliminates volatile N2O greenhouse emissions without lowering crop yield</span>
            </div>

            {/* Agroforestry Trees Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-[10px] font-mono uppercase text-gray-600">Field Border Agroforestry Trees</span>
                <span className="text-emerald-700 font-mono">{practices.agroforestryBorderTrees} Trees</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={practices.agroforestryBorderTrees}
                onChange={e => setPractices(p => ({ ...p, agroforestryBorderTrees: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Solar Pumping Toggle */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 block">Solar Powered Drip Pumps</span>
                <span className="text-[10px] text-gray-500">Zero diesel generator combustion</span>
              </div>
              <button
                onClick={() => setPractices(p => ({ ...p, solarPumpingUsed: !p.solarPumpingUsed }))}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  practices.solarPumpingUsed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {practices.solarPumpingUsed ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Sequestration Breakdown Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
                  Carbon Sequestration Vector Breakdown (tCO₂e)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Total: {estimate.totalSequestrationTonsCo2e + estimate.grossEmissionsAvoidedTonsCo2e} tCO₂e Gross
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} stroke="#64748b" interval={0} angle={-15} textAnchor="end" />
                  <YAxis fontSize={10} stroke="#64748b" />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #c8e6c9', fontSize: 12 }}
                    formatter={(val: any) => [`${val} tCO₂e`, 'Carbon Yield']}
                  />
                  <Bar dataKey="tCO2e" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Institutional Buyers Offer Strip */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-mono uppercase font-bold text-gray-500 block">
              Active Institutional Voluntary Carbon Market Buyers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CARBON_BUYERS.map(buyer => (
                <div
                  key={buyer.id}
                  onClick={() => setSelectedBuyerOffer(buyer.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedBuyerOffer === buyer.id
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 mb-1">
                    <span>{buyer.badge}</span>
                    <span className="font-mono text-sm text-[#1b2e1b]">${buyer.bidPricePerTonUsd} / t</span>
                  </div>
                  <h5 className="font-bold text-xs text-gray-800 line-clamp-1">{buyer.buyerName}</h5>
                  <span className="text-[10px] text-gray-500 block mt-1">{buyer.settlementTerms}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical MRV Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif font-bold text-base text-[#1b2e1b]">
              Audited Verra & Gold Standard Issuance Ledger
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">Cryptographically Anchored Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                <th className="pb-2 font-bold">Audit ID</th>
                <th className="pb-2 font-bold">Vintage Year</th>
                <th className="pb-2 font-bold">Protocol Standard</th>
                <th className="pb-2 font-bold">Issued Credits</th>
                <th className="pb-2 font-bold">Auditor</th>
                <th className="pb-2 font-bold">Verification Hash</th>
                <th className="pb-2 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {HISTORICAL_AUDIT_LOG.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="py-3 font-mono font-bold text-gray-800">{rec.id}</td>
                  <td className="py-3 font-mono">{rec.year}</td>
                  <td className="py-3 font-semibold text-emerald-700">{rec.verificationStandard}</td>
                  <td className="py-3 font-mono font-bold">{rec.creditsIssued} tCO₂e</td>
                  <td className="py-3 text-gray-600">{rec.auditorName}</td>
                  <td className="py-3 font-mono text-[10px] text-gray-400">{rec.verificationHash.slice(0, 16)}...</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic ESG Passport Modal */}
      <AnimatePresence>
        {showCertificateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border-2 border-emerald-500 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
                      Farm ESG Carbon Passport
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">Verra VM0042 Protocol Certified</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Certificate Canvas Box */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">Digital Asset Proof</span>
                  <h4 className="font-serif font-extrabold text-xl text-[#1b2e1b]">
                    {farmerName} Regenerative Farm
                  </h4>
                  <p className="text-xs text-gray-600">
                    Certified for capturing <span className="font-bold text-emerald-700">{estimate.netAnnualCarbonCredits} tons CO₂e</span> in the 2026 Soil Vintage.
                  </p>
                </div>

                {qrCodeUrl && (
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    <img src={qrCodeUrl} alt="ESG Verification QR" className="w-36 h-36 rounded-xl border border-emerald-300 shadow-xs" />
                    <span className="text-[9px] font-mono text-gray-500">Scan for Cryptographic On-Chain Verification</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-left text-xs bg-white p-3 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 uppercase block">Compliance Score</span>
                    <span className="font-bold text-emerald-700">{estimate.verraProtocolComplianceScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 uppercase block">Estimated Payout</span>
                    <span className="font-bold text-emerald-700">${estimate.projectedAnnualRevenueUsd} USD</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export ESG PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
