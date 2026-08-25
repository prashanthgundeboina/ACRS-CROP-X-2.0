import { ICameraProvider, CameraConnectionState, CameraDeviceKind, CameraStreamConfig, WebRTCConnectionStats } from '../../types/cameraTypes';

export class SimulatorCameraProvider implements ICameraProvider {
  public id = 'simulated-camera-device';
  public label = 'Agronomic Test Simulator';
  public kind: CameraDeviceKind = 'simulated';
  private state: CameraConnectionState = 'DISCONNECTED';
  private dummyCanvasStream: MediaStream | null = null;
  private animInterval: any = null;

  public async connect(_config?: Partial<CameraStreamConfig>): Promise<MediaStream> {
    this.disconnect();
    this.state = 'CONNECTING';

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      let frame = 0;
      this.animInterval = setInterval(() => {
        if (!ctx) return;
        frame++;
        // Draw synthetic crop simulation pattern
        ctx.fillStyle = '#1b2e1b';
        ctx.fillRect(0, 0, 1280, 720);

        // Grid lines
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.2)';
        ctx.lineWidth = 2;
        for (let x = 0; x < 1280; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 720);
          ctx.stroke();
        }

        // Green foliage simulation circles
        ctx.fillStyle = '#2e7d32';
        for (let i = 0; i < 8; i++) {
          const cx = 200 + i * 120 + Math.sin(frame * 0.05 + i) * 20;
          const cy = 360 + Math.cos(frame * 0.04 + i) * 30;
          ctx.beginPath();
          ctx.arc(cx, cy, 60, 0, Math.PI * 2);
          ctx.fill();
        }

        // Overlay text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`SIMULATED FIELD CANOPY • FRAME ${frame}`, 40, 60);
      }, 100);

      this.dummyCanvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
    }

    this.state = 'STREAMING';
    return this.dummyCanvasStream || new MediaStream();
  }

  public disconnect(): void {
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
    if (this.dummyCanvasStream) {
      this.dummyCanvasStream.getTracks().forEach((t) => t.stop());
      this.dummyCanvasStream = null;
    }
    this.state = 'DISCONNECTED';
  }

  public captureFrame(videoEl?: HTMLVideoElement): { dataUrl: string; imageData: ImageData; width: number; height: number } | null {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (videoEl && videoEl.videoWidth > 0) {
      ctx.drawImage(videoEl, 0, 0, 640, 360);
    } else {
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Simulated High-Yield Paddy Sample', 20, 40);
    }

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
      imageData: ctx.getImageData(0, 0, 640, 360),
      width: 640,
      height: 360,
    };
  }

  public getStatus(): CameraConnectionState {
    return this.state;
  }

  public getStream(): MediaStream | null {
    return this.dummyCanvasStream;
  }

  public getStats(): WebRTCConnectionStats | null {
    return {
      roundTripTimeMs: 1,
      framesDecodedPerSec: 30,
      resolution: { width: 1280, height: 720 },
    };
  }
}

export const simulatorCameraProvider = new SimulatorCameraProvider();
