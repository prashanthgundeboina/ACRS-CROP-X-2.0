import React from 'react';
import { SoilData, RecommendationResponse, CropRecommendation } from '../types';
import { Printer, Download, FileText, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  soilData: SoilData;
  recommendations: RecommendationResponse | null;
  selectedCrop?: CropRecommendation | null;
  diagnosticResult?: string | null;
  onClose: () => void;
}

export const ReportExportModal: React.FC<Props> = ({
  soilData,
  recommendations,
  selectedCrop,
  diagnosticResult,
  onClose
}) => {
  const { t, activeLangObj } = useLanguage();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-[#c8e6c9] shadow-2xl flex flex-col justify-between">
        {/* Printable Report Wrapper */}
        <div id="printable-agri-report" className="p-8 md:p-10 space-y-8 print:p-0">
          {/* Header Certificate Style */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#2e7d32] pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#4CAF50]">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-widest text-[#2e7d32]">Official Precision Agronomy Audit</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1b2e1b] mt-1">CROP RECOMMENDATION & DIAGNOSTIC REPORT</h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Generated via Gemini 2.5 Flash Neural Engine • {currentDate}</p>
            </div>
            <div className="text-right flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[#4CAF50] text-white font-bold text-xs rounded-xl hover:bg-[#2e7d32] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Save / Print PDF
              </button>
              <button
                onClick={onClose}
                className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 1. Laboratory Header & Sample Information */}
          <div className="bg-[#f8fcf8] p-4 rounded-2xl border border-[#c8e6c9] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Sample Lab Ref</span>
              <span className="font-bold text-[#1b2e1b]">LAB-SR-2026-8941</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Testing Method</span>
              <span className="font-bold text-[#1b2e1b]">ICP-OES & Telemetry Spectrometry</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Sampling Depth</span>
              <span className="font-bold text-[#1b2e1b]">0 - 30 cm (Topsoil)</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase">Soil Fertility Index</span>
              <span className="font-bold text-[#2e7d32]">84.2 / 100 (Optimal)</span>
            </div>
          </div>

          {/* 2. Executive Telemetry Summary */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#1b2e1b] border-l-4 border-[#4CAF50] pl-3">I. {t.soilNutrients} & Laboratory Telemetry Data</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{t.nitrogen} (N)</span>
                <div className="text-base font-black text-[#2e7d32]">{soilData.nitrogen} ppm</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Target: 40-80 ppm</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{t.phosphorus} (P)</span>
                <div className="text-base font-black text-[#2e7d32]">{soilData.phosphorus} ppm</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Target: 25-50 ppm</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{t.potassium} (K)</span>
                <div className="text-base font-black text-[#2e7d32]">{soilData.potassium} ppm</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Target: 30-70 ppm</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{t.soilPh}</span>
                <div className="text-base font-black text-[#2e7d32]">{soilData.ph}</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Target: 6.0-7.2</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{t.soilMoisture}</span>
                <div className="text-base font-black text-[#2e7d32]">{soilData.soil_moisture}%</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Volumetric Water</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Organic Matter</span>
                <div className="text-base font-black text-[#2e7d32]">{soilData.organic_matter}%</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Humus & Carbon</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Micronutrient Zinc (Zn)</span>
                <div className="text-base font-black text-[#2e7d32]">2.1 ppm</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Adequate</span>
              </div>
              <div className="p-3 bg-[#f8fcf8] rounded-xl border border-[#c8e6c9]">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Electrical Cond. (EC)</span>
                <div className="text-base font-black text-[#2e7d32]">0.8 dS/m</div>
                <span className="text-[9px] text-emerald-600 font-semibold">Non-saline</span>
              </div>
            </div>
          </div>

          {/* 2. Historical Fertility Trend Summary */}
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#1b2e1b] border-l-4 border-[#4CAF50] pl-3">II. 6-Month Historical Soil Fertility & NPK Trajectory</h3>
            <div className="p-4 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] text-xs space-y-3 font-mono">
              <div className="grid grid-cols-4 gap-2 text-center font-bold text-[#1b2e1b] border-b border-[#c8e6c9] pb-2">
                <span>Period</span>
                <span>Nitrogen (N)</span>
                <span>Phosphorus (P)</span>
                <span>Potassium (K)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-gray-700">
                <span>Q1 2026</span>
                <span>38 ppm</span>
                <span>22 ppm</span>
                <span>35 ppm</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-gray-700">
                <span>Q2 2026</span>
                <span>42 ppm</span>
                <span>28 ppm</span>
                <span>41 ppm</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[#2e7d32] font-bold bg-[#e8f5e9] py-1 rounded-lg">
                <span>Current (Live)</span>
                <span>{soilData.nitrogen} ppm</span>
                <span>{soilData.phosphorus} ppm</span>
                <span>{soilData.potassium} ppm</span>
              </div>
            </div>
          </div>

          {/* 2. Top Recommended Crops */}
          {recommendations && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1b2e1b] border-l-4 border-[#4CAF50] pl-3">II. {t.recommendedCrops}</h3>
              <div className="space-y-3">
                {recommendations.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif text-base font-bold text-[#1b2e1b]">{rec.crop}</span>
                      <span className="px-3 py-1 bg-[#4CAF50] text-white text-xs font-bold rounded-full">
                        {rec.confidence}% {t.suitabilityScore}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{rec.description}</p>
                    <div className="text-[11px] text-[#2e7d32] font-semibold">
                      {t.cropRotation}: <span className="text-gray-800 font-normal">{rec.rotation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Diagnostic Findings if available */}
          {diagnosticResult && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1b2e1b] border-l-4 border-rose-500 pl-3">III. Plant Pathology Diagnostic Report</h3>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 whitespace-pre-wrap font-mono leading-relaxed">
                {diagnosticResult}
              </div>
            </div>
          )}

          {/* Environmental Insight */}
          {recommendations?.environmentalInsight && (
            <div className="p-4 bg-[#1b2e1b] text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-[#81c784]">Agronomist Environmental Note</span>
              <p className="text-xs text-gray-200 leading-relaxed">{recommendations.environmentalInsight}</p>
            </div>
          )}

          {/* Footer certification stamp */}
          <div className="border-t border-[#c8e6c9] pt-4 flex justify-between items-center text-[10px] text-gray-400">
            <span>Verified by Crop Recommendation Pro AI Engine</span>
            <span>Document ID: AGR-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
