import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  Usb, 
  Flame, 
  CheckCircle2, 
  Wifi, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Battery, 
  Radio,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { CameraDevice, MobileBridgeSession, PairingSessionState } from '../../types/cameraTypes';
import { cameraConnectionService } from '../../services/cameraConnectionService';
import { webRTCPairingService, NetworkInfo } from '../../services/webrtc/webRTCPairingService';

interface CameraDeviceCardProps {
  devices: CameraDevice[];
  activeBridge: MobileBridgeSession | null;
  onSimulatePhoneConnect: () => void;
  onSelectDevice?: (deviceId: string) => void;
  onConnectSimulator?: () => void;
}

export const CameraDeviceCard: React.FC<CameraDeviceCardProps> = ({
  devices,
  activeBridge,
  onSimulatePhoneConnect,
  onSelectDevice,
  onConnectSimulator,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [customLanIp, setCustomLanIp] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 mins in secs
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showNetworkTroubleshooter, setShowNetworkTroubleshooter] = useState(false);

  // Fetch network info and create session if none exists
  useEffect(() => {
    webRTCPairingService.getNetworkInfo().then((info) => {
      setNetworkInfo(info);
      if (info.primaryLanIp && info.primaryLanIp !== '127.0.0.1' && info.primaryLanIp !== 'localhost') {
        setCustomLanIp(`${info.primaryLanIp}:${info.port}`);
      }
    });

    if (!activeBridge) {
      cameraConnectionService.createMobileBridgeSession();
    }
  }, []);

  // Generate QR Code image data url when activeBridge or customLanIp changes
  useEffect(() => {
    if (activeBridge?.qrCodeUrl) {
      QRCode.toDataURL(activeBridge.qrCodeUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#0d160d',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((e) => console.warn('QR generation error:', e));
    }
  }, [activeBridge?.qrCodeUrl]);

  // Session expiration countdown
  useEffect(() => {
    if (!activeBridge) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((activeBridge.expiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBridge?.expiresAt]);

  const handleRegenerateSession = async () => {
    setIsRegenerating(true);
    try {
      await cameraConnectionService.createMobileBridgeSession(customLanIp || undefined);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (activeBridge?.qrCodeUrl) {
      navigator.clipboard.writeText(activeBridge.qrCodeUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIconForKind = (kind: CameraDevice['kind']) => {
    switch (kind) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'usb':
        return <Usb className="w-5 h-5" />;
      case 'thermal':
        return <Flame className="w-5 h-5" />;
      case 'simulated':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Radio className="w-5 h-5" />;
    }
  };

  const currentPairingState: PairingSessionState = activeBridge?.state || 'CREATED';

  const pairingSteps: Array<{ key: string; label: string; stateMatch: PairingSessionState[] }> = [
    {
      key: 'qr',
      label: 'QR Generated',
      stateMatch: [
        'CREATED',
        'QR_GENERATED',
        'QR_DISPLAYED',
        'PHONE_SCANNED',
        'PHONE_OPENED',
        'MOBILE_OPENED',
        'MOBILE_AUTHENTICATED',
        'WAITING_FOR_CAMERA_PERMISSION',
        'CAMERA_PERMISSION_REQUESTED',
        'CAMERA_GRANTED',
        'PHONE_READY',
        'SIGNALING_CONNECTED',
        'OFFER_CREATED',
        'ANSWER_RECEIVED',
        'ICE_CONNECTED',
        'PEER_CONNECTED',
        'MEDIA_TRACK_RECEIVED',
        'VIDEO_FRAME_RECEIVED',
        'STREAM_VERIFIED',
        'CONNECTED',
        'STREAMING',
        'COMPLETED'
      ]
    },
    {
      key: 'scanned',
      label: 'Phone Opened',
      stateMatch: [
        'PHONE_OPENED',
        'MOBILE_OPENED',
        'MOBILE_AUTHENTICATED',
        'WAITING_FOR_CAMERA_PERMISSION',
        'CAMERA_PERMISSION_REQUESTED',
        'CAMERA_GRANTED',
        'PHONE_READY',
        'SIGNALING_CONNECTED',
        'OFFER_CREATED',
        'ANSWER_RECEIVED',
        'ICE_CONNECTED',
        'PEER_CONNECTED',
        'MEDIA_TRACK_RECEIVED',
        'VIDEO_FRAME_RECEIVED',
        'STREAM_VERIFIED',
        'CONNECTED',
        'STREAMING',
        'COMPLETED'
      ]
    },
    {
      key: 'perm',
      label: 'Camera Granted',
      stateMatch: [
        'CAMERA_GRANTED',
        'PHONE_READY',
        'SIGNALING_CONNECTED',
        'OFFER_CREATED',
        'ANSWER_RECEIVED',
        'ICE_CONNECTED',
        'PEER_CONNECTED',
        'MEDIA_TRACK_RECEIVED',
        'VIDEO_FRAME_RECEIVED',
        'STREAM_VERIFIED',
        'CONNECTED',
        'STREAMING',
        'COMPLETED'
      ]
    },
    {
      key: 'webrtc',
      label: 'WebRTC Paired',
      stateMatch: [
        'ICE_CONNECTED',
        'PEER_CONNECTED',
        'MEDIA_TRACK_RECEIVED',
        'VIDEO_FRAME_RECEIVED',
        'STREAM_VERIFIED',
        'CONNECTED',
        'STREAMING',
        'COMPLETED'
      ]
    },
    {
      key: 'verified',
      label: 'Stream Verified',
      stateMatch: ['STREAM_VERIFIED', 'STREAMING', 'COMPLETED']
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider">
              Phase 12 Device Connection Center
            </span>
            <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-black uppercase rounded-full">
              Multi-Sensor Hub
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-serif font-bold text-gray-900">
            Connected Agronomic Field Cameras & Sensors
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className={`px-4 py-2 min-h-[40px] rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              showQrModal
                ? 'bg-[#1b2e1b] text-white'
                : 'bg-gradient-to-r from-[#2e7d32] to-[#4CAF50] text-white hover:brightness-110'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{showQrModal ? 'Close QR Bridge' : 'Connect Phone via QR'}</span>
          </button>
        </div>
      </div>

      {/* QR Bridge Drawer / Pairing Hub */}
      {showQrModal && activeBridge && (
        <div className="p-5 bg-gradient-to-br from-[#0d160d] via-[#142314] to-[#0d160d] text-white rounded-3xl space-y-4 border border-[#2e7d32]/40 shadow-xl animate-fade-in">
          {/* Drawer Title Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2e7d32]/30 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#2e7d32]/30 text-[#4CAF50] rounded-xl border border-[#4CAF50]/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  Smartphone WebRTC Field Scout Bridge
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-full text-[10px] font-mono border border-emerald-500/40">
                    Encrypted P2P
                  </span>
                </h5>
                <p className="text-xs text-gray-400">
                  Scan the QR code with your phone&apos;s camera to turn it into an autonomous crop inspection sensor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                timeRemaining < 60 ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                <span>Expires in: {formatCountdown(timeRemaining)}</span>
              </span>

              <button
                onClick={handleRegenerateSession}
                disabled={isRegenerating}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                title="Regenerate Pairing QR"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main Pairing Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left: Real QR Code Display */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-emerald-800/40 text-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Field Scout QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-[#2e7d32] animate-spin" />
                </div>
              )}
              <div className="mt-2 text-xs font-mono font-bold text-gray-800">
                PIN: <span className="text-[#2e7d32] tracking-wider">{activeBridge.connectionPin}</span>
              </div>
            </div>

            {/* Right: Pairing Progression, Link & Actions */}
            <div className="md:col-span-8 space-y-4">
              {/* Step Progression Bar */}
              <div className="space-y-1.5 bg-black/40 p-3.5 rounded-2xl border border-emerald-900/60">
                <div className="text-[11px] font-mono text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Pairing Handshake Verification</span>
                  <span className="text-[#4CAF50]">{activeBridge.state}</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {pairingSteps.map((step, idx) => {
                    const isPassed = step.stateMatch.includes(currentPairingState);
                    return (
                      <div key={step.key} className="space-y-1 text-center">
                        <div className={`h-2 rounded-full transition-all ${
                          isPassed ? 'bg-[#4CAF50] shadow-sm shadow-[#4CAF50]/50' : 'bg-gray-800'
                        }`} />
                        <span className={`text-[9px] font-mono block leading-tight ${
                          isPassed ? 'text-emerald-300 font-bold' : 'text-gray-600'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & URL Copy */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Pairing Link'}</span>
                </button>

                <a
                  href={activeBridge.qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#4CAF50]" />
                  <span>Test in New Tab / Window</span>
                </a>

                <button
                  onClick={onSimulatePhoneConnect}
                  className="px-3.5 py-2 bg-[#2e7d32] hover:bg-[#4CAF50] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Simulator Test</span>
                </button>
              </div>

              {/* Troubleshooting Drawer Toggle */}
              <div className="pt-1">
                <button
                  onClick={() => setShowNetworkTroubleshooter(!showNetworkTroubleshooter)}
                  className="text-[11px] text-gray-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-[#4CAF50]" />
                  <span>LAN Wi-Fi Reachability & Troubleshooting Tips</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showNetworkTroubleshooter ? 'rotate-180' : ''}`} />
                </button>

                {showNetworkTroubleshooter && (
                  <div className="mt-2 p-3 bg-black/60 rounded-xl border border-emerald-900/60 text-xs space-y-2 text-gray-300">
                    <p className="text-[11px] leading-relaxed">
                      💡 <strong>Same Wi-Fi Network:</strong> Ensure your phone and laptop are connected to the same farm Wi-Fi or hotspot.
                    </p>
                    {networkInfo?.lanIps && networkInfo.lanIps.length > 0 && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                        <span>Detected Server IPs:</span>
                        <div className="flex flex-wrap gap-1">
                          {networkInfo.lanIps.map((ip) => (
                            <span key={ip} className="px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-800">
                              {ip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400">
                      🔒 <strong>Zero Credentials in QR:</strong> The QR code uses temporary session tokens with automatic 5-minute invalidation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {devices.map((device) => {
          const isConnected = device.isConnected;
          return (
            <div
              key={device.id}
              onClick={() => onSelectDevice && onSelectDevice(device.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isConnected
                  ? 'bg-gradient-to-br from-[#f8fcf8] to-[#edf7ee] border-[#4CAF50] shadow-sm ring-2 ring-[#4CAF50]/20'
                  : 'bg-[#fafdfa] border-[#c8e6c9]/70 hover:border-[#4CAF50]/60 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${
                    isConnected ? 'bg-[#2e7d32] text-white shadow-md' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {getIconForKind(device.kind)}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                    {isConnected ? 'Connected & Live' : 'Standby'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h5 className="text-xs font-bold text-gray-900 truncate">
                    {device.label}
                  </h5>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                    <span>{device.resolution?.width}x{device.resolution?.height}</span>
                    {device.fps && <span>• {device.fps} fps</span>}
                    {device.latencyMs && (
                      <span className="text-emerald-700 font-bold">• {device.latencyMs}ms RTT</span>
                    )}
                  </div>

                  {device.batteryLevel && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-600">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{device.batteryLevel}% Battery Level</span>
                    </div>
                  )}

                  {device.ipAddress && (
                    <div className="text-[10px] text-gray-400 font-mono truncate">
                      {device.ipAddress}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom status / connect button if disconnected */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                {device.kind === 'mobile' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQrModal(true);
                    }}
                    className="text-[#2e7d32] font-bold hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>{isConnected ? 'Manage QR Session' : 'Show Pairing QR'}</span>
                  </button>
                ) : device.kind === 'simulated' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onConnectSimulator) onConnectSimulator();
                      else cameraConnectionService.connectSimulator();
                    }}
                    className="text-[#2e7d32] font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isConnected ? 'Simulating' : 'Start Simulation'}</span>
                  </button>
                ) : (
                  <span className="text-gray-400 text-[10px]">
                    {isConnected ? 'Active Video Provider' : 'Ready to Connect'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
