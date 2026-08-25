import {
  AdviserConsultationLocation,
  AdviserLiveLocation,
  ConsultationMeetingRequest,
  FarmerLocationState,
  MeetingStatus,
  NearbyAdviser,
} from '../types';

export class LocationService {
  /**
   * Request browser GPS position with high accuracy
   */
  public async getBrowserCoordinates(): Promise<{
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    accuracyLevel: 'high' | 'medium' | 'low';
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const acc = pos.coords.accuracy;
          let level: 'high' | 'medium' | 'low' = 'high';
          if (acc > 200) level = 'low';
          else if (acc > 50) level = 'medium';

          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: Math.round(acc),
            accuracyLevel: level,
          });
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        }
      );
    });
  }

  /**
   * Reverse Geocode coordinates to Locality, District, State & Address
   */
  public async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{
    locality: string;
    district: string;
    state: string;
    country: string;
    fullAddress: string;
  }> {
    try {
      const res = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.location) {
          return data.location;
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }

    // Default fallback
    return {
      locality: 'Ludhiana Agro District',
      district: 'Ludhiana',
      state: 'Punjab',
      country: 'India',
      fullAddress: 'PAU Agricultural Zone, Ludhiana, Punjab, India',
    };
  }

  /**
   * Fetch Nearby Advisers within specified radius using real GPS
   */
  public async getNearbyAdvisers(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number | 'all';
    specialization?: string;
    availableOnly?: boolean;
  }): Promise<{
    advisers: NearbyAdviser[];
    totalAdvisers: number;
    count: number;
    radiusKm: number | string;
  }> {
    try {
      const q = new URLSearchParams();
      q.set('latitude', String(params.latitude));
      q.set('longitude', String(params.longitude));
      if (params.radiusKm !== undefined) q.set('radiusKm', String(params.radiusKm));
      if (params.specialization) q.set('specialization', params.specialization);
      if (params.availableOnly) q.set('availableOnly', 'true');

      const res = await fetch(`/api/advisers/nearby?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          advisers: data.advisers || [],
          totalAdvisers: data.totalAdvisers || 0,
          count: data.count || 0,
          radiusKm: data.radiusKm || 25,
        };
      }
    } catch (e) {
      console.warn('Failed to fetch nearby advisers:', e);
    }

    return {
      advisers: [],
      totalAdvisers: 0,
      count: 0,
      radiusKm: params.radiusKm || 25,
    };
  }

  /**
   * Get Adviser Consultation Location & Live Settings
   */
  public async getAdviserLocationProfile(phoneNumber: string): Promise<{
    consultationLocation: AdviserConsultationLocation | null;
    liveLocation: AdviserLiveLocation;
    availabilityStatus: string;
  } | null> {
    try {
      const res = await fetch(`/api/adviser/location/${encodeURIComponent(phoneNumber)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          consultationLocation: data.consultationLocation,
          liveLocation: data.liveLocation,
          availabilityStatus: data.availabilityStatus,
        };
      }
    } catch (e) {
      console.warn('Failed to load adviser location profile:', e);
    }
    return null;
  }

  /**
   * Adviser updates consultation location center
   */
  public async updateAdviserLocation(
    phoneNumber: string,
    consultationLocation: Partial<AdviserConsultationLocation>
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/adviser/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, consultationLocation }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to update adviser location:', e);
      return false;
    }
  }

  /**
   * Adviser toggles / streams live location (Opt-in only)
   */
  public async setAdviserLiveLocation(params: {
    phoneNumber: string;
    enabled: boolean;
    mode?: 'off' | 'while_available' | 'during_consultation';
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/adviser/live-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to set adviser live location:', e);
      return false;
    }
  }

  /**
   * Disable live location
   */
  public async disableAdviserLiveLocation(phoneNumber: string): Promise<boolean> {
    try {
      const res = await fetch('/api/adviser/live-location', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Admin verifies adviser consultation location
   */
  public async verifyAdviserLocation(params: {
    phoneNumber: string;
    isVerified: boolean;
    verifiedBy?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/adviser/verify-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Farmer requests in-person consultation / field meeting
   */
  public async requestConsultationMeeting(
    meetingData: Omit<ConsultationMeetingRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<ConsultationMeetingRequest | null> {
    try {
      const res = await fetch('/api/consultations/meetings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });

      if (res.ok) {
        const data = await res.json();
        return data.meeting;
      }
    } catch (e) {
      console.error('Failed to request meeting:', e);
    }
    return null;
  }

  /**
   * Retrieve list of consultation meetings
   */
  public async getConsultationMeetings(
    phoneNumber?: string,
    role?: string
  ): Promise<ConsultationMeetingRequest[]> {
    try {
      const q = new URLSearchParams();
      if (phoneNumber) q.set('phoneNumber', phoneNumber);
      if (role) q.set('role', role);

      const res = await fetch(`/api/consultations/meetings?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.meetings || [];
      }
    } catch (e) {
      console.warn('Failed to load consultation meetings:', e);
    }
    return [];
  }

  /**
   * Update Farmer Real Device Location & Sharing Preference
   */
  public async updateFarmerLocation(params: {
    phoneNumber: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    accuracyLevel?: 'high' | 'medium' | 'low';
    locality?: string;
    district?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
    sharingEnabled?: boolean;
    isManual?: boolean;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/farmer/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to update farmer location:', e);
      return false;
    }
  }

  /**
   * Get Farmer Stored Location & Sharing Preference
   */
  public async getFarmerLocation(phoneNumber: string): Promise<FarmerLocationState | null> {
    try {
      const res = await fetch(`/api/farmer/location?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      if (res.ok) {
        const data = await res.json();
        return data.location || null;
      }
    } catch (e) {
      console.warn('Failed to load farmer location:', e);
    }
    return null;
  }

  /**
   * Admin fetches all location entries (farmers + advisers)
   */
  public async fetchAdminLocations(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/locations');
      if (res.ok) {
        const data = await res.json();
        return data.locations || [];
      }
    } catch (e) {
      console.warn('Failed to fetch admin locations:', e);
    }
    return [];
  }

  /**
   * Update meeting status
   */
  public async updateMeetingStatus(
    meetingId: string,
    status: MeetingStatus,
    notes?: string,
    meetingAddress?: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`/api/consultations/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, meetingAddress }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to update meeting status:', e);
      return false;
    }
  }
}

export const locationService = new LocationService();
