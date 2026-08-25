import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface HeroVideoPlayerProps {
  mediaType: 'video' | 'image';
  videoUrl: string;
  imageUrl: string;
  posterUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}

export const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = ({
  mediaType,
  videoUrl,
  imageUrl,
  posterUrl,
  autoplay = true,
  muted = true,
  loop = true,
  playsInline = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
  const [isMuted, setIsMuted] = useState<boolean>(muted);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Detect system prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      motionQuery.addEventListener('change', listener);
      return () => motionQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaType === 'video' && !prefersReducedMotion) {
      videoRef.current.muted = isMuted;
      if (autoplay) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Autoplay deferred by browser policy:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [videoUrl, mediaType, isMuted, autoplay, prefersReducedMotion]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const showVideo = mediaType === 'video' && !videoError && !prefersReducedMotion;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none" id="hero-media-container">
      {showVideo ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl || imageUrl}
            autoPlay={autoplay}
            muted={isMuted}
            loop={loop}
            playsInline={playsInline}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              console.warn("Video failed to load, falling back to hero image.");
              setVideoError(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-1000 scale-105 ${
              videoLoaded ? 'opacity-100' : 'opacity-70'
            }`}
          />

          {/* Quick Floating Playback Controls in Bottom Right */}
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/90 text-xs shadow-xl">
            <button
              id="hero-toggle-play"
              onClick={togglePlay}
              className="p-1.5 hover:text-emerald-400 transition-colors"
              title={isPlaying ? "Pause Video" : "Play Video"}
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="w-[1px] h-3 bg-white/20" />
            <button
              id="hero-toggle-mute"
              onClick={toggleMute}
              className="p-1.5 hover:text-emerald-400 transition-colors"
              title={isMuted ? "Unmute Video" : "Mute Video"}
              aria-label={isMuted ? "Unmute Video" : "Mute Video"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] text-emerald-300 font-medium tracking-wider uppercase pr-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Field Feed
            </span>
          </div>
        </>
      ) : (
        <div
          id="hero-fallback-image"
          className="w-full h-full bg-cover bg-center transition-all duration-700 scale-105"
          style={{ backgroundImage: `url(${imageUrl || posterUrl})` }}
        />
      )}

      {/* High-Contrast Multi-Stop Visual Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-slate-950/80 pointer-events-none" />
    </div>
  );
};
