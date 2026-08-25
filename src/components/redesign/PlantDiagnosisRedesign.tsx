import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Upload,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge, StatusVariant } from '../ui/StatusBadge';
import { FarmerButton } from '../ui/FarmerButton';

interface PlantDiagnosisRedesignProps {
  diagnosticImage: string | null;
  isDiagnosing: boolean;
  diagnosticReport: string | null;
  diagnosticAlert: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCallModal: () => void;
}

export const PlantDiagnosisRedesign: React.FC<PlantDiagnosisRedesignProps> = ({
  diagnosticImage,
  isDiagnosing,
  diagnosticReport,
  diagnosticAlert,
  onImageUpload,
  onOpenCallModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSevere = diagnosticAlert?.includes('⚠️') || diagnosticReport?.toLowerCase().includes('fungal') || diagnosticReport?.toLowerCase().includes('blight');

  return (
    <div className="space-y-6 my-6">
      <GlassCard padding="lg" className="border-2 border-[#c8e6c9]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-[#2e7d32] rounded-2xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#1b2e1b]">
                📷 Check My Plant Health
              </h2>
              <p className="text-xs text-gray-600 font-sans">
                Instant computer vision pathology scanner powered by Google Gemini 2.5 Flash Vision.
              </p>
            </div>
          </div>

          <FarmerButton
            onClick={onOpenCallModal}
            variant="voice"
            size="sm"
            icon={PhoneCall}
          >
            🎙️ Explain Disease By Voice
          </FarmerButton>
        </div>

        {/* Upload Zone & Scanner Flow */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
          {/* Left Upload Container */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#a5d6a7] rounded-3xl bg-[#f8fcf8] text-center space-y-4">
            {diagnosticImage ? (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#2e7d32]/30 shadow-md">
                <img src={diagnosticImage} alt="Crop Scan Sample" className="w-full h-full object-cover" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/70 text-white rounded-xl text-xs font-bold backdrop-blur-md hover:bg-black"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-16 h-16 bg-[#e8f5e9] text-[#2e7d32] rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#1b2e1b]">Take or Upload Leaf Photo</h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1">
                    Upload a clear photo of infected leaves, spots, or insect damage.
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />

            <FarmerButton
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="md"
              icon={Camera}
              fullWidth
            >
              {diagnosticImage ? 'Analyze Different Photo' : '📷 Scan Plant Photo Now'}
            </FarmerButton>
          </div>

          {/* Right Analysis & Result Steps */}
          <div className="md:col-span-7 space-y-4">
            {isDiagnosing ? (
              <div className="p-8 text-center space-y-3 bg-[#e8f5e9]/50 rounded-3xl border border-[#a5d6a7]">
                <RefreshCw className="w-10 h-10 text-[#2e7d32] animate-spin mx-auto" />
                <h4 className="font-serif font-bold text-lg text-[#1b2e1b]">
                  Analyzing Tissue Structure & Pathogens...
                </h4>
                <p className="text-xs text-gray-600">
                  Google Gemini 2.5 Flash Vision is scanning chlorosis patterns and spore signatures.
                </p>
              </div>
            ) : diagnosticReport ? (
              <div className="space-y-4">
                {/* Severity Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-gray-500">
                    Diagnostic Analysis Complete
                  </span>
                  <StatusBadge
                    label={isSevere ? 'Severe Pathogen Risk' : 'Healthy / Minor Issue'}
                    variant={isSevere ? 'danger' : 'success'}
                    size="md"
                    pulse={isSevere}
                  />
                </div>

                {/* Report Content */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 text-xs text-gray-800 space-y-2 leading-relaxed shadow-2xs max-h-48 overflow-y-auto custom-scrollbar">
                  {diagnosticAlert && (
                    <div className={`p-2.5 rounded-xl text-xs font-bold ${isSevere ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'}`}>
                      {diagnosticAlert}
                    </div>
                  )}
                  <p className="whitespace-pre-line">{diagnosticReport}</p>
                </div>

                {/* What To Do vs What To Avoid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="font-mono font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      What To Do Immediately
                    </span>
                    <p className="text-emerald-950">
                      Apply recommended bio-fungicide or neem oil wash directly onto affected foliage.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                    <span className="font-mono font-bold text-rose-900 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      What To Avoid
                    </span>
                    <p className="text-rose-950">
                      Do not water leaves overhead in the evening to prevent fungal spore proliferation.
                    </p>
                  </div>
                </div>

                {/* Re-check window */}
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-mono text-amber-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Next Check Window:</strong> Re-scan leaf health in 3 days.</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 bg-[#f8fcf8] rounded-3xl border border-dashed border-[#c8e6c9]">
                <ShieldCheck className="w-10 h-10 text-[#2e7d32]/40 mx-auto" />
                <h4 className="font-serif font-bold text-lg text-[#1b2e1b]">No Active Plant Scan</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Upload a leaf photo using the scanner on the left to receive instant diagnostic guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
