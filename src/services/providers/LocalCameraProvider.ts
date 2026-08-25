import { ICameraProvider, CameraConnectionState, CameraDeviceKind, CameraStreamConfig, WebRTCConnectionStats } from '../../types/cameraTypes';
import { cameraDeviceService } from '../cameraDeviceService';

export class LocalCameraProvider implements ICameraProvider {
  public id = 'phone-cam-local';
  public label = 'Integrated / USB Webcam';
  public kind: CameraDeviceKind = 'integrated';
  private state: CameraConnectionState = 'DISCONNECTED';

  public async connect(config?: Partial<CameraStreamConfig>): Promise<MediaStream> {
    this.state = 'WAITING_FOR_PERMISSION';
    try {
      this.state = 'CONNECTING';
      const stream = await cameraDeviceService.startStream(config);
      this.state = 'STREAMING';
      return stream;
    } catch (err) {
      this.state = 'ERROR';
      throw err;
    }
  }

  public disconnect(): void {
    cameraDeviceService.stopStream();
    this.state = 'DISCONNECTED';
  }

  public captureFrame(videoEl?: HTMLVideoElement): { dataUrl: string; imageData: ImageData; width: number; height: number } | null {
    if (videoEl) {
      return cameraDeviceService.captureFrame(videoEl);
    }
    return null;
  }

  public getStatus(): CameraConnectionState {
    return this.state;
  }

  public getStream(): MediaStream | null {
    return cameraDeviceService.getActiveStream();
  }

  public getStats(): WebRTCConnectionStats | null {
    return {
      roundTripTimeMs: 0,
      framesDecodedPerSec: 30,
      resolution: { width: 1280, height: 720 },
    };
  }
}

export const localCameraProvider = new LocalCameraProvider();
