export interface SoilData {
  nitrogen: number;      // N
  phosphorus: number;    // P
  potassium: number;     // K
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  // Advanced Factors
  soil_moisture: number;
  soil_type: number;      // Categorical represented as numeric
  sunlight_exposure: number;
  wind_speed: number;
  co2_concentration: number;
  organic_matter: number;
  irrigation_frequency: number;
  crop_density: number;
  pest_pressure: number;
  fertilizer_usage: number;
  growth_stage: number;
  urban_area_proximity: number;
  water_source_type: number;
  frost_risk: number;
  water_usage_efficiency: number;
  moisture?: number;
  ec?: number;
  rain_probability?: number;
}

export interface CropRecommendation {
  crop: string;
  confidence: number;
  description: string;
  rotation: string;
  farmingTips: string[];
  idealConditions: {
    n: string;
    p: string;
    k: string;
    temp: string;
    rain: string;
  };
  reasoning?: string;
  yieldProjection?: any;
  matchPercentage?: number;
  expected_yield?: number;
}

export interface RecommendationResponse {
  recommendations: CropRecommendation[];
  environmentalInsight: string;
}

export interface FarmerProfile {
  farmerName: string;
  farmLocation: string;
  farmAreaSize: number; // e.g. 5
  unitPreference: 'metric' | 'imperial'; // 'metric' = hectares/kg/°C, 'imperial' = acres/lbs/°F
  preferredCropCycle: string; // e.g. 'Rabi Wheat - Kharif Rice'
  primaryWaterSource: string; // e.g. 'Borewell Drip', 'Canal', 'Rainfed'
  soilTypeZone: string; // e.g. 'Alluvial Loam', 'Black Cotton Soil', 'Red Sandy Soil'
  targetPhGoal: number; // e.g. 6.5
  name?: string;
  fullName?: string;
  farmName?: string;
  location?: string;
  village?: string;
  farmSize?: number;
  totalLandAcres?: number;
  primaryCrops?: string[];
  primaryCrop?: string;
  farmSizeUnit?: string;
}

export interface MarketItemInsight {
  crop: string;
  currentMandiPrice: number; // Price per quintal (₹ or $)
  priceTrend: 'rising' | 'stable' | 'falling';
  priceChangePercent: number; // e.g. +4.5%
  demandIndex: 'High Demand' | 'Moderate Demand' | 'Export Surge' | 'Stable';
  estimatedCostPerAcre: number;
  projectedGrossRevenuePerAcre: number;
  estimatedNetProfitPerAcre: number;
  roiPercentage: number; // e.g. 142%
  bestSellingMonth: string;
  marketRiskLevel: 'Low Risk' | 'Medium Risk' | 'High Opportunity';
}

export type UserRole = 'farmer' | 'farmer_adviser' | 'customer' | 'admin';

export interface UserAccount {
  id: string;
  phoneNumber: string;
  farmerName: string;
  role?: UserRole;
  email?: string;
  auth_provider?: 'password' | 'otp';
  profileImage: string; // Base64 image data URL or avatar URL
  farmLocation: string;
  farmAreaSize: number;
  unitPreference: 'metric' | 'imperial';
  preferredCropCycle: string;
  primaryWaterSource: string;
  soilTypeZone: string;
  targetPhGoal: number;
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  fullName?: string;
  village?: string;
  adviserName?: string;
  adviserContact?: string;
  // Professional & Admin Profile Details
  specialization?: string;
  organization?: string;
  licenseNumber?: string;
  consultationHours?: string;
  languages?: string[];
  bio?: string;
  assignedFarmersCount?: number;
  activeCasesCount?: number;
  adminRoleTitle?: string;
  isDemoAdmin?: boolean;
  // Customer role details
  customerType?: 'Commercial Farm Buyer' | 'Agri-Retailer' | 'Institutional Buyer' | 'FPO Partner' | 'General Consumer';
  customerNotes?: string;
  // Location & Privacy
  locationSharingEnabled?: boolean;
  farmerGpsPermission?: 'granted' | 'prompt' | 'denied' | 'unknown';
  consultationLocation?: AdviserConsultationLocation;
  liveLocation?: AdviserLiveLocation;
  isVerified?: boolean;
  learningCompleted?: boolean;
  accountStatus?: 'Active' | 'Under Review' | 'Suspended' | 'Deleted' | 'active' | 'suspended' | 'pending' | 'deleted' | 'learning_required' | 'under_review';
  lastLogin?: string;
  lastLoginAt?: string;
  securityStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerSettings {
  language: string;
  voiceGuidance: boolean;
  voiceResponses: boolean;
  voiceLanguage: string;
  cameraPermission: 'granted' | 'prompt' | 'denied';
  microphonePermission: 'granted' | 'prompt' | 'denied';
  preferredCamera: 'environment' | 'user';
  alertsWeather: boolean;
  alertsCrop: boolean;
  alertsWater: boolean;
  alertsAdviser: boolean;
  displayTheme: 'light' | 'dark';
  largeText: boolean;
}

export interface AdviserSettings {
  notifNewCall: boolean;
  notifUrgentCrop: boolean;
  notifNewCase: boolean;
  notifFarmerMessage: boolean;
  notifIotAlert: boolean;
  callSound: boolean;
  autoAccept: boolean;
  cameraPreference: 'hd' | 'standard' | 'bandwidth_saver';
  micPreference: 'default' | 'noise_cancelling';
  defaultDashboard: 'overview' | 'queue' | 'twin';
  compactMode: boolean;
  notificationDensity: 'all' | 'high_priority' | 'critical_only';
  interfaceLanguage: string;
  voiceLanguage: string;
}

export interface AdminSettings {
  platformName: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  alertSystem: boolean;
  alertDevice: boolean;
  alertWebRTC: boolean;
  alertAiService: boolean;
  sessionDurationHours: number;
  authPolicies: string;
  passwordPolicyMinLength: number;
  otpPolicy: string;
  weatherApiStatus: string;
  satelliteServiceStatus: string;
  aiServiceStatus: string;
  iotServiceStatus: string;
  webrtcServiceStatus: string;
  auditRetentionDays: number;
  securityEventLogging: boolean;
}

export interface CallAnnotation {
  id: string;
  type: 'point' | 'highlight' | 'draw' | 'note';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color?: string;
  text?: string;
  path?: Array<{ x: number; y: number }>;
  timestamp: number;
  author: string;
}

export type CallStatus = 'REQUESTED' | 'ACCEPTED' | 'ACTIVE' | 'DECLINED' | 'ENDED';

export interface FarmerAdviserCallSession {
  callId: string;
  farmerId: string;
  farmerName: string;
  farmerAvatar?: string;
  farmName: string;
  farmZone: string;
  crop: string;
  soilMoisture: number | string;
  weather: string;
  croperxObservation: string;
  status: CallStatus;
  createdAt: number;
  connectedAt?: number;
  endedAt?: number;
  sessionId: string; // WebRTC bridge session ID
  annotations: CallAnnotation[];
  farmerMuted: boolean;
  adviserMuted: boolean;
  notes?: string[];
}

export interface FarmerSimpleCropResult {
  cropName: string;
  scientificName?: string;
  healthStatus: 'healthy' | 'attention' | 'urgent';
  healthSummary: string;
  soilCondition: 'moist' | 'dry' | 'optimal';
  soilSummary: string;
  primaryAction: string;
  actionTiming?: string;
  confidence: number;
  capturedImageUrl?: string;
}

export interface FarmerChatbotResponse {
  answer: string;
  reason: string;
  action: string;
  timing: string;
  audioText?: string;
}

// ============================================================
// PHASE 43: ADVISER ONBOARDING, ASSESSMENT & LEARNING GATEWAY
// ============================================================

export type AdviserApplicationStatus =
  | 'REGISTERED'
  | 'OTP_REQUIRED'
  | 'OTP_VERIFIED'
  | 'ASSESSMENT_REQUIRED'
  | 'ASSESSMENT_IN_PROGRESS'
  | 'NOT_ELIGIBLE'
  | 'PENDING_ADMIN_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVATION_REQUIRED'
  | 'PASSWORD_SETUP_REQUIRED'
  | 'LEARNING_REQUIRED'
  | 'MASTERY_REQUIRED'
  | 'ACTIVE';

export interface AdviserApplication {
  id: string;
  userId?: string;
  mobile: string;
  fullName: string;
  email?: string;
  specialization: string;
  experienceYears: number;
  qualification: string;
  primaryCrops: string[];
  languages: string[];
  region: string;
  institution?: string;
  certificationInfo?: string;
  status: AdviserApplicationStatus;
  assessmentScore?: number;
  assessmentPercentage?: number;
  assessmentVersion?: string;
  assessmentSubmittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  activationTokenHashed?: string;
  activationExpiresAt?: string;
  passwordSetupCompleted?: boolean;
  courseCompleted?: boolean;
  masteryTestPassed?: boolean;
  masteryScore?: number;
  assessmentPassed?: boolean;
  categoryScores?: Record<string, number>;
  yearsOfExperience?: number;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdviserAssessmentQuestion {
  id: number;
  category: 'agriculture' | 'soil' | 'crop_health' | 'climate' | 'agronomy' | 'croperx';
  categoryLabel: string;
  question: string;
  options: string[];
}

export interface AdviserAssessmentResult {
  score: number;
  maxScore: number;
  percentage: number;
  status: AdviserApplicationStatus;
  isEligible: boolean;
  passed: boolean;
  submittedAt: string;
  message: string;
}

export interface AdviserCourseModule {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  durationMinutes: number;
  estimatedDuration?: string;
  icon: string;
  overview: string;
  coreConcepts: string[];
  operationalProtocols: string[];
  farmerImpactNotes: string[];
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    correctOptionIndex?: number;
    explanation: string;
  };
}

export interface AdviserCourseProgress {
  mobile: string;
  userId?: string;
  completedModules: number[];
  currentModule: number;
  courseCompleted: boolean;
  masteryTestPassed: boolean;
  masteryScore?: number;
  updatedAt: string;
}

export interface AdviserMasteryQuestion {
  id: number;
  moduleNumber: number;
  moduleTitle: string;
  question: string;
  options: string[];
}

export interface AdviserMasteryResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  feedback: string;
  weakModules?: number[];
  unlockedDashboard: boolean;
}


export interface AdminFarmerRecord {
  id: string;
  name: string;
  phoneNumber: string;
  farmLocation: string;
  farmAreaSize: number;
  assignedCrop: string;
  assignedAdviser: string;
  soilHealthScore: number;
  status: 'Active' | 'Under Review' | 'Flagged';
  lastActive: string;
}

export interface AdminAdviserRecord {
  id: string;
  name: string;
  phoneNumber: string;
  specialty: string;
  location: string;
  assignedFarmersCount: number;
  activeCallsToday: number;
  rating: number;
  status: 'Available' | 'On Call' | 'Offline';
}

export interface AdminFarmRecord {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  acreage: number;
  cropCycle: string;
  zonesCount: number;
  irrigationType: string;
  soilType: string;
}

export interface AdminCaseRecord {
  id: string;
  farmerName: string;
  crop: string;
  diagnosis: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Resolved' | 'In Progress' | 'Open';
  adviserAssigned: string;
  createdAt: string;
}

export interface AdminDeviceRecord {
  id: string;
  name: string;
  type: 'Soil Probe' | 'IoT Gateway' | 'Smart Valve' | 'Weather Station' | 'Drone Dock';
  farm: string;
  battery: number;
  signalQuality: string;
  status: 'Online' | 'Offline' | 'Warning';
  lastPing: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Failed';
}

export interface AdminSystemHealth {
  uptimePercent: number;
  apiLatencyMs: number;
  activeWebRTCTunnels: number;
  aiModelLatencyMs: number;
  iotGatewayConnections: number;
  serverStatus: 'Operational' | 'Degraded' | 'Maintenance';
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  country: string;
  fullAddress: string;
  estimatedSoilType: string;
  estimatedTemp: number;
  estimatedHumidity: number;
  estimatedRainfall: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: string;
  soilData: SoilData;
}

export type AlertCategoryType = 'weather' | 'pests' | 'soil' | 'market';

export interface AlertCategorySubscription {
  id: AlertCategoryType;
  label: string;
  description: string;
  iconName: string;
  isSubscribed: boolean;
  alertCount: number;
}

export interface FarmZone {
  id: string;
  name: string;
  areaHa: number;
  assignedCrop: string;
  soilType: string;
  nitrogen: number;
  ph: number;
  moisture: number;
  status: 'Active Cultivation' | 'Soil Preparation' | 'Fallow / Cover Crop';
  pushNotificationsEnabled?: boolean;
  pushCategories?: AlertCategoryType[];
  lastPushNotifiedAt?: string;
  pushAlertThreshold?: 'all' | 'high_critical_only' | 'critical_only';
  currentCrop?: string;
  areaAcres?: number;
  soilMoisture?: number;
  pestRisk?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EarlyAlert {
  id: string;
  type: string;
  category: AlertCategoryType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  action: string;
  affectedZoneIds?: string[];
  timestamp?: string;
}

export type IrrigationStatusCode = 
  | 'WATER_NOW' 
  | 'WATER_SOON' 
  | 'WAIT' 
  | 'MONITOR' 
  | 'DATA_UNAVAILABLE';

export interface IrrigationRecommendationDetails {
  statusCode: IrrigationStatusCode;
  statusLabel: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEUTRAL';
  badgeColor: 'danger' | 'warning' | 'info' | 'success' | 'gray';
  
  // Farmer-friendly 5-part answer structure
  what: string;       // WHAT IS HAPPENING?
  why: string;        // WHY?
  action: string;     // WHAT SHOULD I DO?
  when: string;       // WHEN?
  avoid: string;      // WHAT SHOULD I AVOID?
  
  // Deterministic calculation results (null/undefined when inputs are insufficient)
  evapotranspirationMmDay?: number; // ET0 in mm/day
  cropCoefficientKc?: number;      // Kc
  cropWaterNeedMmDay?: number;      // ETc = ET0 * Kc in mm/day
  netIrrigationDeficitMm?: number;  // Deficit in mm depth
  grossIrrigationRequiredMm?: number; // Incorporating irrigation method efficiency
  estimatedWaterLitersPerM2?: number; // L/m² (= mm depth)
  estimatedTotalVolumeM3?: number;  // Total m³ (only if area known)
  estimatedTotalLiters?: number;    // Total Liters (only if area known)
  estimatedPumpHours?: number;      // Pump runtime hours (if flow rate calculable)
  
  // Metadata & Transparency
  confidenceScore: number;          // 0 - 100%
  dataFreshness: {
    weatherTimestamp?: string;
    weatherAgeHours: number;
    soilTimestamp?: string;
    soilAgeHours: number;
    sensorsTimestamp?: string;
    isStale: boolean;
    staleReason?: string;
  };
  assumptionsUsed: string[];        // Explicit list of assumptions (no hidden magic)
  missingInputs: string[];          // Missing inputs that were not fabricated
  recommendedWindow: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NONE';
}

export interface ZoneIrrigationEvaluation {
  zoneId: string;
  zoneName: string;
  crop: string;
  areaHa: number;
  currentMoisture: number;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  statusLabel: string;
  recommendation: IrrigationRecommendationDetails;
  lastUpdated: string;
}

export interface FarmIrrigationPlan {
  id: string;
  createdAt: string;
  farmName: string;
  summaryRecommendation: IrrigationRecommendationDetails;
  zoneEvaluations: ZoneIrrigationEvaluation[];
  timeline: {
    morning: { action: string; recommended: boolean; note: string };
    afternoon: { action: string; recommended: boolean; note: string };
    evening: { action: string; recommended: boolean; note: string };
  };
  weatherOutlookSummary: string;
  criticalZoneId?: string;
}

// Phase 30 & 31: Public Home & Content Studio (CMS) Types
export type HomeMediaType = 'Hero Video' | 'Hero Image' | 'Drone Field Video' | 'Secondary Field Image';

export interface HomeMediaItem {
  id: string;
  type: HomeMediaType;
  title: string;
  url: string;
  posterUrl?: string;
  isActive: boolean;
  isBackground: boolean;
  uploadedAt: string;
  fileSizeMb?: number;
  category?: 'Hero' | 'Drone' | 'Field' | 'Crop' | 'Adviser' | 'Platform';
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  priority: 'Information' | 'Important' | 'Critical';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface HomeSectionConfig {
  id: 'hero' | 'announcements' | 'howItWorks' | 'liveShowcase' | 'capabilities' | 'roles' | 'trust' | 'cta';
  name: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
}

export interface HomeConfigVersion {
  version: number;
  config: HomePageConfig;
  publishedAt: string;
  publishedBy: string;
  changeSummary: string;
}

export interface HomePageConfig {
  // Hero Configuration
  heroTitle: string; // "Welcome to CroperX" / Heading
  heroSubtitle: string; // "AI-powered farming intelligence connecting farmers, advisers, cameras, sensors, weather and field data."
  heroHeading?: string; // "Your Field. Your Crop. Your Intelligence."
  heroDescription: string;
  primaryActionLabel: string; // "Login"
  secondaryActionLabel: string; // "Register"
  exploreActionLabel?: string; // "Explore CroperX"
  
  // Media Configuration
  activeMediaType: 'video' | 'image';
  heroVideoUrl: string;
  heroImageUrl: string;
  posterImageUrl: string;
  videoSettings: {
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    playsInline: boolean;
  };

  // Section Toggles
  sectionToggles: {
    overview: boolean;
    howItWorks: boolean;
    roles: boolean;
    statsBanner: boolean;
    liveShowcase?: boolean;
    capabilities?: boolean;
    trust?: boolean;
    announcements?: boolean;
    cta?: boolean;
  };

  // Advanced CMS Extensions
  sections?: HomeSectionConfig[];
  announcements?: PublicAnnouncement[];
  mediaLibrary: HomeMediaItem[];
  versions?: HomeConfigVersion[];
  
  updatedAt: string;
  updatedBy?: string;
}

// ============================================================
// PHASE 34: SMART LOCATION, NEARBY ADVISERS & DISCOVERY TYPES
// ============================================================

export type AdviserLocationType = 
  | 'Office'
  | 'Agricultural Extension Center'
  | 'Clinic / Advisory Center'
  | 'Farm Consultation Point'
  | 'Organization'
  | 'Custom Meeting Point';

export interface AdviserConsultationLocation {
  type: AdviserLocationType;
  label: string;
  address: string;
  locality?: string;
  district: string;
  state: string;
  country?: string;
  latitude: number;
  longitude: number;
  meetingRadiusKm?: number;
  isPrimary?: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  visibility: 'public' | 'hidden';
}

export interface AdviserLiveLocation {
  enabled: boolean;
  mode: 'off' | 'while_available' | 'during_consultation';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  updatedAt?: string;
}

export interface NearbyAdviser {
  id: string;
  name: string;
  phoneNumber: string;
  profileImage?: string;
  specialization: string;
  organization: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  consultationHours?: string;
  availability: 'available' | 'busy' | 'offline' | 'consultation_only';
  distanceKm: number;
  distanceDisplay: string;
  consultationLocation: AdviserConsultationLocation;
  isLocationVerified: boolean;
  liveLocationActive: boolean;
  liveLocationCoords?: { latitude: number; longitude: number };
  meetingRadiusKm?: number;
  bio?: string;
  assignedFarmersCount?: number;
}

export type MeetingStatus = 
  | 'Requested'
  | 'Accepted'
  | 'Declined'
  | 'Reschedule Requested'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface ConsultationMeetingRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAvatar?: string;
  adviserId: string;
  adviserName: string;
  adviserPhone: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  farmLocation: string;
  preferredMeetingPoint: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  meetingAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface FarmerLocationState {
  permission: 'unknown' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout';
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  accuracyLevel: 'high' | 'medium' | 'low';
  locality: string;
  district: string;
  state: string;
  country: string;
  fullAddress: string;
  lastUpdated: string | null;
  isManual: boolean;
  sharingEnabled?: boolean;
}

export interface AdminLocationEntry {
  userId: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  latitude: number;
  longitude: number;
  locality?: string;
  district?: string;
  state?: string;
  locationType: 'Farmer GPS' | 'Adviser Consultation Office' | 'Adviser Live GPS';
  isVerified?: boolean;
  sharingEnabled?: boolean;
  lastUpdated?: string;
}

// ============================================================
// PHASE 39: LIVE FARMER-ADVISER PRESENCE, GPS & EMERGENCY TYPES
// ============================================================

export type LivePresenceState =
  | 'offline'
  | 'going_online'
  | 'online'
  | 'location_permission_required'
  | 'location_updating'
  | 'in_consultation'
  | 'emergency';

export type EmergencyStatus =
  | 'Triggered'
  | 'Notified'
  | 'Acknowledged'
  | 'In Consultation'
  | 'Resolved';

export interface EmergencyIncident {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAvatar?: string;
  farmName: string;
  farmZone: string;
  crop: string;
  soilMoisture: string;
  weather: string;
  description: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  status: EmergencyStatus;
  severity: 'Emergency' | 'Critical';
  triggeredAt: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  assignedAdviserName?: string;
  resolvedAt?: number;
  resolvedBy?: string;
  resolutionNotes?: string;
  callId?: string;
}

export interface UserLivePresence {
  userId: string;
  phoneNumber: string;
  name: string;
  role: UserRole;
  avatar?: string;
  state: 'offline' | 'online' | 'in_consultation' | 'emergency';
  isLocationSharing: boolean;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  lastHeartbeat: number;
  lastLocationUpdate?: number;
  specialization?: string;
  organization?: string;
  farmName?: string;
  farmZone?: string;
  crop?: string;
  district?: string;
  stateName?: string;
  activeCallId?: string;
  verifiedLiveness?: boolean;
  emergencyIncident?: EmergencyIncident;
}

export type RealtimeEventType =
  | 'PRESENCE_CHANGED'
  | 'LOCATION_UPDATED'
  | 'CALL_REQUESTED'
  | 'CALL_ACCEPTED'
  | 'CALL_REJECTED'
  | 'CALL_ENDED'
  | 'EMERGENCY_TRIGGERED'
  | 'EMERGENCY_ACKNOWLEDGED'
  | 'EMERGENCY_RESOLVED'
  | 'CHAT_MESSAGE_RECEIVED'
  | 'CHAT_MESSAGE_REACTED'
  | 'CHAT_TYPING'
  | 'CHAT_SEEN';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  timestamp: number;
  data: any;
}

export interface ChatTelemetryCard {
  cropName: string;
  soilMoisture: string;
  weatherCondition: string;
  soilPh?: number;
  fieldZone?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverRole: UserRole;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'telemetry';
  telemetryCard?: ChatTelemetryCard;
  voiceDurationSeconds?: number;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  status: 'sent' | 'delivered' | 'seen';
  createdAt: number;
  replyToMessageId?: string;
}

export interface ChatConversation {
  id: string;
  participantA: {
    userId: string;
    name: string;
    role: UserRole;
    phoneNumber: string;
    avatar?: string;
  };
  participantB: {
    userId: string;
    name: string;
    role: UserRole;
    phoneNumber: string;
    avatar?: string;
  };
  lastMessage?: ChatMessage;
  unreadCountA: number;
  unreadCountB: number;
  updatedAt: number;
  isTyping?: {
    userId: string;
    timestamp: number;
  };
}



