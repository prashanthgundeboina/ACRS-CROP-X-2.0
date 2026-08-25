import { CameraDevice, CameraStreamConfig } from '../types/cameraTypes';

class CameraDeviceService {
  private activeStream: MediaStream | null = null;
  private currentFacingMode: 'environment' | 'user' = 'environment';
  private currentDeviceId: string | null = null;

  /**
   * Check whether the current browser supports camera access
   */
  public isCameraSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Enumerate available video inputs (front, back, external USB)
   */
  public async getAvailableCameras(): Promise<CameraDevice[]> {
    if (!this.isCameraSupported()) return [];

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      return videoDevices.map((d, index) => {
        const label = d.label || `Camera ${index + 1}`;
        const isBackCamera = /back|rear|environment/i.test(label);
        const isFrontCamera = /front|user|selfie/i.test(label);

        return {
          id: d.deviceId || `cam-${index}`,
          label: label,
          kind: /usb|external/i.test(label) ? 'usb' : 'mobile',
          facingMode: isBackCamera ? 'environment' : isFrontCamera ? 'user' : undefined,
          isConnected: false,
          resolution: { width: 1280, height: 720 },
          fps: 30,
        };
      });
    } catch (err) {
      console.warn('Unable to enumerate camera devices:', err);
      return [];
    }
  }

  /**
   * Start camera stream with explicit user intent and chosen configuration
   */
  public async startStream(config?: Partial<CameraStreamConfig>): Promise<MediaStream> {
    if (!this.isCameraSupported()) {
      throw new Error('Camera access is not supported in this browser environment.');
    }

    // Stop existing stream if active
    this.stopStream();

    const facingMode = config?.facingMode || this.currentFacingMode;
    const deviceId = config?.deviceId || this.currentDeviceId;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? {
            deviceId: { exact: deviceId },
            width: { ideal: config?.idealWidth || 1280 },
            height: { ideal: config?.idealHeight || 720 },
          }
        : {
            facingMode: { ideal: facingMode },
            width: { ideal: config?.idealWidth || 1280 },
            height: { ideal: config?.idealHeight || 720 },
          },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      this.currentFacingMode = facingMode;

      // Track active device ID
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const settings = videoTracks[0].getSettings();
        if (settings.deviceId) {
          this.currentDeviceId = settings.deviceId;
        }
      }

      return stream;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera permission was denied by the user. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No camera hardware was found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('Camera is already in use by another application or tab.');
      }
      throw new Error(err.message || 'Failed to start camera stream.');
    }
  }

  /**
   * Stop and release all video stream tracks
   */
  public stopStream(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore cleanup errors
        }
      });
      this.activeStream = null;
    }
  }

  /**
   * Switch between front and back camera (for mobile phones)
   */
  public async switchFacingMode(): Promise<MediaStream> {
    const nextMode: 'environment' | 'user' = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    this.currentFacingMode = nextMode;
    this.currentDeviceId = null; // reset specific ID so facingMode ideal is picked
    return this.startStream({ facingMode: nextMode });
  }

  public getFacingMode(): 'environment' | 'user' {
    return this.currentFacingMode;
  }

  public getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  public isStreaming(): boolean {
    return !!(this.activeStream && this.activeStream.active);
  }

  /**
   * Capture a still frame from an HTMLVideoElement into a Base64 data URL and ImageData
   */
  public captureFrame(videoElement: HTMLVideoElement): { dataUrl: string; imageData: ImageData; width: number; height: number } | null {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const imageData = ctx.getImageData(0, 0, width, height);

    return { dataUrl, imageData, width, height };
  }
}

export const cameraDeviceService = new CameraDeviceService();
