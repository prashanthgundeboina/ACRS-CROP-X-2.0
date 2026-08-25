/**
 * CroperX GPS Tracking Service Module
 * Strict Rule: Uses navigator.geolocation.watchPosition to update farmer's live coordinates
 * ONLY while the presence heartbeat is actively running.
 */

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export type GpsLocationListener = (coords: GpsCoordinates) => void;
export type GpsErrorListener = (error: GeolocationPositionError | Error) => void;

class GpsTrackingService {
  private watchId: number | null = null;
  private isTrackingActive: boolean = false;
  private lastCoordinates: GpsCoordinates | null = null;
  private locationListeners: Set<GpsLocationListener> = new Set();
  private errorListeners: Set<GpsErrorListener> = new Set();
  private heartbeatActiveChecker: (() => boolean) | null = null;
  private minDistanceThresholdMeters = 2.0; // Filter micro-jitters
  private lastSentTime = 0;

  /**
   * Acquire a single high-accuracy GPS fix with promise
   */
  public async getSingleLocationFix(): Promise<GpsCoordinates> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser or device.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: GpsCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp || Date.now(),
          };
          this.lastCoordinates = coords;
          resolve(coords);
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 5000,
        }
      );
    });
  }

  /**
   * Check if geolocation permission is granted
   */
  public async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as any });
        return result.state;
      } catch (e) {
        return 'prompt';
      }
    }
    return 'prompt';
  }

  /**
   * Start continuous GPS tracking via watchPosition.
   * GUARANTEE: Only remains active while isHeartbeatActive() returns TRUE.
   */
  public startTracking(options: {
    isHeartbeatActive: () => boolean;
    onUpdate?: GpsLocationListener;
    onError?: GpsErrorListener;
  }): boolean {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.warn('[GpsTrackingService] Geolocation unavailable.');
      return false;
    }

    this.heartbeatActiveChecker = options.isHeartbeatActive;
    if (options.onUpdate) this.locationListeners.add(options.onUpdate);
    if (options.onError) this.errorListeners.add(options.onError);

    // Strict guard: Do not start if presence heartbeat is not active
    if (!this.heartbeatActiveChecker()) {
      console.warn('[GpsTrackingService] Refusing to start watchPosition: Presence heartbeat is inactive.');
      return false;
    }

    // Clear any existing watcher
    this.stopTracking();

    try {
      this.isTrackingActive = true;
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // Verify presence heartbeat is STILL active on every location callback
          if (this.heartbeatActiveChecker && !this.heartbeatActiveChecker()) {
            console.log('[GpsTrackingService] Presence heartbeat stopped. Automatically halting watchPosition.');
            this.stopTracking();
            return;
          }

          const coords: GpsCoordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp || Date.now(),
          };

          // Filter out redundant tiny jitters if under threshold, unless 10 seconds elapsed
          const now = Date.now();
          const shouldNotify =
            !this.lastCoordinates ||
            now - this.lastSentTime > 10000 ||
            this.computeDistanceMeters(this.lastCoordinates, coords) >= this.minDistanceThresholdMeters;

          if (shouldNotify) {
            this.lastCoordinates = coords;
            this.lastSentTime = now;
            this.locationListeners.forEach((listener) => {
              try {
                listener(coords);
              } catch (e) {
                console.error('[GpsTrackingService] Listener execution error:', e);
              }
            });
          }
        },
        (error) => {
          console.warn('[GpsTrackingService] Position watch error:', error.message);
          this.errorListeners.forEach((errListener) => {
            try {
              errListener(error);
            } catch (e) {
              // ignore
            }
          });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 20000,
        }
      );

      return true;
    } catch (err: any) {
      console.error('[GpsTrackingService] Failed to start watchPosition:', err);
      this.isTrackingActive = false;
      return false;
    }
  }

  /**
   * Stop GPS tracking immediately and clear watchId
   */
  public stopTracking(): void {
    if (this.watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTrackingActive = false;
  }

  /**
   * Add listener for location updates
   */
  public addListener(listener: GpsLocationListener): () => void {
    this.locationListeners.add(listener);
    if (this.lastCoordinates) {
      listener(this.lastCoordinates);
    }
    return () => this.locationListeners.delete(listener);
  }

  /**
   * Check if tracking is currently active
   */
  public isTracking(): boolean {
    return this.isTrackingActive && this.watchId !== null;
  }

  /**
   * Get latest cached coordinates
   */
  public getLastCoordinates(): GpsCoordinates | null {
    return this.lastCoordinates;
  }

  /**
   * Calculate distance between two GPS coordinates in meters
   */
  private computeDistanceMeters(c1: GpsCoordinates, c2: GpsCoordinates): number {
    const R = 6371e3; // Earth radius in meters
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.latitude * Math.PI) / 180) *
        Math.cos((c2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const gpsTrackingService = new GpsTrackingService();
